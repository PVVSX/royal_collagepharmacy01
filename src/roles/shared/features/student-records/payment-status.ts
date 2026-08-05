import type {
  BillingStatus,
  SlipReviewStatus,
} from "./model";

export type ReviewStatus = "pending" | "approved" | "rejected";
export type StudentPaymentStatus = "paid" | "unpaid" | "pending";
export type PaymentStatusItem<T extends { status: string }> = Omit<T, "status"> & {
  status: StudentPaymentStatus;
};

type ReviewRecord = {
  studentId?: string;
  type: string;
  status: ReviewStatus;
};

export type PaymentOwnerScope = {
  studentId: string;
  legacyStudentIds?: readonly string[];
};

const studentStatusByReview: Record<ReviewStatus, StudentPaymentStatus> = {
  pending: "pending",
  approved: "paid",
  rejected: "unpaid",
};

function requireStudentPaymentStatus(status: string): StudentPaymentStatus {
  if (status === "paid" || status === "unpaid" || status === "pending") {
    return status;
  }
  throw new Error(`Unsupported student payment status: ${status}`);
}

function findMatchingReview<T extends { description: string }>(
  item: T,
  payments: readonly ReviewRecord[],
  owner?: PaymentOwnerScope,
) {
  return payments.find((payment) => {
    if (payment.type !== item.description) return false;
    if (!owner) return true;

    return payment.studentId === owner.studentId ||
      owner.legacyStudentIds?.includes(payment.studentId ?? "") === true;
  });
}

export function mergePaymentStatuses<T extends { description: string; status: string }>(
  items: readonly T[],
  payments: readonly ReviewRecord[],
  owner?: PaymentOwnerScope,
): PaymentStatusItem<T>[] {
  return items.map((item) => {
    const matchedPayment = findMatchingReview(item, payments, owner);
    return {
      ...item,
      status: matchedPayment
        ? studentStatusByReview[matchedPayment.status]
        : requireStudentPaymentStatus(item.status),
    };
  });
}

export function mergeStudentRecordPaymentStatuses<
  T extends {
    description: string;
    status: string;
    billingStatus: BillingStatus;
    slipReviewStatus: SlipReviewStatus;
  },
>(
  items: readonly T[],
  payments: readonly ReviewRecord[],
  owner?: PaymentOwnerScope,
) {
  return mergePaymentStatuses(items, payments, owner).map((item) => {
    const matchedPayment = findMatchingReview(item, payments, owner);
    if (!matchedPayment) return item;

    const statusByReview: Record<
      ReviewStatus,
      { billingStatus: BillingStatus; slipReviewStatus: SlipReviewStatus }
    > = {
      pending: {
        billingStatus: "awaiting_payment",
        slipReviewStatus: "pending_review",
      },
      approved: {
        billingStatus: "paid",
        slipReviewStatus: "approved",
      },
      rejected: {
        billingStatus: item.billingStatus === "paid" ? "awaiting_payment" : item.billingStatus,
        slipReviewStatus: "rejected",
      },
    };

    return { ...item, ...statusByReview[matchedPayment.status] };
  });
}
