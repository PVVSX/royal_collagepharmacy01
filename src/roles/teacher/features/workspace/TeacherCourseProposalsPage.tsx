"use client";

import { useMemo, useState, type FormEvent } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import {
  EmptyState,
  LoadingState,
  WorkspaceHeader,
} from "@/roles/shared/components/workspace/WorkspacePrimitives";
import type {
  CourseProposal,
  CourseProposalActor,
  CourseProposalStatus,
} from "@/roles/shared/features/academic";
import { usePortalSession } from "@/roles/shared/features/roles/use-portal-session";

const statusMeta: Record<CourseProposalStatus, {
  label: string;
  variant: "neutral" | "warning" | "success" | "danger";
}> = {
  submitted: { label: "รอเจ้าหน้าที่ตรวจ", variant: "neutral" },
  needs_revision: { label: "ต้องแก้ไขข้อมูล", variant: "warning" },
  passed: { label: "ผ่านการตรวจ", variant: "success" },
  rejected: { label: "ไม่ผ่านการตรวจ", variant: "danger" },
};

interface ProposalFormState {
  courseCode: string;
  courseTitle: string;
  credits: string;
  rationale: string;
  reason: string;
  evidenceReference: string;
}

const EMPTY_FORM: ProposalFormState = {
  courseCode: "",
  courseTitle: "",
  credits: "",
  rationale: "",
  reason: "",
  evidenceReference: "",
};

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("th-TH", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Bangkok",
  }).format(new Date(value));
}

export default function TeacherCourseProposalsPage() {
  const db = useMockDb();
  const { session, isReady } = usePortalSession();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProposalId, setEditingProposalId] = useState<string | null>(null);
  const [form, setForm] = useState<ProposalFormState>(EMPTY_FORM);
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const actor: CourseProposalActor | null = session?.role === "teacher"
    ? {
        userId: session.userId,
        userName: session.displayName,
        role: session.role,
        organisationId: session.organisation.id,
        resourceScopes: session.resourceScopes,
      }
    : null;
  const proposals = useMemo(() => db.courseProposals
    .filter((proposal) => (
      proposal.proposerId === session?.userId &&
      proposal.institutionId === session?.organisation.id
    ))
    .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt)), [db.courseProposals, session]);
  const editingProposal = proposals.find((proposal) => proposal.id === editingProposalId);

  if (!isReady || !db.isLoaded) {
    return <PageShell size="full"><LoadingState label="กำลังโหลดคำขอสร้างรายวิชา" /></PageShell>;
  }

  const closeDialog = () => {
    setIsDialogOpen(false);
    setEditingProposalId(null);
    setForm(EMPTY_FORM);
    setFormError("");
    setIsSubmitting(false);
  };

  const openCreateDialog = () => {
    setEditingProposalId(null);
    setForm(EMPTY_FORM);
    setFormError("");
    setIsDialogOpen(true);
  };

  const openRevisionDialog = (proposal: CourseProposal) => {
    setEditingProposalId(proposal.id);
    setForm({
      courseCode: proposal.courseCode,
      courseTitle: proposal.courseTitle,
      credits: String(proposal.credits),
      rationale: proposal.rationale,
      reason: "",
      evidenceReference: "",
    });
    setFormError("");
    setIsDialogOpen(true);
  };

  const updateForm = (field: keyof ProposalFormState, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
    setFormError("");
  };

  const submitProposal = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!actor) return;
    const credits = Number(form.credits);
    if (!form.courseCode.trim() || !form.courseTitle.trim() || !form.rationale.trim() || !Number.isFinite(credits) || credits <= 0) {
      setFormError("กรุณาระบุรหัส ชื่อ หน่วยกิต และเหตุผลในการสร้างรายวิชาให้ครบถ้วน");
      return;
    }
    if (editingProposal && !form.reason.trim()) {
      setFormError("กรุณาระบุสิ่งที่แก้ไขก่อนส่งคำขอกลับไปตรวจอีกครั้ง");
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingProposal) {
        db.resubmitCourseProposal({
          proposalId: editingProposal.id,
          actor,
          courseCode: form.courseCode,
          courseTitle: form.courseTitle,
          credits,
          rationale: form.rationale,
          reason: form.reason,
          evidenceReference: form.evidenceReference || undefined,
        });
        toast.success("ส่งข้อมูลรายวิชาที่แก้ไขแล้วกลับไปตรวจอีกครั้ง");
      } else {
        db.submitCourseProposal({
          actor,
          courseCode: form.courseCode,
          courseTitle: form.courseTitle,
          credits,
          rationale: form.rationale,
          evidenceReference: form.evidenceReference || undefined,
        });
        toast.success("ส่งคำขอสร้างรายวิชาให้เจ้าหน้าที่ตรวจแล้ว");
      }
      closeDialog();
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "ไม่สามารถส่งคำขอสร้างรายวิชาได้");
      setIsSubmitting(false);
    }
  };

  return (
    <PageShell size="full" className="space-y-6">
      <WorkspaceHeader
        eyebrow="ขั้นตอนเสนอรายวิชา"
        title="คำขอสร้างรายวิชา"
        description="สร้างรายการวิชาและติดตามผลตรวจจากเจ้าหน้าที่ราชวิทยาลัย พร้อมแก้ไขและส่งใหม่เมื่อได้รับข้อเสนอแนะ"
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {(Object.keys(statusMeta) as CourseProposalStatus[]).map((status) => (
          <Card key={status}>
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">{statusMeta[status].label}</p>
              <p className="mt-1 text-2xl font-bold tabular-nums text-foreground">
                {proposals.filter((proposal) => proposal.status === status).length}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="gap-3 border-b border-border sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="text-lg">รายการที่ฉันเสนอ</CardTitle>
            <p aria-live="polite" className="mt-1 text-xs text-muted-foreground">ทั้งหมด {proposals.length} รายการ</p>
          </div>
          <Button type="button" onClick={openCreateDialog}>
            <span aria-hidden="true" className="material-symbols-outlined text-lg">add</span>
            สร้างคำขอรายวิชา
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          {proposals.length ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead scope="col">รายวิชา</TableHead>
                  <TableHead scope="col">หน่วยกิต</TableHead>
                  <TableHead scope="col">อัปเดตล่าสุด</TableHead>
                  <TableHead scope="col">สถานะ</TableHead>
                  <TableHead scope="col">ผลตรวจล่าสุด</TableHead>
                  <TableHead scope="col" className="text-right">ดำเนินการ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {proposals.map((proposal) => {
                  const meta = statusMeta[proposal.status];
                  return (
                    <TableRow key={proposal.id}>
                      <TableCell>
                        <p className="font-medium text-foreground">{proposal.courseCode}</p>
                        <p className="max-w-sm whitespace-normal text-xs text-muted-foreground">{proposal.courseTitle}</p>
                      </TableCell>
                      <TableCell>{proposal.credits}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{formatDateTime(proposal.updatedAt)}</TableCell>
                      <TableCell><Badge variant={meta.variant}>{meta.label}</Badge></TableCell>
                      <TableCell>
                        {proposal.latestReview ? (
                          <div className="max-w-md whitespace-normal">
                            <p className="text-sm font-medium text-foreground">{proposal.latestReview.note}</p>
                            <p className="mt-1 text-xs text-muted-foreground">
                              {proposal.latestReview.actor.userName} · {formatDateTime(proposal.latestReview.reviewedAt)}
                            </p>
                          </div>
                        ) : <span className="text-muted-foreground">—</span>}
                      </TableCell>
                      <TableCell className="text-right">
                        {proposal.status === "needs_revision" ? (
                          <Button type="button" size="sm" variant="outline" onClick={() => openRevisionDialog(proposal)}>
                            แก้ไขและส่งใหม่
                          </Button>
                        ) : <span className="text-xs text-muted-foreground">ไม่มีงานที่ต้องทำ</span>}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : (
            <div className="p-5">
              <EmptyState
                icon="post_add"
                title="ยังไม่มีคำขอสร้างรายวิชา"
                description="สร้างรายการแรกเพื่อส่งให้เจ้าหน้าที่ราชวิทยาลัยตรวจสอบ"
              />
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={(open) => { if (!open) closeDialog(); }}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>{editingProposal ? "แก้ไขคำขอรายวิชา" : "สร้างคำขอรายวิชา"}</DialogTitle>
            <DialogDescription>
              {editingProposal
                ? "ปรับข้อมูลตามข้อเสนอแนะ แล้วส่งกลับให้เจ้าหน้าที่ตรวจอีกครั้ง"
                : "ข้อมูลจะถูกส่งให้เจ้าหน้าที่ราชวิทยาลัยตรวจ โดยคุณติดตามสถานะได้จากรายการนี้"}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={submitProposal} noValidate aria-busy={isSubmitting} className="space-y-4">
            {formError ? <div id="course-proposal-error" role="alert" className="rounded-xl border border-danger-border bg-danger-soft p-3 text-sm text-danger-on-soft">{formError}</div> : null}
            <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_8rem]">
              <div className="space-y-1.5">
                <label htmlFor="proposal-course-code" className="text-sm font-medium">รหัสรายวิชา</label>
                <Input id="proposal-course-code" value={form.courseCode} onChange={(event) => updateForm("courseCode", event.target.value)} aria-invalid={Boolean(formError && !form.courseCode.trim())} aria-describedby={formError ? "course-proposal-error" : undefined} />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="proposal-credits" className="text-sm font-medium">หน่วยกิต</label>
                <Input id="proposal-credits" type="number" min="1" step="1" value={form.credits} onChange={(event) => updateForm("credits", event.target.value)} aria-invalid={Boolean(formError && Number(form.credits) <= 0)} aria-describedby={formError ? "course-proposal-error" : undefined} />
              </div>
            </div>
            <div className="space-y-1.5">
              <label htmlFor="proposal-course-title" className="text-sm font-medium">ชื่อรายวิชา</label>
              <Input id="proposal-course-title" value={form.courseTitle} onChange={(event) => updateForm("courseTitle", event.target.value)} aria-invalid={Boolean(formError && !form.courseTitle.trim())} aria-describedby={formError ? "course-proposal-error" : undefined} />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="proposal-rationale" className="text-sm font-medium">เหตุผลและวัตถุประสงค์ของรายวิชา</label>
              <Textarea id="proposal-rationale" value={form.rationale} onChange={(event) => updateForm("rationale", event.target.value)} aria-invalid={Boolean(formError && !form.rationale.trim())} aria-describedby={formError ? "course-proposal-error" : undefined} />
            </div>
            {editingProposal ? (
              <div className="space-y-1.5">
                <label htmlFor="proposal-revision-reason" className="text-sm font-medium">สรุปสิ่งที่แก้ไข</label>
                <Textarea id="proposal-revision-reason" value={form.reason} onChange={(event) => updateForm("reason", event.target.value)} aria-invalid={Boolean(formError && !form.reason.trim())} aria-describedby={formError ? "course-proposal-error" : undefined} />
              </div>
            ) : null}
            <div className="space-y-1.5">
              <label htmlFor="proposal-evidence" className="text-sm font-medium">หลักฐานอ้างอิง (ถ้ามี)</label>
              <Input id="proposal-evidence" value={form.evidenceReference} onChange={(event) => updateForm("evidenceReference", event.target.value)} placeholder="เช่น URL หรือเลขที่เอกสาร" />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={closeDialog}>ยกเลิก</Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "กำลังส่ง..." : editingProposal ? "ส่งข้อมูลที่แก้ไข" : "ส่งให้เจ้าหน้าที่ตรวจ"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </PageShell>
  );
}
