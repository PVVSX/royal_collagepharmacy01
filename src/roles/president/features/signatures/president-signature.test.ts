import { describe, expect, it } from "vitest";

import { HISTORICAL_REQUESTS } from "@/roles/shared/features/requests/request-schema";
import { DEFAULT_ROLE_ASSIGNMENTS } from "@/roles/shared/features/roles/role-assignment";
import {
  canPresidentViewRequest,
  isPresidentFinalizedRequest,
  selectAwaitingSignatureRequests,
  signRequestAsPresident,
} from "./president-signature";

const request = HISTORICAL_REQUESTS.find((item) => item.status === "awaiting_president_signature")!;
const assignment = DEFAULT_ROLE_ASSIGNMENTS.find((item) => item.id === "term-vpt-2569")!;
const signedAt = new Date("2026-08-11T07:30:00.000Z");
const handwrittenSignature = {
  version: 1 as const,
  strokes: [[
    { x: 0.12, y: 0.62, pressure: 0.4 },
    { x: 0.44, y: 0.24, pressure: 0.7 },
    { x: 0.78, y: 0.58, pressure: 0.5 },
  ]],
};

describe("signRequestAsPresident", () => {
  it("signs with the active college assignment and records an audit event", () => {
    const signed = signRequestAsPresident({
      request,
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
    })).toThrow("ผู้ลงนามไม่มีสิทธิ์ในวิทยาลัยของคำร้องนี้");
  });

  it("keeps pending work with the college so a successor sees the same queue", () => {
    const current = DEFAULT_ROLE_ASSIGNMENTS.find((item) => item.id === "term-vpt-2569")!;
    const successor = DEFAULT_ROLE_ASSIGNMENTS.find((item) => item.id === "term-vpt-2570")!;
    expect(selectAwaitingSignatureRequests([request], current.collegeCode).map((item) => item.id)).toEqual(
      selectAwaitingSignatureRequests([request], successor.collegeCode).map((item) => item.id),
    );
  });

  it("hides requests that staff have not forwarded", () => {
    expect(canPresidentViewRequest({ ...request, status: "staff_review" })).toBe(false);
    expect(canPresidentViewRequest({ ...request, status: "needs_information" })).toBe(false);
  });

  it("allows only President-authorized finalized history", () => {
    const signed = signRequestAsPresident({
      request,
      assignment,
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
});
