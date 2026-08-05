export type SemanticBadgeVariant =
  | "active"
  | "brand"
  | "danger"
  | "info"
  | "neutral"
  | "success"
  | "warning";

export interface StudentRecordStatusMeta {
  label: string;
  variant: SemanticBadgeVariant;
}

export type EnrollmentStatus = "registered" | "pending" | "cancelled";
export type BillingStatus = "paid" | "awaiting_payment" | "overdue";
export type SlipReviewStatus =
  | "not_submitted"
  | "pending_review"
  | "approved"
  | "rejected";
export type TrainingStatus =
  | "normal"
  | "maintaining"
  | "completed"
  | "resigned";
export type QualificationType =
  | "degree"
  | "specialty_training"
  | "short_course";

export const studentRecordStatusMeta = {
  enrollment: {
    registered: { label: "ลงทะเบียนแล้ว", variant: "success" },
    pending: { label: "รอยืนยันลงทะเบียน", variant: "warning" },
    cancelled: { label: "ยกเลิกการลงทะเบียน", variant: "neutral" },
  },
  billing: {
    paid: { label: "ชำระแล้ว", variant: "success" },
    awaiting_payment: { label: "รอชำระ", variant: "warning" },
    overdue: { label: "เกินกำหนด", variant: "danger" },
  },
  slipReview: {
    not_submitted: { label: "ยังไม่ส่งสลิป", variant: "neutral" },
    pending_review: { label: "รอตรวจสลิป", variant: "warning" },
    approved: { label: "ตรวจสอบแล้ว", variant: "success" },
    rejected: { label: "ต้องแก้ไขสลิป", variant: "danger" },
  },
  training: {
    normal: { label: "ปกติ", variant: "success" },
    maintaining: { label: "รักษาสถานภาพ", variant: "warning" },
    completed: { label: "สำเร็จการฝึกอบรม", variant: "info" },
    resigned: { label: "ลาออก", variant: "neutral" },
  },
  qualification: {
    degree: { label: "ระดับปริญญา", variant: "neutral" },
    specialty_training: { label: "ฝึกอบรมเฉพาะทาง", variant: "brand" },
    short_course: { label: "หลักสูตรระยะสั้น", variant: "info" },
  },
} as const satisfies {
  enrollment: Record<EnrollmentStatus, StudentRecordStatusMeta>;
  billing: Record<BillingStatus, StudentRecordStatusMeta>;
  slipReview: Record<SlipReviewStatus, StudentRecordStatusMeta>;
  training: Record<TrainingStatus, StudentRecordStatusMeta>;
  qualification: Record<QualificationType, StudentRecordStatusMeta>;
};

export interface StudentRecordStatusByKind {
  enrollment: EnrollmentStatus;
  billing: BillingStatus;
  slipReview: SlipReviewStatus;
  training: TrainingStatus;
  qualification: QualificationType;
}

export type StudentRecordStatusKind = keyof StudentRecordStatusByKind;

export function getStudentRecordStatusMeta<
  Kind extends StudentRecordStatusKind,
>(
  kind: Kind,
  status: StudentRecordStatusByKind[Kind],
): StudentRecordStatusMeta {
  const metadata = studentRecordStatusMeta[kind] as Record<
    string,
    StudentRecordStatusMeta
  >;

  return metadata[status];
}

export interface EducationTimelineEntry {
  degree: string;
  field: string;
  institution: string;
  parentInstitution: string;
  period: string;
  isCurrent: boolean;
  qualificationType: QualificationType;
  trainingStatus: TrainingStatus;
}

export interface RegistrationCourseRecord {
  code: string;
  title: string;
  credits: number;
  schedule: string;
  room: string;
  capacity: number;
  enrolled: number;
  status: "available" | "full" | "registered";
  enrollmentStatus: EnrollmentStatus;
  billingStatus: BillingStatus;
  slipReviewStatus: SlipReviewStatus;
}

export interface FinanceItemRecord {
  id: number;
  description: string;
  amount: number;
  dueDate: string;
  /** Legacy status used by the existing payment mock flow. */
  status: "paid" | "unpaid" | "pending";
  billingStatus: BillingStatus;
  slipReviewStatus: SlipReviewStatus;
}

export const mockPaymentFeeRule = {
  lateFee: 500,
  transactionFee: 50,
  note: "กำหนดค่าปรับล่าช้า 500 บาทและค่าธรรมเนียมต่อรายการ 50 บาท",
} as const;

export interface MockPaymentBreakdown {
  baseAmount: number;
  lateFee: number;
  transactionFee: number;
  total: number;
}

export function getMockPaymentBreakdown(
  baseAmount: number,
  billingStatus: BillingStatus,
): MockPaymentBreakdown {
  const isSettled = billingStatus === "paid";
  const lateFee = billingStatus === "overdue" ? mockPaymentFeeRule.lateFee : 0;
  const transactionFee = isSettled ? 0 : mockPaymentFeeRule.transactionFee;

  return {
    baseAmount,
    lateFee,
    transactionFee,
    total: baseAmount + lateFee + transactionFee,
  };
}

export function getOutstandingBaseAmount(
  items: readonly Pick<FinanceItemRecord, "amount" | "billingStatus">[],
): number {
  return items
    .filter((item) => item.billingStatus !== "paid")
    .reduce((total, item) => total + item.amount, 0);
}

export function getEstimatedOutstandingAmount(
  items: readonly Pick<FinanceItemRecord, "amount" | "billingStatus">[],
): number {
  return items
    .filter((item) => item.billingStatus !== "paid")
    .reduce(
      (total, item) =>
        total + getMockPaymentBreakdown(item.amount, item.billingStatus).total,
      0,
    );
}

export interface StudentDocumentDefinition {
  id: string;
  name: string;
  extension: "PDF";
  icon: string;
}

export const studentDocuments: readonly StudentDocumentDefinition[] = [
  {
    id: "student-card",
    name: "บัตรประจำตัวผู้เข้าศึกษา",
    extension: "PDF",
    icon: "badge",
  },
  {
    id: "student-certificate",
    name: "ใบรับรองการเป็นผู้เข้าศึกษา",
    extension: "PDF",
    icon: "school",
  },
  {
    id: "transcript",
    name: "ใบแจ้งผลการศึกษา (Transcript)",
    extension: "PDF",
    icon: "description",
  },
  {
    id: "registration-receipt",
    name: "ใบเสร็จรับเงินค่าลงทะเบียน",
    extension: "PDF",
    icon: "receipt",
  },
  {
    id: "board-qualification",
    name: "วุฒิบัตร / หนังสืออนุมัติ",
    extension: "PDF",
    icon: "workspace_premium",
  },
  {
    id: "professional-certificate",
    name: "ประกาศนียบัตร",
    extension: "PDF",
    icon: "verified",
  },
];
