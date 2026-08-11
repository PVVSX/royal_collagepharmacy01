"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { PageShell } from "@/roles/shared/components/layout/PageShell";
import { formatFileSize } from "@/roles/shared/features/file-metadata";
import { selectRequestsForAdminSession } from "@/roles/shared/features/requests/request-access";
import {
  REQUEST_EVENT_LABELS,
  REQUEST_STATUS_META,
  canTransitionRequest,
  makeTimelineId,
  progressForStatus,
  type MockRequest,
  type RequestEventType,
  type RequestStatus,
} from "@/roles/shared/features/requests/request-schema";
import { useRequestStore } from "@/roles/shared/features/requests/request-store";
import {
  PORTAL_SESSION_KEY,
  readPortalSession,
} from "@/roles/shared/features/roles/mock-login";

type AdminFilter = RequestStatus | "all";
type StaffDecision = "needs_information" | "awaiting_president_signature" | "rejected";

const STAFF_NAME = "เจ้าหน้าที่ทะเบียน";

function subscribeToPortalSession(onStoreChange: () => void) {
  window.addEventListener("storage", onStoreChange);
  return () => window.removeEventListener("storage", onStoreChange);
}

function getPortalSessionSnapshot() {
  return window.localStorage.getItem(PORTAL_SESSION_KEY);
}

function getPortalSessionServerSnapshot() {
  return null;
}

const FILTERS: readonly { id: AdminFilter; label: string }[] = [
  { id: "all", label: "ทั้งหมด" },
  { id: "staff_review", label: "รอเจ้าหน้าที่" },
  { id: "needs_information", label: "ขอข้อมูลเพิ่ม" },
  { id: "awaiting_president_signature", label: "รอประธานลงนาม" },
  { id: "signed", label: "ลงนามแล้ว" },
  { id: "rejected", label: "ไม่อนุมัติ" },
];

const SUMMARY_CARDS: readonly {
  status: RequestStatus;
  label: string;
  icon: string;
  className: string;
}[] = [
  { status: "staff_review", label: "รอตรวจสอบ", icon: "schedule", className: "bg-admin-metric-warning-soft text-admin-metric-warning" },
  { status: "needs_information", label: "ขอข้อมูลเพิ่ม", icon: "contact_support", className: "bg-admin-metric-info-soft text-admin-metric-info" },
  { status: "awaiting_president_signature", label: "รอลงนาม", icon: "draw", className: "bg-brand-soft text-brand-on-soft" },
  { status: "signed", label: "ลงนามแล้ว", icon: "check_circle", className: "bg-admin-metric-success-soft text-admin-metric-success" },
  { status: "rejected", label: "ไม่อนุมัติ", icon: "cancel", className: "bg-danger-soft text-danger" },
];

function formatDateTime(value: string) {
  return new Date(value).toLocaleString("th-TH", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Bangkok",
  });
}

function RequestInformation({ request }: { request: MockRequest }) {
  const status = REQUEST_STATUS_META[request.status];
  const attachedDocuments = request.documents.filter((document) => document.file);
  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 border-b border-admin-border pb-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="font-mono text-xs text-admin-content-muted">{request.id}</p>
          <h3 className="mt-1 break-words text-base font-semibold text-admin-content">{request.title}</h3>
          <p className="mt-1 text-xs text-admin-content-muted">{request.typeLabel} · {request.displayDate} · {request.collegeCode}</p>
        </div>
        <Badge variant={status.variant} className="h-auto shrink-0 self-start py-1">{status.label}</Badge>
      </div>

      <section aria-labelledby="requester-heading">
        <h4 id="requester-heading" className="mb-2 text-xs font-semibold text-admin-content">ผู้ยื่นคำร้อง</h4>
        <dl className="grid gap-3 rounded-2xl bg-admin-surface-soft p-4 sm:grid-cols-2">
          <div><dt className="text-xs text-admin-content-muted">ชื่อ-นามสกุล</dt><dd className="mt-1 text-sm font-medium text-admin-content">{request.requester.name}</dd></div>
          <div><dt className="text-xs text-admin-content-muted">รหัสสมาชิก</dt><dd className="mt-1 font-mono text-sm font-medium text-admin-content">{request.requester.memberId}</dd></div>
          <div className="sm:col-span-2"><dt className="text-xs text-admin-content-muted">อีเมล</dt><dd className="mt-1 break-all text-sm font-medium text-admin-content">{request.requester.email}</dd></div>
        </dl>
      </section>

      <section aria-labelledby="admin-request-data-heading">
        <h4 id="admin-request-data-heading" className="mb-2 text-xs font-semibold text-admin-content">ข้อมูลคำร้อง</h4>
        <dl className="grid gap-3 rounded-2xl border border-admin-border p-4 sm:grid-cols-2">
          {request.fields.map((field) => (
            <div key={field.id} className="min-w-0"><dt className="text-xs text-admin-content-muted">{field.label}</dt><dd className="mt-1 whitespace-pre-wrap break-words text-sm font-medium text-admin-content">{field.value}</dd></div>
          ))}
          {request.applicantNote && (
            <div className="min-w-0 sm:col-span-2"><dt className="text-xs text-admin-content-muted">หมายเหตุจากผู้ยื่น</dt><dd className="mt-1 whitespace-pre-wrap break-words text-sm font-medium text-admin-content">{request.applicantNote}</dd></div>
          )}
        </dl>
      </section>

      {request.courses.length > 0 && (
        <section aria-labelledby="admin-request-courses-heading">
          <h4 id="admin-request-courses-heading" className="mb-2 text-xs font-semibold text-admin-content">รายวิชาที่เกี่ยวข้อง</h4>
          <div className="space-y-2 rounded-2xl border border-admin-border p-3">
            {request.courses.map((course) => (
              <div key={course.code} className="flex flex-col gap-0.5 text-xs sm:flex-row sm:items-center sm:justify-between">
                <span className="font-medium text-admin-content">{course.code} {course.title}</span>
                <span className="text-admin-content-muted">{course.credits} หน่วยกิต{course.term ? ` · ${course.term}` : ""}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {attachedDocuments.length > 0 && (
        <section aria-labelledby="admin-request-documents-heading">
          <h4 id="admin-request-documents-heading" className="mb-2 text-xs font-semibold text-admin-content">เอกสารประกอบ</h4>
          <div className="space-y-2 rounded-2xl border border-admin-border p-3">
            {attachedDocuments.map((document) => (
              <div key={document.id} className="flex min-w-0 flex-wrap items-center gap-2 text-xs">
                <span className="material-symbols-outlined text-lg text-primary">attach_file</span>
                <span className="min-w-0 flex-1 truncate font-medium text-admin-content">{document.label}: {document.file?.name}</span>
                <span className="shrink-0 text-admin-content-muted">{formatFileSize(document.file?.size ?? 0)}</span>
                <Badge variant={document.reviewStatus === "accepted" ? "success" : "warning"} className="h-auto py-0.5">
                  {document.reviewStatus === "accepted" ? "ตรวจแล้ว" : "รอตรวจ"}
                </Badge>
              </div>
            ))}
          </div>
        </section>
      )}

      {request.comments.length > 0 && (
        <section className="rounded-2xl border border-info-border bg-info-soft p-4" aria-labelledby="existing-review-heading">
          <h4 id="existing-review-heading" className="text-xs font-semibold text-info-on-soft">หมายเหตุและการสนทนา</h4>
          <div className="mt-2 space-y-3">
            {request.comments.map((comment) => (
              <div key={comment.id} className="border-t border-info-border/60 pt-2 first:border-t-0 first:pt-0">
                <p className="whitespace-pre-wrap text-sm text-info-on-soft">{comment.message}</p>
                <p className="mt-1 text-xs text-info-on-soft/80">{comment.actorName} · {formatDateTime(comment.createdAt)}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      <section aria-labelledby="admin-request-events-heading">
        <h4 id="admin-request-events-heading" className="mb-2 text-xs font-semibold text-admin-content">ประวัติคำร้อง</h4>
        <ol className="space-y-2 border-l-2 border-admin-border pl-5">
          {request.events.map((event) => (
            <li key={event.id} className="relative text-xs text-admin-content">
              <span className="absolute -left-[27px] top-0.5 h-3 w-3 rounded-full bg-primary ring-4 ring-card" />
              <span className="font-medium">{REQUEST_EVENT_LABELS[event.type]}</span>
              <span className="ml-1 text-admin-content-muted">โดย {event.actorName} · {formatDateTime(event.createdAt)}</span>
              {event.note && <p className="mt-0.5 whitespace-pre-wrap text-admin-content-muted">{event.note}</p>}
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}

export default function AdminRequestsPage() {
  const { requests, storageError, isReady, updateRequest } = useRequestStore();
  const serializedSession = useSyncExternalStore(
    subscribeToPortalSession,
    getPortalSessionSnapshot,
    getPortalSessionServerSnapshot,
  );
  const [filter, setFilter] = useState<AdminFilter>("all");
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [reviewNote, setReviewNote] = useState("");
  const [reviewError, setReviewError] = useState("");

  const visibleRequests = useMemo(
    () => selectRequestsForAdminSession(
      requests,
      serializedSession ? readPortalSession() : null,
    ),
    [requests, serializedSession],
  );
  const selectedRequest = visibleRequests.find((request) => request.id === selectedId) ?? null;
  const filteredRequests = useMemo(() => {
    const normalizedSearch = search.trim().toLocaleLowerCase("th-TH");
    return visibleRequests.filter((request) => {
      const matchesStatus = filter === "all" || request.status === filter;
      if (!matchesStatus) return false;
      if (!normalizedSearch) return true;
      return [request.id, request.title, request.typeLabel, request.requester.name, request.requester.memberId, request.collegeCode]
        .some((value) => value.toLocaleLowerCase("th-TH").includes(normalizedSearch));
    });
  }, [filter, search, visibleRequests]);

  const openDetail = (request: MockRequest) => {
    setSelectedId(request.id);
    setReviewNote("");
    setReviewError("");
  };

  const closeDetail = () => {
    setSelectedId(null);
    setReviewNote("");
    setReviewError("");
  };

  const reviewRequest = (status: StaffDecision) => {
    if (!selectedRequest || !canTransitionRequest(selectedRequest.status, status, "staff")) {
      toast.error("สถานะคำร้องเปลี่ยนแล้ว กรุณาเปิดรายการใหม่อีกครั้ง");
      closeDetail();
      return;
    }
    const note = reviewNote.trim();
    if ((status === "rejected" || status === "needs_information") && !note) {
      setReviewError(status === "rejected" ? "กรุณาระบุเหตุผลที่ไม่อนุมัติ" : "กรุณาระบุข้อมูลที่ต้องการให้สมาชิกส่งเพิ่มเติม");
      return;
    }
    const missingRequiredDocument = selectedRequest.documents.find((document) => document.required && !document.file);
    if (status === "awaiting_president_signature" && missingRequiredDocument) {
      setReviewError(`ยังขาด${missingRequiredDocument.label} กรุณาขอข้อมูลเพิ่มเติมก่อนส่งลงนาม`);
      return;
    }
    const now = new Date();
    const nowIso = now.toISOString();
    const eventType: RequestEventType = status === "needs_information"
      ? "information_requested"
      : status === "rejected"
        ? "rejected"
        : "forwarded_for_signature";
    const fallbackNote = status === "awaiting_president_signature" ? "ตรวจสอบข้อมูลครบถ้วนและส่งให้ประธานลงนาม" : "";
    const recordedNote = note || fallbackNote;
    updateRequest(selectedRequest.id, (request) => ({
      ...request,
      status,
      updatedAt: nowIso,
      documents: request.documents.map((document) => ({
        ...document,
        reviewStatus: status === "awaiting_president_signature" && document.file ? "accepted" : document.reviewStatus,
      })),
      comments: recordedNote ? [...request.comments, {
        id: makeTimelineId("comment-staff", now, request.comments.length),
        actorRole: "staff",
        actorName: STAFF_NAME,
        message: recordedNote,
        createdAt: nowIso,
      }] : request.comments,
      events: [...request.events, {
        id: makeTimelineId(`event-${eventType}`, now, request.events.length),
        type: eventType,
        actorRole: "staff",
        actorName: STAFF_NAME,
        createdAt: nowIso,
        note: recordedNote || undefined,
      }],
      progress: progressForStatus(status),
    }));
    toast.success(`อัปเดตคำร้อง ${selectedRequest.id} แล้ว`, { description: REQUEST_STATUS_META[status].label });
    closeDetail();
  };

  const canReview = selectedRequest?.status === "staff_review";
  const canReject = selectedRequest
    ? canTransitionRequest(selectedRequest.status, "rejected", "staff")
    : false;

  return (
    <PageShell size="wide" bottom="roomy" className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight text-admin-content">จัดการคำร้อง</h1>
        <p className="mt-1 text-sm text-admin-content-muted">ตรวจสอบรายละเอียด ขอข้อมูลเพิ่มเติม และส่งคำร้องที่ครบถ้วนให้ประธานลงนาม</p>
      </header>

      {storageError && (
        <div role="alert" className="flex gap-2 rounded-2xl border border-warning-border bg-warning-soft p-3 text-xs text-warning-on-soft"><span className="material-symbols-outlined text-lg">warning</span><span>{storageError}</span></div>
      )}

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-5" aria-label="สรุปจำนวนคำร้อง">
        {SUMMARY_CARDS.map((item) => (
          <Card key={item.status} className="border border-admin-border bg-surface-raised"><CardContent className="flex items-center gap-3 px-4"><span className={`material-symbols-outlined flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${item.className}`}>{item.icon}</span><div><p className="text-xs text-admin-content-muted">{item.label}</p><p className="mt-0.5 text-xl font-bold text-admin-content">{visibleRequests.filter((request) => request.status === item.status).length}</p></div></CardContent></Card>
        ))}
      </section>

      <Card className="border border-admin-border bg-surface-raised">
        <CardContent className="space-y-4 px-4 md:px-5">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex gap-2 overflow-x-auto pb-1" aria-label="กรองสถานะคำร้อง">
              {FILTERS.map((item) => {
                const count = item.id === "all" ? visibleRequests.length : visibleRequests.filter((request) => request.status === item.id).length;
                return <button key={item.id} type="button" aria-pressed={filter === item.id} onClick={() => setFilter(item.id)} className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/30 ${filter === item.id ? "border-brand-border bg-brand-soft text-brand-on-soft" : "border-admin-border bg-admin-surface-soft text-admin-content-muted hover:text-admin-content"}`}>{item.label} ({count})</button>;
              })}
            </div>
            <div className="relative w-full lg:w-80"><span className="material-symbols-outlined pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-lg text-admin-content-muted">search</span><Input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="ค้นหาเลขที่ ชื่อสมาชิก หรือประเภท..." aria-label="ค้นหาคำร้อง" className="h-9 bg-admin-surface-soft pl-9" /></div>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-admin-border">
            <table className="w-full min-w-[860px] text-left text-sm">
              <thead className="bg-admin-surface-soft text-xs text-admin-content-muted"><tr><th scope="col" className="px-4 py-3 font-medium">เลขที่คำร้อง</th><th scope="col" className="px-4 py-3 font-medium">ผู้ยื่นคำร้อง</th><th scope="col" className="px-4 py-3 font-medium">ประเภท / เรื่อง</th><th scope="col" className="px-4 py-3 font-medium">วันที่ยื่น</th><th scope="col" className="px-4 py-3 font-medium">สถานะ</th><th scope="col" className="px-4 py-3 text-right font-medium">จัดการ</th></tr></thead>
              <tbody className="divide-y divide-admin-border">
                {!isReady ? (
                  <tr><td colSpan={6} className="px-4 py-14 text-center text-sm text-admin-content-muted"><span className="material-symbols-outlined mr-2 animate-spin align-middle">progress_activity</span>กำลังโหลดคำร้อง</td></tr>
                ) : filteredRequests.map((request) => {
                  const status = REQUEST_STATUS_META[request.status];
                  return (
                    <tr key={request.id} className="transition-colors hover:bg-admin-surface-soft">
                      <td className="px-4 py-3 font-mono text-xs font-medium text-admin-content">{request.id}</td>
                      <td className="px-4 py-3"><p className="font-medium text-admin-content">{request.requester.name}</p><p className="mt-0.5 text-xs text-admin-content-muted">{request.requester.memberId}</p></td>
                      <td className="max-w-xs px-4 py-3"><p className="text-xs text-admin-content-muted">{request.typeLabel}</p><p className="mt-0.5 truncate font-medium text-admin-content">{request.title}</p></td>
                      <td className="whitespace-nowrap px-4 py-3 text-admin-content-secondary">{request.displayDate}</td>
                      <td className="px-4 py-3"><Badge variant={status.variant} className="h-auto py-1">{status.label}</Badge></td>
                      <td className="px-4 py-3 text-right"><Button variant="outline" size="sm" onClick={() => openDetail(request)}><span className="material-symbols-outlined text-base">visibility</span>ตรวจสอบ</Button></td>
                    </tr>
                  );
                })}
                {isReady && filteredRequests.length === 0 && (
                  <tr><td colSpan={6} className="px-4 py-14 text-center"><span className="material-symbols-outlined text-4xl text-admin-content-muted">inbox</span><p className="mt-2 text-sm font-medium text-admin-content">ไม่พบคำร้อง</p><p className="mt-1 text-xs text-admin-content-muted">ลองเปลี่ยนสถานะหรือคำค้นหา</p></td></tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={Boolean(selectedRequest)} onOpenChange={(open) => !open && closeDetail()}>
        <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader><DialogTitle className="flex items-center gap-2"><span className="material-symbols-outlined text-primary">fact_check</span>ตรวจสอบคำร้อง</DialogTitle><DialogDescription>ตรวจรายละเอียดและบันทึกผลการพิจารณา</DialogDescription></DialogHeader>
          {selectedRequest && <RequestInformation request={selectedRequest} />}
          {(canReview || canReject) && (
            <div className="space-y-1.5 border-t border-admin-border pt-4">
              <label htmlFor="review-note" className="text-xs font-medium text-admin-content">หมายเหตุจากผู้ตรวจสอบ <span className="ml-1 text-admin-content-muted">(จำเป็นเมื่อขอข้อมูลเพิ่มหรือไม่อนุมัติ)</span></label>
              <Textarea id="review-note" value={reviewNote} onChange={(event) => { setReviewNote(event.target.value); if (reviewError) setReviewError(""); }} placeholder="ระบุผลการตรวจสอบหรือข้อมูลที่ต้องการเพิ่มเติม" aria-invalid={Boolean(reviewError)} aria-describedby={reviewError ? "review-note-error" : undefined} className="min-h-24 bg-admin-surface-soft" />
              {reviewError && <p id="review-note-error" role="alert" className="text-xs text-destructive">{reviewError}</p>}
            </div>
          )}
          <DialogFooter className="border-t border-admin-border pt-4 sm:flex-wrap">
            <Button variant="outline" onClick={closeDetail}>ปิด</Button>
            {canReview && <Button variant="outline" className="border-info-border text-info-on-soft hover:bg-info-soft" onClick={() => reviewRequest("needs_information")}>ขอข้อมูลเพิ่มเติม</Button>}
            {canReject && <Button variant="destructive" onClick={() => reviewRequest("rejected")}>ไม่อนุมัติ</Button>}
            {canReview && <Button onClick={() => reviewRequest("awaiting_president_signature")}><span className="material-symbols-outlined text-base">forward</span>ส่งให้ประธานลงนาม</Button>}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageShell>
  );
}
