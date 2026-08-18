import { describe, expect, it } from "vitest";

import type { RegistrationRecord, RegistrationStatus } from "@/roles/shared/features/registration";

import { registrationTimelineSteps } from "./registration-timeline";

function registration(status: RegistrationStatus): RegistrationRecord {
  return {
    id: `registration-${status}`,
    studentId: "student-001",
    studentName: "ภก. ผู้เรียน ทดสอบระบบ",
    courseId: "course-001",
    courseOfferingId: "offering-001",
    institutionId: "institution-001",
    courseCode: "TEST-101",
    courseTitle: "รายวิชาทดสอบสถานะ",
    credits: 3,
    term: "1/2569",
    status,
    submittedAt: "2026-08-18T01:00:00.000Z",
    updatedAt: "2026-08-18T02:00:00.000Z",
    eligibility: {
      status: "active",
      decision: "eligible",
      checkedAt: "2026-08-18T01:05:00.000Z",
      evidenceReference: "license-registry:test",
    },
    history: [{
      id: `history-${status}`,
      to: status,
      actor: "system",
      at: "2026-08-18T02:00:00.000Z",
    }],
  };
}

describe("registrationTimelineSteps", () => {
  it.each([
    ["pending", undefined, undefined, ["completed", "completed", "waiting", "waiting", "waiting"], "teacher-review"],
    ["needs_info", undefined, undefined, ["completed", "completed", "action_required", "waiting", "waiting"], "teacher-review"],
    ["rejected", undefined, undefined, ["completed", "completed", "problem", "waiting", "waiting"], "teacher-review"],
    ["awaiting_payment", "awaiting_payment", "rejected", ["completed", "completed", "completed", "problem", "waiting"], "payment"],
    ["enrolled", "paid", "approved", ["completed", "completed", "completed", "completed", "completed"], "enrollment"],
  ] as const)("maps %s to semantic states", (status, invoice, payment, expectedStates, currentId) => {
    const item = registration(status);
    if (status === "awaiting_payment" || status === "enrolled") {
      item.teacherDecision = {
        decision: "approved",
        teacherId: "teacher-001",
        teacherName: "อ. ภก. ผู้สอน",
        decidedAt: "2026-08-18T01:30:00.000Z",
        reason: "ข้อมูลครบถ้วน",
      };
    }

    const steps = registrationTimelineSteps(item, invoice, payment);

    expect(steps.map((step) => step.state)).toEqual(expectedStates);
    expect(steps.find((step) => step.current)?.id).toBe(currentId);
  });

  it("keeps the completed journey visible after withdrawal without a false current stage", () => {
    const item = registration("withdrawn");
    item.history = [
      ...item.history,
      { id: "history-enrolled", to: "enrolled", actor: "system", at: "2026-08-18T02:30:00.000Z" },
      { id: "history-withdrawn", from: "drop_pending", to: "withdrawn", actor: "registrar", at: "2026-08-18T03:00:00.000Z" },
    ];

    const steps = registrationTimelineSteps(item, "paid", "approved");

    expect(steps.every((step) => step.state === "completed")).toBe(true);
    expect(steps.some((step) => step.current)).toBe(false);
  });
});
