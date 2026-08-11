import { describe, expect, it } from "vitest";

import {
  normalizeRegistrationInvoices,
  normalizeRegistrations,
} from "./mock-db-provider";

describe("mock DB registration migration", () => {
  it("upgrades legacy registration records with history and credits", () => {
    const [registration] = normalizeRegistrations([{
      id: "REG-LEGACY",
      studentId: "STUDENT-OLD",
      studentName: "ผู้ใช้เดิม",
      courseId: "OLD-101",
      courseCode: "OLD-101",
      courseTitle: "วิชาเดิม",
      term: "1/2569",
      status: "approved",
      submittedAt: "24 มิ.ย. 2569",
    }]);

    expect(registration).toMatchObject({
      id: "REG-LEGACY",
      credits: 3,
      status: "approved",
    });
    expect(registration.history[0]).toMatchObject({
      to: "approved",
      actor: "migration",
    });
  });

  it("creates and unlocks a missing invoice for a legacy approval", () => {
    const registrations = normalizeRegistrations([{
      id: "REG-LEGACY",
      studentId: "STUDENT-OLD",
      studentName: "ผู้ใช้เดิม",
      courseId: "OLD-101",
      courseCode: "OLD-101",
      courseTitle: "วิชาเดิม",
      term: "1/2569",
      status: "approved",
      submittedAt: "2026-06-24T03:00:00.000Z",
    }]);
    const invoice = normalizeRegistrationInvoices([], registrations)
      .find((item) => item.registrationId === "REG-LEGACY");

    expect(invoice?.status).toBe("awaiting_payment");
    expect(invoice?.dueAt).toMatch(/T23:59:59\+07:00$/);
  });
});
