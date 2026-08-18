import type {
  LicenseEligibilityDecision,
  LicenseVerificationStatus,
} from "@/roles/shared/features/license-eligibility";
import type { SystemRole } from "@/roles/shared/features/roles/access-model";

export const registrationStatuses = [
  "selected",
  "submitted",
  "pending",
  "needs_info",
  "approved",
  "awaiting_payment",
  "enrolled",
  "rejected",
  "drop_pending",
  "withdrawn",
] as const;

export type RegistrationStatus = (typeof registrationStatuses)[number];
export type RegistrationActor =
  | "member"
  | "student"
  | "teacher"
  | "registrar"
  | "royal_college_staff"
  | "system"
  | "migration";

export interface RegistrationActionActor {
  userId: string;
  userName: string;
  role: SystemRole;
  organisationId: string;
}

export interface RegistrationEligibilitySnapshot {
  status: LicenseVerificationStatus;
  decision: LicenseEligibilityDecision;
  checkedAt: string;
  evidenceReference: string;
}

export interface RegistrationTeacherDecision {
  decision: "approved" | "needs_info" | "rejected";
  teacherId: string;
  teacherName: string;
  decidedAt: string;
  reason?: string;
  evidenceReference?: string;
}

export interface RegistrationHistoryEntry {
  id: string;
  from?: RegistrationStatus;
  to: RegistrationStatus;
  actor: RegistrationActor;
  actorUserId?: string;
  actorName?: string;
  actorRole?: SystemRole;
  organisationId?: string;
  evidenceReference?: string;
  at: string;
  reason?: string;
}
export interface RegistrationRecord {
  id: string;
  studentId: string;
  studentName: string;
  courseId: string;
  courseCode: string;
  courseTitle: string;
  credits: number;
  term: string;
  status: RegistrationStatus;
  submittedAt: string;
  updatedAt: string;
  reviewReason?: string;
  courseOfferingId?: string;
  institutionId?: string;
  eligibility?: RegistrationEligibilitySnapshot;
  teacherDecision?: RegistrationTeacherDecision;
  history: RegistrationHistoryEntry[];
}

export interface RegistrationSelectionInput {
  id: string;
  studentId: string;
  studentName: string;
  courseId: string;
  courseCode: string;
  courseTitle: string;
  credits: number;
  term: string;
  courseOfferingId?: string;
  institutionId?: string;
  eligibility?: RegistrationEligibilitySnapshot;
}

const allowedTransitions = {
  selected: ["submitted"],
  submitted: ["pending"],
  pending: ["needs_info", "approved", "rejected"],
  needs_info: ["submitted"],
  approved: ["awaiting_payment", "drop_pending"],
  awaiting_payment: ["enrolled", "drop_pending"],
  enrolled: ["drop_pending"],
  rejected: ["selected"],
  drop_pending: ["withdrawn", "approved", "awaiting_payment", "enrolled"],
  withdrawn: ["selected"],
} as const satisfies Record<RegistrationStatus, readonly RegistrationStatus[]>;

export const registrationStatusMeta = {
  selected: { label: "เลือกแล้ว", variant: "brand" },
  submitted: { label: "ส่งคำขอแล้ว", variant: "info" },
  pending: { label: "รอตรวจสอบ", variant: "warning" },
  needs_info: { label: "รอข้อมูลเพิ่ม", variant: "warning" },
  approved: { label: "อนุมัติแล้ว", variant: "success" },
  awaiting_payment: { label: "รอชำระเงิน", variant: "warning" },
  enrolled: { label: "ลงทะเบียนสำเร็จ", variant: "success" },
  rejected: { label: "ไม่อนุมัติ", variant: "danger" },
  drop_pending: { label: "รออนุมัติถอน", variant: "warning" },
  withdrawn: { label: "ถอนแล้ว", variant: "neutral" },
} as const;

export function isRegistrationStatus(value: unknown): value is RegistrationStatus {
  return typeof value === "string" && registrationStatuses.includes(value as RegistrationStatus);
}

export function canTransitionRegistration(
  from: RegistrationStatus,
  to: RegistrationStatus,
): boolean {
  return (allowedTransitions[from] as readonly RegistrationStatus[]).includes(to);
}

export function transitionRegistration(
  registration: RegistrationRecord,
  to: RegistrationStatus,
  actor: RegistrationActor | RegistrationActionActor,
  options: { at?: string; reason?: string; evidenceReference?: string } = {},
): RegistrationRecord {
  if (!canTransitionRegistration(registration.status, to)) {
    throw new Error(`Invalid registration transition: ${registration.status} -> ${to}`);
  }

  const reason = options.reason?.trim();
  if ((to === "needs_info" || to === "rejected") && !reason) {
    throw new Error(`Registration transition to ${to} requires a reason`);
  }

  const at = options.at ?? new Date().toISOString();
  const actorType: RegistrationActor = typeof actor === "string"
    ? actor
    : actor.role === "student"
      ? "student"
      : actor.role === "teacher"
        ? "teacher"
        : actor.role === "royal_college_staff"
          ? "royal_college_staff"
          : "registrar";
  const history: RegistrationHistoryEntry = {
    id: `${registration.id}-${registration.history.length + 1}`,
    from: registration.status,
    to,
    actor: actorType,
    at,
    ...(reason ? { reason } : {}),
    ...(typeof actor === "string" ? {} : {
      actorUserId: actor.userId,
      actorName: actor.userName,
      actorRole: actor.role,
      organisationId: actor.organisationId,
    }),
    ...(options.evidenceReference?.trim()
      ? { evidenceReference: options.evidenceReference.trim() }
      : {}),
  };

  return {
    ...registration,
    status: to,
    updatedAt: at,
    reviewReason: to === "needs_info" || to === "rejected" ? reason : undefined,
    history: [...registration.history, history],
  };
}

export function createSubmittedRegistration(
  input: RegistrationSelectionInput,
  at = new Date().toISOString(),
): RegistrationRecord {
  const selected: RegistrationRecord = {
    ...input,
    status: "selected",
    submittedAt: at,
    updatedAt: at,
    history: [{
      id: `${input.id}-1`,
      to: "selected",
      actor: "member",
      at,
    }],
  };

  const submitted = transitionRegistration(selected, "submitted", "member", { at });
  return transitionRegistration(submitted, "pending", "system", { at });
}

export function resubmitRegistration(
  registration: RegistrationRecord,
  at = new Date().toISOString(),
): RegistrationRecord {
  const submitted = transitionRegistration(registration, "submitted", "member", { at });
  return transitionRegistration(submitted, "pending", "system", { at });
}

export function createEligibilityCheckedRegistration(
  input: Omit<RegistrationSelectionInput, "eligibility">,
  eligibility: RegistrationEligibilitySnapshot,
  at = new Date().toISOString(),
): RegistrationRecord {
  if (eligibility.decision !== "eligible" && eligibility.decision !== "eligible_with_warning") {
    throw new Error(`Registration eligibility is ${eligibility.decision}`);
  }
  return createSubmittedRegistration({ ...input, eligibility }, at);
}

export function recordTeacherRegistrationDecision(
  registration: RegistrationRecord,
  decision: RegistrationTeacherDecision["decision"],
  actor: RegistrationActionActor,
  options: { at?: string; reason?: string; evidenceReference?: string } = {},
) {
  if (actor.role !== "teacher") throw new Error("Only a teacher can review a registration");
  const reason = options.reason?.trim();
  if (!reason) throw new Error("Teacher registration decisions require a reason");
  const at = options.at ?? new Date().toISOString();
  const target = decision === "approved" ? "approved" : decision;
  const updated = transitionRegistration(registration, target, actor, {
    at,
    reason: options.reason,
    evidenceReference: options.evidenceReference,
  });
  return {
    ...updated,
    teacherDecision: {
      decision,
      teacherId: actor.userId,
      teacherName: actor.userName,
      decidedAt: at,
      reason,
      ...(options.evidenceReference?.trim()
        ? { evidenceReference: options.evidenceReference.trim() }
        : {}),
    },
  } satisfies RegistrationRecord;
}

export function markRegistrationAwaitingPayment(
  registration: RegistrationRecord,
  at = new Date().toISOString(),
) {
  return transitionRegistration(registration, "awaiting_payment", "system", { at });
}

export function markRegistrationEnrolled(
  registration: RegistrationRecord,
  at = new Date().toISOString(),
) {
  return transitionRegistration(registration, "enrolled", "system", { at });
}
