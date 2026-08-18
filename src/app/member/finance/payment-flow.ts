import { resolveMockPaymentOwner } from "@/roles/shared/data";
import type {
  PaymentMethod,
  RegistrationInvoice,
} from "@/roles/shared/features/finance";

const NORMAL_PAYMENT_STATUS: Record<PaymentMethod, "approved"> = {
  promptpay: "approved",
  credit_card: "approved",
  debit_card: "approved",
};

export function normalPaymentStatus(method: PaymentMethod): "approved" {
  return NORMAL_PAYMENT_STATUS[method];
}

export function studentFinanceOwnerIds(studentId: string) {
  const normalizedStudentId = studentId.trim();
  if (!normalizedStudentId) return [];
  const owner = resolveMockPaymentOwner(normalizedStudentId);
  return [owner.studentId, ...(owner.legacyStudentIds ?? [])];
}

export function selectStudentRegistrationInvoices(
  invoices: readonly RegistrationInvoice[],
  studentId: string,
) {
  const ownerIds = new Set(studentFinanceOwnerIds(studentId));
  return invoices.filter((invoice) => ownerIds.has(invoice.studentId));
}
