import {
  createCourseProposal,
  reviewCourseProposalRecord,
} from "./course-proposal-workflow";
import { createPendingSubjectResult, publishSubjectResult, reviseSubjectResult, saveSubjectResultDraft } from "./result-workflow";
import type {
  AcademicActor,
  AcademicInstitution,
  AcademicStudent,
  AcademicTeacher,
  CourseProposal,
  CourseProposalActor,
  CourseOffering,
  StudentAffiliation,
  SubjectResult,
  TeacherAffiliation,
  TeachingAssignment,
} from "./model";

export const DEFAULT_ACADEMIC_INSTITUTIONS: readonly AcademicInstitution[] = [
  {
    id: "org-inst-siriraj",
    code: "INST-SIRIRAJ",
    name: "สถาบันฝึกอบรมโรงพยาบาลศิริราช",
    kind: "hospital",
  },
  {
    id: "org-inst-chula",
    code: "INST-CHULA",
    name: "สถาบันฝึกอบรมจุฬาลงกรณ์มหาวิทยาลัย",
    kind: "university",
  },
];

export const DEFAULT_ACADEMIC_STUDENTS: readonly AcademicStudent[] = [
  { id: "วภท-2568-001", name: "ภก. สมชาย ใจดี", licenseNumber: "ภ.12345" },
  { id: "RPC-2569-001", name: "ภญ. คารินา วัฒนกุล", licenseNumber: "ภ.34567" },
  { id: "RPC-2569-003", name: "ภก. นที พิพัฒน์", licenseNumber: "ภ.23456" },
  { id: "RPC-2569-004", name: "ภญ. สายฝน สกุลไทย", licenseNumber: "ภ.34567" },
  { id: "RPC-2569-005", name: "ภญ. พิมพ์ชนก แสงทอง", licenseNumber: "ภ.34567" },
  { id: "RPC-2569-006", name: "ภก. ณัฐวุฒิ คงมั่น", licenseNumber: "ภ.34567" },
  { id: "RPC-2569-007", name: "ภญ. อรอนงค์ สุขใจ", licenseNumber: "ภ.34567" },
  { id: "RPC-2569-008", name: "ภก. ชยพล วัฒนะ", licenseNumber: "ภ.34567" },
];

export const DEFAULT_ACADEMIC_TEACHERS: readonly AcademicTeacher[] = [
  { id: "teacher-001", name: "อ. ภก. กิตติพงศ์ วัฒนเภสัช" },
  { id: "teacher-002", name: "อ. ภญ. ชนิดา ศรีสุข" },
  { id: "teacher-003", name: "อ. ภก. ธีรภัทร พรหมรักษ์" },
];

export const DEFAULT_STUDENT_AFFILIATIONS: readonly StudentAffiliation[] = [
  { id: "student-affiliation-001", studentId: "วภท-2568-001", institutionId: "org-inst-siriraj", startsAt: "2026-01-01T00:00:00.000Z", status: "active" },
  { id: "student-affiliation-002", studentId: "RPC-2569-001", institutionId: "org-inst-siriraj", startsAt: "2026-01-01T00:00:00.000Z", status: "active" },
  { id: "student-affiliation-003", studentId: "RPC-2569-003", institutionId: "org-inst-chula", startsAt: "2026-01-01T00:00:00.000Z", status: "active" },
  { id: "student-affiliation-004", studentId: "RPC-2569-004", institutionId: "org-inst-chula", startsAt: "2026-01-01T00:00:00.000Z", status: "active" },
  { id: "student-affiliation-005", studentId: "RPC-2569-005", institutionId: "org-inst-siriraj", startsAt: "2026-01-01T00:00:00.000Z", status: "active" },
  { id: "student-affiliation-006", studentId: "RPC-2569-006", institutionId: "org-inst-siriraj", startsAt: "2026-01-01T00:00:00.000Z", status: "active" },
  { id: "student-affiliation-007", studentId: "RPC-2569-007", institutionId: "org-inst-siriraj", startsAt: "2026-01-01T00:00:00.000Z", status: "active" },
  { id: "student-affiliation-008", studentId: "RPC-2569-008", institutionId: "org-inst-siriraj", startsAt: "2026-01-01T00:00:00.000Z", status: "active" },
];

export const DEFAULT_TEACHER_AFFILIATIONS: readonly TeacherAffiliation[] = [
  { id: "teacher-affiliation-001", teacherId: "teacher-001", institutionId: "org-inst-siriraj", startsAt: "2026-01-01T00:00:00.000Z", status: "active" },
  { id: "teacher-affiliation-002", teacherId: "teacher-002", institutionId: "org-inst-chula", startsAt: "2026-01-01T00:00:00.000Z", status: "active" },
  { id: "teacher-affiliation-003", teacherId: "teacher-003", institutionId: "org-inst-siriraj", startsAt: "2025-01-01T00:00:00.000Z", status: "active" },
];

export const DEFAULT_COURSE_OFFERINGS: readonly CourseOffering[] = [
  { id: "offering-bcp-101", courseCode: "BCP-101", courseTitle: "เภสัชบำบัดพื้นฐาน", credits: 3, term: "1/2569", section: "SIR-01", institutionId: "org-inst-siriraj", collegeCode: "วภท.", status: "open" },
  { id: "offering-vpt-301", courseCode: "วภท-301", courseTitle: "องค์ความรู้ทางเภสัชบำบัดเฉพาะทาง (สอบข้อเขียน)", credits: 12, term: "1/2569", section: "SIR-01", institutionId: "org-inst-siriraj", collegeCode: "วภท.", status: "open" },
  { id: "offering-vpt-302", courseCode: "วภท-302", courseTitle: "การสอบปากเปล่าข้างเตียงผู้ป่วย (Bedside Examination)", credits: 12, term: "1/2569", section: "CHU-01", institutionId: "org-inst-chula", collegeCode: "วภท.", status: "open" },
  { id: "offering-vpt-303", courseCode: "วภท-303", courseTitle: "การสอบโครงร่างวิทยานิพนธ์ (Thesis Proposal Examination)", credits: 12, term: "1/2569", section: "CHU-01", institutionId: "org-inst-chula", collegeCode: "วภท.", status: "open" },
];

export const DEFAULT_TEACHING_ASSIGNMENTS: readonly TeachingAssignment[] = [
  { id: "teaching-assignment-001", teacherId: "teacher-001", courseOfferingId: "offering-bcp-101", institutionId: "org-inst-siriraj", startsAt: "2026-01-01T00:00:00.000Z", endsAt: "2027-01-01T00:00:00.000Z", assignedBy: "institution-admin-001", assignedAt: "2026-01-01T00:00:00.000Z" },
  { id: "teaching-assignment-002", teacherId: "teacher-001", courseOfferingId: "offering-vpt-301", institutionId: "org-inst-siriraj", startsAt: "2026-01-01T00:00:00.000Z", endsAt: "2027-01-01T00:00:00.000Z", assignedBy: "institution-admin-001", assignedAt: "2026-01-01T00:00:00.000Z" },
  { id: "teaching-assignment-003", teacherId: "teacher-002", courseOfferingId: "offering-vpt-302", institutionId: "org-inst-chula", startsAt: "2026-01-01T00:00:00.000Z", endsAt: "2027-01-01T00:00:00.000Z", assignedBy: "institution-admin-002", assignedAt: "2026-01-01T00:00:00.000Z" },
  { id: "teaching-assignment-004", teacherId: "teacher-003", courseOfferingId: "offering-vpt-301", institutionId: "org-inst-siriraj", startsAt: "2025-01-01T00:00:00.000Z", endsAt: "2026-01-01T00:00:00.000Z", assignedBy: "institution-admin-001", assignedAt: "2025-01-01T00:00:00.000Z" },
];

const teacherOne: AcademicActor = {
  userId: "teacher-001",
  userName: "อ. ภก. กิตติพงศ์ วัฒนเภสัช",
  role: "teacher",
  organisationId: "org-inst-siriraj",
};

const teacherTwo: AcademicActor = {
  userId: "teacher-002",
  userName: "อ. ภญ. ชนิดา ศรีสุข",
  role: "teacher",
  organisationId: "org-inst-chula",
};

const teacherOneProposalActor: CourseProposalActor = {
  ...teacherOne,
  resourceScopes: ["course:proposal", "course:offering-bcp-101", "course:offering-vpt-301"],
};

const teacherTwoProposalActor: CourseProposalActor = {
  ...teacherTwo,
  resourceScopes: ["course:proposal", "course:offering-vpt-302"],
};

const staffProposalActor: CourseProposalActor = {
  userId: "staff-001",
  userName: "ภญ. ปาริชาติ สุขเกษม",
  role: "royal_college_staff",
  organisationId: "org-royal-college",
  resourceScopes: ["staff:central"],
};

function proposal(input: {
  id: string;
  actor: CourseProposalActor;
  courseCode: string;
  courseTitle: string;
  credits: number;
  rationale: string;
  at: string;
}) {
  return createCourseProposal({
    ...input,
    evidenceReference: `proposal-brief:${input.id}`,
  });
}

const submittedProposal = proposal({
  id: "CPROP-2569-001",
  actor: teacherOneProposalActor,
  courseCode: "BCP-520",
  courseTitle: "การติดตามการใช้ยาแม่นยำในผู้ป่วยวิกฤต",
  credits: 3,
  rationale: "เพิ่มทักษะการใช้ข้อมูลระดับผู้ป่วยเพื่อปรับการรักษาอย่างปลอดภัย",
  at: "2026-08-14T02:00:00.000Z",
});

const needsRevisionProposal = reviewCourseProposalRecord({
  proposal: proposal({
    id: "CPROP-2569-002",
    actor: teacherOneProposalActor,
    courseCode: "BCP-521",
    courseTitle: "เภสัชบำบัดผู้สูงอายุแบบสหสาขา",
    credits: 2,
    rationale: "เตรียมผู้เรียนให้จัดการปัญหาจากการใช้ยาหลายรายการในผู้สูงอายุ",
    at: "2026-08-10T03:00:00.000Z",
  }),
  actor: staffProposalActor,
  decision: "needs_revision",
  reason: "กรุณาเพิ่มผลลัพธ์การเรียนรู้และวิธีประเมินสมรรถนะให้ตรวจสอบได้",
  evidenceReference: "staff-review:CPROP-2569-002:v1",
  at: "2026-08-12T04:00:00.000Z",
});

const passedProposal = reviewCourseProposalRecord({
  proposal: proposal({
    id: "CPROP-2569-003",
    actor: teacherOneProposalActor,
    courseCode: "BCP-519",
    courseTitle: "การสื่อสารความเสี่ยงด้านยาในภาวะฉุกเฉิน",
    credits: 2,
    rationale: "เสริมการสื่อสารข้อมูลยาแก่ทีมรักษาและครอบครัวในสถานการณ์เร่งด่วน",
    at: "2026-08-01T02:00:00.000Z",
  }),
  actor: staffProposalActor,
  decision: "passed",
  reason: "ขอบเขต เนื้อหา และหลักฐานการประเมินครบสำหรับการทดลองใช้ในระบบต้นแบบ",
  evidenceReference: "staff-review:CPROP-2569-003:v1",
  at: "2026-08-04T05:00:00.000Z",
});

const rejectedProposal = reviewCourseProposalRecord({
  proposal: proposal({
    id: "CPROP-2569-004",
    actor: teacherTwoProposalActor,
    courseCode: "BCP-522",
    courseTitle: "เวิร์กช็อปการจัดการข้อมูลคลินิก",
    credits: 1,
    rationale: "เสนอรูปแบบเวิร์กช็อปเสริมสำหรับผู้เรียนในสถาบันจุฬาลงกรณ์",
    at: "2026-07-20T02:00:00.000Z",
  }),
  actor: staffProposalActor,
  decision: "rejected",
  reason: "เนื้อหาซ้ำกับกิจกรรมที่มีอยู่และยังไม่แสดงผลลัพธ์การเรียนรู้ที่แตกต่าง",
  evidenceReference: "staff-review:CPROP-2569-004:v1",
  at: "2026-07-24T05:00:00.000Z",
});

export const DEFAULT_COURSE_PROPOSALS: readonly CourseProposal[] = [
  submittedProposal,
  needsRevisionProposal,
  passedProposal,
  rejectedProposal,
];

const pendingResult = createPendingSubjectResult({
  id: "result-pending-001",
  studentId: "RPC-2569-005",
  courseOfferingId: "offering-bcp-101",
  teacherId: "teacher-001",
  at: "2026-08-01T01:00:00.000Z",
});

const draftResult = saveSubjectResultDraft(createPendingSubjectResult({
  id: "result-draft-001",
  studentId: "วภท-2568-001",
  courseOfferingId: "offering-vpt-301",
  teacherId: "teacher-001",
  at: "2026-08-01T01:00:00.000Z",
}), "S", teacherOne, "2026-08-02T01:00:00.000Z");

const teacherOnePublishedSResult = publishSubjectResult(saveSubjectResultDraft(createPendingSubjectResult({
  id: "result-published-001",
  studentId: "RPC-2569-006",
  courseOfferingId: "offering-bcp-101",
  teacherId: "teacher-001",
  at: "2026-08-01T01:00:00.000Z",
}), "S", teacherOne, "2026-08-02T01:00:00.000Z"), teacherOne, "2026-08-03T01:00:00.000Z");

const teacherOnePublishedUResult = publishSubjectResult(saveSubjectResultDraft(createPendingSubjectResult({
  id: "result-published-u-001",
  studentId: "RPC-2569-007",
  courseOfferingId: "offering-vpt-301",
  teacherId: "teacher-001",
  at: "2026-08-01T01:30:00.000Z",
}), "U", teacherOne, "2026-08-02T01:30:00.000Z"), teacherOne, "2026-08-03T01:30:00.000Z");

const teacherOneRevisedResult = reviseSubjectResult(publishSubjectResult(saveSubjectResultDraft(createPendingSubjectResult({
  id: "result-revised-teacher-001",
  studentId: "RPC-2569-008",
  courseOfferingId: "offering-vpt-301",
  teacherId: "teacher-001",
  at: "2026-08-01T02:00:00.000Z",
}), "U", teacherOne, "2026-08-02T02:00:00.000Z"), teacherOne, "2026-08-03T02:00:00.000Z"), "S", "ตรวจหลักฐานการประเมินภาคปฏิบัติเพิ่มเติมแล้ว", teacherOne, "2026-08-04T02:00:00.000Z");

const teacherTwoPublishedResult = publishSubjectResult(saveSubjectResultDraft(createPendingSubjectResult({
  id: "result-published-teacher-002",
  studentId: "RPC-2569-003",
  courseOfferingId: "offering-vpt-302",
  teacherId: "teacher-002",
  at: "2026-08-01T01:00:00.000Z",
}), "S", teacherTwo, "2026-08-02T01:00:00.000Z"), teacherTwo, "2026-08-03T01:00:00.000Z");

const teacherTwoRevisedResult = reviseSubjectResult(publishSubjectResult(saveSubjectResultDraft(createPendingSubjectResult({
  id: "result-revised-teacher-002",
  studentId: "RPC-2569-004",
  courseOfferingId: "offering-vpt-302",
  teacherId: "teacher-002",
  at: "2026-08-01T01:00:00.000Z",
}), "U", teacherTwo, "2026-08-02T01:00:00.000Z"), teacherTwo, "2026-08-03T01:00:00.000Z"), "S", "ตรวจสอบหลักฐานการประเมินเพิ่มเติมแล้ว", teacherTwo, "2026-08-04T01:00:00.000Z");

export const DEFAULT_SUBJECT_RESULTS: readonly SubjectResult[] = [
  pendingResult,
  draftResult,
  teacherOnePublishedSResult,
  teacherOnePublishedUResult,
  teacherOneRevisedResult,
  teacherTwoPublishedResult,
  teacherTwoRevisedResult,
];
