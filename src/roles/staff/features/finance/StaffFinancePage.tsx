"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useMockDb } from "@/providers/mock-db-provider";
import { PageShell } from "@/roles/shared/components/layout/PageShell";
import { LoadingState } from "@/roles/shared/components/workspace/WorkspacePrimitives";
import {
  appendAuditEvent,
  createAuditActorSnapshot,
  SensitiveViewAuditBoundary,
  useSensitiveViewAudit,
  type AuditActorSnapshot,
} from "@/roles/shared/features/audit";
import { getInvoiceBreakdown, resolveInvoiceStatus } from "@/roles/shared/features/finance";
import { ORGANISATIONS } from "@/roles/shared/features/roles/access-model";
import { readPortalSession } from "@/roles/shared/features/roles/mock-login";
import { usePortalSession } from "@/roles/shared/features/roles/use-portal-session";
import { StaffPageHeader } from "@/roles/staff/components/StaffPageHeader";

type FinanceStatus = "locked" | "awaiting_payment" | "overdue" | "paid" | "cancelled" | "exception" | "reconciled" | "refunded";
type FinanceAction = "reconcile" | "exception" | "cancel";
const FINANCE_STATUSES = new Set<FinanceStatus>(["locked", "awaiting_payment", "overdue", "paid", "cancelled", "exception", "reconciled", "refunded"]);

interface FinanceRow {
  id: string;
  registrationId: string;
  studentId: string;
  studentName: string;
  description: string;
  amount: number;
  lateFee: number;
  status: FinanceStatus;
  evidenceReference?: string;
}

const seededFinanceRows: readonly FinanceRow[] = [
  { id: "INV-2569-008", registrationId: "REG-2569-008", studentId: "RPC-2569-008", studentName: "ภญ. ปาริชาติ สุขใจ", description: "ค่าลงทะเบียน วภท-305", amount: 12000, lateFee: 0, status: "paid", evidenceReference: "TXN-2569-805" },
  { id: "INV-2569-009", registrationId: "REG-2569-009", studentId: "RPC-2569-009", studentName: "ภก. ธีรภัทร มั่นคง", description: "ค่าลงทะเบียน BCP-201", amount: 3000, lateFee: 0, status: "exception", evidenceReference: "BANK-2569-104" },
];

const FINANCE_OVERRIDE_KEY = "royal-college.staff-finance-overrides.v1";
const FINANCE_OVERRIDE_EVENT = "royal-college:staff-finance-overrides-updated";
const EMPTY_FINANCE_OVERRIDES: Readonly<Record<string, FinanceStatus>> = {};
let cachedOverrideRaw = "";
let cachedOverrides: Readonly<Record<string, FinanceStatus>> = EMPTY_FINANCE_OVERRIDES;

function getFinanceOverrideSnapshot() {
  const raw = window.localStorage.getItem(FINANCE_OVERRIDE_KEY) ?? "";
  if (raw !== cachedOverrideRaw) {
    cachedOverrideRaw = raw;
    try {
      const parsed: unknown = raw ? JSON.parse(raw) : {};
      cachedOverrides = parsed && typeof parsed === "object"
        ? Object.fromEntries(Object.entries(parsed).filter((entry): entry is [string, FinanceStatus] => (
            typeof entry[1] === "string" && FINANCE_STATUSES.has(entry[1] as FinanceStatus)
          )))
        : EMPTY_FINANCE_OVERRIDES;
    } catch {
      cachedOverrides = EMPTY_FINANCE_OVERRIDES;
    }
  }
  return cachedOverrides;
}

function subscribeFinanceOverrides(onStoreChange: () => void) {
  window.addEventListener("storage", onStoreChange);
  window.addEventListener(FINANCE_OVERRIDE_EVENT, onStoreChange);
  return () => {
    window.removeEventListener("storage", onStoreChange);
    window.removeEventListener(FINANCE_OVERRIDE_EVENT, onStoreChange);
  };
}

function persistFinanceOverride(id: string, status: FinanceStatus) {
  const next = { ...getFinanceOverrideSnapshot(), [id]: status };
  window.localStorage.setItem(FINANCE_OVERRIDE_KEY, JSON.stringify(next));
  cachedOverrideRaw = "";
  window.dispatchEvent(new Event(FINANCE_OVERRIDE_EVENT));
}

function auditActor(): AuditActorSnapshot {
  const session = readPortalSession();
  return session ? createAuditActorSnapshot(session) : {
    userId: "staff-unknown",
    userName: "เจ้าหน้าที่ราชวิทยาลัย",
    role: "royal_college_staff",
    organisation: ORGANISATIONS.royalCollege,
    resourceScopes: ["*"],
  };
}

const statusMeta: Record<FinanceStatus, { label: string; variant: "neutral" | "warning" | "danger" | "success" | "info" }> = {
  locked: { label: "รอตรวจคำขอ", variant: "neutral" },
  awaiting_payment: { label: "รอชำระเงิน", variant: "warning" },
  overdue: { label: "ค้างชำระ", variant: "danger" },
  paid: { label: "ชำระแล้ว", variant: "success" },
  cancelled: { label: "ยกเลิก", variant: "neutral" },
  exception: { label: "รายการผิดปกติ", variant: "danger" },
  reconciled: { label: "กระทบยอดแล้ว", variant: "info" },
  refunded: { label: "คืนเงินแล้ว", variant: "neutral" },
};

const actionMeta: Record<FinanceAction, { label: string; after: FinanceStatus; audit: string; tone: "default" | "outline" | "destructive" }> = {
  reconcile: { label: "ยืนยันกระทบยอด", after: "reconciled", audit: "payment.reconcile", tone: "default" },
  exception: { label: "บันทึกรายการผิดปกติ", after: "exception", audit: "payment.exception", tone: "outline" },
  cancel: { label: "ยกเลิกรายการ", after: "cancelled", audit: "payment.cancel", tone: "destructive" },
};

function baht(value: number) {
  return new Intl.NumberFormat("th-TH", { style: "currency", currency: "THB", maximumFractionDigits: 0 }).format(value);
}

export default function StaffFinancePage() {
  const { registrations, registrationInvoices, isLoaded } = useMockDb();
  const { session, isReady: isSessionReady } = usePortalSession();
  const overrides = useSyncExternalStore(
    subscribeFinanceOverrides,
    getFinanceOverrideSnapshot,
    () => EMPTY_FINANCE_OVERRIDES,
  );
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<{ row: FinanceRow; action: FinanceAction } | null>(null);
  const [reason, setReason] = useState("");
  const [evidence, setEvidence] = useState("");
  const [formError, setFormError] = useState("");
  const sensitiveViewAudit = useSensitiveViewAudit({
    enabled: isSessionReady && isLoaded && session?.role === "royal_college_staff",
    session,
    resource: {
      type: "finance_register",
      id: "FINANCE-REGISTER",
      label: "ทะเบียนข้อมูลการเงิน",
      organisationId: ORGANISATIONS.royalCollege.id,
    },
  });

  const rows = useMemo<FinanceRow[]>(() => {
    const registrationById = new Map(registrations.map((registration) => [registration.id, registration]));
    const providerRows = registrationInvoices.map((invoice) => {
      const registration = registrationById.get(invoice.registrationId);
      const breakdown = getInvoiceBreakdown(invoice);
      return {
        id: invoice.id,
        registrationId: invoice.registrationId,
        studentId: invoice.studentId,
        studentName: registration?.studentName ?? "ผู้เข้ารับการฝึกอบรม",
        description: invoice.description,
        amount: breakdown.baseAmount,
        lateFee: breakdown.lateFee,
        status: overrides[invoice.id] ?? resolveInvoiceStatus(invoice),
      };
    });
    return [...providerRows, ...seededFinanceRows.map((row) => ({ ...row, status: overrides[row.id] ?? row.status }))];
  }, [overrides, registrationInvoices, registrations]);
  const filtered = useMemo(() => {
    const query = search.trim().toLocaleLowerCase("th-TH");
    return rows.filter((row) => !query || [row.id, row.registrationId, row.studentId, row.studentName, row.description].some((value) => value.toLocaleLowerCase("th-TH").includes(query)));
  }, [rows, search]);

  const closeDialog = () => {
    setSelected(null);
    setReason("");
    setEvidence("");
    setFormError("");
  };

  const submitAction = () => {
    if (!selected) return;
    const cleanReason = reason.trim();
    const cleanEvidence = evidence.trim();
    if (!cleanReason || !cleanEvidence) {
      setFormError("กรุณาระบุเหตุผลและหลักฐานอ้างอิงให้ครบถ้วน");
      return;
    }
    const meta = actionMeta[selected.action];
    try {
      appendAuditEvent({
        actor: auditActor(),
        action: meta.audit,
        resource: {
          type: "invoice",
          id: selected.row.id,
          label: selected.row.description,
          organisationId: ORGANISATIONS.royalCollege.id,
        },
        before: { status: selected.row.status },
        after: { status: meta.after },
        reason: cleanReason,
        evidenceReference: cleanEvidence,
        occurredAt: new Date().toISOString(),
      });
      persistFinanceOverride(selected.row.id, meta.after);
      toast.success(`${meta.label} ${selected.row.id} แล้ว`);
      closeDialog();
    } catch {
      setFormError("บันทึกสถานะและ Audit Log ไม่สำเร็จ กรุณาลองใหม่อีกครั้ง");
    }
  };

  const exportReport = () => {
    try {
      appendAuditEvent({
        actor: auditActor(),
        action: "sensitive_data.export",
        resource: { type: "finance_report", id: "FINANCE-REPORT-2569", label: "รายงานกระทบยอด", organisationId: ORGANISATIONS.royalCollege.id },
        before: { exported: false },
        after: { exported: true },
        reason: "จัดทำรายงานกระทบยอดสำหรับการตรวจสอบ",
        evidenceReference: `EXPORT-${Date.now().toString(36).toUpperCase()}`,
        occurredAt: new Date().toISOString(),
      });
      toast.success("เตรียมรายงานการเงินแล้ว");
    } catch {
      toast.error("ไม่สามารถบันทึกการออกรายงานลง Audit Log ได้");
    }
  };

  if (!isSessionReady || !isLoaded) {
    return <PageShell size="full"><LoadingState label="กำลังโหลดข้อมูลการเงินและ Audit" /></PageShell>;
  }

  return (
    <PageShell size="full" className="space-y-6">
      <StaffPageHeader title="Payment และ Reconciliation" description="ดู Invoice กระทบยอด ตรวจรายการผิดปกติ และบันทึก Cancellation ใน Workspace เจ้าหน้าที่เดียว" eyebrow="Central Finance Operations" actions={<Button variant="outline" onClick={exportReport}><span aria-hidden="true" className="material-symbols-outlined text-lg">download</span>ออกรายงาน</Button>} />
      <SensitiveViewAuditBoundary status={sensitiveViewAudit.status} onRetry={sensitiveViewAudit.retry}>
      <div className="rounded-2xl border border-info-border bg-info-soft p-4 text-sm text-info-on-soft"><strong>Payment ปกติ:</strong> System Actor เป็นผู้ยืนยันอัตโนมัติ เจ้าหน้าที่ดำเนินการเฉพาะ Reconciliation และ Exception ทุกการเปลี่ยนสถานะต้องมีเหตุผลและหลักฐานอ้างอิง</div>
      <div id="refund-policy-note" role="note" className="rounded-2xl border border-warning-border bg-warning-soft p-4 text-sm text-warning-on-soft"><strong>การคืนเงิน:</strong> ยังไม่เปิดให้ดำเนินการจนกว่าผู้มีส่วนเกี่ยวข้องจะอนุมัติเงื่อนไข Refund</div>
      <Card><CardContent className="space-y-4 px-4 md:px-5"><div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"><div><h2 className="font-semibold">Invoice และ Payment Status</h2><p className="mt-1 text-xs text-muted-foreground">ค้างชำระคิดค่าปรับ {baht(500)} ตามเงื่อนไขที่กำหนด</p></div><Input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="ค้นหา Invoice นักศึกษา หรือรายการ" aria-label="ค้นหารายการการเงิน" className="h-11 rounded-xl text-sm sm:w-80" /></div><div className="overflow-x-auto rounded-2xl border border-border"><table className="w-full min-w-[980px] text-left text-sm"><thead className="bg-muted/50 text-xs text-muted-foreground"><tr><th scope="col" className="px-4 py-3 font-medium">Invoice</th><th scope="col" className="px-4 py-3 font-medium">นักศึกษา</th><th scope="col" className="px-4 py-3 font-medium">รายการ</th><th scope="col" className="px-4 py-3 text-right font-medium">ยอดเงิน</th><th scope="col" className="px-4 py-3 font-medium">สถานะ</th><th scope="col" className="px-4 py-3 text-right font-medium">ดำเนินการ</th></tr></thead><tbody className="divide-y divide-border">{filtered.map((row) => <tr key={row.id}><td className="px-4 py-3"><p className="font-mono text-xs font-medium">{row.id}</p><p className="mt-1 text-xs text-muted-foreground">{row.registrationId}</p></td><td className="px-4 py-3"><p className="font-medium">{row.studentName}</p><p className="text-xs text-muted-foreground">{row.studentId}</p></td><td className="px-4 py-3">{row.description}{row.lateFee > 0 ? <p className="mt-1 text-xs text-danger">รวมค่าปรับ {baht(row.lateFee)}</p> : null}</td><td className="px-4 py-3 text-right font-semibold tabular-nums">{baht(row.amount + row.lateFee)}</td><td className="px-4 py-3"><Badge variant={statusMeta[row.status].variant}>{statusMeta[row.status].label}</Badge></td><td className="px-4 py-3"><div className="flex justify-end gap-1.5"><Button size="xs" variant="outline" onClick={() => setSelected({ row, action: "exception" })}>ผิดปกติ</Button>{row.status === "paid" || row.status === "exception" ? <Button size="xs" onClick={() => setSelected({ row, action: "reconcile" })}>กระทบยอด</Button> : null}<Button size="xs" variant="destructive" onClick={() => setSelected({ row, action: "cancel" })} disabled={row.status === "cancelled" || row.status === "refunded"}>ยกเลิก</Button><Button size="xs" variant="outline" disabled aria-describedby="refund-policy-note">คืนเงิน (รอข้อสรุป)</Button></div></td></tr>)}</tbody></table>{filtered.length === 0 ? <div className="py-14 text-center"><span aria-hidden="true" className="material-symbols-outlined text-4xl text-muted-foreground">receipt_long</span><p className="mt-2 text-sm font-medium">ไม่พบรายการการเงิน</p><p className="mt-1 text-xs text-muted-foreground">ลองเปลี่ยนคำค้นหา</p></div> : null}</div></CardContent></Card>

      <Dialog open={Boolean(selected)} onOpenChange={(open) => { if (!open) closeDialog(); }}><DialogContent aria-describedby="finance-action-description"><DialogHeader><DialogTitle>{selected ? actionMeta[selected.action].label : "ดำเนินการการเงิน"}</DialogTitle><DialogDescription id="finance-action-description">{selected?.row.id} · การบันทึกนี้จะเก็บค่าก่อนหลัง ผู้ดำเนินการ เหตุผล หลักฐาน และเวลาใน Audit History</DialogDescription></DialogHeader><div className="space-y-4"><div><label htmlFor="finance-reason" className="mb-1.5 block text-sm font-medium">เหตุผล <span className="text-danger">*</span></label><Textarea id="finance-reason" value={reason} onChange={(event) => { setReason(event.target.value); setFormError(""); }} placeholder="อธิบายเหตุผลของการดำเนินการ" aria-invalid={Boolean(formError) && !reason.trim()} aria-describedby={formError ? "finance-form-error" : undefined} /></div><div><label htmlFor="finance-evidence" className="mb-1.5 block text-sm font-medium">หลักฐานอ้างอิง <span className="text-danger">*</span></label><Input id="finance-evidence" value={evidence} onChange={(event) => { setEvidence(event.target.value); setFormError(""); }} placeholder="เช่น เลขธุรกรรม เลขบันทึก หรือชื่อไฟล์" aria-invalid={Boolean(formError) && !evidence.trim()} aria-describedby={formError ? "finance-form-error" : undefined} /></div>{formError ? <p id="finance-form-error" role="alert" className="rounded-xl border border-danger-border bg-danger-soft p-3 text-sm text-danger-on-soft">{formError}</p> : null}</div><DialogFooter><Button variant="outline" onClick={closeDialog}>ยกเลิก</Button><Button variant={selected ? actionMeta[selected.action].tone : "default"} onClick={submitAction}>ยืนยันการบันทึก</Button></DialogFooter></DialogContent></Dialog>
      </SensitiveViewAuditBoundary>
    </PageShell>
  );
}
