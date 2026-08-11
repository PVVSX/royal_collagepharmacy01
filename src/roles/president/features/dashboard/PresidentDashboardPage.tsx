"use client";

import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { usePresidentAccess } from "@/roles/president/president-access";
import { REQUEST_STATUS_META } from "@/roles/shared/features/requests/request-schema";
import { useRequestStore } from "@/roles/shared/features/requests/request-store";
import { formatAssignmentPeriod } from "@/roles/shared/features/roles/role-assignment";
import {
  isPresidentFinalizedRequest,
  selectAwaitingSignatureRequests,
} from "@/roles/president/features/signatures/president-signature";

export default function PresidentDashboardPage() {
  const { assignment, storageError: assignmentError } = usePresidentAccess();
  const { requests, isReady, storageError } = useRequestStore();
  const collegeRequests = requests.filter((request) => request.collegeCode === assignment?.collegeCode);
  const pending = selectAwaitingSignatureRequests(requests, assignment?.collegeCode ?? "");
  const presidentHistory = collegeRequests.filter(isPresidentFinalizedRequest);
  const signed = presidentHistory.filter((request) => request.status === "signed");
  const rejectedByPresident = presidentHistory.filter((request) => request.status === "rejected");

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <p className="text-sm text-muted-foreground">ยินดีต้อนรับ</p>
          <h1 className="mt-1 truncate text-2xl font-bold tracking-tight text-foreground">{assignment?.userName}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{assignment?.collegeName}</p>
        </div>
        {assignment && <Badge variant="success" className="h-auto self-start py-1.5 sm:self-auto">{formatAssignmentPeriod(assignment)}</Badge>}
      </header>

      {(storageError || assignmentError) && (
        <div role="alert" className="flex gap-2 rounded-2xl border border-warning-border bg-warning-soft p-3 text-xs text-warning-on-soft"><span className="material-symbols-outlined text-lg">warning</span><span>{storageError || assignmentError}</span></div>
      )}

      <section className="grid gap-3 sm:grid-cols-3" aria-label="สรุปคำร้อง">
        {[
          { label: "รอลงนาม", value: pending.length, icon: "pending_actions", color: "bg-warning-soft text-warning-on-soft" },
          { label: "ลงนามแล้ว", value: signed.length, icon: "verified", color: "bg-success-soft text-success-on-soft" },
          { label: "ไม่อนุมัติโดยประธาน", value: rejectedByPresident.length, icon: "cancel", color: "bg-danger-soft text-danger" },
        ].map((item) => (
          <Card key={item.label}><CardContent className="flex items-center gap-4 px-5"><span className={`material-symbols-outlined flex h-12 w-12 items-center justify-center rounded-2xl text-2xl ${item.color}`}>{item.icon}</span><div><p className="text-sm text-muted-foreground">{item.label}</p><p className="mt-1 text-2xl font-bold text-foreground">{isReady ? item.value : "-"}</p></div></CardContent></Card>
        ))}
      </section>

      <Card>
        <CardContent className="space-y-4 px-4 md:px-5">
          <div className="flex items-center justify-between gap-3"><div><h2 className="text-base font-semibold text-foreground">คำร้องเร่งดำเนินการ</h2><p className="mt-1 text-xs text-muted-foreground">เรียงจากรายการที่รอนานที่สุด</p></div><Button asChild variant="outline" size="sm"><Link href="/president/signatures">ดูทั้งหมด</Link></Button></div>
          {!isReady ? (
            <div className="flex min-h-44 items-center justify-center gap-2 text-sm text-muted-foreground" role="status"><span className="material-symbols-outlined animate-spin">progress_activity</span>กำลังโหลดรายการ</div>
          ) : pending.length === 0 ? (
            <div className="flex min-h-44 flex-col items-center justify-center text-center"><span className="material-symbols-outlined text-4xl text-muted-foreground">task_alt</span><p className="mt-2 text-sm font-medium text-foreground">ไม่มีคำร้องรอลงนาม</p><p className="mt-1 text-xs text-muted-foreground">คำร้องใหม่จะแสดงเมื่อเจ้าหน้าที่ตรวจสอบครบถ้วนแล้ว</p></div>
          ) : (
            <div className="space-y-2">
              {[...pending].sort((left, right) => left.createdAt.localeCompare(right.createdAt)).slice(0, 5).map((request) => (
                <Link key={request.id} href={`/president/signatures/${encodeURIComponent(request.id)}`} className="flex min-w-0 items-center gap-3 rounded-2xl border border-border p-3 transition-colors hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                  <span className="material-symbols-outlined text-primary">description</span><div className="min-w-0 flex-1"><p className="truncate text-sm font-medium text-foreground">{request.title}</p><p className="mt-0.5 truncate text-xs text-muted-foreground">{request.id} · {request.requester.name}</p></div><Badge variant={REQUEST_STATUS_META[request.status].variant} className="hidden h-auto py-1 sm:inline-flex">{REQUEST_STATUS_META[request.status].label}</Badge><span className="material-symbols-outlined text-muted-foreground">chevron_right</span>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
