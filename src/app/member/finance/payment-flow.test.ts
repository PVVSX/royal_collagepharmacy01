import { describe, expect, it } from "vitest";

import { currentMemberPaymentOwner } from "@/roles/shared/data";
import {
  createLockedRegistrationInvoice,
  type PaymentMethod,
} from "@/roles/shared/features/finance";

import {
  normalPaymentStatus,
  selectStudentRegistrationInvoices,
  studentFinanceOwnerIds,
} from "./payment-flow";

const currentInvoice = createLockedRegistrationInvoice({
  registrationId: "REG-CURRENT",
  studentId: currentMemberPaymentOwner.studentId,
  courseCode: "BCP-101",
  courseTitle: "เภสัชบำบัดพื้นฐาน",
  credits: 3,
  at: "2026-08-18T03:00:00.000Z",
});

describe("Student payment flow", () => {
  it.each<PaymentMethod>(["promptpay", "credit_card", "debit_card"])(
    "treats %s as a normal System-confirmed payment",
    (method) => {
      expect(normalPaymentStatus(method)).toBe("approved");
    },
  );

  it("keeps legacy aliases only for the matching current Student", () => {
    expect(studentFinanceOwnerIds(currentMemberPaymentOwner.studentId)).toEqual([
      currentMemberPaymentOwner.studentId,
      ...currentMemberPaymentOwner.legacyStudentIds,
    ]);
    expect(studentFinanceOwnerIds("STUDENT-OTHER")).toEqual(["STUDENT-OTHER"]);
  });

  it("does not expose another Student's invoices", () => {
    expect(selectStudentRegistrationInvoices([currentInvoice], "STUDENT-OTHER"))
      .toEqual([]);
  });
});
