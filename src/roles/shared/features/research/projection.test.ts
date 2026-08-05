import { describe, expect, it } from "vitest";
import { approvedResearchArticles } from "@/roles/shared/features/research/projection";
import type { ResearchSubmission } from "@/roles/shared/features/research/types";

const baseSubmission: ResearchSubmission = {
  id: "RES-001",
  title: "ตัวอย่างผลงานวิจัย",
  authors: "สมชาย ใจดี",
  type: "บทความวิจัย",
  field: "เภสัชกรรมคลินิก",
  journal: "วารสารตัวอย่าง",
  publisher: "ราชวิทยาลัยเภสัชกรรมแห่งประเทศไทย",
  year: 2569,
  language: "ไทย",
  doi: "",
  abstract: "บทคัดย่อสำหรับการทดสอบ",
  consentToPublish: true,
  submittedAt: "5 ส.ค. 2569",
  status: "pending",
};

describe("approved research projection", () => {
  it("exposes only approved member submissions", () => {
    const articles = approvedResearchArticles([
      baseSubmission,
      { ...baseSubmission, id: "RES-002", status: "approved" },
      { ...baseSubmission, id: "RES-003", status: "rejected" },
    ]);

    expect(articles.map((article) => article.id)).toEqual(["RES-002"]);
  });
});
