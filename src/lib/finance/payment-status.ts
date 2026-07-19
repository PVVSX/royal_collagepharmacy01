export type ReviewStatus = "pending" | "approved" | "rejected";
export type StudentPaymentStatus = "paid" | "unpaid" | "pending";
export type PaymentStatusItem<T extends { status: string }> = Omit<
  T,
  "status"
> & {
  status: StudentPaymentStatus;
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

export function mergePaymentStatuses<T extends { description: string; status: string }>(
  items: readonly T[],
  payments: readonly { type: string; status: ReviewStatus }[],
): PaymentStatusItem<T>[] {
  return items.map((item) => {
    const matchedPayment = payments.find(
      (payment) => payment.type === item.description,
    );

    return {
      ...item,
      status: matchedPayment
        ? studentStatusByReview[matchedPayment.status]
        : requireStudentPaymentStatus(item.status),
    };
  });
}
