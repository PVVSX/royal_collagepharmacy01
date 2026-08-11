import { describe, expect, it } from "vitest";

import {
  createSubmittedRegistration,
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
});
