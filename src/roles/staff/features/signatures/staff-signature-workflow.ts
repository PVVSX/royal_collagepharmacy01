import {
  canTransitionRequest,
  makeRequestDocumentFingerprint,
  makeTimelineId,
  progressForStatus,
  type MockRequest,
  type SignatureWorkflowKind,
  type SignatureWorkflowPreparer,
  type SignatureWorkflowStep,
} from "@/roles/shared/features/requests/request-schema";
import { ORGANISATIONS, ORGANISATION_LIST } from "@/roles/shared/features/roles/access-model";

export interface PrepareSignatureWorkflowInput {
  request: MockRequest;
  kind: SignatureWorkflowKind;
  preparedAt: Date;
  preparedBy: SignatureWorkflowPreparer;
  evidenceReference: string;
}

export const SIGNATURE_WORKFLOW_META: Record<SignatureWorkflowKind, { label: string; description: string }> = {
  college_only: { label: "ระดับวิทยาลัยเท่านั้น", description: "ส่งให้ประธานวิทยาลัยต้นทางลงนาม 1 ขั้น" },
  royal_only: { label: "ระดับราชวิทยาลัยเท่านั้น", description: "ส่งให้ประธานราชวิทยาลัยลงนาม 1 ขั้น" },
  two_level: { label: "สองระดับตามลำดับ", description: "ประธานวิทยาลัยลงนามก่อน แล้วระบบส่งต่อประธานราชวิทยาลัย" },
};

function stepForCollege(request: MockRequest, order: number, status: SignatureWorkflowStep["status"]): SignatureWorkflowStep {
  const college = ORGANISATION_LIST.find((organisation) => (
    organisation.kind === "college" && organisation.code === request.collegeCode
  ));
  if (!college) throw new Error("ไม่พบ Organisation Scope ของวิทยาลัยต้นทาง");
  return {
    id: `${request.id}-signature-college`,
    order,
    level: "college",
    organisationId: college.id,
    organisationCode: college.code,
    organisationName: college.name,
    status,
  };
}

function stepForRoyalCollege(request: MockRequest, order: number, status: SignatureWorkflowStep["status"]): SignatureWorkflowStep {
  return {
    id: `${request.id}-signature-royal`,
    order,
    level: "royal_college",
    organisationId: ORGANISATIONS.royalCollege.id,
    organisationCode: ORGANISATIONS.royalCollege.code,
    organisationName: ORGANISATIONS.royalCollege.name,
    status,
  };
}

export function prepareRequestForSignature({ request, kind, preparedAt, preparedBy, evidenceReference }: PrepareSignatureWorkflowInput): MockRequest {
  if (!canTransitionRequest(request.status, "awaiting_president_signature", "royal_college_staff")) {
    throw new Error("คำร้องไม่อยู่ในสถานะที่เตรียมเข้าคิวลงนามได้");
  }
  const incompleteRequiredDocument = request.documents.find((document) => (
    document.required && (!document.file || document.reviewStatus !== "accepted")
  ));
  if (incompleteRequiredDocument) {
    throw new Error(`เอกสารบังคับยังไม่ครบ: ${incompleteRequiredDocument.label}`);
  }

  const steps = kind === "college_only"
    ? [stepForCollege(request, 1, "awaiting_signature")]
    : kind === "royal_only"
      ? [stepForRoyalCollege(request, 1, "awaiting_signature")]
      : [stepForCollege(request, 1, "awaiting_signature"), stepForRoyalCollege(request, 2, "pending")];
  const preparedAtIso = preparedAt.toISOString();
  const fingerprint = makeRequestDocumentFingerprint(request);
  const sourceEvidence = evidenceReference.trim();
  if (!sourceEvidence) throw new Error("กรุณาระบุหลักฐานต้นทาง");

  return {
    ...request,
    status: "awaiting_president_signature",
    updatedAt: preparedAtIso,
    signatureWorkflow: {
      kind,
      preparedAt: preparedAtIso,
      preparedBy: { ...preparedBy },
      documentFingerprint: fingerprint,
      evidenceReference: sourceEvidence,
      steps,
    },
    events: [...request.events, {
      id: makeTimelineId("event-forwarded-signature", preparedAt, request.events.length),
      type: "forwarded_for_signature",
      actorRole: "royal_college_staff",
      actorName: preparedBy.userName,
      createdAt: preparedAtIso,
      note: `${SIGNATURE_WORKFLOW_META[kind].label} · ${fingerprint}`,
    }],
    progress: progressForStatus("awaiting_president_signature"),
  };
}
