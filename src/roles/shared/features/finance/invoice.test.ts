import { describe, expect, it } from "vitest";

import {
  createBangkokDueAt,
  createLockedRegistrationInvoice,
  getInvoiceBreakdown,
  resolveInvoiceStatus,
  unlockRegistrationInvoice,
} from "./invoice";

const locked = createLockedRegistrationInvoice({
  registrationId: "REG-1",
  studentId: "STUDENT-1",
  courseCode: "TEST-101",
  courseTitle: "วิชาทดสอบ",
  credits: 3,
  at: "2026-08-10T17:30:00.000Z",
});
describe("registration invoice", () => {
  it("creates Bangkok end-of-day dueAt without an interval", () => {
    expect(createBangkokDueAt("2026-08-10T17:30:00.000Z"))
      .toBe("2026-08-25T23:59:59+07:00");
  });

  it("stays awaiting at the deadline and becomes overdue after it", () => {
    const invoice = unlockRegistrationInvoice(locked, "2026-08-10T17:30:00.000Z");

    expect(resolveInvoiceStatus(invoice, invoice.dueAt)).toBe("awaiting_payment");
    expect(resolveInvoiceStatus(invoice, "2026-08-25T17:00:00.001Z")).toBe("overdue");
  });

  it("applies one 500-baht late fee without compounding", () => {
    const invoice = unlockRegistrationInvoice(locked, "2026-08-10T17:30:00.000Z");
    const first = getInvoiceBreakdown(invoice, "2026-09-01T00:00:00.000Z");
    const second = getInvoiceBreakdown(invoice, "2026-10-01T00:00:00.000Z");

    expect(first).toEqual({ baseAmount: 3_000, lateFee: 500, total: 3_500 });
    expect(second).toEqual(first);
  });
});
