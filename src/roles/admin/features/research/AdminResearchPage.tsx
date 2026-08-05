"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { useMockDb } from "@/providers/mock-db-provider";
import { PageShell } from "@/roles/shared/components/layout/PageShell";
import { formatFileSize } from "@/roles/shared/features/file-metadata";
import {
  researchSubmissionStatusMeta,
  type ResearchSubmission,
  type ResearchSubmissionStatus,
} from "@/roles/shared/features/research/types";

type StatusFilter = ResearchSubmissionStatus | "all";

export function AdminResearchPage() {
  const { researchSubmissions, updateResearchSubmissionStatus } = useMockDb();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("pending");
  const [selected, setSelected] = useState<ResearchSubmission | null>(null);
  const [reviewerNote, setReviewerNote] = useState("");
  const [noteError, setNoteError] = useState("");

  const filtered = useMemo(() => researchSubmissions.filter((submission) => {
    const query = search.trim().toLowerCase();
    const matchesQuery = !query || [submission.id, submission.title, submission.authors, submission.field]
      .some((value) => value.toLowerCase().includes(query));
    return matchesQuery && (statusFilter === "all" || submission.status === statusFilter);
  }), [researchSubmissions, search, statusFilter]);

  const openDetail = (submission: ResearchSubmission) => {
    setSelected(submission);
    setReviewerNote(submission.reviewerNote ?? "");
    setNoteError("");
  };

  const completeReview = (status: ResearchSubmissionStatus) => {
    if (!selected) return;
    if (status === "rejected" && !reviewerNote.trim()) {
      setNoteError("กรุณาระบุสิ่งที่สมาชิกต้องแก้ไข");
      return;
    }
    updateResearchSubmissionStatus(selected.id, status, reviewerNote.trim() || undefined);
    toast.success(status === "approved" ? "อนุมัติและเผยแพร่ผลงานแล้ว" : "ส่งผลงานกลับให้สมาชิกแก้ไขแล้ว");
    setSelected(null);
  };

  const filters: { id: StatusFilter; label: string }[] = [
    { id: "pending", label: "รอตรวจสอบ" },
    { id: "approved", label: "เผยแพร่แล้ว" },
    { id: "rejected", label: "ควรแก้ไข" },
    { id: "all", label: "ทั้งหมด" },
  ];

  return (
    <PageShell bottom="roomy">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-content">ตรวจสอบผลงานวิจัย</h1>
        <p className="mt-1 text-sm text-content-muted">ตรวจข้อมูล หลักฐาน และสิทธิ์เผยแพร่ก่อนนำผลงานเข้าสู่ฐานข้อมูล</p>
      </div>

      <Card className="card-shadow">
        <CardHeader className="border-b border-border pb-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div
              role="group"
              aria-label="กรองผลงานวิจัยตามสถานะ"
              className="flex max-w-full gap-1 overflow-x-auto rounded-lg bg-surface-sunken p-1"
            >
              {filters.map((filter) => {
                const count = filter.id === "all"
                  ? researchSubmissions.length
                  : researchSubmissions.filter((submission) => submission.status === filter.id).length;
                return (
                  <button
                    key={filter.id}
                    type="button"
                    aria-pressed={statusFilter === filter.id}
                    onClick={() => setStatusFilter(filter.id)}
                    className={`whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${statusFilter === filter.id ? "bg-surface-raised text-brand shadow-sm" : "text-content-muted hover:text-content"}`}
                  >
                    {filter.label} ({count})
                  </button>
                );
              })}
            </div>
            <div className="relative w-full lg:w-80">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-lg text-content-muted">search</span>
              <Input value={search} onChange={(event) => setSearch(event.target.value)} className="pl-9" placeholder="ค้นหาชื่อผลงาน ผู้แต่ง หรือรหัส" />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-surface-container-low">
                <TableRow>
                  <TableHead className="w-36">รหัส / วันที่ส่ง</TableHead>
                  <TableHead>ผลงาน</TableHead>
                  <TableHead>หลักฐาน</TableHead>
                  <TableHead>สถานะ</TableHead>
                  <TableHead className="text-right">ตรวจสอบ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((submission) => {
                  const status = researchSubmissionStatusMeta[submission.status];
                  const evidenceCount = Number(Boolean(submission.articleFile)) + Number(Boolean(submission.acceptanceFile));
                  return (
                    <TableRow key={submission.id}>
                      <TableCell>
                        <p className="font-mono text-xs font-medium text-content">{submission.id}</p>
                        <p className="mt-1 text-xs text-content-muted">{submission.submittedAt}</p>
                      </TableCell>
                      <TableCell className="min-w-72">
                        <p className="font-medium leading-snug text-content">{submission.title}</p>
                        <p className="mt-1 text-xs text-content-muted">{submission.authors} | {submission.field}</p>
                      </TableCell>
                      <TableCell className="text-content-muted">{evidenceCount} ไฟล์</TableCell>
                      <TableCell><Badge variant={status.variant}>{status.label}</Badge></TableCell>
                      <TableCell className="text-right">
                        <Button variant="outline" size="sm" onClick={() => openDetail(submission)}>ดูรายละเอียด</Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="h-40 text-center">
                      <span className="material-symbols-outlined text-4xl text-content-muted">science</span>
                      <p className="mt-2 text-sm font-medium text-content">ไม่พบผลงานในรายการนี้</p>
                      <p className="mt-1 text-xs text-content-muted">ลองเปลี่ยนสถานะหรือคำค้นหา</p>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={Boolean(selected)} onOpenChange={(open) => { if (!open) setSelected(null); }}>
        <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>ตรวจสอบผลงานวิจัย</DialogTitle>
            <DialogDescription>{selected?.id} | ส่งเมื่อ {selected?.submittedAt}</DialogDescription>
          </DialogHeader>

          {selected && (
            <div className="space-y-5">
              <div>
                <h2 className="text-lg font-semibold leading-snug text-content">{selected.title}</h2>
                <p className="mt-1 text-sm text-content-muted">{selected.authors}</p>
              </div>

              <dl className="grid gap-3 rounded-xl bg-muted/30 p-4 text-sm sm:grid-cols-2">
                <div><dt className="text-xs text-content-muted">ประเภท</dt><dd className="mt-1 font-medium">{selected.type}</dd></div>
                <div><dt className="text-xs text-content-muted">สาขา</dt><dd className="mt-1 font-medium">{selected.field}</dd></div>
                <div><dt className="text-xs text-content-muted">แหล่งเผยแพร่</dt><dd className="mt-1 font-medium">{selected.journal || "ยังไม่ระบุ"}</dd></div>
                <div><dt className="text-xs text-content-muted">ปีที่เผยแพร่</dt><dd className="mt-1 font-medium">{selected.year}</dd></div>
              </dl>

              <div>
                <h3 className="text-sm font-semibold">บทคัดย่อ</h3>
                <p className="mt-2 rounded-lg border border-border p-3 text-sm leading-relaxed text-content-muted">{selected.abstract}</p>
              </div>

              <div>
                <h3 className="text-sm font-semibold">หลักฐานประกอบ</h3>
                <div className="mt-2 space-y-2">
                  {[selected.articleFile, selected.acceptanceFile].filter(Boolean).map((file) => file && (
                    <button key={file.name} type="button" onClick={() => toast.info(`เปิดไฟล์: ${file.name}`)} className="flex w-full items-center gap-3 rounded-lg border border-border px-3 py-3 text-left hover:bg-muted/40">
                      <span className="material-symbols-outlined text-primary">description</span>
                      <span className="min-w-0 flex-1 truncate text-sm font-medium">{file.name}</span>
                      <span className="text-xs text-content-muted">{formatFileSize(file.size)}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className={`rounded-lg border px-3 py-3 text-sm ${selected.consentToPublish ? "border-success-border bg-success-soft text-success-on-soft" : "border-danger-border bg-danger-soft text-danger-on-soft"}`}>
                <span className="material-symbols-outlined mr-2 align-middle text-lg">{selected.consentToPublish ? "verified" : "warning"}</span>
                {selected.consentToPublish ? "สมาชิกยืนยันสิทธิ์และยินยอมให้เผยแพร่แล้ว" : "ยังไม่มีการยืนยันสิทธิ์เผยแพร่"}
              </div>

              {selected.status === "pending" ? (
                <div className="space-y-2">
                  <label htmlFor="research-review-note" className="text-sm font-medium">หมายเหตุถึงสมาชิก</label>
                  <Textarea id="research-review-note" rows={3} value={reviewerNote} onChange={(event) => { setReviewerNote(event.target.value); setNoteError(""); }} placeholder="ระบุเฉพาะเมื่อมีข้อมูลที่ควรแก้ไข" />
                  {noteError && <p role="alert" className="text-xs text-danger">{noteError}</p>}
                </div>
              ) : selected.reviewerNote ? (
                <div className="rounded-lg border border-info-border bg-info-soft px-3 py-3">
                  <p className="text-xs font-medium text-info-on-soft">หมายเหตุการตรวจสอบ</p>
                  <p className="mt-1 text-sm text-info-on-soft">{selected.reviewerNote}</p>
                </div>
              ) : null}
            </div>
          )}

          <DialogFooter className="gap-2 sm:justify-between">
            <Button variant="outline" onClick={() => setSelected(null)}>ปิด</Button>
            {selected?.status === "pending" && (
              <div className="flex gap-2">
                <Button variant="outline" className="border-danger-border text-danger hover:bg-danger-soft" onClick={() => completeReview("rejected")}>ส่งกลับแก้ไข</Button>
                <Button className="bg-success text-success-foreground hover:bg-success/90" disabled={!selected.consentToPublish} onClick={() => completeReview("approved")}>อนุมัติและเผยแพร่</Button>
              </div>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageShell>
  );
}
