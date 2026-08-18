import type {
  WorkflowStateStep,
  WorkflowStepState,
} from "@/roles/shared/components/workspace/WorkflowStateTimeline";
import type { RegistrationRecord } from "@/roles/shared/features/registration";

type RegistrationInvoiceStatus = "locked" | "awaiting_payment" | "paid" | "cancelled";
type RegistrationPaymentStatus = "pending" | "approved" | "rejected";

export const eligibilityDecisionLabel = {
  eligible: "ผ่าน",
  eligible_with_warning: "ผ่านแบบมีเงื่อนไข",
  ineligible: "ไม่ผ่าน",
  manual_review: "รอตรวจสอบเพิ่มเติม",
} as const;

export const teacherDecisionLabel = {
  approved: "อนุมัติ",
  needs_info: "ขอข้อมูลเพิ่ม",
  rejected: "ไม่อนุมัติ",
} as const;

export function paymentStatusLabel(
  invoiceStatus?: RegistrationInvoiceStatus,
  paymentStatus?: RegistrationPaymentStatus,
) {
  if (paymentStatus === "approved" || invoiceStatus === "paid") return "ชำระแล้ว";
  if (paymentStatus === "rejected") return "การชำระเงินมีปัญหา";
  if (paymentStatus === "pending") return "รอตรวจการชำระเงิน";
  if (invoiceStatus === "awaiting_payment") return "รอชำระเงิน";
  if (invoiceStatus === "cancelled") return "ยกเลิกรายการชำระเงินแล้ว";
  return "ยังไม่เปิดยอด";
}

export function registrationTimelineSteps(
  registration: RegistrationRecord,
  invoiceStatus?: RegistrationInvoiceStatus,
  paymentStatus?: RegistrationPaymentStatus,
): WorkflowStateStep[] {
  const eligibilityDecision = registration.eligibility?.decision;
  const teacherDecision = registration.teacherDecision;
  const hasReachedEnrollment = registration.status === "enrolled" ||
    registration.history.some((event) => event.to === "enrolled");
  const isWithdrawalFlow = registration.status === "drop_pending" || registration.status === "withdrawn";

  const submissionState: WorkflowStepState = registration.status === "selected"
    ? "waiting"
    : "completed";
  const eligibilityState: WorkflowStepState = eligibilityDecision === "ineligible"
    ? "problem"
    : eligibilityDecision === "eligible" || eligibilityDecision === "eligible_with_warning"
      ? "completed"
      : "waiting";
  const teacherState: WorkflowStepState = registration.status === "rejected"
    ? "problem"
    : registration.status === "needs_info"
      ? "action_required"
      : [
          "approved",
          "awaiting_payment",
          "enrolled",
          "drop_pending",
          "withdrawn",
        ].includes(registration.status)
        ? "completed"
        : "waiting";
  const paymentState: WorkflowStepState = paymentStatus === "approved" || invoiceStatus === "paid" || hasReachedEnrollment
    ? "completed"
    : paymentStatus === "rejected"
      ? "problem"
      : "waiting";
  const enrollmentState: WorkflowStepState = hasReachedEnrollment ? "completed" : "waiting";

  let currentStepId: string | undefined;
  if (!isWithdrawalFlow) {
    if (registration.status === "selected") currentStepId = "submission";
    else if (eligibilityState !== "completed") currentStepId = "eligibility";
    else if (["submitted", "pending", "needs_info", "rejected"].includes(registration.status)) currentStepId = "teacher-review";
    else if (paymentState !== "completed") currentStepId = "payment";
    else currentStepId = "enrollment";
  }

  const steps: WorkflowStateStep[] = [
    {
      id: "submission",
      label: "ส่งคำขอ",
      description: submissionState === "completed" ? "ส่งคำขอแล้ว" : "เลือกวิชาแล้ว รอส่งคำขอ",
      state: submissionState,
    },
    {
      id: "eligibility",
      label: "ตรวจคุณสมบัติ",
      description: eligibilityDecision ? eligibilityDecisionLabel[eligibilityDecision] : "รอตรวจคุณสมบัติ",
      state: eligibilityState,
    },
    {
      id: "teacher-review",
      label: "อาจารย์พิจารณา",
      description: registration.status === "needs_info"
        ? "ต้องส่งข้อมูลเพิ่ม"
        : registration.status === "rejected"
          ? "ไม่อนุมัติ"
          : teacherState === "completed" && teacherDecision
            ? teacherDecisionLabel[teacherDecision.decision]
            : teacherState === "completed"
              ? "อนุมัติแล้ว"
              : "รอพิจารณา",
      state: teacherState,
    },
    {
      id: "payment",
      label: "ชำระเงิน",
      description: paymentStatusLabel(invoiceStatus, paymentStatus),
      state: paymentState,
    },
    {
      id: "enrollment",
      label: "ลงทะเบียนสำเร็จ",
      description: hasReachedEnrollment ? "ลงทะเบียนเรียบร้อย" : "รอขั้นตอนก่อนหน้า",
      state: enrollmentState,
    },
  ];

  return steps.map((step) => ({ ...step, current: step.id === currentStepId }));
}
