import { describe, expect, it } from "vitest";

import type { AcademicActor } from "./model";
import {
  createPendingSubjectResult,
  publishSubjectResult,
  reviseSubjectResult,
  saveSubjectResultDraft,
} from "./result-workflow";

const teacher: AcademicActor = {
  userId: "teacher-001",
  userName: "อาจารย์ทดสอบ",
  role: "teacher",
  organisationId: "org-inst-siriraj",
};

function pending() {
  return createPendingSubjectResult({
    id: "result-test",
    studentId: "student-001",
    courseOfferingId: "offering-001",
    teacherId: teacher.userId,
    at: "2026-08-01T00:00:00.000Z",
  });
}

describe("S/U result workflow", () => {
  it("saves a draft then publishes an immutable first revision", () => {
    const draft = saveSubjectResultDraft(pending(), "S", teacher, "2026-08-02T00:00:00.000Z");
    const published = publishSubjectResult(draft, teacher, "2026-08-03T00:00:00.000Z");

    expect(published).toMatchObject({ status: "published", currentValue: "S" });
    expect(published.revisions).toHaveLength(1);
    expect(published.revisions[0]).toMatchObject({ newValue: "S", actor: teacher });
    expect(draft.revisions).toEqual([]);
  });

  it("requires a reason and retains old/new values when revising", () => {
    const published = publishSubjectResult(
      saveSubjectResultDraft(pending(), "U", teacher),
      teacher,
    );

    expect(() => reviseSubjectResult(published, "S", "  ", teacher))
      .toThrowError("Result revision requires a reason");

    const revised = reviseSubjectResult(
      published,
      "S",
      "ตรวจหลักฐานใหม่",
      teacher,
      "2026-08-04T00:00:00.000Z",
    );
    expect(revised).toMatchObject({ status: "revised", currentValue: "S" });
    expect(revised.revisions).toHaveLength(2);
    expect(revised.revisions[1]).toMatchObject({
      previousValue: "U",
      newValue: "S",
      reason: "ตรวจหลักฐานใหม่",
    });
    expect(published.revisions).toHaveLength(1);
  });

  it("blocks another teacher and direct edits after publication", () => {
    const otherTeacher = { ...teacher, userId: "teacher-002" };
    expect(() => saveSubjectResultDraft(pending(), "S", otherTeacher))
      .toThrowError("Teacher cannot edit a result outside their assignment");

    const published = publishSubjectResult(saveSubjectResultDraft(pending(), "S", teacher), teacher);
    expect(() => saveSubjectResultDraft(published, "U", teacher))
      .toThrowError("Published results must use the revision workflow");
  });
});
