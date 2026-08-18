"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import {
  createAdmissionDocuments,
  type AdmissionDocument,
  type AdmissionDocumentStatus,
} from "@/roles/shared/features/admissions/documents";
import {
  defaultResearchSubmissions,
  type ResearchSubmission,
  type ResearchSubmissionStatus,
} from "@/roles/shared/features/research/types";
import type { FileMetadata } from "@/roles/shared/features/file-metadata";
import { currentMemberPassport } from "@/roles/shared/member/domain/member";
import {
  createEligibilityCheckedRegistration,
  isRegistrationStatus,
  markRegistrationAwaitingPayment,
  markRegistrationEnrolled,
  recordTeacherRegistrationDecision,
  resubmitRegistration as resubmitRegistrationRecord,
  transitionRegistration,
  type RegistrationHistoryEntry,
  type RegistrationRecord,
  type RegistrationSelectionInput,
  type RegistrationStatus,
  type RegistrationActionActor,
  type RegistrationEligibilitySnapshot,
  type RegistrationTeacherDecision,
} from "@/roles/shared/features/registration";
import {
  cancelRegistrationInvoice,
  createLockedRegistrationInvoice,
  payRegistrationInvoice,
  unlockRegistrationInvoice,
  type PaymentMethod,
  type RegistrationInvoice,
} from "@/roles/shared/features/finance";
import {
  findLicenseRegistryRecord,
  getLicenseEligibility,
  isLicenseStatus,
} from "@/roles/shared/features/license-eligibility";
import type { LicenseVerificationStatus } from "@/roles/shared/features/license-eligibility";
import {
  DEFAULT_ACADEMIC_INSTITUTIONS,
  DEFAULT_ACADEMIC_STUDENTS,
  DEFAULT_ACADEMIC_TEACHERS,
  DEFAULT_COURSE_PROPOSALS,
  DEFAULT_COURSE_OFFERINGS,
  DEFAULT_STUDENT_AFFILIATIONS,
  DEFAULT_SUBJECT_RESULTS,
  DEFAULT_TEACHER_AFFILIATIONS,
  DEFAULT_TEACHING_ASSIGNMENTS,
  canTeacherAccessOffering,
  createCourseProposal as createCourseProposalRecord,
  createPendingSubjectResult,
  isAcademicAffiliationActive,
  publishSubjectResult as publishSubjectResultRecord,
  reviseSubjectResult as reviseSubjectResultRecord,
  reviewCourseProposalRecord,
  resubmitCourseProposalRecord,
  saveSubjectResultDraft as saveSubjectResultDraftRecord,
  type AcademicActor,
  type AcademicInstitution,
  type AcademicStudent,
  type AcademicTeacher,
  type CourseProposal,
  type CourseProposalActor,
  type CourseProposalDecision,
  type CourseOffering,
  type ScopedAcademicActor,
  type StudentAffiliation,
  type SubjectResult,
  type SubjectResultValue,
  type TeacherAffiliation,
  type TeachingAssignment,
} from "@/roles/shared/features/academic";
import {
  appendAuditEvent,
  useAuditLog,
  type UserAuditEvent,
} from "@/roles/shared/features/audit";
import {
  ORGANISATIONS,
  ORGANISATION_LIST,
  hasResourceScope,
  isSystemRole,
  type OrganisationScope,
} from "@/roles/shared/features/roles/access-model";

// Types
export type Status = "pending" | "approved" | "rejected";

export interface Admission {
  id: string;
  name: string;
  license: string;
  program: string;
  date: string;
  status: Status;
  documents: AdmissionDocument[];
  documentStatus: AdmissionDocumentStatus;
  documentNote?: string;
  licenseStatus: LicenseVerificationStatus;
  licenseCheckedAt: string;
}

export interface Payment {
  id: string;
  studentId: string;
  name: string;
  program: string;
  amount: number;
  date: string;
  status: Status;
  type: string;
  invoiceId?: string;
  method?: PaymentMethod;
  referenceNo?: string;
  submittedAt?: string;
}

export interface Program {
  id: string;
  name: string;
  studentsCount: number;
  status: "active" | "draft";
  lastUpdated: string;
}

export interface CourseRequest {
  id: string;
  collegeName: string;
  courseCode: string;
  courseTitle: string;
  type: string;
  duration: string;
  capacity: number;
  status: Status;
  submittedAt: string;
}

export type Registration = RegistrationRecord;

export interface ExamRequest {
  id: string;
  studentId: string;
  studentName: string;
  program: string;
  examType: string;
  logbookUrl: string;
  status: "pending" | "approved" | "rejected" | "passed" | "failed";
  submittedAt: string;
  examDate?: string;
}

export interface Certificate {
  id: string;
  studentId: string;
  studentName: string;
  program: string;
  issuedAt: string;
  status: "pending_approval" | "issued";
}

export interface Settings {
  admissionOpen: boolean;
  registrationOpen: boolean;
}

export interface RegistrationReviewInput {
  registrationId: string;
  decision: "approve" | "needs_info" | "reject";
  actor: ScopedAcademicActor;
  reason?: string;
  evidenceReference?: string;
}

export interface TeachingAssignmentInput {
  teacherId: string;
  courseOfferingId: string;
  actor: AcademicActor;
  startsAt?: string;
  endsAt?: string;
}

export interface AffiliationStatusInput {
  affiliationType: "student" | "teacher";
  affiliationId: string;
  status: "active" | "inactive";
  actor: AcademicActor;
  reason: string;
}

export interface CourseOfferingStatusInput {
  courseOfferingId: string;
  status: CourseOffering["status"];
  actor: AcademicActor;
  reason: string;
}

export interface SubjectResultDraftInput {
  resultId: string;
  value: SubjectResultValue;
  actor: ScopedAcademicActor;
}

export interface SubjectResultRevisionInput extends SubjectResultDraftInput {
  reason: string;
}

export interface CourseProposalSubmissionInput {
  actor: CourseProposalActor;
  courseCode: string;
  courseTitle: string;
  credits: number;
  rationale: string;
  evidenceReference?: string;
}

export interface CourseProposalResubmissionInput extends CourseProposalSubmissionInput {
  proposalId: string;
  reason: string;
}

export interface CourseProposalReviewInput {
  proposalId: string;
  actor: CourseProposalActor;
  decision: CourseProposalDecision;
  reason: string;
  evidenceReference?: string;
}

export type RegistrationSubmissionInput = Omit<
  RegistrationSelectionInput,
  "id" | "eligibility"
>;

interface MockDbContextType {
  isLoaded: boolean;
  admissions: Admission[];
  setAdmissions: React.Dispatch<React.SetStateAction<Admission[]>>;
  updateAdmissionStatus: (id: string, status: Status) => void;
  updateAdmissionDocuments: (
    id: string,
    documents: AdmissionDocument[],
    documentStatus?: AdmissionDocumentStatus,
    documentNote?: string,
  ) => void;

  researchSubmissions: ResearchSubmission[];
  setResearchSubmissions: React.Dispatch<React.SetStateAction<ResearchSubmission[]>>;
  addResearchSubmission: (submission: ResearchSubmission) => void;
  updateResearchSubmissionStatus: (
    id: string,
    status: ResearchSubmissionStatus,
    reviewerNote?: string,
  ) => void;
  
  payments: Payment[];
  setPayments: React.Dispatch<React.SetStateAction<Payment[]>>;
  updatePaymentStatus: (id: string, status: Status) => void;
  addPayment: (payment: Payment) => void;

  programs: Program[];
  setPrograms: React.Dispatch<React.SetStateAction<Program[]>>;

  courseRequests: CourseRequest[];
  setCourseRequests: React.Dispatch<React.SetStateAction<CourseRequest[]>>;
  updateCourseRequestStatus: (id: string, status: Status) => void;

  registrations: Registration[];
  setRegistrations: React.Dispatch<React.SetStateAction<Registration[]>>;
  registrationInvoices: RegistrationInvoice[];
  submitRegistrations: (
    selections: RegistrationSubmissionInput[],
  ) => Registration[];
  resubmitRegistration: (id: string) => void;
  requestRegistrationDrop: (id: string, reason?: string) => void;
  updateRegistrationStatus: (
    id: string,
    status: RegistrationStatus,
    reason?: string,
  ) => void;

  academicInstitutions: AcademicInstitution[];
  academicStudents: AcademicStudent[];
  academicTeachers: AcademicTeacher[];
  studentAffiliations: StudentAffiliation[];
  teacherAffiliations: TeacherAffiliation[];
  courseOfferings: CourseOffering[];
  teachingAssignments: TeachingAssignment[];
  courseProposals: CourseProposal[];
  subjectResults: SubjectResult[];
  auditEvents: UserAuditEvent[];
  reviewRegistration: (input: RegistrationReviewInput) => void;
  assignTeacherToCourse: (input: TeachingAssignmentInput) => void;
  updateAffiliationStatus: (input: AffiliationStatusInput) => void;
  updateCourseOfferingStatus: (input: CourseOfferingStatusInput) => void;
  submitCourseProposal: (input: CourseProposalSubmissionInput) => void;
  resubmitCourseProposal: (input: CourseProposalResubmissionInput) => void;
  reviewCourseProposal: (input: CourseProposalReviewInput) => void;
  saveSubjectResultDraft: (input: SubjectResultDraftInput) => void;
  publishSubjectResult: (input: { resultId: string; actor: ScopedAcademicActor }) => void;
  reviseSubjectResult: (input: SubjectResultRevisionInput) => void;

  examRequests: ExamRequest[];
  setExamRequests: React.Dispatch<React.SetStateAction<ExamRequest[]>>;
  updateExamRequestStatus: (id: string, status: ExamRequest["status"]) => void;

  certificates: Certificate[];
  setCertificates: React.Dispatch<React.SetStateAction<Certificate[]>>;
  updateCertificateStatus: (id: string, status: Certificate["status"]) => void;

  settings: Settings;
  updateSettings: (settings: Partial<Settings>) => void;
}

const exampleSubmittedDocumentIds = new Set([
  "application-photo",
  "degree",
  "license",
  "transcript",
  "recommendation",
  "cv",
  "permission",
]);

function createMockSubmittedDocuments(options?: { missingId?: string; accepted?: boolean }) {
  return createAdmissionDocuments().map((document) => {
    const isMissing = document.id === options?.missingId;
    const hasFile = exampleSubmittedDocumentIds.has(document.id) && !isMissing;
    return {
      ...document,
      file: hasFile
        ? {
            name: `${document.id}.pdf`,
            type: "application/pdf",
            size: 420000,
            lastModified: 1783209600000,
          }
        : undefined,
      reviewStatus: isMissing
        ? "missing" as const
        : hasFile && options?.accepted
          ? "accepted" as const
          : hasFile
            ? "pending" as const
            : "not_applicable" as const,
      reviewerNote: isMissing ? "กรุณาแนบเอกสารฉบับที่อ่านวันหมดอายุได้ชัดเจน" : undefined,
    };
  });
}

function isFileMetadata(value: unknown): value is FileMetadata {
  if (!value || typeof value !== "object") return false;
  const file = value as Partial<FileMetadata>;
  return (
    typeof file.name === "string" &&
    typeof file.type === "string" &&
    typeof file.size === "number" &&
    typeof file.lastModified === "number"
  );
}

function isResearchSubmission(value: unknown): value is ResearchSubmission {
  if (!value || typeof value !== "object") return false;
  const submission = value as Partial<ResearchSubmission>;
  return (
    typeof submission.id === "string" &&
    typeof submission.title === "string" &&
    typeof submission.authors === "string" &&
    typeof submission.type === "string" &&
    typeof submission.field === "string" &&
    typeof submission.journal === "string" &&
    typeof submission.publisher === "string" &&
    typeof submission.year === "number" &&
    typeof submission.language === "string" &&
    typeof submission.doi === "string" &&
    typeof submission.abstract === "string" &&
    typeof submission.consentToPublish === "boolean" &&
    typeof submission.submittedAt === "string" &&
    (submission.status === "pending" ||
      submission.status === "approved" ||
      submission.status === "rejected") &&
    (!submission.articleFile || isFileMetadata(submission.articleFile)) &&
    (!submission.acceptanceFile || isFileMetadata(submission.acceptanceFile))
  );
}

function normalizeResearchSubmissions(value: unknown): ResearchSubmission[] {
  if (!Array.isArray(value)) return defaultResearchSubmissions;
  const validStored = value.filter(isResearchSubmission);
  const storedIds = new Set(validStored.map((submission) => submission.id));
  return [
    ...validStored,
    ...defaultResearchSubmissions.filter((submission) => !storedIds.has(submission.id)),
  ];
}

function normalizeAdmissionDocuments(
  value: unknown,
  admissionStatus: Status,
): AdmissionDocument[] {
  if (!Array.isArray(value) || value.length === 0) {
    return admissionStatus === "approved"
      ? createMockSubmittedDocuments({ accepted: true })
      : createAdmissionDocuments();
  }

  const storedById = new Map(
    value
      .filter((document): document is Record<string, unknown> => (
        Boolean(document) && typeof document === "object" && typeof document.id === "string"
      ))
      .map((document) => [document.id as string, document]),
  );

  return createAdmissionDocuments().map((requirement) => {
    const stored = storedById.get(requirement.id);
    if (!stored) return requirement;

    const file = isFileMetadata(stored.file) ? stored.file : undefined;
    const reviewStatus =
      stored.reviewStatus === "accepted" ||
      stored.reviewStatus === "missing" ||
      stored.reviewStatus === "not_applicable" ||
      stored.reviewStatus === "pending"
        ? stored.reviewStatus
        : file
          ? admissionStatus === "approved" ? "accepted" : "pending"
          : requirement.required ? "pending" : "not_applicable";

    return {
      ...requirement,
      file,
      reviewStatus,
      reviewerNote: typeof stored.reviewerNote === "string" ? stored.reviewerNote : undefined,
    };
  });
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function normalizeAdmission(value: unknown): Admission | null {
  if (!value || typeof value !== "object") return null;
  const admission = value as Partial<Admission>;
  if (
    !isNonEmptyString(admission.id) ||
    !isNonEmptyString(admission.name) ||
    !isNonEmptyString(admission.license) ||
    !isNonEmptyString(admission.program) ||
    !isNonEmptyString(admission.date)
  ) {
    return null;
  }

  const status: Status = admission.status === "approved" || admission.status === "rejected"
    ? admission.status
    : "pending";
  const documents = normalizeAdmissionDocuments(admission.documents, status);
  const hasPendingDocumentReview = documents.some((document) => (
    document.reviewStatus === "missing" ||
    (Boolean(document.file) && document.reviewStatus !== "accepted")
  ));
  const documentStatus: AdmissionDocumentStatus = status === "approved"
    ? "complete"
    : hasPendingDocumentReview
      ? "pending"
      : "complete";
  const registryRecord = findLicenseRegistryRecord(admission.license);
  const licenseStatus = isLicenseStatus(admission.licenseStatus)
    ? admission.licenseStatus
    : registryRecord?.status ?? "unverified";
  const licenseCheckedAt = isNonEmptyString(admission.licenseCheckedAt)
    ? admission.licenseCheckedAt
    : registryRecord?.checkedAt ?? "2026-08-11T07:30:00.000Z";

  return {
    id: admission.id.trim(),
    name: admission.name.trim(),
    license: admission.license.trim(),
    program: admission.program.trim(),
    date: admission.date.trim(),
    status,
    documents,
    documentStatus,
    documentNote: typeof admission.documentNote === "string"
      ? admission.documentNote
      : undefined,
    licenseStatus,
    licenseCheckedAt,
  };
}

const defaultAdmissions: Admission[] = [
  { id: "APP-2026-001", name: "ภก. สมชาย ใจดี", license: "ภ.12345", program: "เภสัชบำบัด", date: "24 มิ.ย. 2569", status: "pending", documents: createMockSubmittedDocuments(), documentStatus: "pending", licenseStatus: "active", licenseCheckedAt: "2026-08-11T07:30:00.000Z" },
  { id: "APP-2026-002", name: "ภญ. สมหญิง รักชาติ", license: "ภ.23456", program: "เภสัชกรรมชุมชน", date: "23 มิ.ย. 2569", status: "pending", documents: createMockSubmittedDocuments({ missingId: "license" }), documentStatus: "pending", documentNote: "หากต้องการแนบสำเนาใบประกอบวิชาชีพ กรุณาใช้ไฟล์ที่เห็นวันหมดอายุชัดเจน", licenseStatus: "suspended", licenseCheckedAt: "2026-08-11T07:30:00.000Z" },
  { id: "APP-2026-003", name: "ภก. มานะ อดทน", license: "ภ.34567", program: "การคุ้มครองผู้บริโภค", date: "22 มิ.ย. 2569", status: "approved", documents: createMockSubmittedDocuments({ accepted: true }), documentStatus: "complete", licenseStatus: "active", licenseCheckedAt: "2026-08-11T07:30:00.000Z" },
  { id: "APP-2026-004", name: "ภก. ธนา วรเวช", license: "ภ.45678", program: "เภสัชบำบัด", date: "21 มิ.ย. 2569", status: "pending", documents: createAdmissionDocuments(), documentStatus: "complete", licenseStatus: "revoked", licenseCheckedAt: "2026-08-11T07:30:00.000Z" },
];

function normalizeAdmissions(value: unknown): Admission[] {
  const storedAdmissions = Array.isArray(value) ? value : [];
  const normalizedAdmissions: Admission[] = [];
  const storedIds = new Set<string>();

  storedAdmissions.forEach((storedAdmission) => {
    const admission = normalizeAdmission(storedAdmission);
    if (!admission || storedIds.has(admission.id)) return;
    normalizedAdmissions.push(admission);
    storedIds.add(admission.id);
  });

  return [
    ...normalizedAdmissions,
    ...defaultAdmissions.filter((admission) => !storedIds.has(admission.id)),
  ];
}

const KARINA_STUDENT_ID = "RPC-2569-001";
const KARINA_FORMAL_NAME = "ภญ. คารินา วัฒนกุล";

const defaultPayments: Payment[] = [
  { id: "PAY-2569-001", studentId: KARINA_STUDENT_ID, name: KARINA_FORMAL_NAME, program: "เภสัชบำบัด", amount: 25000, date: "24 มิ.ย. 2569", status: "pending", type: "ค่าลงทะเบียนเรียน" },
  { id: "PAY-2569-002", studentId: "RPC-2569-002", name: "ภก. สมชาย ใจดี", program: "เภสัชบำบัด", amount: 25000, date: "23 มิ.ย. 2569", status: "pending", type: "ค่าลงทะเบียนเรียน" },
];

const defaultPrograms: Program[] = [
  { id: "PRG-01", name: "วิทยาลัยเภสัชกรรมบำบัด", studentsCount: 450, status: "active", lastUpdated: "12 มิ.ย. 2569" },
  { id: "PRG-02", name: "วิทยาลัยเภสัชกรรมชุมชน", studentsCount: 320, status: "active", lastUpdated: "10 มิ.ย. 2569" },
];

const defaultCourseRequests: CourseRequest[] = [
  { id: "CRQ-001", collegeName: "วิทยาลัยเภสัชกรรมบำบัด", courseCode: "BCP-501", courseTitle: "การบริบาลทางเภสัชกรรมผู้ป่วยวิกฤต", type: "วุฒิบัตรเฉพาะทาง", duration: "16 สัปดาห์", capacity: 30, status: "pending", submittedAt: "24 มิ.ย. 2569" },
  { id: "CRQ-002", collegeName: "วิทยาลัยการคุ้มครองผู้บริโภค", courseCode: "CPA-102", courseTitle: "กฎหมายและจริยธรรมวิชาชีพขั้นสูง", type: "ประกาศนียบัตรระยะสั้น", duration: "8 สัปดาห์", capacity: 50, status: "approved", submittedAt: "20 มิ.ย. 2569" },
];

const memberName = `${currentMemberPassport.identity.titleTh}${currentMemberPassport.identity.firstNameTh} ${currentMemberPassport.identity.lastNameTh}`;

function defaultOfferingFor(courseCode: string, studentId?: string) {
  const institutionId = DEFAULT_STUDENT_AFFILIATIONS.find((affiliation) => (
    affiliation.studentId === studentId && affiliation.status === "active"
  ))?.institutionId;
  return DEFAULT_COURSE_OFFERINGS.find((offering) => (
    offering.courseCode === courseCode && offering.institutionId === institutionId
  )) ?? DEFAULT_COURSE_OFFERINGS.find((offering) => offering.courseCode === courseCode);
}

function defaultEligibilityForStudent(studentId: string, at: string): RegistrationEligibilitySnapshot {
  const licenseNumber = DEFAULT_ACADEMIC_STUDENTS.find((student) => student.id === studentId)?.licenseNumber ??
    (studentId === currentMemberPassport.memberId ? currentMemberPassport.license.licenseNumber : "");
  const registryRecord = findLicenseRegistryRecord(licenseNumber);
  const status = registryRecord?.status ?? "unverified";
  const eligibility = getLicenseEligibility(status);
  return {
    status,
    decision: eligibility.decision,
    checkedAt: registryRecord?.checkedAt ?? at,
    evidenceReference: `license-registry:${licenseNumber || "unknown"}:${registryRecord?.checkedAt ?? at}`,
  };
}

function createAcademicRegistration(
  input: Omit<RegistrationSelectionInput, "id" | "courseOfferingId" | "institutionId" | "eligibility"> & { id: string },
  at: string,
) {
  const offering = defaultOfferingFor(input.courseCode, input.studentId);
  return createEligibilityCheckedRegistration({
    ...input,
    courseOfferingId: offering?.id,
    institutionId: offering?.institutionId,
  }, defaultEligibilityForStudent(input.studentId, at), at);
}

function approveAndAwaitPayment(
  registration: Registration,
  actor: RegistrationActionActor,
  at: string,
) {
  return markRegistrationAwaitingPayment(
    recordTeacherRegistrationDecision(registration, "approved", actor, {
      at,
      reason: "ตรวจคุณสมบัติและข้อมูลรายวิชาครบถ้วน",
    }),
    at,
  );
}

const teacherOneRegistrationActor: RegistrationActionActor = {
  userId: "teacher-001",
  userName: "อ. ภก. กิตติพงศ์ วัฒนเภสัช",
  role: "teacher",
  organisationId: "org-inst-siriraj",
};

const teacherTwoRegistrationActor: RegistrationActionActor = {
  userId: "teacher-002",
  userName: "อ. ภญ. ชนิดา ศรีสุข",
  role: "teacher",
  organisationId: "org-inst-chula",
};

const seededPendingRegistrations = [
  createAcademicRegistration({
    id: "REG-001",
    studentId: KARINA_STUDENT_ID,
    studentName: KARINA_FORMAL_NAME,
    courseId: "C1",
    courseCode: "BCP-101",
    courseTitle: "เภสัชบำบัดพื้นฐาน",
    credits: 3,
    term: "1/2569",
  }, "2026-06-24T03:00:00.000Z"),
  createAcademicRegistration({
    id: "REG-MEMBER-002",
    studentId: currentMemberPassport.memberId,
    studentName: memberName,
    courseId: "วภท-302",
    courseCode: "วภท-302",
    courseTitle: "การสอบปากเปล่าข้างเตียงผู้ป่วย (Bedside Examination)",
    credits: 12,
    term: "1/2569",
  }, "2026-06-24T03:30:00.000Z"),
];

const seededEnrolledMemberRegistration = markRegistrationEnrolled(approveAndAwaitPayment(
  createAcademicRegistration({
    id: "REG-MEMBER-001",
    studentId: currentMemberPassport.memberId,
    studentName: memberName,
    courseId: "วภท-301",
    courseCode: "วภท-301",
    courseTitle: "องค์ความรู้ทางเภสัชบำบัดเฉพาะทาง (สอบข้อเขียน)",
    credits: 12,
    term: "1/2569",
  }, "2026-06-14T03:00:00.000Z"),
  teacherOneRegistrationActor,
  "2026-06-15T03:00:00.000Z",
), "2026-06-16T03:00:00.000Z");

const seededSirirajResultEnrollments = [
  {
    id: "REG-SIRIRAJ-005",
    studentId: "RPC-2569-005",
    studentName: "ภญ. พิมพ์ชนก แสงทอง",
    courseId: "BCP-101",
    courseCode: "BCP-101",
    courseTitle: "เภสัชบำบัดพื้นฐาน",
    credits: 3,
  },
  {
    id: "REG-SIRIRAJ-006",
    studentId: "RPC-2569-006",
    studentName: "ภก. ณัฐวุฒิ คงมั่น",
    courseId: "BCP-101",
    courseCode: "BCP-101",
    courseTitle: "เภสัชบำบัดพื้นฐาน",
    credits: 3,
  },
  {
    id: "REG-SIRIRAJ-007",
    studentId: "RPC-2569-007",
    studentName: "ภญ. อรอนงค์ สุขใจ",
    courseId: "วภท-301",
    courseCode: "วภท-301",
    courseTitle: "องค์ความรู้ทางเภสัชบำบัดเฉพาะทาง (สอบข้อเขียน)",
    credits: 12,
  },
  {
    id: "REG-SIRIRAJ-008",
    studentId: "RPC-2569-008",
    studentName: "ภก. ชยพล วัฒนะ",
    courseId: "วภท-301",
    courseCode: "วภท-301",
    courseTitle: "องค์ความรู้ทางเภสัชบำบัดเฉพาะทาง (สอบข้อเขียน)",
    credits: 12,
  },
].map((student, index) => markRegistrationEnrolled(approveAndAwaitPayment(
  createAcademicRegistration({
    ...student,
    term: "1/2569",
  }, `2026-06-${String(10 + index).padStart(2, "0")}T03:00:00.000Z`),
  teacherOneRegistrationActor,
  `2026-06-${String(11 + index).padStart(2, "0")}T03:00:00.000Z`,
), `2026-06-${String(12 + index).padStart(2, "0")}T03:00:00.000Z`));

const seededChulaEnrollments = [
  {
    id: "REG-CHULA-003",
    studentId: "RPC-2569-003",
    studentName: "ภก. นที พิพัฒน์",
  },
  {
    id: "REG-CHULA-004",
    studentId: "RPC-2569-004",
    studentName: "ภญ. สายฝน สกุลไทย",
  },
].map((student, index) => markRegistrationEnrolled(approveAndAwaitPayment(
  createAcademicRegistration({
    ...student,
    courseId: "วภท-302",
    courseCode: "วภท-302",
    courseTitle: "การสอบปากเปล่าข้างเตียงผู้ป่วย (Bedside Examination)",
    credits: 12,
    term: "1/2569",
  }, `2026-06-${String(17 + index).padStart(2, "0")}T03:00:00.000Z`),
  teacherTwoRegistrationActor,
  `2026-06-${String(19 + index).padStart(2, "0")}T03:00:00.000Z`,
), `2026-06-${String(21 + index).padStart(2, "0")}T03:00:00.000Z`));

const defaultRegistrations: Registration[] = [
  seededEnrolledMemberRegistration,
  ...seededSirirajResultEnrollments,
  ...seededChulaEnrollments,
  ...seededPendingRegistrations,
];

const defaultRegistrationInvoices: RegistrationInvoice[] = defaultRegistrations.map((registration) => {
  const locked = createLockedRegistrationInvoice({
    registrationId: registration.id,
    studentId: registration.studentId,
    courseCode: registration.courseCode,
    courseTitle: registration.courseTitle,
    credits: registration.credits,
    at: registration.submittedAt,
  });

  if (registration.status === "enrolled") {
    return payRegistrationInvoice(unlockRegistrationInvoice(locked, registration.updatedAt), registration.updatedAt);
  }
  return registration.status === "approved" || registration.status === "awaiting_payment"
    ? unlockRegistrationInvoice(locked, registration.updatedAt)
    : locked;
});

function isoOrNow(value: unknown, fallback = new Date().toISOString()): string {
  return typeof value === "string" && !Number.isNaN(Date.parse(value)) ? value : fallback;
}

function normalizeRegistrationHistory(
  value: unknown,
  registrationId: string,
  status: RegistrationStatus,
  at: string,
): RegistrationHistoryEntry[] {
  if (!Array.isArray(value)) {
    return [{
      id: `${registrationId}-migration-1`,
      to: status,
      actor: "migration",
      at,
      reason: "ย้ายข้อมูลจากรูปแบบ localStorage เดิม",
    }];
  }

  const history = value.flatMap((entry, index): RegistrationHistoryEntry[] => {
    if (!entry || typeof entry !== "object") return [];
    const stored = entry as Record<string, unknown>;
    if (!isRegistrationStatus(stored.to)) return [];
    const actor = stored.actor === "member" || stored.actor === "student" ||
      stored.actor === "teacher" || stored.actor === "registrar" ||
      stored.actor === "royal_college_staff" || stored.actor === "system" ||
      stored.actor === "migration"
      ? stored.actor
      : "migration";

    return [{
      id: isNonEmptyString(stored.id) ? stored.id : `${registrationId}-migration-${index + 1}`,
      ...(isRegistrationStatus(stored.from) ? { from: stored.from } : {}),
      to: stored.to,
      actor,
      at: isoOrNow(stored.at, at),
      ...(isNonEmptyString(stored.reason) ? { reason: stored.reason } : {}),
      ...(isNonEmptyString(stored.actorUserId) ? { actorUserId: stored.actorUserId } : {}),
      ...(isNonEmptyString(stored.actorName) ? { actorName: stored.actorName } : {}),
      ...(isSystemRole(stored.actorRole) ? { actorRole: stored.actorRole } : {}),
      ...(isNonEmptyString(stored.organisationId) ? { organisationId: stored.organisationId } : {}),
      ...(isNonEmptyString(stored.evidenceReference)
        ? { evidenceReference: stored.evidenceReference }
        : {}),
    }];
  });

  return history.length > 0 ? history : [{
    id: `${registrationId}-migration-1`,
    to: status,
    actor: "migration",
    at,
    reason: "ซ่อมประวัติสถานะจาก localStorage เดิม",
  }];
}

function normalizeRegistration(value: unknown): Registration | null {
  if (!value || typeof value !== "object") return null;
  const stored = value as Record<string, unknown>;
  const requiredStrings = [
    stored.id,
    stored.studentId,
    stored.studentName,
    stored.courseCode,
    stored.courseTitle,
    stored.term,
  ];
  if (!requiredStrings.every(isNonEmptyString)) return null;

  const storedStatus: RegistrationStatus = isRegistrationStatus(stored.status)
    ? stored.status
    : stored.status === "approved" || stored.status === "rejected"
      ? stored.status
      : "pending";
  const updatedAt = isoOrNow(stored.updatedAt);
  const submittedAt = isoOrNow(stored.submittedAt, updatedAt);
  const id = String(stored.id);
  const studentId = String(stored.studentId);
  const offering = defaultOfferingFor(String(stored.courseCode), studentId);
  const storedEligibility = stored.eligibility && typeof stored.eligibility === "object"
    ? stored.eligibility as Record<string, unknown>
    : null;
  const eligibility = storedEligibility && (
    isLicenseStatus(storedEligibility.status) || storedEligibility.status === "unverified"
  )
    ? {
        status: storedEligibility.status as RegistrationEligibilitySnapshot["status"],
        decision: storedEligibility.decision === "eligible" ||
          storedEligibility.decision === "eligible_with_warning" ||
          storedEligibility.decision === "manual_review" ||
          storedEligibility.decision === "ineligible"
          ? storedEligibility.decision
          : getLicenseEligibility(storedEligibility.status as RegistrationEligibilitySnapshot["status"]).decision,
        checkedAt: isoOrNow(storedEligibility.checkedAt, submittedAt),
        evidenceReference: isNonEmptyString(storedEligibility.evidenceReference)
          ? storedEligibility.evidenceReference
          : `migration:${id}:eligibility`,
      } satisfies RegistrationEligibilitySnapshot
    : defaultEligibilityForStudent(studentId, submittedAt);
  const storedTeacherDecision = stored.teacherDecision && typeof stored.teacherDecision === "object"
    ? stored.teacherDecision as Record<string, unknown>
    : null;
  const teacherDecision = storedTeacherDecision &&
    (storedTeacherDecision.decision === "approved" ||
      storedTeacherDecision.decision === "needs_info" ||
      storedTeacherDecision.decision === "rejected") &&
    isNonEmptyString(storedTeacherDecision.teacherId) &&
    isNonEmptyString(storedTeacherDecision.teacherName)
    ? {
        decision: storedTeacherDecision.decision as RegistrationTeacherDecision["decision"],
        teacherId: storedTeacherDecision.teacherId,
        teacherName: storedTeacherDecision.teacherName,
        decidedAt: isoOrNow(storedTeacherDecision.decidedAt, updatedAt),
        ...(isNonEmptyString(storedTeacherDecision.reason)
          ? { reason: storedTeacherDecision.reason }
          : {}),
        ...(isNonEmptyString(storedTeacherDecision.evidenceReference)
          ? { evidenceReference: storedTeacherDecision.evidenceReference }
          : {}),
      }
    : undefined;

  const normalized: Registration = {
    id,
    studentId,
    studentName: DEFAULT_ACADEMIC_STUDENTS.find((student) => student.id === studentId)?.name ??
      String(stored.studentName),
    courseId: isNonEmptyString(stored.courseId) ? stored.courseId : String(stored.courseCode),
    courseCode: String(stored.courseCode),
    courseTitle: String(stored.courseTitle),
    credits: typeof stored.credits === "number" && stored.credits > 0 ? stored.credits : 3,
    term: String(stored.term),
    status: storedStatus,
    submittedAt,
    updatedAt,
    reviewReason: isNonEmptyString(stored.reviewReason) ? stored.reviewReason : undefined,
    courseOfferingId: isNonEmptyString(stored.courseOfferingId)
      ? stored.courseOfferingId
      : offering?.id ?? (isNonEmptyString(stored.courseId) ? stored.courseId : String(stored.courseCode)),
    institutionId: isNonEmptyString(stored.institutionId)
      ? stored.institutionId
      : offering?.institutionId,
    eligibility,
    teacherDecision,
    history: normalizeRegistrationHistory(stored.history, id, storedStatus, updatedAt),
  };
  return storedStatus === "approved"
    ? markRegistrationAwaitingPayment(normalized, updatedAt)
    : normalized;
}

export function normalizeRegistrations(value: unknown): Registration[] {
  const stored = Array.isArray(value) ? value : [];
  const normalized = stored.map(normalizeRegistration).filter((item): item is Registration => Boolean(item));
  const ids = new Set(normalized.map((item) => item.id));
  return [...normalized, ...defaultRegistrations.filter((item) => !ids.has(item.id))];
}

function cloneRecord<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function mergeAcademicRecords<T extends { id: string }>(
  value: unknown,
  defaults: readonly T[],
  validator: (item: unknown) => item is T,
) {
  const stored = Array.isArray(value) ? value.filter(validator).map(cloneRecord) : [];
  const ids = new Set(stored.map((item) => item.id));
  return [...stored, ...defaults.filter((item) => !ids.has(item.id)).map(cloneRecord)];
}

function isStringRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object";
}

function isAcademicInstitutionRecord(value: unknown): value is AcademicInstitution {
  if (!isStringRecord(value)) return false;
  return isNonEmptyString(value.id) && isNonEmptyString(value.code) &&
    isNonEmptyString(value.name) && (value.kind === "hospital" || value.kind === "university");
}

function isAcademicStudentRecord(value: unknown): value is AcademicStudent {
  if (!isStringRecord(value)) return false;
  return isNonEmptyString(value.id) && isNonEmptyString(value.name) && isNonEmptyString(value.licenseNumber);
}

function normalizeAcademicStudents(value: unknown) {
  return mergeAcademicRecords(
    value,
    DEFAULT_ACADEMIC_STUDENTS,
    isAcademicStudentRecord,
  ).map((student) => {
    const canonical = DEFAULT_ACADEMIC_STUDENTS.find((item) => item.id === student.id);
    return canonical ? { ...student, name: canonical.name } : student;
  });
}

function isAcademicTeacherRecord(value: unknown): value is AcademicTeacher {
  if (!isStringRecord(value)) return false;
  return isNonEmptyString(value.id) && isNonEmptyString(value.name);
}

function isAcademicAffiliationRecord(value: unknown, subjectKey: "studentId" | "teacherId") {
  if (!isStringRecord(value)) return false;
  return isNonEmptyString(value.id) && isNonEmptyString(value[subjectKey]) &&
    isNonEmptyString(value.institutionId) && isNonEmptyString(value.startsAt) &&
    (value.endsAt === undefined || isNonEmptyString(value.endsAt)) &&
    (value.status === "active" || value.status === "inactive");
}

function isStudentAffiliationRecord(value: unknown): value is StudentAffiliation {
  return isAcademicAffiliationRecord(value, "studentId");
}

function isTeacherAffiliationRecord(value: unknown): value is TeacherAffiliation {
  return isAcademicAffiliationRecord(value, "teacherId");
}

function isCourseOfferingRecord(value: unknown): value is CourseOffering {
  if (!isStringRecord(value)) return false;
  return isNonEmptyString(value.id) && isNonEmptyString(value.courseCode) &&
    isNonEmptyString(value.courseTitle) && typeof value.credits === "number" &&
    isNonEmptyString(value.term) && isNonEmptyString(value.section) &&
    isNonEmptyString(value.institutionId) && isNonEmptyString(value.collegeCode) &&
    (value.status === "open" || value.status === "closed");
}

function isTeachingAssignmentRecord(value: unknown): value is TeachingAssignment {
  if (!isStringRecord(value)) return false;
  return isNonEmptyString(value.id) && isNonEmptyString(value.teacherId) &&
    isNonEmptyString(value.courseOfferingId) && isNonEmptyString(value.institutionId) &&
    isNonEmptyString(value.startsAt) && (value.endsAt === undefined || isNonEmptyString(value.endsAt)) &&
    isNonEmptyString(value.assignedBy) && isNonEmptyString(value.assignedAt);
}

function isAcademicActorRecord(value: unknown): value is AcademicActor {
  if (!isStringRecord(value)) return false;
  return isNonEmptyString(value.userId) && isNonEmptyString(value.userName) &&
    isSystemRole(value.role) && isNonEmptyString(value.organisationId);
}

function isSubjectResultRecord(value: unknown): value is SubjectResult {
  if (!isStringRecord(value)) return false;
  if (!isNonEmptyString(value.id) || !isNonEmptyString(value.studentId) ||
    !isNonEmptyString(value.courseOfferingId) || !isNonEmptyString(value.teacherId) ||
    !isNonEmptyString(value.updatedAt) || !Array.isArray(value.revisions) ||
    (value.status !== "pending" && value.status !== "draft" &&
      value.status !== "published" && value.status !== "revised")) return false;
  if (value.draftValue !== undefined && value.draftValue !== "S" && value.draftValue !== "U") return false;
  if (value.currentValue !== undefined && value.currentValue !== "S" && value.currentValue !== "U") return false;
  return value.revisions.every((revision) => (
    isStringRecord(revision) && isNonEmptyString(revision.id) &&
    (revision.previousValue === undefined || revision.previousValue === "S" || revision.previousValue === "U") &&
    (revision.newValue === "S" || revision.newValue === "U") &&
    (revision.reason === undefined || typeof revision.reason === "string") &&
    isAcademicActorRecord(revision.actor) && isNonEmptyString(revision.createdAt)
  ));
}

function isCourseProposalStatus(value: unknown): value is CourseProposal["status"] {
  return value === "submitted" || value === "needs_revision" ||
    value === "passed" || value === "rejected";
}

function isCourseProposalActorRecord(value: unknown): value is CourseProposalActor {
  if (!isAcademicActorRecord(value)) return false;
  const resourceScopes = (value as AcademicActor & { resourceScopes?: unknown }).resourceScopes;
  return Array.isArray(resourceScopes) &&
    resourceScopes.every((scope: unknown) => typeof scope === "string");
}

function isCourseProposalHistoryRecord(
  value: unknown,
): value is CourseProposal["history"][number] {
  if (!isStringRecord(value)) return false;
  return isNonEmptyString(value.id) &&
    (value.action === "submitted" || value.action === "resubmitted" || value.action === "reviewed") &&
    (value.fromStatus === undefined || isCourseProposalStatus(value.fromStatus)) &&
    isCourseProposalStatus(value.toStatus) &&
    isCourseProposalActorRecord(value.actor) &&
    isNonEmptyString(value.occurredAt) && Number.isFinite(Date.parse(value.occurredAt)) &&
    isNonEmptyString(value.reason) &&
    (value.evidenceReference === undefined || typeof value.evidenceReference === "string");
}

function isCourseProposalRecord(value: unknown): value is CourseProposal {
  if (!isStringRecord(value)) return false;
  const latestReview = value.latestReview;
  const hasValidReview = latestReview === undefined || (
    isStringRecord(latestReview) && latestReview.decision !== "submitted" &&
    isCourseProposalStatus(latestReview.decision) && isNonEmptyString(latestReview.note) &&
    isCourseProposalActorRecord(latestReview.actor) &&
    isNonEmptyString(latestReview.reviewedAt) && Number.isFinite(Date.parse(latestReview.reviewedAt)) &&
    (latestReview.evidenceReference === undefined || typeof latestReview.evidenceReference === "string")
  );
  return isNonEmptyString(value.id) && isNonEmptyString(value.proposerId) &&
    isNonEmptyString(value.proposerName) && isNonEmptyString(value.institutionId) &&
    isNonEmptyString(value.courseCode) && isNonEmptyString(value.courseTitle) &&
    typeof value.credits === "number" && Number.isFinite(value.credits) && value.credits > 0 &&
    isNonEmptyString(value.rationale) && isCourseProposalStatus(value.status) &&
    isNonEmptyString(value.submittedAt) && Number.isFinite(Date.parse(value.submittedAt)) &&
    isNonEmptyString(value.updatedAt) && Number.isFinite(Date.parse(value.updatedAt)) &&
    hasValidReview && Array.isArray(value.history) && value.history.length > 0 &&
    value.history.every(isCourseProposalHistoryRecord);
}

export function normalizeCourseProposals(value: unknown) {
  return mergeAcademicRecords(value, DEFAULT_COURSE_PROPOSALS, isCourseProposalRecord);
}

export function normalizeSubjectResults(value: unknown) {
  return mergeAcademicRecords(value, DEFAULT_SUBJECT_RESULTS, isSubjectResultRecord);
}

function organisationForActor(actor: AcademicActor): OrganisationScope {
  const organisation = ORGANISATION_LIST.find((item) => item.id === actor.organisationId);
  if (!organisation) throw new Error(`Unknown academic organisation ${actor.organisationId}`);
  return organisation;
}

function hasTeacherCourseMutationScope(
  actor: ScopedAcademicActor,
  courseOfferingId: string,
) {
  return actor.resourceScopes.includes("course:assigned") ||
    hasResourceScope(actor.resourceScopes, `course:${courseOfferingId}`);
}

function appendAcademicAudit(input: {
  actor: AcademicActor;
  resourceScopes: readonly string[];
  action: string;
  resourceType: string;
  resourceId: string;
  resourceLabel?: string;
  resourceOrganisationId?: string;
  before: unknown;
  after: unknown;
  reason?: string;
  evidenceReference?: string;
  occurredAt: string;
}) {
  return appendAuditEvent({
    actor: {
      userId: input.actor.userId,
      userName: input.actor.userName,
      role: input.actor.role,
      organisation: organisationForActor(input.actor),
      resourceScopes: [...input.resourceScopes],
    },
    action: input.action,
    resource: {
      type: input.resourceType,
      id: input.resourceId,
      ...(input.resourceLabel ? { label: input.resourceLabel } : {}),
      ...(input.resourceOrganisationId
        ? { organisationId: input.resourceOrganisationId }
        : {}),
    },
    before: input.before,
    after: input.after,
    reason: input.reason,
    evidenceReference: input.evidenceReference,
    occurredAt: input.occurredAt,
  });
}

function enrollPaidRegistration(registration: Registration, at: string) {
  if (registration.status === "enrolled") return registration;
  const awaiting = registration.status === "approved"
    ? markRegistrationAwaitingPayment(registration, at)
    : registration;
  return awaiting.status === "awaiting_payment"
    ? markRegistrationEnrolled(awaiting, at)
    : registration;
}

export function normalizeRegistrationInvoices(
  value: unknown,
  registrations: readonly Registration[],
): RegistrationInvoice[] {
  const lifecycleStatuses = new Set(["locked", "awaiting_payment", "paid", "cancelled"]);
  const stored = Array.isArray(value) ? value : [];
  const normalized = stored.flatMap((item): RegistrationInvoice[] => {
    if (!item || typeof item !== "object") return [];
    const invoice = item as Record<string, unknown>;
    if (
      !isNonEmptyString(invoice.id) ||
      !isNonEmptyString(invoice.registrationId) ||
      !isNonEmptyString(invoice.studentId) ||
      !isNonEmptyString(invoice.description) ||
      typeof invoice.baseAmount !== "number" ||
      !lifecycleStatuses.has(String(invoice.status))
    ) return [];

    const createdAt = isoOrNow(invoice.createdAt);
    const status = String(invoice.status) as RegistrationInvoice["status"];
    return [{
      id: invoice.id,
      registrationId: invoice.registrationId,
      studentId: invoice.studentId,
      description: invoice.description,
      baseAmount: invoice.baseAmount,
      status,
      createdAt,
      updatedAt: isoOrNow(invoice.updatedAt, createdAt),
      dueAt: isNonEmptyString(invoice.dueAt) ? invoice.dueAt : undefined,
      paidAt: isNonEmptyString(invoice.paidAt) ? invoice.paidAt : undefined,
      cancelledAt: isNonEmptyString(invoice.cancelledAt) ? invoice.cancelledAt : undefined,
    }];
  });
  const byRegistrationId = new Map(normalized.map((invoice) => [invoice.registrationId, invoice]));
  const defaultsByRegistrationId = new Map(
    defaultRegistrationInvoices.map((invoice) => [invoice.registrationId, invoice]),
  );

  registrations.forEach((registration) => {
    const existing = byRegistrationId.get(registration.id);
    if (existing) {
      if ((registration.status === "approved" || registration.status === "awaiting_payment") && (
        existing.status === "locked" ||
        (existing.status === "awaiting_payment" && !existing.dueAt)
      )) {
        byRegistrationId.set(
          registration.id,
          unlockRegistrationInvoice(existing, registration.updatedAt),
        );
      } else if (registration.status === "enrolled" && existing.status !== "paid") {
        const payable = existing.status === "locked"
          ? unlockRegistrationInvoice(existing, registration.updatedAt)
          : existing;
        if (payable.status !== "cancelled") {
          byRegistrationId.set(registration.id, payRegistrationInvoice(payable, registration.updatedAt));
        }
      }
      return;
    }
    const seeded = defaultsByRegistrationId.get(registration.id);
    if (seeded) {
      byRegistrationId.set(registration.id, seeded);
      return;
    }

    const locked = createLockedRegistrationInvoice({
      registrationId: registration.id,
      studentId: registration.studentId,
      courseCode: registration.courseCode,
      courseTitle: registration.courseTitle,
      credits: registration.credits,
      at: registration.submittedAt,
    });
    if (registration.status === "enrolled") {
      byRegistrationId.set(
        registration.id,
        payRegistrationInvoice(unlockRegistrationInvoice(locked, registration.updatedAt), registration.updatedAt),
      );
    } else if (registration.status === "approved" || registration.status === "awaiting_payment") {
      byRegistrationId.set(registration.id, unlockRegistrationInvoice(locked, registration.updatedAt));
    } else if (registration.status === "rejected" || registration.status === "withdrawn") {
      byRegistrationId.set(registration.id, cancelRegistrationInvoice(locked, registration.updatedAt));
    } else {
      byRegistrationId.set(registration.id, locked);
    }
  });

  return [...byRegistrationId.values()];
}

const defaultExamRequests: ExamRequest[] = [
  { id: "EXM-001", studentId: "RPC-2566-045", studentName: "ภก. วิทยา ตั้งใจ", program: "เภสัชบำบัด", examType: "สอบประเมินความรู้ขั้นสุดท้าย (Board Exam)", logbookUrl: "logbook_vithaya.pdf", status: "pending", submittedAt: "24 มิ.ย. 2569", examDate: "15 ก.ค. 2569" },
  { id: "EXM-002", studentId: "RPC-2566-089", studentName: "ภญ. มาลี สวยดี", program: "เภสัชกรรมชุมชน", examType: "สอบประเมินความรู้ขั้นสุดท้าย (Board Exam)", logbookUrl: "logbook_malee.pdf", status: "approved", submittedAt: "20 มิ.ย. 2569", examDate: "15 ก.ค. 2569" },
];

const defaultCertificates: Certificate[] = [
  { id: "CERT-001", studentId: "RPC-2566-045", studentName: "ภก. วิทยา ตั้งใจ", program: "เภสัชบำบัด", issuedAt: "รอดำเนินการ", status: "pending_approval" },
];

const defaultSettings: Settings = {
  admissionOpen: true,
  registrationOpen: true, // Set to true by default so user can test Registration
};

const MockDbContext = createContext<MockDbContextType | undefined>(undefined);

export function MockDbProvider({ children }: { children: ReactNode }) {
  const auditLog = useAuditLog();
  const [admissions, setAdmissions] = useState<Admission[]>([]);
  const [researchSubmissions, setResearchSubmissions] = useState<ResearchSubmission[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [courseRequests, setCourseRequests] = useState<CourseRequest[]>([]);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [registrationInvoices, setRegistrationInvoices] = useState<RegistrationInvoice[]>([]);
  const [academicInstitutions, setAcademicInstitutions] = useState<AcademicInstitution[]>([]);
  const [academicStudents, setAcademicStudents] = useState<AcademicStudent[]>([]);
  const [academicTeachers, setAcademicTeachers] = useState<AcademicTeacher[]>([]);
  const [studentAffiliations, setStudentAffiliations] = useState<StudentAffiliation[]>([]);
  const [teacherAffiliations, setTeacherAffiliations] = useState<TeacherAffiliation[]>([]);
  const [courseOfferings, setCourseOfferings] = useState<CourseOffering[]>([]);
  const [teachingAssignments, setTeachingAssignments] = useState<TeachingAssignment[]>([]);
  const [courseProposals, setCourseProposals] = useState<CourseProposal[]>([]);
  const [subjectResults, setSubjectResults] = useState<SubjectResult[]>([]);
  const [examRequests, setExamRequests] = useState<ExamRequest[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [settings, setSettings] = useState<Settings>({ admissionOpen: true, registrationOpen: true });
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const s = (k: string) => localStorage.getItem(k);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const p = (v: string | null, d: any) => {
      if (!v) return d;
      try {
        return JSON.parse(v);
      } catch {
        return d;
      }
    };

    const normalizedAdmissions = normalizeAdmissions(
      p(s("mock_admissions"), defaultAdmissions),
    );

    const parsedResearchSubmissions = p(
      s("mock_researchSubmissions"),
      defaultResearchSubmissions,
    );
    const normalizedRegistrations = normalizeRegistrations(
      p(s("mock_registrations"), defaultRegistrations),
    );
    const normalizedInvoices = normalizeRegistrationInvoices(
      p(s("mock_registration_invoices"), defaultRegistrationInvoices),
      normalizedRegistrations,
    );
    const normalizedAcademicInstitutions = mergeAcademicRecords(
      p(s("mock_academic_institutions"), DEFAULT_ACADEMIC_INSTITUTIONS),
      DEFAULT_ACADEMIC_INSTITUTIONS,
      isAcademicInstitutionRecord,
    );
    const normalizedAcademicStudents = normalizeAcademicStudents(
      p(s("mock_academic_students"), DEFAULT_ACADEMIC_STUDENTS),
    );
    const normalizedAcademicTeachers = mergeAcademicRecords(
      p(s("mock_academic_teachers"), DEFAULT_ACADEMIC_TEACHERS),
      DEFAULT_ACADEMIC_TEACHERS,
      isAcademicTeacherRecord,
    );
    const normalizedStudentAffiliations = mergeAcademicRecords(
      p(s("mock_student_affiliations"), DEFAULT_STUDENT_AFFILIATIONS),
      DEFAULT_STUDENT_AFFILIATIONS,
      isStudentAffiliationRecord,
    );
    const normalizedTeacherAffiliations = mergeAcademicRecords(
      p(s("mock_teacher_affiliations"), DEFAULT_TEACHER_AFFILIATIONS),
      DEFAULT_TEACHER_AFFILIATIONS,
      isTeacherAffiliationRecord,
    );
    const normalizedCourseOfferings = mergeAcademicRecords(
      p(s("mock_course_offerings"), DEFAULT_COURSE_OFFERINGS),
      DEFAULT_COURSE_OFFERINGS,
      isCourseOfferingRecord,
    );
    const normalizedTeachingAssignments = mergeAcademicRecords(
      p(s("mock_teaching_assignments"), DEFAULT_TEACHING_ASSIGNMENTS),
      DEFAULT_TEACHING_ASSIGNMENTS,
      isTeachingAssignmentRecord,
    );
    const normalizedCourseProposals = normalizeCourseProposals(
      p(s("mock_course_proposals"), DEFAULT_COURSE_PROPOSALS),
    );
    const normalizedSubjectResults = normalizeSubjectResults(
      p(s("mock_subject_results"), DEFAULT_SUBJECT_RESULTS),
    );
    const asArray = <T,>(value: unknown, fallback: T[]): T[] => (
      Array.isArray(value) ? value as T[] : fallback
    );

    /* eslint-disable react-hooks/set-state-in-effect */
    setAdmissions(normalizedAdmissions);
    setResearchSubmissions(normalizeResearchSubmissions(parsedResearchSubmissions));
    setPayments(asArray(p(s("mock_payments"), defaultPayments), defaultPayments).map((payment) => (
      payment.studentId === KARINA_STUDENT_ID
        ? { ...payment, studentId: KARINA_STUDENT_ID, name: KARINA_FORMAL_NAME }
        : payment
    )));
    setPrograms(asArray(p(s("mock_programs"), defaultPrograms), defaultPrograms));
    setCourseRequests(asArray(p(s("mock_courseRequests"), defaultCourseRequests), defaultCourseRequests));
    setRegistrations(normalizedRegistrations);
    setRegistrationInvoices(normalizedInvoices);
    setAcademicInstitutions(normalizedAcademicInstitutions);
    setAcademicStudents(normalizedAcademicStudents);
    setAcademicTeachers(normalizedAcademicTeachers);
    setStudentAffiliations(normalizedStudentAffiliations);
    setTeacherAffiliations(normalizedTeacherAffiliations);
    setCourseOfferings(normalizedCourseOfferings);
    setTeachingAssignments(normalizedTeachingAssignments);
    setCourseProposals(normalizedCourseProposals);
    setSubjectResults(normalizedSubjectResults);
    setExamRequests(asArray(p(s("mock_examRequests"), defaultExamRequests), defaultExamRequests));
    setCertificates(asArray(p(s("mock_certificates"), defaultCertificates), defaultCertificates));
    setSettings(p(s("mock_settings"), defaultSettings));

    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (!isLoaded) return;
    localStorage.setItem("mock_admissions", JSON.stringify(admissions));
    localStorage.setItem("mock_researchSubmissions", JSON.stringify(researchSubmissions));
    localStorage.setItem("mock_payments", JSON.stringify(payments));
    localStorage.setItem("mock_programs", JSON.stringify(programs));
    localStorage.setItem("mock_courseRequests", JSON.stringify(courseRequests));
    localStorage.setItem("mock_registrations", JSON.stringify(registrations));
    localStorage.setItem("mock_registration_invoices", JSON.stringify(registrationInvoices));
    localStorage.setItem("mock_academic_institutions", JSON.stringify(academicInstitutions));
    localStorage.setItem("mock_academic_students", JSON.stringify(academicStudents));
    localStorage.setItem("mock_academic_teachers", JSON.stringify(academicTeachers));
    localStorage.setItem("mock_student_affiliations", JSON.stringify(studentAffiliations));
    localStorage.setItem("mock_teacher_affiliations", JSON.stringify(teacherAffiliations));
    localStorage.setItem("mock_course_offerings", JSON.stringify(courseOfferings));
    localStorage.setItem("mock_teaching_assignments", JSON.stringify(teachingAssignments));
    localStorage.setItem("mock_course_proposals", JSON.stringify(courseProposals));
    localStorage.setItem("mock_subject_results", JSON.stringify(subjectResults));
    localStorage.setItem("mock_examRequests", JSON.stringify(examRequests));
    localStorage.setItem("mock_certificates", JSON.stringify(certificates));
    localStorage.setItem("mock_settings", JSON.stringify(settings));
    localStorage.setItem("mock_db_schema_version", "4");
  }, [academicInstitutions, academicStudents, academicTeachers, admissions, certificates, courseOfferings, courseProposals, courseRequests, examRequests, isLoaded, payments, programs, registrationInvoices, registrations, researchSubmissions, settings, studentAffiliations, subjectResults, teacherAffiliations, teachingAssignments]);

  const updateAdmissionStatus = (id: string, status: Status) => setAdmissions((previous) => previous.map((admission) => {
    if (admission.id !== id) return admission;
    if (status !== "approved") return { ...admission, status };

    return {
      ...admission,
      status,
      documentStatus: "complete",
      documents: admission.documents.map((document) => ({
        ...document,
        reviewStatus: document.file ? "accepted" : "not_applicable",
        reviewerNote: undefined,
      })),
      documentNote: undefined,
    };
  }));
  const updateAdmissionDocuments = (
    id: string,
    documents: AdmissionDocument[],
    documentStatus: AdmissionDocumentStatus = "pending",
    documentNote?: string,
  ) => setAdmissions((previous) => previous.map((admission) => (
    admission.id === id
      ? { ...admission, documents, documentStatus, documentNote }
      : admission
  )));
  const addResearchSubmission = (submission: ResearchSubmission) => setResearchSubmissions((previous) => [submission, ...previous]);
  const updateResearchSubmissionStatus = (
    id: string,
    status: ResearchSubmissionStatus,
    reviewerNote?: string,
  ) => setResearchSubmissions((previous) => previous.map((submission) => (
    submission.id === id ? { ...submission, status, reviewerNote } : submission
  )));
  const enrollRegistrationForInvoice = (
    invoiceId: string,
    at: string,
    evidenceReference: string,
  ) => {
    const invoice = registrationInvoices.find((item) => item.id === invoiceId);
    if (!invoice) return;
    const registration = registrations.find((item) => item.id === invoice.registrationId);
    if (!registration) return;
    if (invoice.status === "paid" && registration.status === "enrolled") return;

    const paidInvoice = payRegistrationInvoice(invoice, at);
    const enrolled = enrollPaidRegistration(registration, at);
    appendAuditEvent({
      actor: {
        userId: "system-payment",
        userName: "System Actor · Payment Confirmation",
        role: "system_actor",
        organisation: ORGANISATIONS.system,
        resourceScopes: ["payment:confirm", "registration:enroll"],
      },
      action: "payment.confirmed",
      resource: {
        type: "invoice",
        id: invoice.id,
        label: invoice.description,
        organisationId: registration.institutionId,
      },
      before: { invoice, registration },
      after: { invoice: paidInvoice, registration: enrolled },
      reason: "ยืนยันรายการชำระเงินและปรับสถานะการลงทะเบียนโดยอัตโนมัติ",
      evidenceReference,
      occurredAt: at,
    });
    setRegistrationInvoices((previous) => previous.map((item) => (
      item.id === paidInvoice.id ? paidInvoice : item
    )));
    setRegistrations((previous) => previous.map((item) => (
      item.id === enrolled.id ? enrolled : item
    )));
    if (enrolled.status !== "enrolled" || !enrolled.courseOfferingId) return;
    const assignment = teachingAssignments.find((item) => (
      item.courseOfferingId === enrolled.courseOfferingId &&
      new Date(item.startsAt).getTime() <= new Date(at).getTime() &&
      (!item.endsAt || new Date(at).getTime() < new Date(item.endsAt).getTime())
    ));
    if (!assignment) return;
    setSubjectResults((previous) => {
      if (previous.some((item) => (
        item.studentId === enrolled.studentId && item.courseOfferingId === enrolled.courseOfferingId
      ))) return previous;
      return [...previous, createPendingSubjectResult({
        id: `RESULT-${enrolled.id}`,
        studentId: enrolled.studentId,
        courseOfferingId: enrolled.courseOfferingId!,
        teacherId: assignment.teacherId,
        at,
      })];
    });
  };
  const updatePaymentStatus = (id: string, status: Status) => {
    const payment = payments.find((item) => item.id === id);
    if (status === "approved" && payment?.invoiceId) {
      const paidAt = new Date().toISOString();
      enrollRegistrationForInvoice(
        payment.invoiceId,
        paidAt,
        payment.referenceNo ?? `payment:${payment.id}`,
      );
    }
    setPayments(prev => prev.map(item => item.id === id ? { ...item, status } : item));
  };
  const addPayment = (payment: Payment) => {
    if (payment.status === "approved" && payment.invoiceId) {
      const paidAt = payment.submittedAt ?? new Date().toISOString();
      enrollRegistrationForInvoice(
        payment.invoiceId,
        paidAt,
        payment.referenceNo ?? `payment:${payment.id}`,
      );
    }
    setPayments(prev => [payment, ...prev]);
  };
  const updateCourseRequestStatus = (id: string, status: Status) => setCourseRequests(prev => prev.map(r => r.id === id ? { ...r, status } : r));
  const submitRegistrations = (
    selections: RegistrationSubmissionInput[],
  ): Registration[] => {
    const activeCourseKeys = new Set(
      registrations
        .filter((registration) => registration.status !== "rejected" && registration.status !== "withdrawn")
        .map((registration) => `${registration.studentId}:${registration.courseCode}`),
    );
    const at = new Date().toISOString();
    const batchId = globalThis.crypto?.randomUUID?.() ?? String(Date.now());
    const created = selections.flatMap((selection, index): Registration[] => {
      const courseKey = `${selection.studentId}:${selection.courseCode}`;
      if (activeCourseKeys.has(courseKey)) return [];
      activeCourseKeys.add(courseKey);
      const requestedOffering = selection.courseOfferingId
        ? courseOfferings.find((item) => item.id === selection.courseOfferingId)
        : undefined;
      if (selection.courseOfferingId && !requestedOffering) {
        throw new Error(`Course offering ${selection.courseOfferingId} was not found`);
      }
      const offering = requestedOffering ?? defaultOfferingFor(selection.courseCode, selection.studentId);
      if (!offering || offering.courseCode !== selection.courseCode) {
        throw new Error(`No course offering matches ${selection.courseCode}`);
      }
      if (selection.institutionId && selection.institutionId !== offering.institutionId) {
        throw new Error("Registration institution does not match its course offering");
      }
      const eligibility = defaultEligibilityForStudent(selection.studentId, at);
      const registration = createEligibilityCheckedRegistration({
        ...selection,
        id: `REG-${batchId}-${index + 1}`,
        courseOfferingId: offering?.id,
        institutionId: offering?.institutionId,
      }, eligibility, at);
      return [{
        ...registration,
        history: registration.history.map((event) => event.actor === "system"
          ? {
              ...event,
              actorUserId: "system-eligibility",
              actorName: "System Actor",
              organisationId: offering?.institutionId,
              evidenceReference: eligibility.evidenceReference,
            }
          : {
              ...event,
              actor: "student",
              actorUserId: selection.studentId,
              actorName: selection.studentName,
              actorRole: "student",
              organisationId: offering?.institutionId,
            }),
      }];
    });

    if (created.length === 0) return [];
    setRegistrations((previous) => [...created, ...previous]);
    setRegistrationInvoices((previous) => [
      ...created.map((registration) => createLockedRegistrationInvoice({
        registrationId: registration.id,
        studentId: registration.studentId,
        courseCode: registration.courseCode,
        courseTitle: registration.courseTitle,
        credits: registration.credits,
        at,
      })),
      ...previous,
    ]);
    return created;
  };
  const resubmitRegistration = (id: string) => {
    const current = registrations.find((registration) => registration.id === id);
    if (!current) return;
    const updated = resubmitRegistrationRecord(current);
    setRegistrations((previous) => previous.map((registration) => (
      registration.id === id ? updated : registration
    )));
  };
  const requestRegistrationDrop = (id: string, reason?: string) => {
    const current = registrations.find((registration) => registration.id === id);
    if (!current) return;
    const updated = transitionRegistration(current, "drop_pending", "member", { reason });
    setRegistrations((previous) => previous.map((registration) => (
      registration.id === id ? updated : registration
    )));
  };
  const updateRegistrationStatus = (
    id: string,
    status: RegistrationStatus,
    reason?: string,
  ) => {
    const current = registrations.find((registration) => registration.id === id);
    if (!current) return;
    const at = new Date().toISOString();
    const updated = transitionRegistration(current, status, "registrar", { at, reason });
    setRegistrations((previous) => previous.map((registration) => (
      registration.id === id ? updated : registration
    )));

    setRegistrationInvoices((previous) => previous.map((invoice) => {
      if (invoice.registrationId !== id) return invoice;
      if (status === "approved" && current.status !== "drop_pending") {
        return unlockRegistrationInvoice(invoice, at);
      }
      if (status === "rejected" || status === "withdrawn") {
        return cancelRegistrationInvoice(invoice, at);
      }
      return invoice;
    }));
  };
  const reviewRegistration = (input: RegistrationReviewInput) => {
    const current = registrations.find((registration) => registration.id === input.registrationId);
    if (!current) throw new Error(`Registration ${input.registrationId} was not found`);
    if (!current.courseOfferingId || !current.institutionId) {
      throw new Error("Registration has no academic course scope");
    }
    const at = new Date().toISOString();
    const assignment = teachingAssignments.find((item) => (
      item.teacherId === input.actor.userId &&
      item.courseOfferingId === current.courseOfferingId &&
      canTeacherAccessOffering(teachingAssignments, input.actor.userId, current.courseOfferingId!, new Date(at))
    ));
    if (!assignment || input.actor.role !== "teacher" || input.actor.organisationId !== current.institutionId) {
      throw new Error("Teacher cannot review a registration outside their assignment");
    }
    if (!hasTeacherCourseMutationScope(input.actor, current.courseOfferingId)) {
      throw new Error("Teacher Resource Scope does not cover this course");
    }
    if (current.eligibility?.decision !== "eligible" && current.eligibility?.decision !== "eligible_with_warning") {
      throw new Error("Registration has not passed System eligibility");
    }
    const decision = input.decision === "approve"
      ? "approved"
      : input.decision === "reject"
        ? "rejected"
        : "needs_info";
    const evidenceReference = input.evidenceReference ?? `teaching-assignment:${assignment.id}`;
    const reviewed = recordTeacherRegistrationDecision(current, decision, input.actor, {
      at,
      reason: input.reason,
      evidenceReference,
    });
    const updated = decision === "approved"
      ? markRegistrationAwaitingPayment(reviewed, at)
      : reviewed;
    const action = decision === "approved"
      ? "registration.approve"
      : decision === "rejected"
        ? "registration.reject"
        : "registration.request_information";
    appendAcademicAudit({
      actor: input.actor,
      resourceScopes: input.actor.resourceScopes,
      action,
      resourceType: "registration",
      resourceId: current.id,
      resourceLabel: `${current.courseCode} · ${current.studentName}`,
      resourceOrganisationId: current.institutionId,
      before: current,
      after: updated,
      reason: input.reason,
      evidenceReference,
      occurredAt: at,
    });
    setRegistrations((previous) => previous.map((registration) => (
      registration.id === current.id ? updated : registration
    )));
    if (decision === "approved") {
      setRegistrationInvoices((previous) => previous.map((invoice) => (
        invoice.registrationId === current.id ? unlockRegistrationInvoice(invoice, at) : invoice
      )));
    } else if (decision === "rejected") {
      setRegistrationInvoices((previous) => previous.map((invoice) => (
        invoice.registrationId === current.id ? cancelRegistrationInvoice(invoice, at) : invoice
      )));
    }
  };
  const assignTeacherToCourse = (input: TeachingAssignmentInput) => {
    if (input.actor.role !== "institution_admin") {
      throw new Error("Only an Institution Admin can change a teaching assignment");
    }
    const offering = courseOfferings.find((item) => item.id === input.courseOfferingId);
    if (!offering || offering.institutionId !== input.actor.organisationId) {
      throw new Error("Course offering is outside the Institution Admin scope");
    }
    const startsAt = input.startsAt ?? new Date().toISOString();
    const start = new Date(startsAt);
    if (!Number.isFinite(start.getTime())) throw new Error("Teaching assignment start is invalid");
    if (input.endsAt && new Date(input.endsAt).getTime() <= start.getTime()) {
      throw new Error("Teaching assignment end must be after its start");
    }
    const teacherAffiliation = teacherAffiliations.find((affiliation) => (
      affiliation.teacherId === input.teacherId &&
      affiliation.institutionId === input.actor.organisationId &&
      isAcademicAffiliationActive(affiliation, start)
    ));
    if (!teacherAffiliation) throw new Error("Teacher is outside the Institution Admin scope");
    if (canTeacherAccessOffering(teachingAssignments, input.teacherId, offering.id, start)) {
      throw new Error("Teacher already has an active assignment for this course offering");
    }
    const assignment: TeachingAssignment = {
      id: `teaching-assignment-${globalThis.crypto?.randomUUID?.() ?? Date.now()}`,
      teacherId: input.teacherId,
      courseOfferingId: offering.id,
      institutionId: offering.institutionId,
      startsAt,
      ...(input.endsAt ? { endsAt: input.endsAt } : {}),
      assignedBy: input.actor.userId,
      assignedAt: new Date().toISOString(),
    };
    appendAcademicAudit({
      actor: input.actor,
      resourceScopes: ["*"],
      action: "teaching_assignment.change",
      resourceType: "teaching_assignment",
      resourceId: assignment.id,
      resourceLabel: offering.courseCode,
      resourceOrganisationId: offering.institutionId,
      before: null,
      after: assignment,
      reason: "กำหนดอาจารย์ผู้รับผิดชอบรายวิชาตามสถาบันและรุ่นเรียน",
      evidenceReference: `course-offering:${offering.id}`,
      occurredAt: assignment.assignedAt,
    });
    setTeachingAssignments((previous) => [...previous, assignment]);
  };
  const updateAffiliationStatus = (input: AffiliationStatusInput) => {
    if (input.actor.role !== "institution_admin") {
      throw new Error("Only an Institution Admin can change an affiliation");
    }
    const reason = input.reason.trim();
    if (!reason) throw new Error("Affiliation changes require a reason");
    const source = input.affiliationType === "student" ? studentAffiliations : teacherAffiliations;
    const affiliation = source.find((item) => item.id === input.affiliationId);
    if (!affiliation || affiliation.institutionId !== input.actor.organisationId) {
      throw new Error("Affiliation is outside the Institution Admin scope");
    }
    const at = new Date().toISOString();
    const updated = {
      ...affiliation,
      status: input.status,
      ...(input.status === "inactive" ? { endsAt: at } : { endsAt: undefined }),
    };
    appendAcademicAudit({
      actor: input.actor,
      resourceScopes: ["institution:self"],
      action: "access.role_scope_change",
      resourceType: `${input.affiliationType}_affiliation`,
      resourceId: affiliation.id,
      resourceLabel: input.affiliationType === "student"
        ? (academicStudents.find((item) => item.id === (affiliation as StudentAffiliation).studentId)?.name ?? affiliation.id)
        : (academicTeachers.find((item) => item.id === (affiliation as TeacherAffiliation).teacherId)?.name ?? affiliation.id),
      resourceOrganisationId: affiliation.institutionId,
      before: affiliation,
      after: updated,
      reason,
      evidenceReference: `affiliation:${affiliation.id}`,
      occurredAt: at,
    });
    if (input.affiliationType === "student") {
      setStudentAffiliations((previous) => previous.map((item) => (
        item.id === affiliation.id ? updated as StudentAffiliation : item
      )));
    } else {
      setTeacherAffiliations((previous) => previous.map((item) => (
        item.id === affiliation.id ? updated as TeacherAffiliation : item
      )));
    }
  };
  const updateCourseOfferingStatus = (input: CourseOfferingStatusInput) => {
    if (input.actor.role !== "institution_admin") {
      throw new Error("Only an Institution Admin can change a course offering");
    }
    const reason = input.reason.trim();
    if (!reason) throw new Error("Course offering changes require a reason");
    const offering = courseOfferings.find((item) => item.id === input.courseOfferingId);
    if (!offering || offering.institutionId !== input.actor.organisationId) {
      throw new Error("Course offering is outside the Institution Admin scope");
    }
    const updated = { ...offering, status: input.status };
    const at = new Date().toISOString();
    appendAcademicAudit({
      actor: input.actor,
      resourceScopes: ["institution:self"],
      action: "course_offering.update",
      resourceType: "course_offering",
      resourceId: offering.id,
      resourceLabel: `${offering.courseCode} · รุ่น ${offering.section}`,
      resourceOrganisationId: offering.institutionId,
      before: offering,
      after: updated,
      reason,
      evidenceReference: `course-offering:${offering.id}`,
      occurredAt: at,
    });
    setCourseOfferings((previous) => previous.map((item) => (
      item.id === offering.id ? updated : item
    )));
  };
  const assertTeacherCanManageCourseProposal = (actor: CourseProposalActor, at: Date) => {
    if (actor.role !== "teacher") {
      throw new Error("Only a Teacher can submit a course proposal");
    }
    const organisation = organisationForActor(actor);
    if (organisation.kind !== "institution" ||
      !hasResourceScope(actor.resourceScopes, "course:proposal")) {
      throw new Error("Teacher lacks the institution or resource scope for course proposals");
    }
    const activeAffiliation = teacherAffiliations.some((affiliation) => (
      affiliation.teacherId === actor.userId &&
      affiliation.institutionId === actor.organisationId &&
      isAcademicAffiliationActive(affiliation, at)
    ));
    if (!activeAffiliation) {
      throw new Error("Teacher has no active affiliation in this institution");
    }
  };
  const assertStaffCanReviewCourseProposal = (actor: CourseProposalActor) => {
    if (actor.role !== "royal_college_staff" ||
      actor.organisationId !== ORGANISATIONS.royalCollege.id ||
      !hasResourceScope(actor.resourceScopes, "staff:central")) {
      throw new Error("Only Royal College Staff with central scope can review course proposals");
    }
  };
  const submitCourseProposal = (input: CourseProposalSubmissionInput) => {
    const at = new Date();
    assertTeacherCanManageCourseProposal(input.actor, at);
    const proposalId = `CPROP-${at.getTime().toString(36).toUpperCase()}-${(
      globalThis.crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2)
    ).slice(0, 8).toUpperCase()}`;
    const created = createCourseProposalRecord({
      id: proposalId,
      actor: input.actor,
      courseCode: input.courseCode,
      courseTitle: input.courseTitle,
      credits: input.credits,
      rationale: input.rationale,
      evidenceReference: input.evidenceReference,
      at: at.toISOString(),
    });
    appendAcademicAudit({
      actor: input.actor,
      resourceScopes: input.actor.resourceScopes,
      action: "course_proposal.submit",
      resourceType: "course_proposal",
      resourceId: created.id,
      resourceLabel: `${created.courseCode} · ${created.courseTitle}`,
      resourceOrganisationId: created.institutionId,
      before: null,
      after: created,
      reason: created.rationale,
      evidenceReference: input.evidenceReference,
      occurredAt: created.submittedAt,
    });
    setCourseProposals((previous) => [created, ...previous]);
  };
  const resubmitCourseProposal = (input: CourseProposalResubmissionInput) => {
    const current = courseProposals.find((proposal) => proposal.id === input.proposalId);
    if (!current) throw new Error(`Course proposal ${input.proposalId} was not found`);
    const at = new Date();
    assertTeacherCanManageCourseProposal(input.actor, at);
    if (current.proposerId !== input.actor.userId ||
      current.institutionId !== input.actor.organisationId) {
      throw new Error("Teacher cannot resubmit another proposer's course proposal");
    }
    const updated = resubmitCourseProposalRecord({
      proposal: current,
      actor: input.actor,
      courseCode: input.courseCode,
      courseTitle: input.courseTitle,
      credits: input.credits,
      rationale: input.rationale,
      reason: input.reason,
      evidenceReference: input.evidenceReference,
      at: at.toISOString(),
    });
    appendAcademicAudit({
      actor: input.actor,
      resourceScopes: input.actor.resourceScopes,
      action: "course_proposal.resubmit",
      resourceType: "course_proposal",
      resourceId: updated.id,
      resourceLabel: `${updated.courseCode} · ${updated.courseTitle}`,
      resourceOrganisationId: updated.institutionId,
      before: current,
      after: updated,
      reason: input.reason,
      evidenceReference: input.evidenceReference,
      occurredAt: updated.updatedAt,
    });
    setCourseProposals((previous) => previous.map((proposal) => (
      proposal.id === updated.id ? updated : proposal
    )));
  };
  const reviewCourseProposal = (input: CourseProposalReviewInput) => {
    assertStaffCanReviewCourseProposal(input.actor);
    const current = courseProposals.find((proposal) => proposal.id === input.proposalId);
    if (!current) throw new Error(`Course proposal ${input.proposalId} was not found`);
    const at = new Date().toISOString();
    const updated = reviewCourseProposalRecord({
      proposal: current,
      actor: input.actor,
      decision: input.decision,
      reason: input.reason,
      evidenceReference: input.evidenceReference,
      at,
    });
    appendAcademicAudit({
      actor: input.actor,
      resourceScopes: input.actor.resourceScopes,
      action: "course_proposal.review",
      resourceType: "course_proposal",
      resourceId: updated.id,
      resourceLabel: `${updated.courseCode} · ${updated.courseTitle}`,
      resourceOrganisationId: updated.institutionId,
      before: current,
      after: updated,
      reason: input.reason,
      evidenceReference: input.evidenceReference,
      occurredAt: at,
    });
    setCourseProposals((previous) => previous.map((proposal) => (
      proposal.id === updated.id ? updated : proposal
    )));
  };
  const resultForTeacher = (resultId: string, actor: ScopedAcademicActor) => {
    const result = subjectResults.find((item) => item.id === resultId);
    if (!result) throw new Error(`Subject result ${resultId} was not found`);
    const offering = courseOfferings.find((item) => item.id === result.courseOfferingId);
    if (!offering || actor.role !== "teacher" || actor.organisationId !== offering.institutionId ||
      !canTeacherAccessOffering(teachingAssignments, actor.userId, result.courseOfferingId)) {
      throw new Error("Teacher cannot access this subject result");
    }
    if (!hasTeacherCourseMutationScope(actor, offering.id)) {
      throw new Error("Teacher Resource Scope does not cover this course");
    }
    const enrolled = registrations.some((registration) => (
      registration.studentId === result.studentId &&
      registration.courseOfferingId === result.courseOfferingId &&
      registration.status === "enrolled"
    ));
    if (!enrolled) throw new Error("Subject results are available only for enrolled students");
    return { result, offering };
  };
  const saveSubjectResultDraft = (input: SubjectResultDraftInput) => {
    const { result } = resultForTeacher(input.resultId, input.actor);
    const updated = saveSubjectResultDraftRecord(result, input.value, input.actor);
    setSubjectResults((previous) => previous.map((item) => item.id === result.id ? updated : item));
  };
  const publishSubjectResult = (input: { resultId: string; actor: ScopedAcademicActor }) => {
    const { result, offering } = resultForTeacher(input.resultId, input.actor);
    const at = new Date().toISOString();
    const updated = publishSubjectResultRecord(result, input.actor, at);
    appendAcademicAudit({
      actor: input.actor,
      resourceScopes: input.actor.resourceScopes,
      action: "result.publish",
      resourceType: "subject_result",
      resourceId: result.id,
      resourceLabel: `${offering.courseCode} · ${result.studentId}`,
      resourceOrganisationId: offering.institutionId,
      before: result,
      after: updated,
      reason: "ประกาศผลแบบผ่าน/ไม่ผ่านให้นักศึกษาเห็นผลล่าสุด",
      evidenceReference: `teaching-assignment:${result.teacherId}:${offering.id}`,
      occurredAt: at,
    });
    setSubjectResults((previous) => previous.map((item) => item.id === result.id ? updated : item));
  };
  const reviseSubjectResult = (input: SubjectResultRevisionInput) => {
    const { result, offering } = resultForTeacher(input.resultId, input.actor);
    const at = new Date().toISOString();
    const updated = reviseSubjectResultRecord(result, input.value, input.reason, input.actor, at);
    appendAcademicAudit({
      actor: input.actor,
      resourceScopes: input.actor.resourceScopes,
      action: "result.revise",
      resourceType: "subject_result",
      resourceId: result.id,
      resourceLabel: `${offering.courseCode} · ${result.studentId}`,
      resourceOrganisationId: offering.institutionId,
      before: result,
      after: updated,
      reason: input.reason,
      evidenceReference: `teaching-assignment:${result.teacherId}:${offering.id}`,
      occurredAt: at,
    });
    setSubjectResults((previous) => previous.map((item) => item.id === result.id ? updated : item));
  };
  const updateExamRequestStatus = (id: string, status: ExamRequest["status"]) => setExamRequests(prev => prev.map(r => r.id === id ? { ...r, status } : r));
  const updateCertificateStatus = (id: string, status: Certificate["status"]) => setCertificates(prev => prev.map(r => r.id === id ? { ...r, status } : r));
  const updateSettings = (newSettings: Partial<Settings>) => setSettings(prev => ({ ...prev, ...newSettings }));

  return (
    <MockDbContext.Provider
      value={{
        isLoaded,
        admissions, setAdmissions, updateAdmissionStatus, updateAdmissionDocuments,
        researchSubmissions, setResearchSubmissions, addResearchSubmission, updateResearchSubmissionStatus,
        payments, setPayments, updatePaymentStatus, addPayment,
        programs, setPrograms,
        courseRequests, setCourseRequests, updateCourseRequestStatus,
        registrations, setRegistrations, registrationInvoices,
        submitRegistrations, resubmitRegistration, requestRegistrationDrop,
        updateRegistrationStatus,
        academicInstitutions, academicStudents, academicTeachers,
        studentAffiliations, teacherAffiliations, courseOfferings,
        teachingAssignments, courseProposals, subjectResults, auditEvents: auditLog.events,
        reviewRegistration, assignTeacherToCourse,
        updateAffiliationStatus, updateCourseOfferingStatus,
        submitCourseProposal, resubmitCourseProposal, reviewCourseProposal,
        saveSubjectResultDraft, publishSubjectResult, reviseSubjectResult,
        examRequests, setExamRequests, updateExamRequestStatus,
        certificates, setCertificates, updateCertificateStatus,
        settings, updateSettings,
      }}
    >
      {children}
    </MockDbContext.Provider>
  );
}

export function useMockDb() {
  const context = useContext(MockDbContext);
  if (context === undefined) throw new Error("useMockDb must be used within a MockDbProvider");
  return context;
}
