import type { TrainingStatus } from "@/roles/shared/features/student-records";
import type { ContinuingEducationStatus } from "@/roles/shared/member/domain/passport";

export interface AdminStudentDirectoryRecord {
  id: string;
  title: string;
  firstName: string;
  lastName: string;
  firstNameEn: string;
  lastNameEn: string;
  licenseNumber: string;
  program: string;
  collegeShort: string;
  year: string;
  trainingStatus: TrainingStatus;
  continuingEducationStatus: ContinuingEducationStatus;
  cpdCredits: number;
  cpdTarget: number;
  email: string;
  phone: string;
}

export const adminStudentDirectory = [
  { id: "RPC-2569-001", title: "ภญ.", firstName: "คาริน่า", lastName: "ยู", firstNameEn: "Karina", lastNameEn: "Yu", licenseNumber: "ภ.34567", program: "เภสัชบำบัด", collegeShort: "วภท.", year: "2569", trainingStatus: "normal", continuingEducationStatus: "active", cpdCredits: 30, cpdTarget: 100, email: "karina@example.com", phone: "081-234-5678" },
  { id: "RPC-2569-002", title: "ภก.", firstName: "สมชาย", lastName: "ใจดี", firstNameEn: "Somchai", lastNameEn: "Jaidee", licenseNumber: "ภ.12345", program: "เภสัชบำบัด", collegeShort: "วภท.", year: "2569", trainingStatus: "normal", continuingEducationStatus: "warning", cpdCredits: 18, cpdTarget: 100, email: "somchai@example.com", phone: "081-234-5678" },
  { id: "RPC-2568-124", title: "ภญ.", firstName: "สมหญิง", lastName: "รักชาติ", firstNameEn: "Somying", lastNameEn: "Rakchart", licenseNumber: "ภ.23456", program: "เภสัชกรรมชุมชน", collegeShort: "วภช.", year: "2568", trainingStatus: "maintaining", continuingEducationStatus: "warning", cpdCredits: 44, cpdTarget: 100, email: "somying@example.com", phone: "082-345-6789" },
  { id: "RPC-2567-089", title: "ภก.", firstName: "มานะ", lastName: "อดทน", firstNameEn: "Mana", lastNameEn: "Adthon", licenseNumber: "ภ.34567", program: "การคุ้มครองผู้บริโภค", collegeShort: "วคบท.", year: "2567", trainingStatus: "completed", continuingEducationStatus: "completed", cpdCredits: 100, cpdTarget: 100, email: "mana@example.com", phone: "083-456-7890" },
  { id: "RPC-2568-201", title: "ภญ.", firstName: "กานดา", lastName: "ศรีสุข", firstNameEn: "Kanda", lastNameEn: "Srisuk", licenseNumber: "ภ.45678", program: "เภสัชอุตสาหการ", collegeShort: "วภอ.", year: "2568", trainingStatus: "resigned", continuingEducationStatus: "non_compliant", cpdCredits: 20, cpdTarget: 100, email: "kanda@example.com", phone: "084-567-8901" },
] as const satisfies readonly AdminStudentDirectoryRecord[];

export function findAdminStudent(studentId: string) {
  return adminStudentDirectory.find((student) => student.id === studentId) ?? null;
}

export function getAdminStudentName(student: AdminStudentDirectoryRecord) {
  return `${student.title} ${student.firstName} ${student.lastName}`;
}
