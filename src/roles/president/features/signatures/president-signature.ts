import {
  canTransitionRequest,
  hasHandwrittenSignatureInk,
  makeRequestDocumentFingerprint,
  makeMockDocumentFingerprint,
  makeTimelineId,
  progressForStatus,
  type HandwrittenSignature,
  type MockRequest,
  type SignatureWorkflow,
  type SignatureWorkflowStep,
} from "@/roles/shared/features/requests/request-schema";
import {
  isRoleAssignmentActive,
  type RoleAssignment,
} from "@/roles/shared/features/roles/role-assignment";
import { hasResourceScope, ORGANISATION_LIST } from "@/roles/shared/features/roles/access-model";

export interface PresidentSigningInput {
  request: MockRequest;
  assignment: RoleAssignment;
  signedAt: Date;
  handwrittenSignature: HandwrittenSignature | null;
  consentAccepted: boolean;
}

export function selectAwaitingSignatureRequests(
  requests: readonly MockRequest[],
  assignment: RoleAssignment | null,
) {
  if (!assignment) return [];
  return requests.filter((request) => canPresidentActOnRequest(request, assignment));
}

export function isPresidentFinalizedRequest(request: MockRequest, assignment?: RoleAssignment) {
  if (assignment) {
    return Boolean(getPresidentDecision(request, assignment));
  }
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

function legacyWorkflow(request: MockRequest): SignatureWorkflow | null {
  const college = ORGANISATION_LIST.find((organisation) => (
    organisation.kind === "college" && organisation.code === request.collegeCode
  ));
  if (!college) return null;
  return {
    kind: "college_only",
    preparedAt: request.updatedAt,
    preparedBy: {
      userId: "legacy-staff",
      userName: "เจ้าหน้าที่ผู้เตรียมเอกสาร",
      role: "royal_college_staff",
      organisationId: "org-royal-college",
      organisationCode: "รวภท.",
      organisationName: "ราชวิทยาลัยเภสัชกรรมแห่งประเทศไทย",
    },
    documentFingerprint: makeRequestDocumentFingerprint(request),
    steps: [{
      id: `${request.id}-signature-college`,
      order: 1,
      level: "college",
      organisationId: college.id,
      organisationCode: college.code,
      organisationName: college.name,
      status: request.status === "signed" ? "signed" : request.status === "rejected" ? "rejected" : "awaiting_signature",
    }],
  };
}

export function getEffectiveSignatureWorkflow(request: MockRequest) {
  return request.signatureWorkflow ?? legacyWorkflow(request);
}

export interface PresidentRequestDecision {
  status: "signed" | "rejected";
  decidedAt: string;
  documentFingerprint: string;
}

export function getPresidentDecision(
  request: MockRequest,
  assignment: RoleAssignment,
): PresidentRequestDecision | null {
  const workflow = getEffectiveSignatureWorkflow(request);
  const step = workflow?.steps.find((item) => (
    item.signerUserId === assignment.userId &&
    (item.status === "signed" || item.status === "rejected") &&
    Boolean(item.decidedAt)
  ));
  if (step?.decidedAt) {
    const signature = [...(request.signatures ?? [])].reverse().find((item) => (
      item.signerUserId === assignment.userId && item.workflowStepId === step.id
    ));
    return {
      status: step.status as "signed" | "rejected",
      decidedAt: step.decidedAt,
      documentFingerprint: signature?.documentFingerprint ?? workflow?.documentFingerprint ?? makeRequestDocumentFingerprint(request),
    };
  }

  const signature = [...(request.signatures ?? (request.mockSignature ? [request.mockSignature] : []))]
    .reverse()
    .find((item) => item.signerUserId === assignment.userId);
  if (signature) {
    return {
      status: "signed",
      decidedAt: signature.signedAt,
      documentFingerprint: signature.documentFingerprint,
    };
  }

  if (!request.signatureWorkflow && request.collegeCode === assignment.collegeCode) {
    const event = [...request.events].reverse().find((item) => (
      item.actorRole === "president" &&
      item.actorName === assignment.userName &&
      (item.type === "signed" || item.type === "rejected")
    ));
    if (event) {
      return {
        status: event.type === "rejected" ? "rejected" : "signed",
        decidedAt: event.createdAt,
        documentFingerprint: request.mockSignature?.documentFingerprint ?? makeRequestDocumentFingerprint(request),
      };
    }
  }
  return null;
}

export function getActiveSignatureStep(request: MockRequest): SignatureWorkflowStep | null {
  const workflow = getEffectiveSignatureWorkflow(request);
  if (!workflow) return null;
  return [...workflow.steps]
    .sort((left, right) => left.order - right.order)
    .find((step) => step.status === "awaiting_signature") ?? null;
}

function assignmentMatchesStep(assignment: RoleAssignment, step: SignatureWorkflowStep) {
  const requiredResource = step.level === "college" ? "signature:college" : "signature:royal_college";
  return assignment.role === "president" &&
    assignment.organisationScope.id === step.organisationId &&
    hasResourceScope(assignment.resourceScopes, requiredResource);
}

export function canPresidentActOnRequest(request: MockRequest, assignment: RoleAssignment) {
  const step = getActiveSignatureStep(request);
  return request.status === "awaiting_president_signature" &&
    Boolean(step && assignmentMatchesStep(assignment, step));
}

export function canPresidentViewRequest(request: MockRequest, assignment?: RoleAssignment) {
  if (!assignment) {
    return request.status === "awaiting_president_signature" || isPresidentFinalizedRequest(request);
  }
  return canPresidentActOnRequest(request, assignment) || isPresidentFinalizedRequest(request, assignment);
}

export function signRequestAsPresident({
  request,
  assignment,
  signedAt,
  handwrittenSignature,
  consentAccepted,
}: PresidentSigningInput): MockRequest {
  if (assignment.role !== "president" || !isRoleAssignmentActive(assignment, signedAt)) {
    throw new Error("วาระของผู้ลงนามไม่อยู่ในช่วงที่มีผล");
  }
  const workflow = getEffectiveSignatureWorkflow(request);
  const activeStep = getActiveSignatureStep(request);
  if (!workflow || !activeStep || !assignmentMatchesStep(assignment, activeStep)) {
    throw new Error("ผู้ลงนามไม่มีสิทธิ์ใน Organisation Scope หรือลำดับปัจจุบัน");
  }
  if (request.status !== "awaiting_president_signature") {
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
  const currentIndex = workflow.steps.findIndex((step) => step.id === activeStep.id);
  const nextStep = workflow.steps[currentIndex + 1];
  const updatedSteps = workflow.steps.map((step, index) => {
    if (step.id === activeStep.id) {
      return { ...step, status: "signed" as const, signerAssignmentId: assignment.id, signerUserId: assignment.userId, signerName: assignment.userName, decidedAt: signedAtIso };
    }
    if (nextStep && index === currentIndex + 1) return { ...step, status: "awaiting_signature" as const };
    return { ...step };
  });
  const finalStep = !nextStep;
  if (finalStep && !canTransitionRequest(request.status, "signed", "president")) {
    throw new Error("คำร้องไม่อยู่ในสถานะที่ลงนามได้");
  }
  const signature = {
    kind: "mock_e_sign" as const,
    signerAssignmentId: assignment.id,
    signerUserId: assignment.userId,
    signerName: assignment.userName,
    signerRoleLabel: activeStep.level === "college" ? `ประธาน${assignment.collegeName}` : "ประธานราชวิทยาลัยเภสัชกรรมแห่งประเทศไทย",
    collegeCode: activeStep.organisationCode,
    signedAt: signedAtIso,
    documentFingerprint: workflow.documentFingerprint || makeMockDocumentFingerprint(request, signedAtIso, storedHandwrittenSignature),
    stampLabel: activeStep.level === "college" ? "ลงนามโดยประธานระดับวิทยาลัย" : "ลงนามโดยประธานระดับราชวิทยาลัย",
    consentText: "ผู้ลงนามยืนยันว่าได้ตรวจสอบและยินยอมลงนามในเอกสารนี้",
    handwrittenSignature: storedHandwrittenSignature,
    workflowStepId: activeStep.id,
    level: activeStep.level,
    organisationId: activeStep.organisationId,
  };
  const stepEvent = {
    id: makeTimelineId("event-signature-step", signedAt, request.events.length),
    type: "signature_step_completed" as const,
    actorRole: "president" as const,
    actorName: assignment.userName,
    createdAt: signedAtIso,
    note: `${activeStep.organisationName} · ${workflow.documentFingerprint}`,
  };
  const continuationEvents = nextStep ? [{
    id: makeTimelineId("event-forwarded-next", signedAt, request.events.length + 1),
    type: "forwarded_to_next_signer" as const,
    actorRole: "system" as const,
    actorName: "System Actor",
    createdAt: signedAtIso,
    note: `ส่งต่อ ${nextStep.organisationName}`,
  }] : [{
    id: makeTimelineId("event-signed", signedAt, request.events.length + 1),
    type: "signed" as const,
    actorRole: "president" as const,
    actorName: assignment.userName,
    createdAt: signedAtIso,
  }];
  return {
    ...request,
    status: finalStep ? "signed" : "awaiting_president_signature",
    updatedAt: signedAtIso,
    signatureWorkflow: { ...workflow, steps: updatedSteps },
    mockSignature: signature,
    signatures: [...(request.signatures ?? (request.mockSignature ? [request.mockSignature] : [])), signature],
    events: [...request.events, stepEvent, ...continuationEvents],
    progress: finalStep
      ? progressForStatus("signed")
      : ["เจ้าหน้าที่ตรวจสอบ ✓", "ประธานระดับวิทยาลัยลงนาม ✓", "รอประธานระดับราชวิทยาลัย ◷"],
  };
}

export function rejectRequestAsPresident({ request, assignment, rejectedAt, reason }: {
  request: MockRequest;
  assignment: RoleAssignment;
  rejectedAt: Date;
  reason: string;
}): MockRequest {
  const note = reason.trim();
  if (!note) throw new Error("กรุณาระบุเหตุผลที่ไม่อนุมัติ");
  if (assignment.role !== "president" || !isRoleAssignmentActive(assignment, rejectedAt)) {
    throw new Error("วาระของผู้ลงนามไม่อยู่ในช่วงที่มีผล");
  }
  const workflow = getEffectiveSignatureWorkflow(request);
  const activeStep = getActiveSignatureStep(request);
  if (!workflow || !activeStep || !assignmentMatchesStep(assignment, activeStep)) {
    throw new Error("ผู้ลงนามไม่มีสิทธิ์ใน Organisation Scope หรือลำดับปัจจุบัน");
  }
  if (!canTransitionRequest(request.status, "rejected", "president")) {
    throw new Error("คำร้องไม่อยู่ในสถานะที่พิจารณาได้");
  }
  const rejectedAtIso = rejectedAt.toISOString();
  return {
    ...request,
    status: "rejected",
    updatedAt: rejectedAtIso,
    signatureWorkflow: {
      ...workflow,
      steps: workflow.steps.map((step) => step.id === activeStep.id
        ? { ...step, status: "rejected", signerAssignmentId: assignment.id, signerUserId: assignment.userId, signerName: assignment.userName, decidedAt: rejectedAtIso, note }
        : { ...step }),
    },
    comments: [...request.comments, { id: makeTimelineId("comment-president", rejectedAt, request.comments.length), actorRole: "president", actorName: assignment.userName, message: note, createdAt: rejectedAtIso }],
    events: [...request.events, { id: makeTimelineId("event-rejected", rejectedAt, request.events.length), type: "rejected", actorRole: "president", actorName: assignment.userName, createdAt: rejectedAtIso, note }],
    progress: progressForStatus("rejected"),
  };
}
