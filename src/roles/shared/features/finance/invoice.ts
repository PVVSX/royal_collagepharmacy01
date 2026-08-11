export type PaymentMethod = "promptpay" | "credit_card" | "debit_card";
export type InvoiceLifecycleStatus = "locked" | "awaiting_payment" | "paid" | "cancelled";
export type InvoiceDisplayStatus = InvoiceLifecycleStatus | "overdue";

export interface RegistrationInvoice {
  id: string;
  registrationId: string;
  studentId: string;
  description: string;
  baseAmount: number;
  status: InvoiceLifecycleStatus;
  createdAt: string;
  updatedAt: string;
  dueAt?: string;
  paidAt?: string;
  cancelledAt?: string;
}
export const invoicePolicy = {
  paymentWindowDays: 14,
  lateFee: 500,
  timeZone: "Asia/Bangkok",
} as const;

const bangkokDateFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: invoicePolicy.timeZone,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

function bangkokCalendarParts(iso: string) {
  const instant = new Date(iso);
  if (Number.isNaN(instant.getTime())) throw new Error(`Invalid ISO instant: ${iso}`);

  const parts = bangkokDateFormatter.formatToParts(instant);
  const value = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((part) => part.type === type)?.value);

  return { year: value("year"), month: value("month"), day: value("day") };
}

export function createBangkokDueAt(
  approvedAt: string,
  paymentWindowDays = invoicePolicy.paymentWindowDays,
): string {
  const { year, month, day } = bangkokCalendarParts(approvedAt);
  const dueDate = new Date(Date.UTC(year, month - 1, day + paymentWindowDays));
  const yyyy = String(dueDate.getUTCFullYear()).padStart(4, "0");
  const mm = String(dueDate.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(dueDate.getUTCDate()).padStart(2, "0");

  return `${yyyy}-${mm}-${dd}T23:59:59+07:00`;
}

export function createLockedRegistrationInvoice(input: {
  registrationId: string;
  studentId: string;
  courseCode: string;
  courseTitle: string;
  credits: number;
  at: string;
}): RegistrationInvoice {
  return {
    id: `INV-${input.registrationId}`,
    registrationId: input.registrationId,
    studentId: input.studentId,
    description: `ค่าลงทะเบียน ${input.courseCode} ${input.courseTitle}`,
    baseAmount: input.credits * 1_000,
    status: "locked",
    createdAt: input.at,
    updatedAt: input.at,
  };
}

export function unlockRegistrationInvoice(
  invoice: RegistrationInvoice,
  approvedAt = new Date().toISOString(),
): RegistrationInvoice {
  if (invoice.status === "paid") return invoice;
  return {
    ...invoice,
    status: "awaiting_payment",
    dueAt: createBangkokDueAt(approvedAt),
    updatedAt: approvedAt,
    cancelledAt: undefined,
  };
}

export function cancelRegistrationInvoice(
  invoice: RegistrationInvoice,
  at = new Date().toISOString(),
): RegistrationInvoice {
  if (invoice.status === "paid") return invoice;
  return { ...invoice, status: "cancelled", cancelledAt: at, updatedAt: at };
}

export function payRegistrationInvoice(
  invoice: RegistrationInvoice,
  at = new Date().toISOString(),
): RegistrationInvoice {
  if (invoice.status === "locked" || invoice.status === "cancelled") {
    throw new Error(`Invoice ${invoice.id} is not payable while ${invoice.status}`);
  }
  return { ...invoice, status: "paid", paidAt: at, updatedAt: at };
}

export function resolveInvoiceStatus(
  invoice: RegistrationInvoice,
  now: Date | string = new Date(),
): InvoiceDisplayStatus {
  if (invoice.status !== "awaiting_payment" || !invoice.dueAt) return invoice.status;
  const nowMs = typeof now === "string" ? new Date(now).getTime() : now.getTime();
  const dueMs = new Date(invoice.dueAt).getTime();
  if (Number.isNaN(nowMs) || Number.isNaN(dueMs)) return invoice.status;
  return nowMs > dueMs ? "overdue" : "awaiting_payment";
}

export function getInvoiceBreakdown(
  invoice: RegistrationInvoice,
  now: Date | string = new Date(),
) {
  const status = resolveInvoiceStatus(invoice, now);
  const lateFee = status === "overdue" ? invoicePolicy.lateFee : 0;
  return {
    baseAmount: invoice.baseAmount,
    lateFee,
    total: invoice.baseAmount + lateFee,
  };
}
