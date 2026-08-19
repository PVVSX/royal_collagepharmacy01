export type CertificateStatus = "review" | "ready_for_council" | "submitted_to_council" | "scheduled_for_council" | "council_rejected" | "issuance_pending" | "issued" | "issuance_failed";

export interface CertificateHistoryEntry {
  id: string;
  action: string;
  from: CertificateStatus;
  to: CertificateStatus;
  occurredAt: string;
  actorName: string;
  evidenceReference?: string;
}

export interface CouncilDecision {
  meetingId: string;
  meetingDate: string;
  agendaItem: string;
  resolutionNumber: string;
  decision: "approved" | "rejected";
  decidedAt: string;
  evidenceReference: string;
  recordedBy: string;
}

export interface CertificateCase {
  id: string;
  studentId: string;
  studentName: string;
  program: string;
  credentialType: "board_certificate" | "approval_certificate" | "diploma";
  sourceRequestId: string;
  sourceResultId?: string;
  status: CertificateStatus;
  meeting?: Pick<CouncilDecision, "meetingId" | "meetingDate" | "agendaItem" | "evidenceReference">;
  decision?: CouncilDecision;
  document?: { id: string; token: string; fingerprint: string; issuedAt: string };
  history: CertificateHistoryEntry[];
}

function move(record: CertificateCase, to: CertificateStatus, actorName: string, action: string, evidenceReference?: string, occurredAt = new Date().toISOString()): CertificateCase {
  return { ...record, status: to, history: [...record.history, { id: `${record.id}-${record.history.length + 1}`, action, from: record.status, to, occurredAt, actorName, evidenceReference }] };
}

export function markReadyForCouncil(record: CertificateCase, actorName: string) {
  if (record.status !== "review") throw new Error("รายการต้องผ่านการตรวจข้อมูลก่อน");
  return move(record, "ready_for_council", actorName, "review_completed");
}

export function submitToCouncil(record: CertificateCase, actorName: string, evidenceReference: string) {
  if (record.status !== "ready_for_council") throw new Error("รายการยังไม่พร้อมเสนอเข้าสภา");
  if (!evidenceReference.trim()) throw new Error("กรุณาระบุหลักฐานการเสนอเรื่อง");
  return move(record, "submitted_to_council", actorName, "submitted_to_council", evidenceReference);
}

export function scheduleCouncilMeeting(record: CertificateCase, actorName: string, meeting: CertificateCase["meeting"]) {
  if (record.status !== "submitted_to_council") throw new Error("รายการยังไม่ได้เสนอเข้าสภา");
  if (!meeting?.meetingId.trim() || !meeting.meetingDate || !meeting.agendaItem.trim() || !meeting.evidenceReference.trim()) throw new Error("กรุณาระบุข้อมูลการประชุมให้ครบถ้วน");
  return { ...move(record, "scheduled_for_council", actorName, "scheduled_for_council", meeting.evidenceReference), meeting };
}

export function recordCouncilDecision(record: CertificateCase, decision: CouncilDecision) {
  if (record.status !== "scheduled_for_council") throw new Error("รายการยังไม่อยู่ในวาระประชุม");
  if (!decision.resolutionNumber.trim() || !decision.evidenceReference.trim()) throw new Error("กรุณาระบุเลขมติและหลักฐาน");
  if (decision.meetingId !== record.meeting?.meetingId) throw new Error("ข้อมูลครั้งประชุมไม่ตรงกับวาระ");
  const decided = { ...move(record, decision.decision === "approved" ? "issuance_pending" : "council_rejected", decision.recordedBy, decision.decision === "approved" ? "council_approved" : "council_rejected", decision.evidenceReference, decision.decidedAt), decision };
  return decision.decision === "approved" ? issueCertificate(decided, decision.decidedAt) : decided;
}

export function issueCertificate(record: CertificateCase, issuedAt = new Date().toISOString()) {
  if (record.status === "issued") return record;
  if (record.status !== "issuance_pending" || record.decision?.decision !== "approved") throw new Error("ออกวุฒิบัตรได้เฉพาะรายการที่สภาอนุมัติแล้ว");
  const token = `${record.id}-${record.decision.resolutionNumber}`.replace(/[^A-Za-z0-9ก-๙-]/g, "").toUpperCase();
  const document = { id: `DOC-${record.id}`, token, fingerprint: `SHA256:${token}:${record.studentId}`, issuedAt };
  return { ...move(record, "issued", "ระบบออกวุฒิบัตร", "certificate_issued", record.decision.evidenceReference, issuedAt), document };
}

export const defaultCertificateCases: CertificateCase[] = [
  { id: "CERT-2569-001", studentId: "วภท-2566-045", studentName: "ภก. วิทยา ตั้งใจ", program: "เภสัชบำบัด", credentialType: "board_certificate", sourceRequestId: "REQ-COMP-2569-001", sourceResultId: "RESULT-FINAL-045", status: "review", history: [] },
  { id: "CERT-2569-002", studentId: "วภช-2566-089", studentName: "ภญ. มาลี สุขใจ", program: "เภสัชกรรมชุมชน", credentialType: "approval_certificate", sourceRequestId: "REQ-COMP-2569-002", status: "ready_for_council", history: [] },
  { id: "CERT-2569-003", studentId: "CPAT-2566-032", studentName: "ภก. ธนา พัฒนกิจ", program: "การบริหารเภสัชกิจ", credentialType: "board_certificate", sourceRequestId: "REQ-COMP-2569-003", status: "submitted_to_council", history: [] },
];
