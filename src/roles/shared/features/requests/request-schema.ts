import type { FileMetadata } from "@/roles/shared/features/file-metadata";

export type RequestCategoryId =
  | "exam"
  | "certificate"
  | "training"
  | "completion";

export type RequestStatus =
  | "pending"
  | "needs_information"
  | "approved"
  | "rejected";

export type RequestFieldType =
  | "text"
  | "textarea"
  | "select"
  | "date"
  | "number";

export interface RequestFieldDefinition {
  id: string;
  label: string;
  type: RequestFieldType;
  required?: boolean;
  placeholder?: string;
  helpText?: string;
  options?: readonly string[];
  min?: number;
}

export interface RequestAttachmentDefinition {
  label: string;
  helpText: string;
  acceptedTypes: readonly string[];
  maxBytes: number;
}

export interface RequestCategoryDefinition {
  id: RequestCategoryId;
  code: string;
  name: string;
  description: string;
  icon: string;
  fields: readonly RequestFieldDefinition[];
  attachment?: RequestAttachmentDefinition;
}

export interface RequestFieldEntry {
  id: string;
  label: string;
  value: string;
}

export interface RequesterSummary {
  memberId: string;
  name: string;
  email: string;
}

export interface MockRequest {
  id: string;
  categoryId: RequestCategoryId | "legacy";
  typeLabel: string;
  title: string;
  displayDate: string;
  createdAt: string;
  updatedAt: string;
  status: RequestStatus;
  requester: RequesterSummary;
  fields: RequestFieldEntry[];
  attachment?: FileMetadata;
  progress: string[];
  reviewerNote?: string;
  reviewedAt?: string;
  reviewedBy?: string;
}

const FIVE_MEGABYTES = 5 * 1024 * 1024;
const DOCUMENT_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
] as const;

export const REQUEST_CATALOG: readonly RequestCategoryDefinition[] = [
  {
    id: "exam",
    code: "สอบ",
    name: "ขอสอบ",
    description: "สมัครสอบ ขอสอบแก้ตัว หรือขอประเมินความรู้ตามหลักสูตร",
    icon: "quiz",
    fields: [
      {
        id: "examType",
        label: "ประเภทการสอบ",
        type: "select",
        required: true,
        options: [
          "สอบประเมินความรู้ขั้นสุดท้าย (Board Exam)",
          "สอบปากเปล่าข้างเตียงผู้ป่วย",
          "สอบแก้ตัว",
          "สอบโครงร่างวิทยานิพนธ์",
        ],
      },
      {
        id: "program",
        label: "หลักสูตร / สาขา",
        type: "text",
        required: true,
        placeholder: "เช่น สาขาเภสัชบำบัด",
      },
      {
        id: "examRound",
        label: "รอบสอบที่ต้องการ",
        type: "text",
        required: true,
        placeholder: "เช่น รอบเดือนกรกฎาคม 2569",
      },
      {
        id: "examNote",
        label: "รายละเอียดเพิ่มเติม",
        type: "textarea",
        placeholder: "ระบุรายละเอียดที่เจ้าหน้าที่ควรทราบ (ถ้ามี)",
      },
    ],
    attachment: {
      label: "Logbook หรือหลักฐานประกอบ (ถ้ามี)",
      helpText: "รองรับ PDF, JPG หรือ PNG ขนาดไม่เกิน 5 MB",
      acceptedTypes: DOCUMENT_TYPES,
      maxBytes: FIVE_MEGABYTES,
    },
  },
  {
    id: "certificate",
    code: "รับรอง",
    name: "ขอหนังสือรับรอง",
    description: "ขอหนังสือรับรองสถานภาพ การฝึกอบรม หรือเอกสารภาษาอังกฤษ",
    icon: "verified",
    fields: [
      {
        id: "certificateType",
        label: "ประเภทหนังสือรับรอง",
        type: "select",
        required: true,
        options: [
          "หนังสือรับรองการเป็นผู้เข้าฝึกอบรม",
          "หนังสือรับรองผลการฝึกอบรม",
          "หนังสือรับรองเพื่อประกอบการสมัครงาน",
          "หนังสือรับรองอื่น ๆ",
        ],
      },
      {
        id: "language",
        label: "ภาษาเอกสาร",
        type: "select",
        required: true,
        options: ["ภาษาไทย", "ภาษาอังกฤษ", "ภาษาไทยและภาษาอังกฤษ"],
      },
      {
        id: "copies",
        label: "จำนวนฉบับ",
        type: "number",
        required: true,
        min: 1,
        placeholder: "1",
      },
      {
        id: "purpose",
        label: "วัตถุประสงค์ในการนำไปใช้",
        type: "textarea",
        required: true,
        placeholder: "ระบุหน่วยงานหรือวัตถุประสงค์ของเอกสาร",
      },
    ],
    attachment: {
      label: "เอกสารอ้างอิงชื่อหน่วยงาน (ถ้ามี)",
      helpText: "รองรับ PDF, JPG หรือ PNG ขนาดไม่เกิน 5 MB",
      acceptedTypes: DOCUMENT_TYPES,
      maxBytes: FIVE_MEGABYTES,
    },
  },
  {
    id: "training",
    code: "ฝึก",
    name: "คำร้องเกี่ยวกับการฝึกอบรม",
    description: "ลาพัก รักษาสถานภาพ เปลี่ยนสถานที่ หรือขยายเวลาฝึกอบรม",
    icon: "school",
    fields: [
      {
        id: "trainingRequestType",
        label: "เรื่องที่ต้องการยื่นคำร้อง",
        type: "select",
        required: true,
        options: [
          "ขอลาพักการฝึกอบรม",
          "ขอรักษาสถานภาพ",
          "ขอเปลี่ยนสถานที่ฝึกอบรม",
          "ขอขยายระยะเวลาฝึกอบรม",
          "คำร้องเกี่ยวกับการฝึกอบรมอื่น ๆ",
        ],
      },
      {
        id: "program",
        label: "หลักสูตรปัจจุบัน",
        type: "text",
        required: true,
        placeholder: "ระบุหลักสูตรและสาขา",
      },
      {
        id: "effectiveDate",
        label: "วันที่ต้องการให้มีผล",
        type: "date",
        required: true,
      },
      {
        id: "trainingReason",
        label: "เหตุผลและรายละเอียด",
        type: "textarea",
        required: true,
        placeholder: "อธิบายเหตุผลและช่วงเวลาที่เกี่ยวข้อง",
      },
    ],
    attachment: {
      label: "หลักฐานประกอบคำร้อง (ถ้ามี)",
      helpText: "รองรับ PDF, JPG หรือ PNG ขนาดไม่เกิน 5 MB",
      acceptedTypes: DOCUMENT_TYPES,
      maxBytes: FIVE_MEGABYTES,
    },
  },
  {
    id: "completion",
    code: "จบ",
    name: "ขอสำเร็จการฝึกอบรม",
    description: "ยื่นตรวจสอบคุณสมบัติและขออนุมัติสำเร็จการฝึกอบรม",
    icon: "workspace_premium",
    fields: [
      {
        id: "program",
        label: "หลักสูตร / สาขาที่ขอสำเร็จ",
        type: "text",
        required: true,
        placeholder: "ระบุชื่อหลักสูตรเต็ม",
      },
      {
        id: "completionDate",
        label: "วันที่สำเร็จการฝึกอบรมตามแผน",
        type: "date",
        required: true,
      },
      {
        id: "completedCredits",
        label: "หน่วยกิตที่สะสมแล้ว",
        type: "number",
        required: true,
        min: 1,
        placeholder: "เช่น 36",
      },
      {
        id: "researchStatus",
        label: "สถานะผลงานวิจัย / วิทยานิพนธ์",
        type: "select",
        required: true,
        options: [
          "ผ่านการอนุมัติแล้ว",
          "ส่งฉบับสมบูรณ์แล้ว รออนุมัติ",
          "หลักสูตรนี้ไม่มีเงื่อนไขผลงานวิจัย",
        ],
      },
      {
        id: "completionNote",
        label: "หมายเหตุ",
        type: "textarea",
        placeholder: "แจ้งข้อมูลเพิ่มเติมแก่เจ้าหน้าที่ (ถ้ามี)",
      },
    ],
    attachment: {
      label: "หลักฐานสำเร็จตามเกณฑ์ (ถ้ามี)",
      helpText: "รองรับ PDF, JPG หรือ PNG ขนาดไม่เกิน 5 MB",
      acceptedTypes: DOCUMENT_TYPES,
      maxBytes: FIVE_MEGABYTES,
    },
  },
] as const;

export const REQUEST_STATUS_META: Record<
  RequestStatus,
  {
    label: string;
    variant: "warning" | "info" | "success" | "danger";
    borderClass: string;
  }
> = {
  pending: {
    label: "รอตรวจสอบ",
    variant: "warning",
    borderClass: "border-l-warning",
  },
  needs_information: {
    label: "ขอข้อมูลเพิ่มเติม",
    variant: "info",
    borderClass: "border-l-info",
  },
  approved: {
    label: "อนุมัติแล้ว",
    variant: "success",
    borderClass: "border-l-success",
  },
  rejected: {
    label: "ไม่อนุมัติ",
    variant: "danger",
    borderClass: "border-l-danger",
  },
};

const CURRENT_MEMBER: RequesterSummary = {
  memberId: "วภท-2568-001",
  name: "ภก. สมชาย ใจดี",
  email: "somchai.j@example.com",
};

export const HISTORICAL_REQUESTS: readonly MockRequest[] = [
  {
    id: "จ.1-2569-001",
    categoryId: "legacy",
    typeLabel: "คำร้องทั่วไป",
    title: "ขอเปลี่ยนแปลงข้อมูลส่วนตัว",
    displayDate: "15 ม.ค. 2569",
    createdAt: "2026-01-15T02:30:00.000Z",
    updatedAt: "2026-01-17T04:00:00.000Z",
    status: "approved",
    requester: CURRENT_MEMBER,
    fields: [
      {
        id: "detail",
        label: "รายละเอียด",
        value: "ขอแก้ไขข้อมูลที่อยู่ในระบบให้ตรงกับบัตรประชาชนปัจจุบัน",
      },
    ],
    progress: ["เจ้าหน้าที่ ✓", "หัวหน้าสาขา ✓", "เสร็จสิ้น ✓"],
    reviewerNote: "ตรวจสอบเอกสารแล้ว อนุมัติการแก้ไขข้อมูล",
    reviewedAt: "2026-01-17T04:00:00.000Z",
    reviewedBy: "เจ้าหน้าที่ทะเบียน",
  },
  {
    id: "ง.1-2569-002",
    categoryId: "legacy",
    typeLabel: "การเงิน",
    title: "ขอผ่อนผันชำระค่าลงทะเบียน",
    displayDate: "20 ม.ค. 2569",
    createdAt: "2026-01-20T03:15:00.000Z",
    updatedAt: "2026-01-20T03:15:00.000Z",
    status: "pending",
    requester: CURRENT_MEMBER,
    fields: [
      {
        id: "detail",
        label: "รายละเอียด",
        value: "ขอผ่อนผันการชำระค่าลงทะเบียน โดยจะชำระภายในวันที่ 15 ของเดือนถัดไป",
      },
    ],
    progress: ["เจ้าหน้าที่ ✓", "ผู้อำนวยการวิทยาลัย ◷", "เสร็จสิ้น"],
  },
  {
    id: "อ.1-2569-003",
    categoryId: "legacy",
    typeLabel: "เอกสารสำคัญ",
    title: "ขอหนังสือรับรองการเป็นผู้เข้าศึกษา",
    displayDate: "25 ม.ค. 2569",
    createdAt: "2026-01-25T06:45:00.000Z",
    updatedAt: "2026-01-25T06:45:00.000Z",
    status: "pending",
    requester: CURRENT_MEMBER,
    fields: [
      {
        id: "detail",
        label: "รายละเอียด",
        value: "ขอหนังสือรับรองภาษาอังกฤษจำนวน 2 ฉบับ เพื่อประกอบการขอวีซ่า",
      },
    ],
    progress: ["เจ้าหน้าที่ ◷", "หัวหน้าสาขา", "เสร็จสิ้น"],
  },
  {
    id: "จ.1-2569-004",
    categoryId: "legacy",
    typeLabel: "คำร้องทั่วไป",
    title: "ขอเปลี่ยนสาขาวิชา",
    displayDate: "10 ธ.ค. 2568",
    createdAt: "2025-12-10T02:00:00.000Z",
    updatedAt: "2025-12-12T07:20:00.000Z",
    status: "rejected",
    requester: CURRENT_MEMBER,
    fields: [
      {
        id: "detail",
        label: "รายละเอียด",
        value: "ขอเปลี่ยนจากสาขาเภสัชบำบัดเป็นสาขาเภสัชกรรมชุมชน",
      },
    ],
    progress: ["เจ้าหน้าที่ ✓", "หัวหน้าสาขา ✗", "เสร็จสิ้น"],
    reviewerNote: "พ้นกำหนดเปลี่ยนแปลงสาขาสำหรับปีการศึกษาปัจจุบัน",
    reviewedAt: "2025-12-12T07:20:00.000Z",
    reviewedBy: "หัวหน้าสาขา",
  },
] as const;

export function getRequestCategory(categoryId: RequestCategoryId) {
  return REQUEST_CATALOG.find((category) => category.id === categoryId);
}

export function formatThaiRequestDate(date: Date) {
  return date.toLocaleDateString("th-TH", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function makeRequestId(category: RequestCategoryDefinition, now: Date) {
  return `${category.code}-${now.getFullYear() + 543}-${now.getTime().toString().slice(-6)}`;
}

export function progressForStatus(status: RequestStatus): string[] {
  if (status === "approved") {
    return ["ยื่นคำร้องแล้ว ✓", "เจ้าหน้าที่ตรวจสอบ ✓", "อนุมัติแล้ว ✓"];
  }
  if (status === "rejected") {
    return ["ยื่นคำร้องแล้ว ✓", "เจ้าหน้าที่ตรวจสอบ ✗", "ไม่อนุมัติ"];
  }
  if (status === "needs_information") {
    return ["ยื่นคำร้องแล้ว ✓", "ขอข้อมูลเพิ่มเติม ◷", "รอสมาชิกดำเนินการ"];
  }
  return ["ยื่นคำร้องแล้ว ✓", "เจ้าหน้าที่ตรวจสอบ ◷", "เสร็จสิ้น"];
}
