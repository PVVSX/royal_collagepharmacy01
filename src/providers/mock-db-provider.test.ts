import { createElement, type ReactNode } from "react";
import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";

import type { CourseProposalActor } from "@/roles/shared/features/academic";
import {
  AUDIT_STORAGE_KEY,
  readAuditEvents,
} from "@/roles/shared/features/audit";

import {
  normalizeRegistrationInvoices,
  normalizeRegistrations,
  normalizeCourseProposals,
  MockDbProvider,
  useMockDb,
} from "./mock-db-provider";

function wrapper({ children }: { children: ReactNode }) {
  return createElement(MockDbProvider, null, children);
}

beforeEach(() => {
  window.localStorage.clear();
});

const teacherProposalActor: CourseProposalActor = {
  userId: "teacher-001",
  userName: "อ. ภก. กิตติพงศ์ วัฒนเภสัช",
  role: "teacher",
  organisationId: "org-inst-siriraj",
  resourceScopes: ["course:proposal", "course:offering-bcp-101", "course:offering-vpt-301"],
};

const staffProposalActor: CourseProposalActor = {
  userId: "staff-001",
  userName: "ภญ. ปาริชาติ สุขเกษม",
  role: "royal_college_staff",
  organisationId: "org-royal-college",
  resourceScopes: ["staff:central"],
};

describe("mock DB registration migration", () => {
  it("upgrades legacy registration records with history and credits", () => {
    const [registration] = normalizeRegistrations([{
      id: "REG-LEGACY",
      studentId: "STUDENT-OLD",
      studentName: "ผู้ใช้เดิม",
      courseId: "OLD-101",
      courseCode: "OLD-101",
      courseTitle: "วิชาเดิม",
      term: "1/2569",
      status: "approved",
      submittedAt: "24 มิ.ย. 2569",
    }]);

    expect(registration).toMatchObject({
      id: "REG-LEGACY",
      credits: 3,
      status: "awaiting_payment",
      courseOfferingId: "OLD-101",
    });
    expect(registration.history[0]).toMatchObject({
      to: "approved",
      actor: "migration",
    });
    expect(registration.history.at(-1)).toMatchObject({
      from: "approved",
      to: "awaiting_payment",
      actor: "system",
    });
  });

  it("creates and unlocks a missing invoice for a legacy approval", () => {
    const registrations = normalizeRegistrations([{
      id: "REG-LEGACY",
      studentId: "STUDENT-OLD",
      studentName: "ผู้ใช้เดิม",
      courseId: "OLD-101",
      courseCode: "OLD-101",
      courseTitle: "วิชาเดิม",
      term: "1/2569",
      status: "approved",
      submittedAt: "2026-06-24T03:00:00.000Z",
    }]);
    const invoice = normalizeRegistrationInvoices([], registrations)
      .find((item) => item.registrationId === "REG-LEGACY");

    expect(invoice?.status).toBe("awaiting_payment");
    expect(invoice?.dueAt).toMatch(/T23:59:59\+07:00$/);
  });

  it("derives System eligibility and keeps an unverified student out of the teacher queue", async () => {
    const { result } = renderHook(() => useMockDb(), { wrapper });
    await waitFor(() => expect(result.current.isLoaded).toBe(true));
    const before = result.current.registrations.length;

    expect(() => result.current.submitRegistrations([{
      studentId: "STUDENT-UNVERIFIED",
      studentName: "ผู้เรียนรอตรวจสอบ",
      courseId: "BCP-101",
      courseOfferingId: "offering-bcp-101",
      institutionId: "org-inst-siriraj",
      courseCode: "BCP-101",
      courseTitle: "เภสัชบำบัดพื้นฐาน",
      credits: 3,
      term: "1/2569",
    }])).toThrowError("Registration eligibility is manual_review");
    expect(result.current.registrations).toHaveLength(before);
  });

  it("lets only an assigned teacher approve into awaiting payment and audits it", async () => {
    const { result } = renderHook(() => useMockDb(), { wrapper });
    await waitFor(() => expect(result.current.isLoaded).toBe(true));

    act(() => result.current.reviewRegistration({
      registrationId: "REG-001",
      decision: "approve",
      actor: {
        userId: "teacher-001",
        userName: "อ. ภก. กิตติพงศ์ วัฒนเภสัช",
        role: "teacher",
        organisationId: "org-inst-siriraj",
        resourceScopes: ["course:offering-bcp-101"],
      },
      reason: "ตรวจคุณสมบัติและข้อมูลรายวิชาครบถ้วน",
    }));

    expect(result.current.registrations.find((item) => item.id === "REG-001")?.status)
      .toBe("awaiting_payment");
    expect(result.current.registrationInvoices.find((item) => item.registrationId === "REG-001")?.status)
      .toBe("awaiting_payment");
    expect(readAuditEvents().at(-1)).toMatchObject({
      action: "registration.approve",
      actor: { userId: "teacher-001", role: "teacher" },
      resource: { id: "REG-001", organisationId: "org-inst-siriraj" },
    });
  });

  it("blocks an actively assigned teacher whose course Resource Scope was revoked", async () => {
    const { result } = renderHook(() => useMockDb(), { wrapper });
    await waitFor(() => expect(result.current.isLoaded).toBe(true));

    expect(() => result.current.reviewRegistration({
      registrationId: "REG-001",
      decision: "approve",
      actor: {
        ...teacherProposalActor,
        resourceScopes: [],
      },
      reason: "พยายามอนุมัติหลังถูกถอน Resource Scope",
    })).toThrowError("Teacher Resource Scope does not cover this course");
    expect(result.current.registrations.find((item) => item.id === "REG-001")?.status)
      .toBe("pending");
  });

  it("blocks a teacher from another institution", async () => {
    const { result } = renderHook(() => useMockDb(), { wrapper });
    await waitFor(() => expect(result.current.isLoaded).toBe(true));

    expect(() => result.current.reviewRegistration({
      registrationId: "REG-001",
      decision: "approve",
      actor: {
        userId: "teacher-002",
        userName: "อ. ภญ. ชนิดา ศรีสุข",
        role: "teacher",
        organisationId: "org-inst-chula",
        resourceScopes: ["course:offering-bcp-101"],
      },
      reason: "ตรวจคุณสมบัติและข้อมูลรายวิชาครบถ้วน",
    })).toThrowError("Teacher cannot review a registration outside their assignment");
  });

  it("moves a paid registration to enrolled and creates a pending result", async () => {
    const { result } = renderHook(() => useMockDb(), { wrapper });
    await waitFor(() => expect(result.current.isLoaded).toBe(true));

    act(() => result.current.reviewRegistration({
      registrationId: "REG-MEMBER-002",
      decision: "approve",
      actor: {
        userId: "teacher-002",
        userName: "อ. ภญ. ชนิดา ศรีสุข",
        role: "teacher",
        organisationId: "org-inst-chula",
        resourceScopes: ["course:offering-vpt-302"],
      },
      reason: "ตรวจคุณสมบัติและข้อมูลรายวิชาครบถ้วน",
    }));
    const invoice = result.current.registrationInvoices.find((item) => (
      item.registrationId === "REG-MEMBER-002"
    ))!;
    act(() => result.current.addPayment({
      id: "PAY-REG-MEMBER-002",
      invoiceId: invoice.id,
      studentId: "วภท-2568-001",
      name: "ภก. สมชาย ใจดี",
      program: "เภสัชบำบัด",
      amount: invoice.baseAmount,
      date: "11 ส.ค. 2569",
      status: "approved",
      type: invoice.description,
      method: "promptpay",
      submittedAt: "2026-08-11T03:00:00.000Z",
    }));

    expect(result.current.registrations.find((item) => item.id === "REG-MEMBER-002")?.status)
      .toBe("enrolled");
    expect(result.current.subjectResults).toContainEqual(expect.objectContaining({
      studentId: "วภท-2568-001",
      courseOfferingId: "offering-vpt-302",
      status: "pending",
    }));
    expect(readAuditEvents().at(-1)).toMatchObject({
      action: "payment.confirmed",
      actor: {
        userId: "system-payment",
        role: "system_actor",
        organisation: { id: "org-system" },
      },
      resource: {
        id: invoice.id,
        organisationId: "org-inst-chula",
      },
      before: {
        invoice: { status: "awaiting_payment" },
        registration: { status: "awaiting_payment" },
      },
      after: {
        invoice: { status: "paid" },
        registration: { status: "enrolled" },
      },
      evidenceReference: "payment:PAY-REG-MEMBER-002",
    });
  });

  it("publishes and revises S/U without overwriting history", async () => {
    const { result } = renderHook(() => useMockDb(), { wrapper });
    await waitFor(() => expect(result.current.isLoaded).toBe(true));
    const actor = {
      userId: "teacher-001",
      userName: "อ. ภก. กิตติพงศ์ วัฒนเภสัช",
      role: "teacher" as const,
      organisationId: "org-inst-siriraj",
      resourceScopes: ["course:assigned"],
    };

    act(() => result.current.publishSubjectResult({ resultId: "result-draft-001", actor }));
    act(() => result.current.reviseSubjectResult({
      resultId: "result-draft-001",
      value: "U",
      reason: "ตรวจหลักฐานการประเมินใหม่",
      actor,
    }));

    const revised = result.current.subjectResults.find((item) => item.id === "result-draft-001");
    expect(revised).toMatchObject({ status: "revised", currentValue: "U" });
    expect(revised?.revisions).toHaveLength(2);
    expect(revised?.revisions[1]).toMatchObject({ previousValue: "S", newValue: "U" });
    expect(readAuditEvents().slice(-2).map((event) => event.action))
      .toEqual(["result.publish", "result.revise"]);
  });

  it("blocks every result mutation when an assigned teacher lacks the course Resource Scope", async () => {
    const { result } = renderHook(() => useMockDb(), { wrapper });
    await waitFor(() => expect(result.current.isLoaded).toBe(true));
    const actor = {
      ...teacherProposalActor,
      resourceScopes: ["course:offering-not-assigned"],
    };

    expect(() => result.current.saveSubjectResultDraft({
      resultId: "result-pending-001",
      value: "S",
      actor,
    })).toThrowError("Teacher Resource Scope does not cover this course");
    expect(() => result.current.publishSubjectResult({
      resultId: "result-draft-001",
      actor,
    })).toThrowError("Teacher Resource Scope does not cover this course");
    expect(() => result.current.reviseSubjectResult({
      resultId: "result-published-001",
      value: "U",
      reason: "พยายามแก้ไขหลังถูกถอน Resource Scope",
      actor,
    })).toThrowError("Teacher Resource Scope does not cover this course");

    expect(result.current.subjectResults.find((item) => item.id === "result-pending-001")?.status)
      .toBe("pending");
    expect(result.current.subjectResults.find((item) => item.id === "result-draft-001")?.status)
      .toBe("draft");
    expect(result.current.subjectResults.find((item) => item.id === "result-published-001")?.status)
      .toBe("published");
  });

  it("lets an Institution Admin assign an active unaffiliated course teacher", async () => {
    const { result } = renderHook(() => useMockDb(), { wrapper });
    await waitFor(() => expect(result.current.isLoaded).toBe(true));

    act(() => result.current.assignTeacherToCourse({
      teacherId: "teacher-003",
      courseOfferingId: "offering-bcp-101",
      actor: {
        userId: "institution-admin-001",
        userName: "ภก. วิชาญ อัครเวช",
        role: "institution_admin",
        organisationId: "org-inst-siriraj",
      },
      startsAt: "2026-08-11T00:00:00.000Z",
    }));

    expect(result.current.teachingAssignments).toContainEqual(expect.objectContaining({
      teacherId: "teacher-003",
      courseOfferingId: "offering-bcp-101",
      institutionId: "org-inst-siriraj",
    }));
    expect(readAuditEvents().at(-1)?.action).toBe("teaching_assignment.change");
  });

  it("lets an Institution Admin manage affiliations and course status only in their institution", async () => {
    const { result } = renderHook(() => useMockDb(), { wrapper });
    await waitFor(() => expect(result.current.isLoaded).toBe(true));
    const actor = {
      userId: "institution-admin-001",
      userName: "ภก. วิชาญ อัครเวช",
      role: "institution_admin" as const,
      organisationId: "org-inst-siriraj",
    };

    act(() => result.current.updateAffiliationStatus({
      affiliationType: "student",
      affiliationId: "student-affiliation-002",
      status: "inactive",
      actor,
      reason: "สิ้นสุดช่วงการฝึกอบรมตามข้อมูลสถาบัน",
    }));
    act(() => result.current.updateCourseOfferingStatus({
      courseOfferingId: "offering-bcp-101",
      status: "closed",
      actor,
      reason: "ปิดรับผู้เรียนในรุ่นปัจจุบัน",
    }));

    expect(result.current.studentAffiliations.find((item) => item.id === "student-affiliation-002"))
      .toMatchObject({ status: "inactive" });
    expect(result.current.courseOfferings.find((item) => item.id === "offering-bcp-101"))
      .toMatchObject({ status: "closed" });
    expect(readAuditEvents().slice(-2).map((event) => event.action))
      .toEqual(["access.role_scope_change", "course_offering.update"]);

    expect(() => result.current.updateAffiliationStatus({
      affiliationType: "teacher",
      affiliationId: "teacher-affiliation-002",
      status: "inactive",
      actor,
      reason: "พยายามแก้ข้ามสถาบัน",
    })).toThrowError("Affiliation is outside the Institution Admin scope");
  });
});

describe("mock DB course proposal workflow", () => {
  it("hydrates all proposal states and complete Teacher result fixtures", async () => {
    const { result } = renderHook(() => useMockDb(), { wrapper });
    await waitFor(() => expect(result.current.isLoaded).toBe(true));

    expect(new Set(result.current.courseProposals.map((proposal) => proposal.status))).toEqual(
      new Set(["submitted", "needs_revision", "passed", "rejected"]),
    );
    expect(new Set(result.current.courseProposals.map((proposal) => proposal.proposerId))).toEqual(
      new Set(["teacher-001", "teacher-002"]),
    );

    const teacherResults = result.current.subjectResults.filter((subjectResult) => (
      subjectResult.teacherId === "teacher-001"
    ));
    expect(teacherResults.map((subjectResult) => subjectResult.status)).toEqual([
      "pending",
      "draft",
      "published",
      "published",
      "revised",
    ]);
    expect(teacherResults.find((subjectResult) => subjectResult.id === "result-published-001")?.currentValue)
      .toBe("S");
    expect(teacherResults.find((subjectResult) => subjectResult.id === "result-published-u-001")?.currentValue)
      .toBe("U");
    teacherResults.forEach((subjectResult) => {
      expect(result.current.registrations).toContainEqual(expect.objectContaining({
        studentId: subjectResult.studentId,
        courseOfferingId: subjectResult.courseOfferingId,
        status: "enrolled",
      }));
    });
  });

  it("submits, returns, and resubmits with immutable history and audit snapshots", async () => {
    const { result } = renderHook(() => useMockDb(), { wrapper });
    await waitFor(() => expect(result.current.isLoaded).toBe(true));

    act(() => result.current.submitCourseProposal({
      actor: teacherProposalActor,
      courseCode: "BCP-590",
      courseTitle: "การประเมินความปลอดภัยด้านยาเชิงระบบ",
      credits: 3,
      rationale: "พัฒนาทักษะการค้นหาและลดความเสี่ยงด้านยาในระบบบริการ",
    }));
    const submitted = result.current.courseProposals.find((proposal) => (
      proposal.courseCode === "BCP-590"
    ));
    expect(submitted).toMatchObject({
      proposerId: "teacher-001",
      institutionId: "org-inst-siriraj",
      status: "submitted",
    });
    expect(readAuditEvents().at(-1)).toMatchObject({
      action: "course_proposal.submit",
      actor: { userId: "teacher-001", resourceScopes: expect.arrayContaining(["course:proposal"]) },
      resource: { id: submitted?.id, organisationId: "org-inst-siriraj" },
      before: null,
      after: { status: "submitted" },
      reason: "พัฒนาทักษะการค้นหาและลดความเสี่ยงด้านยาในระบบบริการ",
    });
    expect(readAuditEvents().at(-1)?.evidenceReference).toBeUndefined();

    act(() => result.current.reviewCourseProposal({
      proposalId: submitted!.id,
      actor: staffProposalActor,
      decision: "needs_revision",
      reason: "กรุณาเพิ่มเกณฑ์ประเมินผลลัพธ์การเรียนรู้",
    }));
    const returned = result.current.courseProposals.find((proposal) => proposal.id === submitted!.id)!;
    expect(returned).toMatchObject({
      status: "needs_revision",
      latestReview: {
        decision: "needs_revision",
        note: "กรุณาเพิ่มเกณฑ์ประเมินผลลัพธ์การเรียนรู้",
      },
    });
    expect(submitted).toMatchObject({ status: "submitted", history: [{ action: "submitted" }] });
    expect(readAuditEvents().at(-1)).toMatchObject({
      action: "course_proposal.review",
      before: { status: "submitted" },
      after: { status: "needs_revision" },
      reason: "กรุณาเพิ่มเกณฑ์ประเมินผลลัพธ์การเรียนรู้",
    });

    act(() => result.current.resubmitCourseProposal({
      proposalId: returned.id,
      actor: teacherProposalActor,
      courseCode: returned.courseCode,
      courseTitle: `${returned.courseTitle} (ปรับปรุง)`,
      credits: returned.credits,
      rationale: "เพิ่มเกณฑ์ประเมินผลลัพธ์การเรียนรู้ที่ตรวจสอบได้แล้ว",
      reason: "ปรับตามข้อเสนอแนะของผู้ตรวจ",
    }));
    const resubmitted = result.current.courseProposals.find((proposal) => proposal.id === submitted!.id)!;
    expect(resubmitted.status).toBe("submitted");
    expect(resubmitted.history.map((entry) => entry.action)).toEqual([
      "submitted",
      "reviewed",
      "resubmitted",
    ]);
    expect(returned).toMatchObject({ status: "needs_revision" });
    expect(readAuditEvents().at(-1)).toMatchObject({
      action: "course_proposal.resubmit",
      before: { status: "needs_revision" },
      after: { status: "submitted" },
      reason: "ปรับตามข้อเสนอแนะของผู้ตรวจ",
    });
  });

  it("enforces exact Teacher affiliation/resource scope and Royal College Staff scope", async () => {
    const { result } = renderHook(() => useMockDb(), { wrapper });
    await waitFor(() => expect(result.current.isLoaded).toBe(true));
    const submission = {
      courseCode: "BCP-591",
      courseTitle: "รายวิชาทดสอบขอบเขตสิทธิ์",
      credits: 2,
      rationale: "ทดสอบการบังคับใช้ขอบเขตทรัพยากรและสถาบัน",
    };

    expect(() => result.current.submitCourseProposal({
      ...submission,
      actor: { ...teacherProposalActor, resourceScopes: ["course:offering-bcp-101"] },
    })).toThrow("Teacher lacks the institution or resource scope for course proposals");
    expect(() => result.current.submitCourseProposal({
      ...submission,
      actor: { ...teacherProposalActor, organisationId: "org-inst-chula" },
    })).toThrow("Teacher has no active affiliation in this institution");
    expect(() => result.current.resubmitCourseProposal({
      ...submission,
      proposalId: "CPROP-2569-002",
      reason: "พยายามแก้ไขรายการของผู้อื่น",
      actor: {
        ...teacherProposalActor,
        userId: "teacher-003",
        userName: "อ. ภก. ธีรภัทร พรหมรักษ์",
      },
    })).toThrow("Teacher cannot resubmit another proposer's course proposal");
    expect(() => result.current.reviewCourseProposal({
      proposalId: "CPROP-2569-001",
      actor: { ...staffProposalActor, organisationId: "org-inst-siriraj" },
      decision: "passed",
      reason: "พยายามตรวจจากองค์กรที่ไม่ถูกต้อง",
    })).toThrow("Only Royal College Staff with central scope can review course proposals");
    expect(() => result.current.reviewCourseProposal({
      proposalId: "CPROP-2569-001",
      actor: { ...staffProposalActor, resourceScopes: [] },
      decision: "passed",
      reason: "พยายามตรวจโดยไม่มีขอบเขตส่วนกลาง",
    })).toThrow("Only Royal College Staff with central scope can review course proposals");
  });

  it("records a passed decision without creating a permanent course offering", async () => {
    const { result } = renderHook(() => useMockDb(), { wrapper });
    await waitFor(() => expect(result.current.isLoaded).toBe(true));
    const offeringIds = result.current.courseOfferings.map((offering) => offering.id);

    act(() => result.current.reviewCourseProposal({
      proposalId: "CPROP-2569-001",
      actor: staffProposalActor,
      decision: "passed",
      reason: "ข้อเสนอครบถ้วนสำหรับบันทึกผลในต้นแบบ",
    }));

    expect(result.current.courseProposals.find((proposal) => proposal.id === "CPROP-2569-001")?.status)
      .toBe("passed");
    expect(result.current.courseOfferings.map((offering) => offering.id)).toEqual(offeringIds);
  });

  it("does not mutate proposal state when the required audit write fails", async () => {
    const { result } = renderHook(() => useMockDb(), { wrapper });
    await waitFor(() => expect(result.current.isLoaded).toBe(true));
    const before = result.current.courseProposals;
    window.localStorage.setItem(AUDIT_STORAGE_KEY, "not-json");

    expect(() => result.current.submitCourseProposal({
      actor: teacherProposalActor,
      courseCode: "BCP-592",
      courseTitle: "รายวิชาทดสอบลำดับ Audit",
      credits: 2,
      rationale: "ยืนยันว่าระบบบันทึกเหตุการณ์ก่อนเปลี่ยนข้อมูลธุรกิจ",
    })).toThrow();
    expect(result.current.courseProposals).toBe(before);
  });

  it("normalizes stored proposal records and canonical Karina related-record names", async () => {
    const custom = normalizeCourseProposals([{ malformed: true }]);
    expect(custom).toHaveLength(4);

    window.localStorage.setItem("mock_academic_students", JSON.stringify([{
      id: "RPC-2569-001",
      name: "คาริน่า ยู",
      licenseNumber: "ภ.34567",
    }]));
    window.localStorage.setItem("mock_registrations", JSON.stringify([{
      id: "REG-001",
      studentId: "RPC-2569-001",
      studentName: "คาริน่า ยู",
      courseId: "BCP-101",
      courseCode: "BCP-101",
      courseTitle: "เภสัชบำบัดพื้นฐาน",
      term: "1/2569",
      status: "pending_teacher_review",
      submittedAt: "2026-06-24T03:00:00.000Z",
    }]));
    window.localStorage.setItem("mock_payments", JSON.stringify([{
      id: "PAY-2569-001",
      studentId: "RPC-2569-001",
      name: "คาริน่า ยู",
      program: "เภสัชบำบัด",
      amount: 25000,
      date: "24 มิ.ย. 2569",
      status: "pending",
      type: "ค่าลงทะเบียนเรียน",
    }]));

    const { result } = renderHook(() => useMockDb(), { wrapper });
    await waitFor(() => expect(result.current.isLoaded).toBe(true));
    expect(result.current.academicStudents.find((student) => student.id === "RPC-2569-001")?.name)
      .toBe("ภญ. คารินา วัฒนกุล");
    expect(result.current.registrations.find((registration) => registration.id === "REG-001")?.studentName)
      .toBe("ภญ. คารินา วัฒนกุล");
    expect(result.current.payments.find((payment) => payment.id === "PAY-2569-001")?.name)
      .toBe("ภญ. คารินา วัฒนกุล");
  });
});
