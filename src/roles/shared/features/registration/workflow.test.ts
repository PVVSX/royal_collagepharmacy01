import { describe, expect, it } from "vitest";

import {
  createEligibilityCheckedRegistration,
  createSubmittedRegistration,
  markRegistrationAwaitingPayment,
  markRegistrationEnrolled,
  recordTeacherRegistrationDecision,
  resubmitRegistration,
  transitionRegistration,
} from "./workflow";

const selected = {
  id: "REG-TEST",
  studentId: "STUDENT-1",
  studentName: "ผู้ทดสอบ",
  courseId: "COURSE-1",
  courseCode: "TEST-101",
  courseTitle: "วิชาทดสอบ",
  credits: 3,
  term: "1/2569",
};

describe("registration workflow", () => {
  it("records selected, submitted and pending when member submits", () => {
    const registration = createSubmittedRegistration(selected, "2026-08-11T02:00:00.000Z");

    expect(registration.status).toBe("pending");
    expect(registration.history.map((event) => event.to)).toEqual([
      "selected",
      "submitted",
      "pending",
    ]);
  });

  it("requires a reason when more information is requested", () => {
    const registration = createSubmittedRegistration(selected);

    expect(() => transitionRegistration(registration, "needs_info", "registrar"))
      .toThrowError("Registration transition to needs_info requires a reason");
  });

  it("supports needs-info resubmission and approved withdrawal", () => {
    const pending = createSubmittedRegistration(selected);
    const needsInfo = transitionRegistration(pending, "needs_info", "registrar", {
      reason: "แนบเอกสารเพิ่ม",
    });
    const resubmitted = resubmitRegistration(needsInfo);
    const approved = transitionRegistration(resubmitted, "approved", "registrar");
    const dropPending = transitionRegistration(approved, "drop_pending", "member");
    const withdrawn = transitionRegistration(dropPending, "withdrawn", "registrar");

    expect(withdrawn.status).toBe("withdrawn");
    expect(withdrawn.history.map((event) => event.to)).toContain("drop_pending");
  });

  it("rejects transitions outside the state machine", () => {
    const pending = createSubmittedRegistration(selected);

    expect(() => transitionRegistration(pending, "withdrawn", "registrar"))
      .toThrowError("Invalid registration transition: pending -> withdrawn");
  });

  it("records eligibility, teacher identity and System enrollment transitions", () => {
    const pending = createEligibilityCheckedRegistration(selected, {
      status: "active",
      decision: "eligible",
      checkedAt: "2026-08-11T01:00:00.000Z",
      evidenceReference: "registry:ภ.12345:2026-08-11",
    }, "2026-08-11T01:00:00.000Z");
    const approved = recordTeacherRegistrationDecision(pending, "approved", {
      userId: "teacher-001",
      userName: "อาจารย์ทดสอบ",
      role: "teacher",
      organisationId: "org-inst-siriraj",
    }, {
      at: "2026-08-11T02:00:00.000Z",
      reason: "ตรวจคุณสมบัติและข้อมูลรายวิชาครบถ้วน",
      evidenceReference: "assignment:teaching-assignment-001",
    });
    const awaitingPayment = markRegistrationAwaitingPayment(approved, "2026-08-11T02:00:00.000Z");
    const enrolled = markRegistrationEnrolled(awaitingPayment, "2026-08-12T02:00:00.000Z");

    expect(enrolled.status).toBe("enrolled");
    expect(enrolled.eligibility?.decision).toBe("eligible");
    expect(enrolled.teacherDecision).toMatchObject({
      teacherId: "teacher-001",
      decision: "approved",
    });
    expect(enrolled.history.map((event) => event.to)).toEqual([
      "selected",
      "submitted",
      "pending",
      "approved",
      "awaiting_payment",
      "enrolled",
    ]);
    expect(enrolled.history[3]).toMatchObject({
      actor: "teacher",
      actorUserId: "teacher-001",
      actorRole: "teacher",
      organisationId: "org-inst-siriraj",
    });
  });

  it("blocks ineligible submissions and requires teacher reasons", () => {
    expect(() => createEligibilityCheckedRegistration(selected, {
      status: "revoked",
      decision: "ineligible",
      checkedAt: "2026-08-11T01:00:00.000Z",
      evidenceReference: "registry:ภ.45678:2026-08-11",
    })).toThrowError("Registration eligibility is ineligible");

    const pending = createSubmittedRegistration(selected);
    expect(() => recordTeacherRegistrationDecision(pending, "needs_info", {
      userId: "teacher-001",
      userName: "อาจารย์ทดสอบ",
      role: "teacher",
      organisationId: "org-inst-siriraj",
    })).toThrowError("Teacher registration decisions require a reason");
  });
});
