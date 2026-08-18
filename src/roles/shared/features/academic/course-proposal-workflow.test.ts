import { describe, expect, it } from "vitest";

import {
  createCourseProposal,
  resubmitCourseProposalRecord,
  reviewCourseProposalRecord,
} from "./course-proposal-workflow";
import { DEFAULT_COURSE_PROPOSALS } from "./mock-data";
import { formatSubjectResultValue, type CourseProposalActor } from "./model";

const teacher: CourseProposalActor = {
  userId: "teacher-001",
  userName: "อาจารย์ทดสอบ",
  role: "teacher",
  organisationId: "org-inst-siriraj",
  resourceScopes: ["course:proposal"],
};

const staff: CourseProposalActor = {
  userId: "staff-001",
  userName: "เจ้าหน้าที่ทดสอบ",
  role: "royal_college_staff",
  organisationId: "org-royal-college",
  resourceScopes: ["staff:central"],
};

function submitted() {
  return createCourseProposal({
    id: "CPROP-TEST-001",
    actor: teacher,
    courseCode: "TEST-501",
    courseTitle: "รายวิชาทดสอบ",
    credits: 3,
    rationale: "ทดสอบการยื่นข้อเสนอรายวิชา",
    evidenceReference: "proposal-brief:TEST-501",
    at: "2026-08-18T01:00:00.000Z",
  });
}

describe("course proposal workflow", () => {
  it("creates a submitted proposal with an immutable actor and history snapshot", () => {
    const proposal = submitted();

    expect(proposal).toMatchObject({
      proposerId: teacher.userId,
      institutionId: teacher.organisationId,
      status: "submitted",
    });
    expect(proposal.history).toHaveLength(1);
    expect(proposal.history[0]).toMatchObject({
      action: "submitted",
      toStatus: "submitted",
      evidenceReference: "proposal-brief:TEST-501",
    });
    expect(proposal.history[0].actor).not.toBe(teacher);
    expect(proposal.history[0].actor.resourceScopes).not.toBe(teacher.resourceScopes);
  });

  it.each(["needs_revision", "passed", "rejected"] as const)(
    "records a %s review without mutating prior history",
    (decision) => {
      const before = submitted();
      const reviewed = reviewCourseProposalRecord({
        proposal: before,
        actor: staff,
        decision,
        reason: `เหตุผลสำหรับ ${decision}`,
        evidenceReference: `review:${decision}`,
        at: "2026-08-18T02:00:00.000Z",
      });

      expect(reviewed.status).toBe(decision);
      expect(reviewed.latestReview).toMatchObject({ decision, note: `เหตุผลสำหรับ ${decision}` });
      expect(reviewed.history).toHaveLength(2);
      expect(reviewed.history[1]).toMatchObject({
        action: "reviewed",
        fromStatus: "submitted",
        toStatus: decision,
      });
      expect(before.status).toBe("submitted");
      expect(before.history).toHaveLength(1);
    },
  );

  it("rejects an invalid runtime review decision", () => {
    expect(() => reviewCourseProposalRecord({
      proposal: submitted(),
      actor: staff,
      decision: "submitted" as never,
      reason: "สถานะนี้ไม่ใช่ผลการพิจารณา",
    })).toThrow("Course proposal review decision is invalid");
  });

  it("resubmits only a returned proposal and retains the complete prior history", () => {
    const returned = reviewCourseProposalRecord({
      proposal: submitted(),
      actor: staff,
      decision: "needs_revision",
      reason: "เพิ่มผลลัพธ์การเรียนรู้",
      evidenceReference: "review:return",
      at: "2026-08-18T02:00:00.000Z",
    });
    const resubmitted = resubmitCourseProposalRecord({
      proposal: returned,
      actor: teacher,
      courseCode: "TEST-501",
      courseTitle: "รายวิชาทดสอบ ฉบับปรับปรุง",
      credits: 3,
      rationale: "เพิ่มผลลัพธ์การเรียนรู้และวิธีประเมินแล้ว",
      reason: "ปรับตามข้อเสนอแนะของผู้ตรวจ",
      evidenceReference: "proposal-brief:TEST-501:v2",
      at: "2026-08-18T03:00:00.000Z",
    });

    expect(resubmitted).toMatchObject({ status: "submitted", courseTitle: "รายวิชาทดสอบ ฉบับปรับปรุง" });
    expect(resubmitted.history.map((entry) => entry.action)).toEqual([
      "submitted",
      "reviewed",
      "resubmitted",
    ]);
    expect(returned.status).toBe("needs_revision");
    expect(() => resubmitCourseProposalRecord({
      proposal: submitted(),
      actor: teacher,
      courseCode: "TEST-501",
      courseTitle: "รายวิชาทดสอบ",
      credits: 3,
      rationale: "รายละเอียด",
      reason: "แก้ไข",
      evidenceReference: "proposal-brief:test",
    })).toThrow("Only a course proposal needing revision can be resubmitted");
  });

  it("seeds all four synthetic statuses across two proposers", () => {
    expect(new Set(DEFAULT_COURSE_PROPOSALS.map((proposal) => proposal.status))).toEqual(
      new Set(["submitted", "needs_revision", "passed", "rejected"]),
    );
    expect(new Set(DEFAULT_COURSE_PROPOSALS.map((proposal) => proposal.proposerId))).toEqual(
      new Set(["teacher-001", "teacher-002"]),
    );
  });
});

describe("formatSubjectResultValue", () => {
  it("renders clear Thai S/U labels and an em dash for no result", () => {
    expect(formatSubjectResultValue("S")).toBe("ผ่าน (S)");
    expect(formatSubjectResultValue("U")).toBe("ไม่ผ่าน (U)");
    expect(formatSubjectResultValue(undefined)).toBe("—");
  });
});
