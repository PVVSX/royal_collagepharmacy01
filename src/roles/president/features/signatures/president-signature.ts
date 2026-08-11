import {
  canTransitionRequest,
  hasHandwrittenSignatureInk,
  makeMockDocumentFingerprint,
  makeTimelineId,
  progressForStatus,
  type HandwrittenSignature,
  type MockRequest,
} from "@/roles/shared/features/requests/request-schema";
import {
  isRoleAssignmentActive,
  type RoleAssignment,
} from "@/roles/shared/features/roles/role-assignment";

export interface PresidentSigningInput {
  request: MockRequest;
  assignment: RoleAssignment;
  signedAt: Date;
  handwrittenSignature: HandwrittenSignature | null;
  consentAccepted: boolean;
}

export function selectAwaitingSignatureRequests(
  requests: readonly MockRequest[],
  collegeCode: string,
) {
  return requests.filter((request) => (
    request.collegeCode === collegeCode &&
    request.status === "awaiting_president_signature"
  ));
}

export function isPresidentFinalizedRequest(request: MockRequest) {
  if (request.status === "signed") {
    return request.events.some((event) => (
      event.actorRole === "president" && event.type === "signed"
    ));
  }
  if (request.status === "rejected") {
    return request.events.some((event) => (
      event.actorRole === "president" && event.type === "rejected"
    ));
  }
  return false;
}

export function canPresidentViewRequest(request: MockRequest) {
  return request.status === "awaiting_president_signature" ||
    isPresidentFinalizedRequest(request);
}

export function signRequestAsPresident({
  request,
  assignment,
  signedAt,
  handwrittenSignature,
  consentAccepted,
}: PresidentSigningInput): MockRequest {
  if (assignment.role !== "college_president" || !isRoleAssignmentActive(assignment, signedAt)) {
    throw new Error("วาระของผู้ลงนามไม่อยู่ในช่วงที่มีผล");
  }
  if (assignment.collegeCode !== request.collegeCode) {
    throw new Error("ผู้ลงนามไม่มีสิทธิ์ในวิทยาลัยของคำร้องนี้");
  }
  if (!canTransitionRequest(request.status, "signed", "president")) {
    throw new Error("คำร้องไม่อยู่ในสถานะที่ลงนามได้");
  }
  if (!hasHandwrittenSignatureInk(handwrittenSignature)) {
    throw new Error("กรุณาใช้เมาส์ ปากกาดิจิทัล หรือหน้าจอสัมผัสลงลายมือชื่อในกรอบ");
  }
  if (!consentAccepted) {
    throw new Error("กรุณายืนยันความยินยอมก่อนลงนาม");
  }

  const signedAtIso = signedAt.toISOString();
  const storedHandwrittenSignature: HandwrittenSignature = {
    version: 1,
    strokes: handwrittenSignature.strokes.map((stroke) => (
      stroke.map((point) => ({ ...point }))
    )),
  };
  return {
    ...request,
    status: "signed",
    updatedAt: signedAtIso,
    mockSignature: {
      kind: "mock_e_sign",
      signerAssignmentId: assignment.id,
      signerUserId: assignment.userId,
      signerName: assignment.userName,
      signerRoleLabel: `ประธาน${assignment.collegeName}`,
      collegeCode: assignment.collegeCode,
      signedAt: signedAtIso,
      documentFingerprint: makeMockDocumentFingerprint(
        request,
        signedAtIso,
        storedHandwrittenSignature,
      ),
      stampLabel: "ลงนามอิเล็กทรอนิกส์โดยประธานวิทยาลัย",
      consentText: "ผู้ลงนามยืนยันว่าได้ตรวจสอบและยินยอมลงนามในเอกสารนี้",
      handwrittenSignature: storedHandwrittenSignature,
    },
    events: [...request.events, {
      id: makeTimelineId("event-signed", signedAt, request.events.length),
      type: "signed",
      actorRole: "president",
      actorName: assignment.userName,
      createdAt: signedAtIso,
    }],
    progress: progressForStatus("signed"),
  };
}
