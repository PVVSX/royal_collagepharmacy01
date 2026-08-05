import type { FileMetadata } from "@/roles/shared/features/file-metadata";

export type AdmissionDocumentReviewStatus =
  | "pending"
  | "accepted"
  | "missing"
  | "not_applicable";

export type AdmissionDocumentStatus = "pending" | "complete" | "incomplete";

export interface AdmissionDocumentRequirement {
  id: string;
  label: string;
  required: boolean;
  hint?: string;
}

export interface AdmissionDocument extends AdmissionDocumentRequirement {
  file?: FileMetadata;
  reviewStatus: AdmissionDocumentReviewStatus;
  reviewerNote?: string;
}

export const admissionDocumentRequirements: AdmissionDocumentRequirement[] = [
  { id: "application-photo", label: "ใบสมัครติดรูปถ่ายขนาด 1 นิ้ว จำนวน 1 ชุด", required: false },
  { id: "degree", label: "สำเนาใบปริญญาบัตร หรือหนังสือรับรองการศึกษา", required: false },
  { id: "license", label: "สำเนาใบประกอบวิชาชีพเภสัชกรรม", required: false },
  { id: "transcript", label: "ใบประมวลผลการศึกษา (Transcript) ทุกระดับ", required: false },
  { id: "name-change", label: "สำเนาใบทะเบียนสมรส หรือใบเปลี่ยนชื่อ-สกุล", required: false, hint: "แนบเฉพาะกรณีชื่อหรือนามสกุลในเอกสารไม่ตรงกัน" },
  { id: "recommendation", label: "หนังสือรับรองการศึกษาและคุณสมบัติ (Recommendation)", required: false, hint: "จำนวน 1-3 ท่านตามข้อกำหนดของหลักสูตร" },
  { id: "cv", label: "ประวัติส่วนบุคคล (Curriculum Vitae)", required: false },
  { id: "permission", label: "หนังสืออนุญาตจากต้นสังกัด", required: false },
  {
    id: "payment-proof",
    label: "หลักฐานการจ่ายค่าสมัคร",
    required: false,
    hint: "ดำเนินการและแนบหลักฐานผ่านขั้นตอนชำระเงินหลังคำร้องได้รับอนุมัติ",
  },
];

export function createAdmissionDocuments(): AdmissionDocument[] {
  return admissionDocumentRequirements.map((requirement) => ({
    ...requirement,
    reviewStatus: requirement.required ? "pending" : "not_applicable",
  }));
}

export function getAdmissionDocumentProgress(documents: AdmissionDocument[]) {
  const requiredDocuments = documents.filter((document) => document.required);
  const attached = documents.filter((document) => (
    Boolean(document.file) && document.reviewStatus !== "missing"
  )).length;
  const attachedRequired = requiredDocuments.filter((document) => (
    Boolean(document.file) && document.reviewStatus !== "missing"
  )).length;
  return {
    attached,
    total: documents.length,
    required: requiredDocuments.length,
    complete: attachedRequired === requiredDocuments.length,
  };
}
