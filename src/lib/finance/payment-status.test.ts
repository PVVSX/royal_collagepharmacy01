import { describe, expect, it } from "vitest";

import { mergePaymentStatuses } from "./payment-status";

const fee = {
  id: 1,
  description: "ค่าลงทะเบียนเรียน",
  amount: 25_000,
  dueDate: "30 มิถุนายน 2569",
  status: "unpaid" as const,
};

describe("mergePaymentStatuses", () => {
  it("maps a pending review to a pending student payment", () => {
    const result = mergePaymentStatuses([fee], [
      { type: fee.description, status: "pending" },
    ]);

    expect(result[0].status).toBe("pending");
  });

  it("maps an approved review to a paid student payment", () => {
    const result = mergePaymentStatuses([fee], [
      { type: fee.description, status: "approved" },
    ]);

    expect(result[0].status).toBe("paid");
  });

  it("maps a rejected review back to an unpaid student payment", () => {
    const result = mergePaymentStatuses(
      [{ ...fee, status: "pending" }],
      [{ type: fee.description, status: "rejected" }],
    );

    expect(result[0].status).toBe("unpaid");
  });

  it("keeps the original status when no review matches the fee", () => {
    const result = mergePaymentStatuses([fee], [
      { type: "ค่าธรรมเนียมอื่น", status: "approved" },
    ]);

    expect(result[0]).toEqual(fee);
  });

  it("rejects an unsupported base payment status", () => {
    expect(() =>
      mergePaymentStatuses(
        [{ ...fee, status: "approved" }],
        [],
      ),
    ).toThrowError("Unsupported student payment status: approved");
  });
});
