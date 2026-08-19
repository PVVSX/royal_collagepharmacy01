import { describe, expect, it } from "vitest";
import { defaultCertificateCases, issueCertificate, markReadyForCouncil, recordCouncilDecision, scheduleCouncilMeeting, submitToCouncil } from "./certificate-workflow";

describe("certificate workflow", () => {
  it("issues exactly once after recorded council approval", () => {
    const ready = markReadyForCouncil(defaultCertificateCases[0], "เจ้าหน้าที่ทะเบียน");
    const submitted = submitToCouncil(ready, "เจ้าหน้าที่ทะเบียน", "MEMO-2569-101");
    const scheduled = scheduleCouncilMeeting(submitted, "เจ้าหน้าที่ทะเบียน", { meetingId: "MEET-8-2569", meetingDate: "2026-08-28", agendaItem: "4.2", evidenceReference: "AGENDA-4.2" });
    const issued = recordCouncilDecision(scheduled, { meetingId: "MEET-8-2569", meetingDate: "2026-08-28", agendaItem: "4.2", resolutionNumber: "8/2569-42", decision: "approved", decidedAt: "2026-08-28T15:00:00+07:00", evidenceReference: "MINUTES-8-2569", recordedBy: "เจ้าหน้าที่ทะเบียน" });
    expect(issued.status).toBe("issued");
    expect(issued.document?.id).toBe("DOC-CERT-2569-001");
    expect(issueCertificate(issued)).toBe(issued);
  });

  it("does not issue rejected cases", () => {
    const submitted = submitToCouncil(defaultCertificateCases[1], "เจ้าหน้าที่ทะเบียน", "MEMO-2569-102");
    const scheduled = scheduleCouncilMeeting(submitted, "เจ้าหน้าที่ทะเบียน", { meetingId: "MEET-8-2569", meetingDate: "2026-08-28", agendaItem: "4.3", evidenceReference: "AGENDA-4.3" });
    const rejected = recordCouncilDecision(scheduled, { meetingId: "MEET-8-2569", meetingDate: "2026-08-28", agendaItem: "4.3", resolutionNumber: "8/2569-43", decision: "rejected", decidedAt: "2026-08-28T15:10:00+07:00", evidenceReference: "MINUTES-8-2569", recordedBy: "เจ้าหน้าที่ทะเบียน" });
    expect(rejected.status).toBe("council_rejected");
    expect(() => issueCertificate(rejected)).toThrow();
  });
});
