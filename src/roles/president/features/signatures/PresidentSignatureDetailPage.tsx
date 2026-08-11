"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { usePresidentAccess } from "@/roles/president/president-access";
import { formatFileSize } from "@/roles/shared/features/file-metadata";
import { HandwrittenSignaturePreview } from "@/roles/shared/features/requests/HandwrittenSignature";
import {
  REQUEST_EVENT_LABELS,
  REQUEST_STATUS_META,
  canTransitionRequest,
  makeTimelineId,
  progressForStatus,
  type HandwrittenSignature,
} from "@/roles/shared/features/requests/request-schema";
import { useRequestStore } from "@/roles/shared/features/requests/request-store";
import { isRoleAssignmentActive } from "@/roles/shared/features/roles/role-assignment";
import {
  canPresidentViewRequest,
  signRequestAsPresident,
} from "./president-signature";
import { SignaturePad } from "./SignaturePad";

function formatDateTime(value: string) {
  return new Date(value).toLocaleString("th-TH", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Bangkok" });
}

export default function PresidentSignatureDetailPage({ requestId }: { requestId: string }) {
  const router = useRouter();
  const { assignment } = usePresidentAccess();
  const { requests, isReady, storageError, updateRequest } = useRequestStore();
  const [handwrittenSignature, setHandwrittenSignature] = useState<HandwrittenSignature | null>(null);
  const [consentAccepted, setConsentAccepted] = useState(false);
  const [decisionNote, setDecisionNote] = useState("");
  const [formError, setFormError] = useState("");
  const request = requests.find((item) => item.id === requestId);

  if (!isReady) {
    return <div className="mx-auto flex min-h-[60vh] max-w-5xl items-center justify-center gap-2 text-sm text-muted-foreground" role="status"><span className="material-symbols-outlined animate-spin">progress_activity</span>กำลังโหลดคำร้อง</div>;
  }
  if (!request) {
    return <div className="mx-auto max-w-xl py-16 text-center"><span className="material-symbols-outlined text-5xl text-muted-foreground">search_off</span><h1 className="mt-3 text-xl font-semibold">ไม่พบคำร้อง</h1><p className="mt-2 text-sm text-muted-foreground">รายการอาจถูกย้ายหรือเลขที่คำร้องไม่ถูกต้อง</p><Button asChild className="mt-5"><Link href="/president/signatures">กลับไปรายการรอลงนาม</Link></Button></div>;
  }
  if (!assignment || request.collegeCode !== assignment.collegeCode) {
    return <div className="mx-auto max-w-xl py-16 text-center"><span className="material-symbols-outlined text-5xl text-danger">lock</span><h1 className="mt-3 text-xl font-semibold">ไม่มีสิทธิ์ดูคำร้องนี้</h1><p className="mt-2 text-sm text-muted-foreground">คำร้องอยู่คนละวิทยาลัยกับวาระปัจจุบัน</p><Button asChild className="mt-5"><Link href="/president/signatures">กลับไปรายการของวิทยาลัย</Link></Button></div>;
  }
  if (!canPresidentViewRequest(request)) {
    return <div className="mx-auto max-w-xl py-16 text-center"><span className="material-symbols-outlined text-5xl text-danger">lock</span><h1 className="mt-3 text-xl font-semibold">ยังไม่มีสิทธิ์ดูคำร้องนี้</h1><p className="mt-2 text-sm text-muted-foreground">คำร้องยังไม่ได้ส่งให้ประธานลงนาม หรือไม่ได้อยู่ในประวัติการพิจารณาของประธาน</p><Button asChild className="mt-5"><Link href="/president/signatures">กลับไปรายการของวิทยาลัย</Link></Button></div>;
  }

  const status = REQUEST_STATUS_META[request.status];
  const actionable = request.status === "awaiting_president_signature";
  const attachedDocuments = request.documents.filter((document) => document.file);

  const signRequest = () => {
    setFormError("");
    try {
      updateRequest(request.id, (current) => signRequestAsPresident({
        request: current,
        assignment,
        signedAt: new Date(),
        handwrittenSignature,
        consentAccepted,
      }));
      toast.success(`ลงนามคำร้อง ${request.id} เรียบร้อยแล้ว`);
      router.push("/president/history");
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "ไม่สามารถลงนามได้ กรุณาลองใหม่อีกครั้ง");
    }
  };

  const rejectRequest = () => {
    const note = decisionNote.trim();
    if (!note) {
      setFormError("กรุณาระบุเหตุผลที่ไม่อนุมัติ");
      return;
    }
    const now = new Date();
    if (!isRoleAssignmentActive(assignment, now) || !canTransitionRequest(request.status, "rejected", "president")) {
      setFormError("วาระหรือสถานะคำร้องเปลี่ยนแล้ว กรุณากลับไปเปิดรายการใหม่");
      return;
    }
    const nowIso = now.toISOString();
    updateRequest(request.id, (current) => ({
      ...current,
      status: "rejected",
      updatedAt: nowIso,
      comments: [...current.comments, {
        id: makeTimelineId("comment-president", now, current.comments.length),
        actorRole: "president",
        actorName: assignment.userName,
        message: note,
        createdAt: nowIso,
      }],
      events: [...current.events, {
        id: makeTimelineId("event-rejected", now, current.events.length),
        type: "rejected",
        actorRole: "president",
        actorName: assignment.userName,
        createdAt: nowIso,
        note,
      }],
      progress: progressForStatus("rejected"),
    }));
    toast.success(`บันทึกผลคำร้อง ${request.id} แล้ว`);
    router.push("/president/history");
  };

  return (
    <div className="mx-auto w-full max-w-5xl space-y-5">
      <div><Button asChild variant="ghost" size="sm" className="-ml-2"><Link href="/president/signatures"><span className="material-symbols-outlined text-base">arrow_back</span>กลับไปรายการ</Link></Button></div>
      {(storageError || formError) && <div id={formError ? "president-signature-form-error" : undefined} role="alert" className={`rounded-2xl border p-3 text-sm ${formError ? "border-danger-border bg-danger-soft text-danger" : "border-warning-border bg-warning-soft text-warning-on-soft"}`}>{formError || storageError}</div>}

      <Card><CardContent className="space-y-6 px-4 md:px-6">
        <header className="flex flex-col gap-3 border-b border-border pb-5 sm:flex-row sm:items-start sm:justify-between"><div className="min-w-0"><p className="font-mono text-xs text-muted-foreground">{request.id}</p><h1 className="mt-1 break-words text-xl font-semibold text-foreground">{request.title}</h1><p className="mt-1 text-xs text-muted-foreground">{request.typeLabel} · ยื่นเมื่อ {request.displayDate}</p></div><Badge variant={status.variant} className="h-auto shrink-0 self-start py-1">{status.label}</Badge></header>

        <section aria-labelledby="president-requester-heading"><h2 id="president-requester-heading" className="mb-2 text-sm font-semibold">ผู้ยื่นคำร้อง</h2><dl className="grid gap-3 rounded-2xl bg-muted/50 p-4 sm:grid-cols-2"><div><dt className="text-xs text-muted-foreground">ชื่อ-นามสกุล</dt><dd className="mt-1 text-sm font-medium">{request.requester.name}</dd></div><div><dt className="text-xs text-muted-foreground">รหัสสมาชิก</dt><dd className="mt-1 font-mono text-sm font-medium">{request.requester.memberId}</dd></div><div className="sm:col-span-2"><dt className="text-xs text-muted-foreground">อีเมล</dt><dd className="mt-1 break-all text-sm font-medium">{request.requester.email}</dd></div></dl></section>

        <section aria-labelledby="president-request-data-heading"><h2 id="president-request-data-heading" className="mb-2 text-sm font-semibold">ข้อมูลคำร้อง</h2><dl className="grid gap-3 rounded-2xl border border-border p-4 sm:grid-cols-2">{request.fields.map((field) => <div key={field.id} className="min-w-0"><dt className="text-xs text-muted-foreground">{field.label}</dt><dd className="mt-1 whitespace-pre-wrap break-words text-sm font-medium">{field.value}</dd></div>)}{request.applicantNote && <div className="sm:col-span-2"><dt className="text-xs text-muted-foreground">หมายเหตุจากผู้ยื่น</dt><dd className="mt-1 whitespace-pre-wrap text-sm font-medium">{request.applicantNote}</dd></div>}</dl></section>

        {request.courses.length > 0 && <section aria-labelledby="president-courses-heading"><h2 id="president-courses-heading" className="mb-2 text-sm font-semibold">รายวิชาที่เกี่ยวข้อง</h2><div className="overflow-x-auto rounded-2xl border border-border"><table className="w-full min-w-[560px] text-left text-sm"><thead className="bg-muted/50 text-xs text-muted-foreground"><tr><th className="px-4 py-2.5 font-medium">รหัสวิชา</th><th className="px-4 py-2.5 font-medium">ชื่อวิชา</th><th className="px-4 py-2.5 font-medium">หน่วยกิต</th><th className="px-4 py-2.5 font-medium">ภาคการศึกษา</th></tr></thead><tbody className="divide-y divide-border">{request.courses.map((course) => <tr key={course.code}><td className="px-4 py-3 font-mono text-xs font-medium">{course.code}</td><td className="px-4 py-3">{course.title}</td><td className="px-4 py-3">{course.credits}</td><td className="px-4 py-3 text-muted-foreground">{course.term ?? "-"}</td></tr>)}</tbody></table></div></section>}

        {attachedDocuments.length > 0 && <section aria-labelledby="president-documents-heading"><h2 id="president-documents-heading" className="mb-2 text-sm font-semibold">เอกสารประกอบ</h2><div className="space-y-2 rounded-2xl border border-border p-3">{attachedDocuments.map((document) => <div key={document.id} className="flex min-w-0 flex-wrap items-center gap-2 text-xs"><span className="material-symbols-outlined text-lg text-primary">attach_file</span><span className="min-w-0 flex-1 truncate font-medium">{document.label}: {document.file?.name}</span><span className="text-muted-foreground">{formatFileSize(document.file?.size ?? 0)}</span><Badge variant={document.reviewStatus === "accepted" ? "success" : "warning"} className="h-auto py-0.5">{document.reviewStatus === "accepted" ? "เจ้าหน้าที่ตรวจแล้ว" : "รอตรวจ"}</Badge></div>)}</div></section>}

        {request.comments.length > 0 && <section className="rounded-2xl border border-info-border bg-info-soft p-4" aria-labelledby="president-comments-heading"><h2 id="president-comments-heading" className="text-sm font-semibold text-info-on-soft">หมายเหตุและการสนทนา</h2><div className="mt-2 space-y-3">{request.comments.map((comment) => <div key={comment.id} className="border-t border-info-border/60 pt-2 first:border-0 first:pt-0"><p className="whitespace-pre-wrap text-sm text-info-on-soft">{comment.message}</p><p className="mt-1 text-xs text-info-on-soft/80">{comment.actorName} · {formatDateTime(comment.createdAt)}</p></div>)}</div></section>}

        {request.mockSignature && <section className="rounded-2xl border-2 border-success-border bg-success-soft p-5 text-center" aria-labelledby="signature-stamp-heading"><span className="material-symbols-outlined text-4xl text-success-on-soft">verified</span><h2 id="signature-stamp-heading" className="mt-2 text-sm font-semibold text-success-on-soft">{request.mockSignature.stampLabel}</h2>{request.mockSignature.handwrittenSignature && <div className="mx-auto mt-4 max-w-md rounded-2xl border border-success-border bg-logo-surface px-4 py-2"><HandwrittenSignaturePreview signature={request.mockSignature.handwrittenSignature} ariaLabel={`ลายมือชื่อของ ${request.mockSignature.signerName}`} /></div>}<p className="mt-2 text-lg font-semibold text-success-on-soft">{request.mockSignature.signerName}</p><p className="mt-1 text-xs text-success-on-soft/80">{formatDateTime(request.mockSignature.signedAt)}</p><p className="mt-2 break-all font-mono text-xs text-success-on-soft/80">{request.mockSignature.documentFingerprint}</p></section>}

        <section aria-labelledby="president-timeline-heading"><h2 id="president-timeline-heading" className="mb-3 text-sm font-semibold">ประวัติคำร้อง</h2><ol className="space-y-3 border-l-2 border-border pl-5">{request.events.map((event) => <li key={event.id} className="relative text-xs"><span className="absolute -left-[27px] top-0.5 h-3 w-3 rounded-full bg-primary ring-4 ring-card" /><span className="font-medium">{REQUEST_EVENT_LABELS[event.type]}</span><span className="ml-1 text-muted-foreground">โดย {event.actorName} · {formatDateTime(event.createdAt)}</span>{event.note && <p className="mt-1 whitespace-pre-wrap text-muted-foreground">{event.note}</p>}</li>)}</ol></section>
      </CardContent></Card>

      {actionable && <Card><CardContent className="space-y-5 px-4 md:px-6"><div><h2 className="text-base font-semibold">ยืนยันการลงนาม</h2><p className="mt-1 text-xs text-muted-foreground">ตรวจสอบข้อมูลทั้งหมดก่อนลงลายมือชื่อ ระบบจะบันทึกผู้ลงนาม เวลา ลายเส้น และรหัสอ้างอิงเอกสาร</p></div><div className="rounded-2xl border border-border bg-muted/20 p-4"><p className="text-xs text-muted-foreground">ผู้ลงนามตามวาระปัจจุบัน</p><p className="mt-1 text-sm font-semibold text-foreground">{assignment.userName}</p></div><SignaturePad value={handwrittenSignature} onChange={(value) => { setHandwrittenSignature(value); setFormError(""); }} invalid={formError.startsWith("กรุณาใช้เมาส์")} ariaDescribedBy={formError ? "president-signature-form-error" : undefined} /><div className="space-y-1.5"><label htmlFor="president-decision-note" className="text-xs font-medium">เหตุผลกรณีไม่อนุมัติ</label><Textarea id="president-decision-note" value={decisionNote} onChange={(event) => { setDecisionNote(event.target.value); setFormError(""); }} rows={3} placeholder="จำเป็นเมื่อเลือกไม่อนุมัติ" /></div><label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-border p-4"><input type="checkbox" checked={consentAccepted} onChange={(event) => { setConsentAccepted(event.target.checked); setFormError(""); }} className="mt-0.5 h-4 w-4 accent-primary" /><span className="text-sm leading-relaxed">ข้าพเจ้ายืนยันว่าได้ตรวจสอบข้อมูลคำร้อง และยินยอมให้ระบบบันทึกลายมือชื่อพร้อมชื่อ วันเวลา และรหัสอ้างอิงเอกสาร</span></label><div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end"><Button variant="destructive" onClick={rejectRequest}>ไม่อนุมัติ</Button><Button onClick={signRequest}><span className="material-symbols-outlined text-base">draw</span>ยืนยันและลงนาม</Button></div></CardContent></Card>}
    </div>
  );
}
