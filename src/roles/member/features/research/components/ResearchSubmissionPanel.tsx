"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useMockDb } from "@/providers/mock-db-provider";
import { researchSubmissionStatusMeta } from "@/roles/shared/features/research/types";
import type { ResearchSubmission } from "@/roles/shared/features/research/types";

export function ResearchSubmissionPanel({
  onCreate,
  onEdit,
}: {
  onCreate: () => void;
  onEdit: (submission: ResearchSubmission) => void;
}) {
  const { researchSubmissions } = useMockDb();
  const [showAll, setShowAll] = useState(false);
  const visibleSubmissions = showAll
    ? researchSubmissions
    : researchSubmissions.slice(0, 3);

  return (
    <section className="mx-2 mb-6 rounded-xl border border-border bg-card p-4 shadow-sm md:mx-4 md:p-5" aria-labelledby="my-research-heading">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 id="my-research-heading" className="text-base font-semibold text-foreground">ผลงานที่ฉันส่ง</h2>
          <p className="mt-1 text-xs text-muted-foreground">ติดตามผลการตรวจสอบก่อนเผยแพร่ในฐานข้อมูลงานวิจัย</p>
        </div>
        <Button size="sm" className="shrink-0 gap-1.5" onClick={onCreate}>
          <span className="material-symbols-outlined text-lg">add</span>
          เพิ่มผลงาน
        </Button>
      </div>

      {researchSubmissions.length === 0 ? (
        <div className="mt-4 rounded-lg border border-dashed border-border bg-muted/20 px-4 py-6 text-center">
          <span className="material-symbols-outlined text-3xl text-muted-foreground">science</span>
          <p className="mt-2 text-sm font-medium">ยังไม่มีผลงานที่นำส่ง</p>
          <p className="mt-1 text-xs text-muted-foreground">เพิ่มผลงานเพื่อให้เจ้าหน้าที่ตรวจสอบและเผยแพร่</p>
        </div>
      ) : (
        <div className="mt-4 space-y-2">
          {visibleSubmissions.map((submission) => {
            const status = researchSubmissionStatusMeta[submission.status];
            return (
              <article key={submission.id} className="rounded-lg border border-border px-4 py-3">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground">{submission.id} | ส่งเมื่อ {submission.submittedAt}</p>
                    <h3 className="mt-1 text-sm font-medium text-foreground">{submission.title}</h3>
                    <p className="mt-1 text-xs text-muted-foreground">{submission.type} | {submission.field}</p>
                  </div>
                  <Badge variant={status.variant} className="w-fit shrink-0">{status.label}</Badge>
                </div>
                {submission.reviewerNote && (
                  <p className="mt-2 rounded-md bg-muted px-3 py-2 text-xs text-muted-foreground">
                    หมายเหตุจากเจ้าหน้าที่: {submission.reviewerNote}
                  </p>
                )}
                {submission.status === "rejected" && (
                  <Button variant="outline" size="sm" className="mt-3 h-8 text-xs" onClick={() => onEdit(submission)}>
                    <span className="material-symbols-outlined text-base">edit</span>
                    แก้ไขและส่งใหม่
                  </Button>
                )}
              </article>
            );
          })}
          {researchSubmissions.length > 3 && (
            <div className="flex justify-center pt-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                aria-expanded={showAll}
                onClick={() => setShowAll((current) => !current)}
                className="gap-1.5 text-xs text-muted-foreground"
              >
                {showAll ? "แสดงน้อยลง" : `ดูผลงานทั้งหมด (${researchSubmissions.length})`}
                <span className="material-symbols-outlined text-base">
                  {showAll ? "expand_less" : "expand_more"}
                </span>
              </Button>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
