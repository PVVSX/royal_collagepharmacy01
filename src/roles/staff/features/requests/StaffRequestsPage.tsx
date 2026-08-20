"use client";

import { useRouter } from "next/navigation";
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
import { SegmentedFilterButton, SegmentedFilterGroup } from "@/components/ui/segmented-filter";
import { Textarea } from "@/components/ui/textarea";
import { PageShell } from "@/roles/shared/components/layout/PageShell";
import { appendAuditEvent, createAuditActorSnapshot } from "@/roles/shared/features/audit";
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
  getPortalSessionStorageSnapshot,
  readPortalSession,
  subscribeToPortalSession as subscribeToSessionStore,
} from "@/roles/shared/features/roles/mock-login";
import { ORGANISATIONS } from "@/roles/shared/features/roles/access-model";

type StaffFilter = RequestStatus | "all";
type StaffDecision = "needs_information" | "rejected";

const STAFF_NAME = "เจ้าหน้าที่ทะเบียน";

function subscribeToPortalSession(onStoreChange: () => void) {
  return subscribeToSessionStore(onStoreChange);
}

function getPortalSessionSnapshot() {
  return getPortalSessionStorageSnapshot();
}

function getPortalSessionServerSnapshot() {
  return "";
}

const FILTERS: readonly { id: StaffFilter; label: string }[] = [
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
  { status: "staff_review", label: "รอตรวจสอบ", icon: "schedule", className: "bg-warning-soft text-warning-on-soft" },
  { status: "needs_information", label: "ขอข้อมูลเพิ่ม", icon: "contact_support", className: "bg-info-soft text-info-on-soft" },
  { status: "awaiting_president_signature", label: "รอลงนาม", icon: "draw", className: "bg-brand-soft text-brand-on-soft" },
  { status: "signed", label: "ลงนามแล้ว", icon: "check_circle", className: "bg-success-soft text-success-on-soft" },
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
      <div className="flex flex-col gap-3 border-b border-border pb-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="font-mono text-xs text-muted-foreground">{request.id}</p>
          <h3 className="mt-1 break-words text-base font-semibold text-foreground">{request.title}</h3>
          <p className="mt-1 text-xs text-muted-foreground">{request.typeLabel} · {request.displayDate} · {request.collegeCode}</p>
        </div>
        <Badge variant={status.variant} className="h-auto shrink-0 self-start py-1">{status.label}</Badge>
      </div>

      <section aria-labelledby="requester-heading">
        <h4 id="requester-heading" className="mb-2 text-xs font-semibold text-foreground">ผู้ยื่นคำร้อง</h4>
        <dl className="grid gap-3 rounded-2xl bg-surface-container-low p-4 sm:grid-cols-2">
          <div><dt className="text-xs text-muted-foreground">ชื่อ-นามสกุล</dt><dd className="mt-1 text-sm font-medium text-foreground">{request.requester.name}</dd></div>
          <div><dt className="text-xs text-muted-foreground">รหัสสมาชิก</dt><dd className="mt-1 font-mono text-sm font-medium text-foreground">{request.requester.memberId}</dd></div>
          <div className="sm:col-span-2"><dt className="text-xs text-muted-foreground">อีเมล</dt><dd className="mt-1 break-all text-sm font-medium text-foreground">{request.requester.email}</dd></div>
        </dl>
      </section>

      <section aria-labelledby="staff-request-data-heading">
        <h4 id="staff-request-data-heading" className="mb-2 text-xs font-semibold text-foreground">ข้อมูลคำร้อง</h4>
        <dl className="grid gap-3 rounded-2xl border border-border p-4 sm:grid-cols-2">
          {request.fields.map((field) => (
            <div key={field.id} className="min-w-0"><dt className="text-xs text-muted-foreground">{field.label}</dt><dd className="mt-1 whitespace-pre-wrap break-words text-sm font-medium text-foreground">{field.value}</dd></div>
          ))}
          {request.applicantNote && (
            <div className="min-w-0 sm:col-span-2"><dt className="text-xs text-muted-foreground">หมายเหตุจากผู้ยื่น</dt><dd className="mt-1 whitespace-pre-wrap break-words text-sm font-medium text-foreground">{request.applicantNote}</dd></div>
          )}
        </dl>
      </section>

      {request.courses.length > 0 && (
        <section aria-labelledby="staff-request-courses-heading">
          <h4 id="staff-request-courses-heading" className="mb-2 text-xs font-semibold text-foreground">รายวิชาที่เกี่ยวข้อง</h4>
          <div className="space-y-2 rounded-2xl border border-border p-3">
            {request.courses.map((course) => (
              <div key={course.code} className="flex flex-col gap-0.5 text-xs sm:flex-row sm:items-center sm:justify-between">
                <span className="font-medium text-foreground">{course.code} {course.title}</span>
                <span className="text-muted-foreground">{course.credits} หน่วยกิต{course.term ? ` · ${course.term}` : ""}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {attachedDocuments.length > 0 && (
        <section aria-labelledby="staff-request-documents-heading">
          <h4 id="staff-request-documents-heading" className="mb-2 text-xs font-semibold text-foreground">เอกสารประกอบ</h4>
          <div className="space-y-2 rounded-2xl border border-border p-3">
            {attachedDocuments.map((document) => (
              <div key={document.id} className="flex min-w-0 flex-wrap items-center gap-2 text-xs">
                <span className="material-symbols-outlined text-lg text-primary">attach_file</span>
                <span className="min-w-0 flex-1 truncate font-medium text-foreground">{document.label}: {document.file?.name}</span>
                <span className="shrink-0 text-muted-foreground">{formatFileSize(document.file?.size ?? 0)}</span>
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

      <section aria-labelledby="staff-request-events-heading">
        <h4 id="staff-request-events-heading" className="mb-2 text-xs font-semibold text-foreground">ประวัติคำร้อง</h4>
        <ol className="space-y-2 border-l-2 border-border pl-5">
          {request.events.map((event) => (
            <li key={event.id} className="relative text-xs text-foreground">
              <span className="absolute -left-[27px] top-0.5 h-3 w-3 rounded-full bg-primary ring-4 ring-card" />
              <span className="font-medium">{REQUEST_EVENT_LABELS[event.type]}</span>
              <span className="ml-1 text-muted-foreground">โดย {event.actorName} · {formatDateTime(event.createdAt)}</span>
              {event.note && <p className="mt-0.5 whitespace-pre-wrap text-muted-foreground">{event.note}</p>}
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}

export default function StaffRequestsPage() {
  const router = useRouter();
  const { requests, storageError, isReady, updateRequest } = useRequestStore();
  const serializedSession = useSyncExternalStore(
    subscribeToPortalSession,
    getPortalSessionSnapshot,
    getPortalSessionServerSnapshot,
  );
  const [filter, setFilter] = useState<StaffFilter>("all");
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [reviewNote, setReviewNote] = useState("");
  const [reviewError, setReviewError] = useState("");

  const visibleRequests = useMemo(
    () => selectRequestsForAdminSession(
      requests,
      serializedSession
        ? readPortalSession({ persistMigration: false })
        : null,
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
    if (!selectedRequest || !canTransitionRequest(selectedRequest.status, status, "royal_college_staff")) {
      toast.error("สถานะคำร้องเปลี่ยนแล้ว กรุณาเปิดรายการใหม่อีกครั้ง");
      closeDetail();
      return;
    }
    const note = reviewNote.trim();
    if ((status === "rejected" || status === "needs_information") && !note) {
      setReviewError(status === "rejected" ? "กรุณาระบุเหตุผลที่ไม่อนุมัติ" : "กรุณาระบุข้อมูลที่ต้องการให้สมาชิกส่งเพิ่มเติม");
      return;
    }
    const now = new Date();
    const nowIso = now.toISOString();
    const eventType: RequestEventType = status === "needs_information"
      ? "information_requested"
      : "rejected";
    const recordedNote = note;
    const nextRequest = (request: MockRequest): MockRequest => ({
      ...request,
      status,
      updatedAt: nowIso,
      documents: request.documents.map((document) => ({ ...document })),
      comments: recordedNote ? [...request.comments, {
        id: makeTimelineId("comment-staff", now, request.comments.length),
        actorRole: "royal_college_staff",
        actorName: STAFF_NAME,
        message: recordedNote,
        createdAt: nowIso,
      }] : request.comments,
      events: [...request.events, {
        id: makeTimelineId(`event-${eventType}`, now, request.events.length),
        type: eventType,
        actorRole: "royal_college_staff",
        actorName: STAFF_NAME,
        createdAt: nowIso,
        note: recordedNote || undefined,
      }],
      progress: progressForStatus(status),
    });
    const session = readPortalSession();
    try {
      appendAuditEvent({
        actor: session ? createAuditActorSnapshot(session) : { userId: "staff-unknown", userName: STAFF_NAME, role: "royal_college_staff", organisation: ORGANISATIONS.royalCollege, resourceScopes: ["*"] },
        action: status === "needs_information" ? "request.request_information" : "request.reject",
        resource: { type: "request", id: selectedRequest.id, label: selectedRequest.title },
        before: { status: selectedRequest.status },
        after: { status },
        reason: recordedNote,
        occurredAt: nowIso,
      });
    } catch {
      setReviewError("บันทึก User Audit Log ไม่สำเร็จ จึงยังไม่เปลี่ยนสถานะคำร้อง");
      toast.error("ยังไม่เปลี่ยนสถานะคำร้อง", { description: "กรุณาตรวจสอบพื้นที่จัดเก็บข้อมูลแล้วลองอีกครั้ง" });
      return;
    }
    updateRequest(selectedRequest.id, nextRequest);
    toast.success(`อัปเดตคำร้อง ${selectedRequest.id} แล้ว`, { description: REQUEST_STATUS_META[status].label });
    closeDetail();
  };

  const canReview = selectedRequest?.status === "staff_review";
  const canReject = selectedRequest
    ? canTransitionRequest(selectedRequest.status, "rejected", "royal_college_staff")
    : false;

  const prepareForSignatureQueue = () => {
    if (!selectedRequest || selectedRequest.status !== "staff_review") return;
    const missingRequiredDocument = selectedRequest.documents.find((document) => document.required && !document.file);
    if (missingRequiredDocument) {
      setReviewError(`ยังขาด${missingRequiredDocument.label} กรุณาขอข้อมูลเพิ่มเติมก่อนจัดคิวลงนาม`);
      return;
    }
    const now = new Date();
    const nowIso = now.toISOString();
    const session = readPortalSession();
    const actorName = session?.displayName ?? STAFF_NAME;
    const nextRequest = (request: MockRequest): MockRequest => ({
      ...request,
      updatedAt: nowIso,
      documents: request.documents.map((document) => ({
        ...document,
        reviewStatus: document.file ? "accepted" : document.reviewStatus,
      })),
      comments: [...request.comments, {
        id: makeTimelineId("comment-staff-reviewed", now, request.comments.length),
        actorRole: "royal_college_staff",
        actorName,
        message: reviewNote.trim() || "ตรวจข้อมูลและเอกสารครบถ้วน พร้อมเลือก Signature Workflow",
        createdAt: nowIso,
      }],
    });
    try {
      appendAuditEvent({
        actor: session ? createAuditActorSnapshot(session) : { userId: "staff-unknown", userName: STAFF_NAME, role: "royal_college_staff", organisation: ORGANISATIONS.royalCollege, resourceScopes: ["*"] },
        action: "request.review_complete",
        resource: { type: "request", id: selectedRequest.id, label: selectedRequest.title },
        before: { documentStatus: "pending" },
        after: { documentStatus: "accepted", next: "signature_preparation" },
        reason: reviewNote.trim() || "ตรวจข้อมูลและเอกสารครบถ้วน",
        evidenceReference: selectedRequest.documents.flatMap((document) => document.file?.name ? [document.file.name] : []).join(", ") || selectedRequest.id,
        occurredAt: nowIso,
      });
    } catch {
      setReviewError("บันทึก User Audit Log ไม่สำเร็จ จึงยังไม่ยืนยันการตรวจเอกสาร");
      toast.error("ยังไม่ยืนยันการตรวจเอกสาร", { description: "กรุณาตรวจสอบพื้นที่จัดเก็บข้อมูลแล้วลองอีกครั้ง" });
      return;
    }
    updateRequest(selectedRequest.id, nextRequest);
    toast.success(`ตรวจความครบถ้วนของ ${selectedRequest.id} แล้ว`);
    closeDetail();
    router.push("/staff/signatures");
  };

  return (
    <PageShell size="wide" bottom="roomy" className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">จัดการคำร้อง</h1>
        <p className="mt-1 text-sm text-muted-foreground">ตรวจสอบรายละเอียด ขอข้อมูลเพิ่มเติม และส่งคำร้องที่ครบถ้วนให้ประธานลงนาม</p>
      </header>

      {storageError && (
        <div role="alert" className="flex gap-2 rounded-2xl border border-warning-border bg-warning-soft p-3 text-xs text-warning-on-soft"><span className="material-symbols-outlined text-lg">warning</span><span>{storageError}</span></div>
      )}

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-5" aria-label="สรุปจำนวนคำร้อง">
        {SUMMARY_CARDS.map((item) => (
          <Card key={item.status} className="border border-border bg-surface-raised"><CardContent className="flex items-center gap-3 px-4"><span className={`material-symbols-outlined flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${item.className}`}>{item.icon}</span><div><p className="text-xs text-muted-foreground">{item.label}</p><p className="mt-0.5 text-xl font-bold text-foreground">{visibleRequests.filter((request) => request.status === item.status).length}</p></div></CardContent></Card>
        ))}
      </section>

      <Card className="border border-border bg-surface-raised">
        <CardContent className="space-y-4 px-4 md:px-5">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <SegmentedFilterGroup aria-label="กรองสถานะคำร้อง">
              {FILTERS.map((item) => {
                const count = item.id === "all" ? visibleRequests.length : visibleRequests.filter((request) => request.status === item.id).length;
                return <SegmentedFilterButton key={item.id} active={filter === item.id} onClick={() => setFilter(item.id)}>{item.label} ({count})</SegmentedFilterButton>;
              })}
            </SegmentedFilterGroup>
            <div className="relative w-full lg:w-80"><span aria-hidden="true" className="material-symbols-outlined pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-lg text-muted-foreground">search</span><Input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="ค้นหาเลขที่ ชื่อสมาชิก หรือประเภท..." aria-label="ค้นหาคำร้อง" className="h-11 rounded-xl bg-surface-container-low pl-9 text-sm" /></div>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-border">
            <table className="w-full min-w-[860px] text-left text-sm">
              <thead className="bg-surface-container-low text-xs text-muted-foreground"><tr><th scope="col" className="px-4 py-3 font-medium">เลขที่คำร้อง</th><th scope="col" className="px-4 py-3 font-medium">ผู้ยื่นคำร้อง</th><th scope="col" className="px-4 py-3 font-medium">ประเภท / เรื่อง</th><th scope="col" className="px-4 py-3 font-medium">วันที่ยื่น</th><th scope="col" className="px-4 py-3 font-medium">สถานะ</th><th scope="col" className="px-4 py-3 text-right font-medium">จัดการ</th></tr></thead>
              <tbody className="divide-y divide-border">
                {!isReady ? (
                  <tr><td colSpan={6} className="px-4 py-14 text-center text-sm text-muted-foreground"><span className="material-symbols-outlined mr-2 animate-spin align-middle">progress_activity</span>กำลังโหลดคำร้อง</td></tr>
                ) : filteredRequests.map((request) => {
                  const status = REQUEST_STATUS_META[request.status];
                  return (
                    <tr key={request.id} className="transition-colors hover:bg-surface-container-low">
                      <td className="px-4 py-3 font-mono text-xs font-medium text-foreground">{request.id}</td>
                      <td className="px-4 py-3"><p className="font-medium text-foreground">{request.requester.name}</p><p className="mt-0.5 text-xs text-muted-foreground">{request.requester.memberId}</p></td>
                      <td className="max-w-xs px-4 py-3"><p className="text-xs text-muted-foreground">{request.typeLabel}</p><p className="mt-0.5 truncate font-medium text-foreground">{request.title}</p></td>
                      <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">{request.displayDate}</td>
                      <td className="px-4 py-3"><Badge variant={status.variant} className="h-auto py-1">{status.label}</Badge></td>
                      <td className="px-4 py-3 text-right"><Button variant="outline" size="sm" onClick={() => openDetail(request)}><span className="material-symbols-outlined text-base">visibility</span>ตรวจสอบ</Button></td>
                    </tr>
                  );
                })}
                {isReady && filteredRequests.length === 0 && (
                  <tr><td colSpan={6} className="px-4 py-14 text-center"><span className="material-symbols-outlined text-4xl text-muted-foreground">inbox</span><p className="mt-2 text-sm font-medium text-foreground">ไม่พบคำร้อง</p><p className="mt-1 text-xs text-muted-foreground">ลองเปลี่ยนสถานะหรือคำค้นหา</p></td></tr>
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
            <div className="space-y-1.5 border-t border-border pt-4">
              <label htmlFor="review-note" className="text-xs font-medium text-foreground">หมายเหตุจากผู้ตรวจสอบ <span className="ml-1 text-muted-foreground">(จำเป็นเมื่อขอข้อมูลเพิ่มหรือไม่อนุมัติ)</span></label>
              <Textarea id="review-note" value={reviewNote} onChange={(event) => { setReviewNote(event.target.value); if (reviewError) setReviewError(""); }} placeholder="ระบุผลการตรวจสอบหรือข้อมูลที่ต้องการเพิ่มเติม" aria-invalid={Boolean(reviewError)} aria-describedby={reviewError ? "review-note-error" : undefined} className="min-h-24 bg-surface-container-low" />
              {reviewError && <p id="review-note-error" role="alert" className="text-xs text-destructive">{reviewError}</p>}
            </div>
          )}
          <DialogFooter className="border-t border-border pt-4 sm:flex-wrap">
            <Button variant="outline" onClick={closeDetail}>ปิด</Button>
            {canReview && <Button variant="outline" className="border-info-border text-info-on-soft hover:bg-info-soft" onClick={() => reviewRequest("needs_information")}>ขอข้อมูลเพิ่มเติม</Button>}
            {canReject && <Button variant="destructive" onClick={() => reviewRequest("rejected")}>ไม่อนุมัติ</Button>}
            {canReview && <Button onClick={prepareForSignatureQueue}><span className="material-symbols-outlined text-base">forward</span>ตรวจครบแล้ว ไปจัดคิวลงนาม</Button>}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageShell>
  );
}
