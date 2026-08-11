"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { currentMemberPaymentOwner, profileData } from "@/roles/shared/data";
import {
  getInvoiceBreakdown,
  resolveInvoiceStatus,
  type InvoiceDisplayStatus,
  type PaymentMethod,
  type RegistrationInvoice,
} from "@/roles/shared/features/finance";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Footer from "@/roles/shared/components/layout/Footer";
import { PageShell } from "@/roles/shared/components/layout/PageShell";
import PaymentDialog from "@/roles/member/features/finance/components/PaymentDialog";
import { useMockDb, type Payment } from "@/providers/mock-db-provider";

type InvoiceView = RegistrationInvoice & {
  displayStatus: InvoiceDisplayStatus | "pending_review";
  amountDue: number;
  lateFee: number;
};

const statusMeta = {
  locked: { variant: "warning", label: "รอตรวจสอบการลงทะเบียน" },
  awaiting_payment: { variant: "warning", label: "รอชำระเงิน" },
  overdue: { variant: "danger", label: "ค้างชำระ" },
  pending_review: { variant: "info", label: "รอตรวจสอบการชำระเงิน" },
  paid: { variant: "success", label: "ชำระแล้ว" },
  cancelled: { variant: "neutral", label: "ยกเลิก" },
} as const;

function formatDueAt(dueAt?: string) {
  if (!dueAt) return "รออนุมัติ";
  return new Date(dueAt).toLocaleString("th-TH", {
    timeZone: "Asia/Bangkok",
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function FinancePage() {
  const { registrationInvoices, payments, addPayment } = useMockDb();
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(null);
  const [nowMs, setNowMs] = useState(() => Date.now());
  const ownerIds = useMemo(() => new Set([
    currentMemberPaymentOwner.studentId,
    ...currentMemberPaymentOwner.legacyStudentIds,
  ]), []);

  useEffect(() => {
    const currentTime = Date.now();
    const nextDueAt = registrationInvoices
      .filter((invoice) => (
        ownerIds.has(invoice.studentId) &&
        invoice.status === "awaiting_payment" &&
        Boolean(invoice.dueAt)
      ))
      .map((invoice) => new Date(invoice.dueAt!).getTime())
      .filter((dueAt) => !Number.isNaN(dueAt) && dueAt >= currentTime)
      .sort((left, right) => left - right)[0];

    if (nextDueAt === undefined) return;

    // Schedule only the next boundary; long deadlines are re-scheduled in safe chunks.
    const delay = Math.min(nextDueAt - currentTime + 1, 2_147_483_647);
    const timeoutId = window.setTimeout(() => setNowMs(Date.now()), delay);
    return () => window.clearTimeout(timeoutId);
  }, [nowMs, ownerIds, registrationInvoices]);

  const invoices = useMemo<InvoiceView[]>(() => {
    const now = new Date(nowMs);
    return registrationInvoices
      .filter((invoice) => ownerIds.has(invoice.studentId))
      .map((invoice) => {
        const latestPayment = payments.find((payment) => payment.invoiceId === invoice.id);
        const breakdown = getInvoiceBreakdown(invoice, now);
        const displayStatus = latestPayment?.status === "pending"
          ? "pending_review"
          : resolveInvoiceStatus(invoice, now);
        return {
          ...invoice,
          displayStatus,
          amountDue: breakdown.total,
          lateFee: breakdown.lateFee,
        };
      });
  }, [nowMs, ownerIds, payments, registrationInvoices]);

  const selectedInvoice = selectedInvoiceId
    ? invoices.find((invoice) => invoice.id === selectedInvoiceId) ?? null
    : null;

  const totalFees = invoices
    .filter((invoice) => invoice.displayStatus !== "cancelled")
    .reduce((total, invoice) => total + invoice.baseAmount, 0);
  const outstandingBalance = invoices
    .filter((invoice) => invoice.displayStatus === "awaiting_payment" || invoice.displayStatus === "overdue")
    .reduce((total, invoice) => total + invoice.amountDue, 0);
  const hasLockedInvoice = invoices.some((invoice) => invoice.displayStatus === "locked");

  const handleSubmitted = (invoiceId: string, method: PaymentMethod, referenceNo: string) => {
    const invoice = registrationInvoices.find((item) => item.id === invoiceId);
    const latestPayment = payments.find((payment) => payment.invoiceId === invoiceId);
    const submittedAt = new Date();
    const liveStatus = latestPayment?.status === "pending"
      ? "pending_review"
      : invoice
        ? resolveInvoiceStatus(invoice, submittedAt)
        : "cancelled";

    if (!invoice || (liveStatus !== "awaiting_payment" && liveStatus !== "overdue")) {
      toast.error("รายการนี้ยังไม่พร้อมชำระเงิน");
      return;
    }
    const breakdown = getInvoiceBreakdown(invoice, submittedAt);
    const submittedAtIso = submittedAt.toISOString();
    const payment: Payment = {
      id: `PAY-${globalThis.crypto?.randomUUID?.() ?? Date.now()}`,
      invoiceId,
      studentId: currentMemberPaymentOwner.studentId,
      name: `${profileData.personalInfo.firstName} ${profileData.personalInfo.lastName}`,
      program: "เภสัชบำบัด",
      amount: breakdown.total,
      date: submittedAt.toLocaleDateString("th-TH"),
      status: method === "promptpay" ? "pending" : "approved",
      type: invoice.description,
      method,
      referenceNo,
      submittedAt: submittedAtIso,
    };
    addPayment(payment);
    setNowMs(submittedAt.getTime());
    toast.success(method === "promptpay" ? "ส่งหลักฐานแล้ว" : "ชำระเงินสำเร็จ");
  };

  return (
    <>
      <PageShell>
        <header className="mb-6">
          <h1 className="text-lg md:text-xl font-semibold mb-1">การชำระเงิน</h1>
          <p className="text-xs text-muted-foreground">ใบแจ้งชำระจะเปิดหลังเจ้าหน้าที่อนุมัติการลงทะเบียน</p>
        </header>

        {hasLockedInvoice && (
          <div role="note" className="mb-5 flex items-start gap-3 rounded-xl border border-warning-border bg-warning-soft p-4 text-warning-on-soft">
            <span className="material-symbols-outlined">hourglass_top</span>
            <div>
              <p className="text-sm font-semibold">รอการตรวจสอบก่อนชำระเงิน</p>
              <p className="mt-1 text-xs">เจ้าหน้าที่ต้องอนุมัติคำขอลงทะเบียนก่อน ระบบจึงจะเปิดยอดและวันครบกำหนดชำระ</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <Card className="card-shadow"><CardContent className="p-5 flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center"><span className="material-symbols-outlined text-xl text-primary">account_balance_wallet</span></div>
            <div><h2 className="text-xs font-medium text-muted-foreground mb-0.5">ค่าใช้จ่ายทั้งหมด</h2><div className="text-2xl font-bold">฿{totalFees.toLocaleString()}</div></div>
          </CardContent></Card>
          <Card className="card-shadow border-l-4 border-l-destructive"><CardContent className="p-5 flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center"><span className="material-symbols-outlined text-xl text-destructive">warning</span></div>
            <div><h2 className="text-xs font-medium text-muted-foreground mb-0.5">ยอดรอชำระ/ค้างชำระ</h2><div className="text-2xl font-bold text-destructive">฿{outstandingBalance.toLocaleString()}</div></div>
          </CardContent></Card>
        </div>

        <Card className="card-shadow">
          <CardHeader className="pb-0 pt-4 px-5"><CardTitle className="text-sm">รายการชำระเงิน</CardTitle></CardHeader>
          <CardContent className="p-0 mt-3">
            <Table>
              <TableHeader><TableRow>
                <TableHead className="text-xs h-9">รายการ</TableHead>
                <TableHead className="text-xs h-9">ยอดชำระ</TableHead>
                <TableHead className="text-xs h-9">กำหนดชำระ</TableHead>
                <TableHead className="text-xs h-9">สถานะ</TableHead>
                <TableHead className="text-xs h-9">การดำเนินการ</TableHead>
              </TableRow></TableHeader>
              <TableBody>
                {invoices.map((invoice) => {
                  const status = statusMeta[invoice.displayStatus];
                  const payable = invoice.displayStatus === "awaiting_payment" || invoice.displayStatus === "overdue";
                  return (
                    <TableRow key={invoice.id}>
                      <TableCell className="text-xs py-3">{invoice.description}</TableCell>
                      <TableCell className="text-xs py-3 font-medium">
                        ฿{invoice.amountDue.toLocaleString()}
                        {invoice.lateFee > 0 && <p className="mt-1 text-xs text-danger">รวมค่าปรับ ฿{invoice.lateFee.toLocaleString()}</p>}
                      </TableCell>
                      <TableCell className="text-xs py-3">{formatDueAt(invoice.dueAt)}</TableCell>
                      <TableCell className="text-xs py-3"><Badge variant={status.variant}>{status.label}</Badge></TableCell>
                      <TableCell className="text-xs py-3">
                        {payable && <Button size="sm" className="h-7 text-xs" onClick={() => setSelectedInvoiceId(invoice.id)}>ชำระเงิน</Button>}
                        {invoice.displayStatus === "pending_review" && <span className="text-muted-foreground">กำลังตรวจสอบ</span>}
                        {invoice.displayStatus === "paid" && <Button variant="ghost" size="sm" onClick={() => toast.info("กำลังจัดเตรียมใบเสร็จ PDF")}>ใบเสร็จ</Button>}
                        {invoice.displayStatus === "locked" && <span className="text-muted-foreground">ยังชำระไม่ได้</span>}
                      </TableCell>
                    </TableRow>
                  );
                })}
                {invoices.length === 0 && (
                  <TableRow><TableCell colSpan={5} className="h-28 text-center text-content-muted">ยังไม่มีใบแจ้งชำระเงิน</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </PageShell>
      <Footer />
      {selectedInvoice && (
        <PaymentDialog
          item={{
            id: selectedInvoice.id,
            description: selectedInvoice.description,
            amount: selectedInvoice.amountDue,
            baseAmount: selectedInvoice.baseAmount,
            lateFee: selectedInvoice.lateFee,
            dueAt: selectedInvoice.dueAt,
          }}
          onSubmitted={handleSubmitted}
          onOpenChange={(open) => { if (!open) setSelectedInvoiceId(null); }}
        />
      )}
    </>
  );
}
