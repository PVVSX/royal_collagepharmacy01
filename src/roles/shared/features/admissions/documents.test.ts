import { describe, expect, it } from "vitest";
import {
  createAdmissionDocuments,
  getAdmissionDocumentProgress,
} from "@/roles/shared/features/admissions/documents";

describe("admission document progress", () => {
  it("keeps every admission attachment optional", () => {
    const documents = createAdmissionDocuments();

    expect(getAdmissionDocumentProgress(documents)).toEqual({
      attached: 0,
      total: 9,
      required: 0,
      complete: true,
    });
    expect(documents.every((document) => (
      !document.required && document.reviewStatus === "not_applicable"
    ))).toBe(true);
  });

  it("tracks optional attachments without making them a submission requirement", () => {
    const documents = createAdmissionDocuments().map((document, index) => index < 2
      ? {
          ...document,
          file: {
            name: `${document.id}.pdf`,
            type: "application/pdf",
            size: 1000,
            lastModified: 1,
          },
          reviewStatus: index === 1 ? "missing" as const : "pending" as const,
        }
      : document);

    expect(getAdmissionDocumentProgress(documents)).toEqual({
      attached: 1,
      total: 9,
      required: 0,
      complete: true,
    });
  });

  it("still supports required-document validation if requirements return later", () => {
    const documents = createAdmissionDocuments();
    documents[0] = { ...documents[0], required: true, reviewStatus: "pending" };

    expect(getAdmissionDocumentProgress(documents)).toEqual({
      attached: 0,
      total: 9,
      required: 1,
      complete: false,
    });
  });
});
