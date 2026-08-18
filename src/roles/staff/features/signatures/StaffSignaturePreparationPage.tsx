"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { PageShell } from "@/roles/shared/components/layout/PageShell";
import { appendAuditEvent, createAuditActorSnapshot } from "@/roles/shared/features/audit";
import { REQUEST_STATUS_META, type MockRequest, type SignatureWorkflowKind } from "@/roles/shared/features/requests/request-schema";
import { useRequestStore } from "@/roles/shared/features/requests/request-store";
import { ORGANISATIONS } from "@/roles/shared/features/roles/access-model";
import { readPortalSession } from "@/roles/shared/features/roles/mock-login";
import { StaffPageHeader } from "@/roles/staff/components/StaffPageHeader";
import { prepareRequestForSignature, SIGNATURE_WORKFLOW_META } from "./staff-signature-workflow";

const workflowCards: readonly { kind: SignatureWorkflowKind; icon: string }[] = [
  { kind: "college_only", icon: "account_balance" },
  { kind: "royal_only", icon: "assured_workload" },
  { kind: "two_level", icon: "conversion_path" },
];

function workflowLabel(request: MockRequest) {
  return request.signatureWorkflow
    ? SIGNATURE_WORKFLOW_META[request.signatureWorkflow.kind].label
    : request.status === "awaiting_president_signature"
      ? "คิวเดิมระดับวิทยาลัย"
      : "ยังไม่เลือก Workflow";
}

export default function StaffSignaturePreparationPage() {
  const { requests, isReady, storageError, updateRequest } = useRequestStore();
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<MockRequest | null>(null);
  const [kind, setKind] = useState<SignatureWorkflowKind>("college_only");
  const [evidence, setEvidence] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [formError, setFormError] = useState("");
  const relevant = useMemo(() => {
    const query = search.trim().toLocaleLowerCase("th-TH");
    return requests.filter((request) => (
      (request.status === "staff_review" || request.status === "awaiting_president_signature" || request.status === "signed") &&
      (!query || [request.id, request.title, request.requester.name, request.requester.memberId].some((value) => value.toLocaleLowerCase("th-TH").includes(query)))
    ));
  }, [requests, search]);

  const closeDialog = () => {
    setSelected(null);
    setKind("college_only");
    setEvidence("");
    setConfirmed(false);
    setFormError("");
  };

  const submit = () => {
    if (!selected) return;
    if (!evidence.trim() || !confirmed) {
      setFormError("กรุณาระบุหลักฐานต้นทางและยืนยันการตรวจความครบถ้วน");
      return;
    }
    const session = readPortalSession();
    const now = new Date();
    try {
      const prepared = prepareRequestForSignature({
        request: selected,
        kind,
        preparedAt: now,
        evidenceReference: evidence.trim(),
        preparedBy: {
          userId: session?.userId ?? "staff-unknown",
          userName: session?.displayName ?? "เจ้าหน้าที่ราชวิทยาลัย",
          role: "royal_college_staff",
          organisationId: session?.organisation.id ?? "org-royal-college",
          organisationCode: session?.organisation.code ?? "รวภท.",
          organisationName: session?.organisation.name ?? "ราชวิทยาลัยเภสัชกรรมแห่งประเทศไทย",
        },
      });
      appendAuditEvent({
        actor: session ? createAuditActorSnapshot(session) : { userId: "staff-unknown", userName: "เจ้าหน้าที่ราชวิทยาลัย", role: "royal_college_staff", organisation: ORGANISATIONS.royalCollege, resourceScopes: ["*"] },
        action: "document.prepare",
        resource: { type: "document", id: selected.id, label: selected.title, organisationId: prepared.signatureWorkflow?.steps[0]?.organisationId },
        before: { status: selected.status },
        after: { status: prepared.status, workflow: kind },
        reason: "ตรวจข้อมูลและเอกสารครบถ้วน พร้อมส่งเข้าคิวลงนาม",
        evidenceReference: evidence.trim(),
        occurredAt: now.toISOString(),
      });
      updateRequest(selected.id, () => prepared);
      toast.success(`ส่ง ${selected.id} เข้าคิวลงนามแล้ว`);
      closeDialog();
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "ไม่สามารถเตรียมเอกสารได้");
    }
  };

  return (
    <PageShell size="full" className="space-y-6">
      <StaffPageHeader title="เตรียมเอกสารเข้าคิวลงนาม" description="ตรวจความครบถ้วน เลือก Signature Workflow ที่เปลี่ยนค่าได้ และส่งให้ประธานตาม Organisation Scope โดยเจ้าหน้าที่ลงนามแทนไม่ได้" eyebrow="Signature Preparation" />
      <section aria-labelledby="workflow-options-heading"><h2 id="workflow-options-heading" className="mb-3 text-sm font-semibold">รูปแบบ Workflow ที่ระบบรองรับ</h2><div className="grid gap-3 md:grid-cols-3">{workflowCards.map((item) => <Card key={item.kind}><CardContent className="p-4"><span aria-hidden="true" className="material-symbols-outlined text-2xl text-primary">{item.icon}</span><h3 className="mt-2 font-semibold">{SIGNATURE_WORKFLOW_META[item.kind].label}</h3><p className="mt-1 text-xs text-muted-foreground">{SIGNATURE_WORKFLOW_META[item.kind].description}</p></CardContent></Card>)}</div><p className="mt-2 text-xs text-muted-foreground">ประเภทเอกสารจริงของแต่ละ Workflow ยังรอ Stakeholder อนุมัติ และสามารถปรับ Configuration ได้</p></section>
      {storageError ? <div role="alert" className="rounded-2xl border border-warning-border bg-warning-soft p-3 text-sm text-warning-on-soft">{storageError}</div> : null}
      <Card><CardContent className="space-y-4 px-4 md:px-5"><div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"><div><h2 className="font-semibold">เอกสารและคำร้อง</h2><p aria-live="polite" className="mt-1 text-xs text-muted-foreground">{isReady ? `${relevant.length} รายการ` : "กำลังโหลดรายการ"}</p></div><Input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="ค้นหาเลขที่เอกสารหรือผู้ยื่น" aria-label="ค้นหาเอกสารเตรียมลงนาม" className="sm:w-80" /></div><div className="overflow-x-auto rounded-2xl border border-border"><table className="w-full min-w-[900px] text-left text-sm"><thead className="bg-muted/50 text-xs text-muted-foreground"><tr><th scope="col" className="px-4 py-3 font-medium">เอกสาร</th><th scope="col" className="px-4 py-3 font-medium">เจ้าของเอกสาร</th><th scope="col" className="px-4 py-3 font-medium">Organisation</th><th scope="col" className="px-4 py-3 font-medium">Workflow</th><th scope="col" className="px-4 py-3 font-medium">สถานะ</th><th scope="col" className="px-4 py-3 text-right font-medium">ดำเนินการ</th></tr></thead><tbody className="divide-y divide-border">{!isReady ? <tr><td colSpan={6} className="px-4 py-14 text-center text-muted-foreground"><span aria-hidden="true" className="material-symbols-outlined mr-2 animate-spin align-middle">progress_activity</span>กำลังโหลดรายการ</td></tr> : relevant.map((request) => <tr key={request.id}><td className="px-4 py-3"><p className="font-mono text-xs font-medium">{request.id}</p><p className="mt-1 max-w-xs truncate text-xs text-muted-foreground">{request.title}</p></td><td className="px-4 py-3"><p className="font-medium">{request.requester.name}</p><p className="text-xs text-muted-foreground">{request.requester.memberId}</p></td><td className="px-4 py-3">{request.collegeCode}</td><td className="px-4 py-3">{workflowLabel(request)}</td><td className="px-4 py-3"><Badge variant={REQUEST_STATUS_META[request.status].variant}>{REQUEST_STATUS_META[request.status].label}</Badge></td><td className="px-4 py-3 text-right"><Button size="sm" onClick={() => setSelected(request)} disabled={request.status !== "staff_review"}>ตรวจและจัดคิว</Button></td></tr>)}</tbody></table>{isReady && relevant.length === 0 ? <div className="py-14 text-center"><span aria-hidden="true" className="material-symbols-outlined text-4xl text-muted-foreground">inventory_2</span><p className="mt-2 text-sm font-medium">ไม่มีเอกสารในรายการ</p><p className="mt-1 text-xs text-muted-foreground">ลองล้างคำค้นหา หรือตรวจคำร้องที่รอเจ้าหน้าที่ก่อน</p></div> : null}</div></CardContent></Card>

      <Dialog open={Boolean(selected)} onOpenChange={(open) => { if (!open) closeDialog(); }}><DialogContent aria-describedby="signature-preparation-description"><DialogHeader><DialogTitle>ตรวจและจัดคิว {selected?.id}</DialogTitle><DialogDescription id="signature-preparation-description">เลือก Workflow สำหรับเอกสารรายการนี้โดยไม่กำหนดให้เป็น Business Policy ถาวร</DialogDescription></DialogHeader><div className="space-y-4"><fieldset><legend className="mb-2 text-sm font-medium">Signature Workflow</legend><div className="space-y-2">{workflowCards.map((item) => <label key={item.kind} className="flex cursor-pointer items-start gap-3 rounded-2xl border border-border p-3 has-[:checked]:border-primary has-[:checked]:bg-primary/5"><input type="radio" name="signature-workflow" value={item.kind} checked={kind === item.kind} onChange={() => { setKind(item.kind); setFormError(""); }} className="mt-1 h-4 w-4 accent-primary" /><span><span className="block text-sm font-medium">{SIGNATURE_WORKFLOW_META[item.kind].label}</span><span className="mt-0.5 block text-xs text-muted-foreground">{SIGNATURE_WORKFLOW_META[item.kind].description}</span></span></label>)}</div></fieldset><div><label htmlFor="signature-source-evidence" className="mb-1.5 block text-sm font-medium">หลักฐานต้นทาง <span className="text-danger">*</span></label><Input id="signature-source-evidence" value={evidence} onChange={(event) => { setEvidence(event.target.value); setFormError(""); }} placeholder="เช่น เลขบันทึกหรือชื่อชุดเอกสาร" aria-invalid={Boolean(formError) && !evidence.trim()} aria-describedby={formError ? "signature-preparation-error" : undefined} /></div><label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-border p-3"><input type="checkbox" checked={confirmed} onChange={(event) => { setConfirmed(event.target.checked); setFormError(""); }} className="mt-0.5 h-4 w-4 accent-primary" /><span className="text-sm">ตรวจข้อมูล เอกสารบังคับ และหลักฐานต้นทางครบถ้วนแล้ว</span></label>{formError ? <p id="signature-preparation-error" role="alert" className="rounded-xl border border-danger-border bg-danger-soft p-3 text-sm text-danger-on-soft">{formError}</p> : null}</div><DialogFooter><Button variant="outline" onClick={closeDialog}>ยกเลิก</Button><Button onClick={submit}>ส่งเข้าคิวลงนาม</Button></DialogFooter></DialogContent></Dialog>
    </PageShell>
  );
}
