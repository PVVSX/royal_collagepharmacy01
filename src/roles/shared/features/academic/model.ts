import type { SystemRole } from "@/roles/shared/features/roles/access-model";

export type AcademicInstitutionKind = "hospital" | "university";

export interface AcademicInstitution {
  id: string;
  code: string;
  name: string;
  kind: AcademicInstitutionKind;
}

export interface AcademicStudent {
  id: string;
  name: string;
  licenseNumber: string;
}

export interface AcademicTeacher {
  id: string;
  name: string;
}

export type AcademicAffiliationStatus = "active" | "inactive";

interface AcademicAffiliationBase {
  id: string;
  institutionId: string;
  startsAt: string;
  endsAt?: string;
  status: AcademicAffiliationStatus;
}

export interface StudentAffiliation extends AcademicAffiliationBase {
  studentId: string;
}

export interface TeacherAffiliation extends AcademicAffiliationBase {
  teacherId: string;
}

export interface CourseOffering {
  id: string;
  courseCode: string;
  courseTitle: string;
  credits: number;
  term: string;
  section: string;
  institutionId: string;
  collegeCode: string;
  status: "open" | "closed";
}

export interface TeachingAssignment {
  id: string;
  teacherId: string;
  courseOfferingId: string;
  institutionId: string;
  startsAt: string;
  endsAt?: string;
  assignedBy: string;
  assignedAt: string;
}

export interface AcademicActor {
  userId: string;
  userName: string;
  role: SystemRole;
  organisationId: string;
}

export interface ScopedAcademicActor extends AcademicActor {
  resourceScopes: readonly string[];
}

export type CourseProposalActor = ScopedAcademicActor;

export type CourseProposalStatus =
  | "submitted"
  | "needs_revision"
  | "passed"
  | "rejected";

export type CourseProposalDecision = Exclude<CourseProposalStatus, "submitted">;

export type CourseProposalHistoryAction = "submitted" | "resubmitted" | "reviewed";

export interface CourseProposalHistoryEntry {
  id: string;
  action: CourseProposalHistoryAction;
  fromStatus?: CourseProposalStatus;
  toStatus: CourseProposalStatus;
  actor: CourseProposalActor;
  occurredAt: string;
  reason: string;
  evidenceReference?: string;
}

export interface CourseProposalReview {
  decision: CourseProposalDecision;
  note: string;
  actor: CourseProposalActor;
  reviewedAt: string;
  evidenceReference?: string;
}

export interface CourseProposal {
  id: string;
  proposerId: string;
  proposerName: string;
  institutionId: string;
  courseCode: string;
  courseTitle: string;
  credits: number;
  rationale: string;
  status: CourseProposalStatus;
  submittedAt: string;
  updatedAt: string;
  latestReview?: CourseProposalReview;
  history: CourseProposalHistoryEntry[];
}

export type SubjectResultValue = "S" | "U";
export type SubjectResultStatus = "pending" | "draft" | "published" | "revised";

export function formatSubjectResultValue(value?: SubjectResultValue) {
  if (value === "S") return "ผ่าน (S)";
  if (value === "U") return "ไม่ผ่าน (U)";
  return "—";
}

export interface SubjectResultRevision {
  id: string;
  previousValue?: SubjectResultValue;
  newValue: SubjectResultValue;
  reason?: string;
  actor: AcademicActor;
  createdAt: string;
}

export interface SubjectResult {
  id: string;
  studentId: string;
  courseOfferingId: string;
  teacherId: string;
  status: SubjectResultStatus;
  draftValue?: SubjectResultValue;
  currentValue?: SubjectResultValue;
  publishedAt?: string;
  updatedAt: string;
  revisions: SubjectResultRevision[];
}

export interface AcademicDataSnapshot {
  academicInstitutions: AcademicInstitution[];
  academicStudents: AcademicStudent[];
  academicTeachers: AcademicTeacher[];
  studentAffiliations: StudentAffiliation[];
  teacherAffiliations: TeacherAffiliation[];
  courseOfferings: CourseOffering[];
  teachingAssignments: TeachingAssignment[];
  courseProposals: CourseProposal[];
  subjectResults: SubjectResult[];
}
