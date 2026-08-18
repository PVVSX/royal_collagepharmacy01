import { describe, expect, it } from "vitest";

import { HISTORICAL_REQUESTS } from "@/roles/shared/features/requests/request-schema";
import { DEFAULT_ROLE_ASSIGNMENTS } from "@/roles/shared/features/roles/role-assignment";
import { ORGANISATIONS } from "@/roles/shared/features/roles/access-model";
import { prepareRequestForSignature } from "@/roles/staff/features/signatures/staff-signature-workflow";
import {
  canPresidentViewRequest,
  getActiveSignatureStep,
  getPresidentDecision,
  isPresidentFinalizedRequest,
  rejectRequestAsPresident,
  selectAwaitingSignatureRequests,
  signRequestAsPresident,
} from "./president-signature";

const request = HISTORICAL_REQUESTS.find((item) => item.status === "awaiting_president_signature")!;
const assignment = DEFAULT_ROLE_ASSIGNMENTS.find((item) => item.id === "term-vpt-2569")!;
const royalAssignment = DEFAULT_ROLE_ASSIGNMENTS.find((item) => item.id === "term-rpc-2569")!;
const signedAt = new Date("2026-08-11T07:30:00.000Z");
const handwrittenSignature = {
  version: 1 as const,
  strokes: [[
    { x: 0.12, y: 0.62, pressure: 0.4 },
    { x: 0.44, y: 0.24, pressure: 0.7 },
    { x: 0.78, y: 0.58, pressure: 0.5 },
  ]],
};

function prepared(kind: "college_only" | "royal_only" | "two_level") {
  return prepareRequestForSignature({
    request: { ...request, status: "staff_review", signatureWorkflow: undefined },
    kind,
    preparedAt: new Date("2026-08-11T06:00:00.000Z"),
    evidenceReference: "MEMO-2569-TEST",
    preparedBy: {
      userId: "staff-001",
      userName: "เจ้าหน้าที่ราชวิทยาลัย",
      role: "royal_college_staff",
      organisationId: ORGANISATIONS.royalCollege.id,
      organisationCode: ORGANISATIONS.royalCollege.code,
      organisationName: ORGANISATIONS.royalCollege.name,
    },
  });
}

describe("signRequestAsPresident", () => {
  it("signs with the active college assignment and records an audit event", () => {
    const collegeOnly = prepared("college_only");
    const signed = signRequestAsPresident({
      request: collegeOnly,
      assignment,
      signedAt,
      handwrittenSignature,
      consentAccepted: true,
    });

    expect(signed.status).toBe("signed");
    expect(signed.mockSignature?.signerAssignmentId).toBe(assignment.id);
    expect(signed.mockSignature?.handwrittenSignature).toEqual(handwrittenSignature);
    expect(signed.mockSignature?.documentFingerprint).toMatch(/^DOC-[0-9A-F]{8}$/);
    expect(signed.events.at(-1)?.type).toBe("signed");
  });

  it("rejects an expired assignment", () => {
    const expired = DEFAULT_ROLE_ASSIGNMENTS.find((item) => item.id === "term-vpt-2568")!;
    expect(() => signRequestAsPresident({
      request,
      assignment: expired,
      signedAt,
      handwrittenSignature,
      consentAccepted: true,
    })).toThrow("วาระของผู้ลงนามไม่อยู่ในช่วงที่มีผล");
  });

  it("rejects a president from another college", () => {
    const otherCollege = DEFAULT_ROLE_ASSIGNMENTS.find((item) => item.id === "term-vpc-2569")!;
    expect(() => signRequestAsPresident({
      request,
      assignment: otherCollege,
      signedAt,
      handwrittenSignature,
      consentAccepted: true,
    })).toThrow("ผู้ลงนามไม่มีสิทธิ์ใน Organisation Scope หรือลำดับปัจจุบัน");
  });

  it("keeps pending work with the college so a successor sees the same queue", () => {
    const current = DEFAULT_ROLE_ASSIGNMENTS.find((item) => item.id === "term-vpt-2569")!;
    const successor = DEFAULT_ROLE_ASSIGNMENTS.find((item) => item.id === "term-vpt-2570")!;
    expect(selectAwaitingSignatureRequests([request], current).map((item) => item.id)).toEqual(
      selectAwaitingSignatureRequests([request], successor).map((item) => item.id),
    );
  });

  it("hides requests that staff have not forwarded", () => {
    expect(canPresidentViewRequest({ ...request, status: "staff_review" })).toBe(false);
    expect(canPresidentViewRequest({ ...request, status: "needs_information" })).toBe(false);
  });

  it("allows only President-authorized finalized history", () => {
    const royalOnly = prepared("royal_only");
    const signed = signRequestAsPresident({
      request: royalOnly,
      assignment: royalAssignment,
      signedAt,
      handwrittenSignature,
      consentAccepted: true,
    });
    expect(isPresidentFinalizedRequest(signed)).toBe(true);
    expect(canPresidentViewRequest(signed)).toBe(true);

    const finalizedByStaff = {
      ...signed,
      events: signed.events.filter((event) => event.actorRole !== "president"),
    };
    expect(isPresidentFinalizedRequest(finalizedByStaff)).toBe(false);
    expect(canPresidentViewRequest(finalizedByStaff)).toBe(false);
  });

  it("requires a drawn signature with actual pen movement", () => {
    expect(() => signRequestAsPresident({
      request,
      assignment,
      signedAt,
      handwrittenSignature: null,
      consentAccepted: true,
    })).toThrow("กรุณาใช้เมาส์ ปากกาดิจิทัล หรือหน้าจอสัมผัสลงลายมือชื่อในกรอบ");

    expect(() => signRequestAsPresident({
      request,
      assignment,
      signedAt,
      handwrittenSignature: { version: 1, strokes: [[{ x: 0.5, y: 0.5 }]] },
      consentAccepted: true,
    })).toThrow("กรุณาใช้เมาส์ ปากกาดิจิทัล หรือหน้าจอสัมผัสลงลายมือชื่อในกรอบ");
  });

  it("requires consent independently from the handwritten signature", () => {
    expect(() => signRequestAsPresident({
      request,
      assignment,
      signedAt,
      handwrittenSignature,
      consentAccepted: false,
    })).toThrow("กรุณายืนยันความยินยอมก่อนลงนาม");
  });

  it("supports college-only and royal-only queues by exact organisation scope", () => {
    const collegeOnly = prepared("college_only");
    const royalOnly = prepared("royal_only");
    expect(selectAwaitingSignatureRequests([collegeOnly, royalOnly], assignment).map((item) => item.id)).toEqual([collegeOnly.id]);
    expect(selectAwaitingSignatureRequests([collegeOnly, royalOnly], royalAssignment).map((item) => item.id)).toEqual([royalOnly.id]);
    expect(() => signRequestAsPresident({ request: royalOnly, assignment, signedAt, handwrittenSignature, consentAccepted: true }))
      .toThrow("ผู้ลงนามไม่มีสิทธิ์ใน Organisation Scope หรือลำดับปัจจุบัน");
  });

  it("enforces the ordered two-level workflow and preserves both signatures", () => {
    const twoLevel = prepared("two_level");
    expect(getActiveSignatureStep(twoLevel)?.level).toBe("college");
    expect(() => signRequestAsPresident({ request: twoLevel, assignment: royalAssignment, signedAt, handwrittenSignature, consentAccepted: true }))
      .toThrow("ผู้ลงนามไม่มีสิทธิ์ใน Organisation Scope หรือลำดับปัจจุบัน");

    const collegeSigned = signRequestAsPresident({ request: twoLevel, assignment, signedAt, handwrittenSignature, consentAccepted: true });
    expect(collegeSigned.status).toBe("awaiting_president_signature");
    expect(getActiveSignatureStep(collegeSigned)?.level).toBe("royal_college");
    expect(selectAwaitingSignatureRequests([collegeSigned], assignment)).toEqual([]);
    expect(selectAwaitingSignatureRequests([collegeSigned], royalAssignment)).toHaveLength(1);

    const fullySigned = signRequestAsPresident({ request: collegeSigned, assignment: royalAssignment, signedAt: new Date("2026-08-11T08:00:00.000Z"), handwrittenSignature, consentAccepted: true });
    expect(fullySigned.status).toBe("signed");
    expect(fullySigned.signatures).toHaveLength(2);
    expect(fullySigned.signatureWorkflow?.steps.map((step) => step.status)).toEqual(["signed", "signed"]);
  });

  it("records rejection on the active workflow step with a required reason", () => {
    const royalOnly = prepared("royal_only");
    const rejected = rejectRequestAsPresident({ request: royalOnly, assignment: royalAssignment, rejectedAt: signedAt, reason: "หลักฐานต้นทางไม่สอดคล้อง" });
    expect(rejected.status).toBe("rejected");
    expect(rejected.signatureWorkflow?.steps[0]).toMatchObject({ status: "rejected", signerUserId: royalAssignment.userId });
    expect(() => rejectRequestAsPresident({ request: royalOnly, assignment: royalAssignment, rejectedAt: signedAt, reason: " " })).toThrow("กรุณาระบุเหตุผลที่ไม่อนุมัติ");
  });

  it("keeps each President decision independent in a two-level workflow", () => {
    const collegeSigned = signRequestAsPresident({
      request: prepared("two_level"),
      assignment,
      signedAt,
      handwrittenSignature,
      consentAccepted: true,
    });
    const royalRejected = rejectRequestAsPresident({
      request: collegeSigned,
      assignment: royalAssignment,
      rejectedAt: new Date("2026-08-11T08:00:00.000Z"),
      reason: "หลักฐานระดับราชวิทยาลัยไม่ครบถ้วน",
    });

    expect(getPresidentDecision(royalRejected, assignment)).toMatchObject({
      status: "signed",
      decidedAt: signedAt.toISOString(),
    });
    expect(getPresidentDecision(royalRejected, royalAssignment)).toMatchObject({
      status: "rejected",
      decidedAt: "2026-08-11T08:00:00.000Z",
    });
  });
});
