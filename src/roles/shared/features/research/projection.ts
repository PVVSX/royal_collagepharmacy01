import type { ResearchArticle } from "@/roles/member/features/research/data/research";
import type { ResearchSubmission } from "@/roles/shared/features/research/types";

export function approvedResearchArticles(
  submissions: ResearchSubmission[],
): ResearchArticle[] {
  return submissions
    .filter((submission) => submission.status === "approved")
    .map((submission) => ({
      id: submission.id,
      title: submission.title,
      authors: submission.authors,
      journal: submission.journal || "ผลงานที่สมาชิกนำส่ง",
      abstract: submission.abstract,
      type: submission.type,
      field: submission.field,
      year: submission.year,
      language: submission.language,
      publisher: submission.publisher || "ราชวิทยาลัยเภสัชกรรมแห่งประเทศไทย",
      doi: submission.doi,
      relevanceScore: 95,
      pdfUrl: submission.articleFile?.name,
    }));
}
