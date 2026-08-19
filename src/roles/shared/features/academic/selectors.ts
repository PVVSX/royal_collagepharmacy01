import type { RegistrationRecord } from "@/roles/shared/features/registration";

import type {
  AcademicStudent,
  AcademicTeacher,
  CourseOffering,
  StudentAffiliation,
  SubjectResult,
  TeacherAffiliation,
  TeachingAssignment,
} from "./model";

function timestamp(value: string | undefined) {
  return value ? new Date(value).getTime() : Number.POSITIVE_INFINITY;
}

export function isAcademicAssignmentActive(
  assignment: Pick<TeachingAssignment, "startsAt" | "endsAt">,
  at: Date = new Date(),
) {
  const current = at.getTime();
  return current >= timestamp(assignment.startsAt) && current < timestamp(assignment.endsAt);
}

export function isAcademicAffiliationActive(
  affiliation: Pick<StudentAffiliation | TeacherAffiliation, "startsAt" | "endsAt" | "status">,
  at: Date = new Date(),
) {
  return affiliation.status === "active" && isAcademicAssignmentActive(affiliation, at);
}

export function selectActiveTeachingAssignments(
  assignments: readonly TeachingAssignment[],
  teacherId: string,
  at: Date = new Date(),
) {
  return assignments.filter((assignment) => (
    assignment.teacherId === teacherId &&
    assignment.status === "accepted" &&
    isAcademicAssignmentActive(assignment, at)
  ));
}

export function canTeacherAccessOffering(
  assignments: readonly TeachingAssignment[],
  teacherId: string,
  courseOfferingId: string,
  at: Date = new Date(),
) {
  return selectActiveTeachingAssignments(assignments, teacherId, at)
    .some((assignment) => assignment.courseOfferingId === courseOfferingId);
}

export function canTeacherAccessOfferingWithinAffiliation(
  assignments: readonly TeachingAssignment[],
  affiliations: readonly TeacherAffiliation[],
  teacherId: string,
  institutionId: string,
  courseOfferingId: string,
  at: Date = new Date(),
) {
  const hasActiveAffiliation = affiliations.some((affiliation) => (
    affiliation.teacherId === teacherId &&
    affiliation.institutionId === institutionId &&
    isAcademicAffiliationActive(affiliation, at)
  ));
  if (!hasActiveAffiliation) return false;

  return selectActiveTeachingAssignments(assignments, teacherId, at)
    .some((assignment) => (
      assignment.institutionId === institutionId &&
      assignment.courseOfferingId === courseOfferingId
    ));
}

export function selectTeacherCourseOfferings(
  offerings: readonly CourseOffering[],
  assignments: readonly TeachingAssignment[],
  teacherId: string,
  at: Date = new Date(),
) {
  const offeringIds = new Set(
    selectActiveTeachingAssignments(assignments, teacherId, at)
      .map((assignment) => assignment.courseOfferingId),
  );
  return offerings.filter((offering) => offeringIds.has(offering.id));
}

export function selectTeacherRegistrations(
  registrations: readonly RegistrationRecord[],
  assignments: readonly TeachingAssignment[],
  teacherId: string,
  at: Date = new Date(),
) {
  const offeringIds = new Set(
    selectActiveTeachingAssignments(assignments, teacherId, at)
      .map((assignment) => assignment.courseOfferingId),
  );
  return registrations.filter((registration) => (
    Boolean(registration.courseOfferingId) && offeringIds.has(registration.courseOfferingId!)
  ));
}

export function selectInstitutionStudents(
  students: readonly AcademicStudent[],
  affiliations: readonly StudentAffiliation[],
  institutionId: string,
  at: Date = new Date(),
) {
  const studentIds = new Set(affiliations
    .filter((affiliation) => (
      affiliation.institutionId === institutionId && isAcademicAffiliationActive(affiliation, at)
    ))
    .map((affiliation) => affiliation.studentId));
  return students.filter((student) => studentIds.has(student.id));
}

export function selectInstitutionTeachers(
  teachers: readonly AcademicTeacher[],
  affiliations: readonly TeacherAffiliation[],
  institutionId: string,
  at: Date = new Date(),
) {
  const teacherIds = new Set(affiliations
    .filter((affiliation) => (
      affiliation.institutionId === institutionId && isAcademicAffiliationActive(affiliation, at)
    ))
    .map((affiliation) => affiliation.teacherId));
  return teachers.filter((teacher) => teacherIds.has(teacher.id));
}

export function selectInstitutionOfferings(
  offerings: readonly CourseOffering[],
  institutionId: string,
) {
  return offerings.filter((offering) => offering.institutionId === institutionId);
}

export function selectInstitutionRegistrations(
  registrations: readonly RegistrationRecord[],
  offerings: readonly CourseOffering[],
  institutionId: string,
) {
  const offeringIds = new Set(selectInstitutionOfferings(offerings, institutionId).map((item) => item.id));
  return registrations.filter((registration) => (
    registration.institutionId === institutionId ||
    Boolean(registration.courseOfferingId && offeringIds.has(registration.courseOfferingId))
  ));
}

export function selectInstitutionResults(
  results: readonly SubjectResult[],
  offerings: readonly CourseOffering[],
  institutionId: string,
) {
  const offeringIds = new Set(selectInstitutionOfferings(offerings, institutionId).map((item) => item.id));
  return results.filter((result) => offeringIds.has(result.courseOfferingId));
}

export function selectLatestPublishedSubjectResult(
  results: readonly SubjectResult[],
  studentId: string,
  courseOfferingId: string,
) {
  return results
    .filter((result) => (
      result.studentId === studentId &&
      result.courseOfferingId === courseOfferingId &&
      (result.status === "published" || result.status === "revised") &&
      Boolean(result.currentValue)
    ))
    .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt))[0] ?? null;
}
