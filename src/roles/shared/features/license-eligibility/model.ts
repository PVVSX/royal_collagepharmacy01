import type { LicenseStatus } from "@/roles/shared/member/domain/passport";

export const licenseStatuses = [
  "active",
  "suspended",
  "revoked",
  "expired",
  "lapsed",
] as const satisfies readonly LicenseStatus[];

export function isLicenseStatus(value: unknown): value is LicenseStatus {
  return typeof value === "string" && licenseStatuses.includes(value as LicenseStatus);
}

export type LicenseEligibilityDecision =
  | "eligible"
  | "eligible_with_warning"
  | "manual_review"
  | "ineligible";

export type LicenseVerificationStatus = LicenseStatus | "unverified";

export type StudentStanding = "active" | "under_review" | "terminated";

export interface LicenseEligibility {
  status: LicenseVerificationStatus;
  decision: LicenseEligibilityDecision;
  canApplyForExam: boolean;
  canRegisterCourses: boolean;
  studentStanding: StudentStanding;
  label: string;
  description: string;
  tone: "success" | "warning" | "danger";
}

const eligibilityByStatus = {
  active: {
    decision: "eligible",
    canApplyForExam: true,
    canRegisterCourses: true,
    studentStanding: "active",
    label: "ใบอนุญาตปกติ",
    description: "สามารถสมัครสอบและลงทะเบียนรายวิชาได้ตามปกติ",
    tone: "success",
  },
  suspended: {
    decision: "eligible_with_warning",
    canApplyForExam: true,
    canRegisterCourses: true,
    studentStanding: "active",
    label: "อยู่ระหว่างพักใช้ใบอนุญาต",
    description: "ยังสามารถสมัครสอบและลงทะเบียนเรียนได้ตามปกติ ระบบจะแจ้งสถานะนี้แก่เจ้าหน้าที่",
    tone: "warning",
  },
  revoked: {
    decision: "ineligible",
    canApplyForExam: false,
    canRegisterCourses: false,
    studentStanding: "terminated",
    label: "ใบอนุญาตถูกเพิกถอน",
    description: "ไม่สามารถสมัครสอบหรือลงทะเบียนรายวิชา และพ้นสภาพการเป็นผู้เข้าศึกษา",
    tone: "danger",
  },
  expired: {
    decision: "manual_review",
    canApplyForExam: false,
    canRegisterCourses: false,
    studentStanding: "under_review",
    label: "ใบอนุญาตหมดอายุ",
    description: "กรุณาติดต่อเจ้าหน้าที่เพื่อตรวจสอบสถานะก่อนสมัครสอบหรือลงทะเบียน",
    tone: "warning",
  },
  lapsed: {
    decision: "manual_review",
    canApplyForExam: false,
    canRegisterCourses: false,
    studentStanding: "under_review",
    label: "ใบอนุญาตขาดต่ออายุ",
    description: "กรุณาติดต่อเจ้าหน้าที่เพื่อตรวจสอบสถานะก่อนสมัครสอบหรือลงทะเบียน",
    tone: "warning",
  },
  unverified: {
    decision: "manual_review",
    canApplyForExam: false,
    canRegisterCourses: false,
    studentStanding: "under_review",
    label: "ไม่พบข้อมูลใบอนุญาต",
    description: "ยังยืนยันข้อมูลใบอนุญาตจากทะเบียนไม่ได้ กรุณาติดต่อเจ้าหน้าที่ก่อนสมัครสอบหรือลงทะเบียน",
    tone: "warning",
  },
} as const satisfies Record<
  LicenseVerificationStatus,
  Omit<LicenseEligibility, "status">
>;

export function getLicenseEligibility(status: LicenseVerificationStatus): LicenseEligibility {
  return { status, ...eligibilityByStatus[status] };
}

export const studentStandingMeta = {
  active: { label: "มีสถานภาพ", tone: "success" },
  under_review: { label: "รอตรวจสอบสถานภาพ", tone: "warning" },
  terminated: { label: "พ้นสภาพ", tone: "danger" },
} as const satisfies Record<
  StudentStanding,
  { label: string; tone: "success" | "warning" | "danger" }
>;
