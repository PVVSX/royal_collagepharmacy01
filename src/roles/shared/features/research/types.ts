import type { FileMetadata } from "@/roles/shared/features/file-metadata";

export type ResearchSubmissionStatus = "pending" | "approved" | "rejected";

export interface ResearchSubmission {
  id: string;
  title: string;
  authors: string;
  type: string;
  field: string;
  journal: string;
  publisher: string;
  year: number;
  language: string;
  doi: string;
  abstract: string;
  articleFile?: FileMetadata;
  acceptanceFile?: FileMetadata;
  consentToPublish: boolean;
  submittedAt: string;
  status: ResearchSubmissionStatus;
  reviewerNote?: string;
}

export const researchSubmissionStatusMeta: Record<
  ResearchSubmissionStatus,
  { label: string; variant: "warning" | "success" | "danger" }
> = {
  pending: { label: "รอตรวจสอบ", variant: "warning" },
  approved: { label: "เผยแพร่แล้ว", variant: "success" },
  rejected: { label: "ควรแก้ไข", variant: "danger" },
};

export const defaultResearchSubmissions: ResearchSubmission[] = [
  {
    id: "RES-2569-001",
    title: "บทบาทของเภสัชกรในการติดตามความปลอดภัยด้านยาในผู้สูงอายุ",
    authors: "สมชาย ใจดี",
    type: "บทความวิจัย",
    field: "เภสัชกรรมคลินิก",
    journal: "วารสารเภสัชกรรมไทย",
    publisher: "วารสารเภสัชกรรมไทย",
    year: 2026,
    language: "ไทย",
    doi: "",
    abstract: "ศึกษารูปแบบการติดตามและลดปัญหาจากการใช้ยาในผู้สูงอายุโดยเภสัชกรประจำคลินิก",
    articleFile: {
      name: "medication-safety-older-adults.pdf",
      type: "application/pdf",
      size: 1480000,
      lastModified: 1783209600000,
    },
    consentToPublish: true,
    submittedAt: "5 ส.ค. 2569",
    status: "pending",
  },
];
