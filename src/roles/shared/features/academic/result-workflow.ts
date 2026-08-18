import type {
  AcademicActor,
  SubjectResult,
  SubjectResultValue,
} from "./model";

export function createPendingSubjectResult(input: {
  id: string;
  studentId: string;
  courseOfferingId: string;
  teacherId: string;
  at?: string;
}): SubjectResult {
  return {
    id: input.id,
    studentId: input.studentId,
    courseOfferingId: input.courseOfferingId,
    teacherId: input.teacherId,
    status: "pending",
    updatedAt: input.at ?? new Date().toISOString(),
    revisions: [],
  };
}

export function saveSubjectResultDraft(
  result: SubjectResult,
  value: SubjectResultValue,
  actor: AcademicActor,
  at = new Date().toISOString(),
): SubjectResult {
  if (result.teacherId !== actor.userId || actor.role !== "teacher") {
    throw new Error("Teacher cannot edit a result outside their assignment");
  }
  if (result.status === "published" || result.status === "revised") {
    throw new Error("Published results must use the revision workflow");
  }
  return { ...result, status: "draft", draftValue: value, updatedAt: at };
}

export function publishSubjectResult(
  result: SubjectResult,
  actor: AcademicActor,
  at = new Date().toISOString(),
): SubjectResult {
  if (result.teacherId !== actor.userId || actor.role !== "teacher") {
    throw new Error("Teacher cannot publish a result outside their assignment");
  }
  if (result.status !== "draft" || !result.draftValue) {
    throw new Error("ต้องบันทึกร่างผลแบบผ่าน/ไม่ผ่านก่อนประกาศผล");
  }
  const revision = {
    id: `${result.id}-revision-${result.revisions.length + 1}`,
    newValue: result.draftValue,
    actor: { ...actor },
    createdAt: at,
  };
  return {
    ...result,
    status: "published",
    currentValue: result.draftValue,
    draftValue: undefined,
    publishedAt: at,
    updatedAt: at,
    revisions: [...result.revisions, revision],
  };
}

export function reviseSubjectResult(
  result: SubjectResult,
  value: SubjectResultValue,
  reason: string,
  actor: AcademicActor,
  at = new Date().toISOString(),
): SubjectResult {
  if (result.teacherId !== actor.userId || actor.role !== "teacher") {
    throw new Error("Teacher cannot revise a result outside their assignment");
  }
  if ((result.status !== "published" && result.status !== "revised") || !result.currentValue) {
    throw new Error("แก้ไขได้เฉพาะผลแบบผ่าน/ไม่ผ่านที่ประกาศแล้ว");
  }
  const normalizedReason = reason.trim();
  if (!normalizedReason) throw new Error("Result revision requires a reason");

  return {
    ...result,
    status: "revised",
    currentValue: value,
    updatedAt: at,
    revisions: [...result.revisions, {
      id: `${result.id}-revision-${result.revisions.length + 1}`,
      previousValue: result.currentValue,
      newValue: value,
      reason: normalizedReason,
      actor: { ...actor },
      createdAt: at,
    }],
  };
}
