export const registrationStatuses = [
  "selected",
  "submitted",
  "pending",
  "needs_info",
  "approved",
  "rejected",
  "drop_pending",
  "withdrawn",
] as const;

export type RegistrationStatus = (typeof registrationStatuses)[number];
export type RegistrationActor = "member" | "registrar" | "system" | "migration";

export interface RegistrationHistoryEntry {
  id: string;
  from?: RegistrationStatus;
  to: RegistrationStatus;
  actor: RegistrationActor;
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
}

const allowedTransitions = {
  selected: ["submitted"],
  submitted: ["pending"],
  pending: ["needs_info", "approved", "rejected"],
  needs_info: ["submitted"],
  approved: ["drop_pending"],
  rejected: ["selected"],
  drop_pending: ["withdrawn", "approved"],
  withdrawn: ["selected"],
} as const satisfies Record<RegistrationStatus, readonly RegistrationStatus[]>;

export const registrationStatusMeta = {
  selected: { label: "เลือกแล้ว", variant: "brand" },
  submitted: { label: "ส่งคำขอแล้ว", variant: "info" },
  pending: { label: "รอตรวจสอบ", variant: "warning" },
  needs_info: { label: "รอข้อมูลเพิ่ม", variant: "warning" },
  approved: { label: "อนุมัติแล้ว", variant: "success" },
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
  actor: RegistrationActor,
  options: { at?: string; reason?: string } = {},
): RegistrationRecord {
  if (!canTransitionRegistration(registration.status, to)) {
    throw new Error(`Invalid registration transition: ${registration.status} -> ${to}`);
  }

  const reason = options.reason?.trim();
  if ((to === "needs_info" || to === "rejected") && !reason) {
    throw new Error(`Registration transition to ${to} requires a reason`);
  }

  const at = options.at ?? new Date().toISOString();
  const history: RegistrationHistoryEntry = {
    id: `${registration.id}-${registration.history.length + 1}`,
    from: registration.status,
    to,
    actor,
    at,
    ...(reason ? { reason } : {}),
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
