import { describe, expect, it } from "vitest";

import {
  REQUEST_CATALOG,
  canTransitionRequest,
  makeMockDocumentFingerprint,
  type MockRequest,
} from "./request-schema";
import { normalizeStoredRequest } from "./request-store";

const baseRequest: MockRequest = {
  id: "ฝง-2569-TEST",
  categoryId: "internship_letter",
  typeLabel: "ขอหนังสือขอฝึกงาน",
  title: "ขอหนังสือขอฝึกงาน: โรงพยาบาลตัวอย่าง",
  displayDate: "11 ส.ค. 2569",
  createdAt: "2026-08-11T03:00:00.000Z",
  updatedAt: "2026-08-11T03:00:00.000Z",
  status: "awaiting_president_signature",
  collegeCode: "วภท.",
  requester: {
    memberId: "วภท-2568-001",
    name: "ภก. สมชาย ใจดี",
    email: "somchai@example.com",
  },
  fields: [{ id: "organizationName", label: "ชื่อหน่วยงาน", value: "โรงพยาบาลตัวอย่าง" }],
  applicantNote: "โปรดออกหนังสือภายในเดือนนี้",
  courses: [{ code: "วภท-301", title: "เภสัชบำบัด", credits: 12, term: "1/2569" }],
  documents: [],
  comments: [],
  events: [],
  progress: [],
};

const handwrittenSignature = {
  version: 1 as const,
  strokes: [[{ x: 0.1, y: 0.8 }, { x: 0.5, y: 0.2, pressure: 0.7 }]],
};

const signatureMetadata = {
  kind: "mock_e_sign" as const,
  signerAssignmentId: "term-vpt-2569",
  signerUserId: "president-vpt-current",
  signerName: "ภญ. ศิริพร วัฒนกุล",
  signerRoleLabel: "ประธานวิทยาลัยเภสัชกรรมบำบัด",
  collegeCode: "วภท.",
  signedAt: "2026-08-11T04:00:00.000Z",
  documentFingerprint: "DOC-12345678",
  stampLabel: "ลงนามอิเล็กทรอนิกส์โดยประธานวิทยาลัย",
  consentText: "ยืนยันการลงนาม",
};

describe("request workflow", () => {
  it("defines an internship-letter category with multiple documents", () => {
    const category = REQUEST_CATALOG.find((item) => item.id === "internship_letter");
    expect(category?.fields.some((field) => field.id === "organizationName")).toBe(true);
    expect(category?.documents).toHaveLength(2);
  });

  it("allows only the assigned role transitions", () => {
    expect(canTransitionRequest("staff_review", "awaiting_president_signature", "staff")).toBe(true);
    expect(canTransitionRequest("awaiting_president_signature", "signed", "president")).toBe(true);
    expect(canTransitionRequest("awaiting_president_signature", "signed", "staff")).toBe(false);
    expect(canTransitionRequest("signed", "staff_review", "member")).toBe(false);
  });

  it("creates a deterministic mock document identifier", () => {
    const signedAt = "2026-08-11T04:00:00.000Z";
    expect(makeMockDocumentFingerprint(baseRequest, signedAt)).toBe(
      makeMockDocumentFingerprint(baseRequest, signedAt),
    );
    expect(makeMockDocumentFingerprint(baseRequest, signedAt)).toMatch(/^DOC-[0-9A-F]{8}$/);
    expect(makeMockDocumentFingerprint(
      { ...baseRequest, applicantNote: "changed" },
      signedAt,
    )).not.toBe(makeMockDocumentFingerprint(baseRequest, signedAt));
    expect(makeMockDocumentFingerprint(baseRequest, signedAt, handwrittenSignature)).not.toBe(
      makeMockDocumentFingerprint(baseRequest, signedAt, {
        ...handwrittenSignature,
        strokes: [[{ x: 0.1, y: 0.8 }, { x: 0.7, y: 0.3 }]],
      }),
    );
  });
});

describe("request-store migration", () => {
  it("migrates v1 status, attachment, and reviewer note", () => {
    const migrated = normalizeStoredRequest({
      id: "old-1",
      categoryId: "training",
      typeLabel: "คำร้องเกี่ยวกับการฝึกอบรม",
      title: "คำร้องเดิม",
      displayDate: "1 ม.ค. 2569",
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-02T00:00:00.000Z",
      status: "pending",
      requester: { memberId: "M1", name: "สมาชิก", email: "m@example.com" },
      fields: [],
      attachment: {
        name: "legacy.pdf",
        type: "application/pdf",
        size: 100,
        lastModified: 1,
      },
      progress: [],
      reviewerNote: "กรุณาแนบข้อมูลเพิ่ม",
      reviewedBy: "เจ้าหน้าที่",
    });

    expect(migrated?.status).toBe("staff_review");
    expect(migrated?.collegeCode).toBe("วภท.");
    expect(migrated?.documents[0].file?.name).toBe("legacy.pdf");
    expect(migrated?.comments[0].message).toBe("กรุณาแนบข้อมูลเพิ่ม");
    expect(migrated?.events.map((event) => event.type)).toContain("migrated");
  });

  it("preserves a valid handwritten signature and supports legacy signature metadata", () => {
    const withDrawing = normalizeStoredRequest({
      ...baseRequest,
      status: "signed",
      mockSignature: { ...signatureMetadata, handwrittenSignature },
    });
    expect(withDrawing?.mockSignature?.handwrittenSignature).toEqual(handwrittenSignature);

    const legacy = normalizeStoredRequest({
      ...baseRequest,
      status: "signed",
      mockSignature: signatureMetadata,
    });
    expect(legacy?.mockSignature?.signerName).toBe(signatureMetadata.signerName);
    expect(legacy?.mockSignature?.handwrittenSignature).toBeUndefined();
  });

  it("drops malformed handwriting without losing valid legacy signing metadata", () => {
    const migrated = normalizeStoredRequest({
      ...baseRequest,
      status: "signed",
      mockSignature: {
        ...signatureMetadata,
        handwrittenSignature: {
          version: 1,
          strokes: [[{ x: -1, y: 0.5 }, { x: 0.5, y: Number.NaN }]],
        },
      },
    });
    expect(migrated?.mockSignature?.signerName).toBe(signatureMetadata.signerName);
    expect(migrated?.mockSignature?.handwrittenSignature).toBeUndefined();
  });
});
