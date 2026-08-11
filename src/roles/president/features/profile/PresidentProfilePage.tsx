"use client";

import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { usePresidentAccess } from "@/roles/president/president-access";
import {
  formatAssignmentPeriod,
  isRoleAssignmentActive,
} from "@/roles/shared/features/roles/role-assignment";
import { useRoleAssignmentStore } from "@/roles/shared/features/roles/role-assignment-store";

export default function PresidentProfilePage() {
  const { assignment } = usePresidentAccess();
  const { assignments, isReady, storageError } = useRoleAssignmentStore();
  const [clock] = useState(() => new Date());
  const collegeTerms = assignments
    .filter((item) => item.role === "college_president" && item.collegeCode === assignment?.collegeCode)
    .sort((left, right) => right.startsAt.localeCompare(left.startsAt));

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6">
      <header><h1 className="text-2xl font-bold tracking-tight">ข้อมูลวาระและโปรไฟล์</h1><p className="mt-1 text-sm text-muted-foreground">สิทธิ์ลงนามมีผลเฉพาะช่วงวาระที่ผู้ดูแลระบบกำหนด</p></header>
      {storageError && <div role="alert" className="rounded-2xl border border-warning-border bg-warning-soft p-3 text-xs text-warning-on-soft">{storageError}</div>}
      {assignment && <Card><CardContent className="space-y-5 px-5 md:px-6"><div className="flex flex-col gap-4 sm:flex-row sm:items-center"><div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-brand-soft"><span className="material-symbols-outlined text-3xl text-brand-on-soft">account_balance</span></div><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><h2 className="text-xl font-semibold">{assignment.userName}</h2><Badge variant="success" className="h-auto py-1">วาระปัจจุบัน</Badge></div><p className="mt-1 text-sm text-muted-foreground">ประธาน{assignment.collegeName}</p></div></div><dl className="grid gap-4 rounded-2xl bg-muted/50 p-4 sm:grid-cols-2"><div><dt className="text-xs text-muted-foreground">อีเมล</dt><dd className="mt-1 break-all text-sm font-medium">{assignment.email}</dd></div><div><dt className="text-xs text-muted-foreground">รหัสผู้ดำรงตำแหน่ง</dt><dd className="mt-1 font-mono text-sm font-medium">{assignment.userId}</dd></div><div><dt className="text-xs text-muted-foreground">วิทยาลัย</dt><dd className="mt-1 text-sm font-medium">{assignment.collegeCode} - {assignment.collegeName}</dd></div><div><dt className="text-xs text-muted-foreground">ช่วงวาระ</dt><dd className="mt-1 text-sm font-medium">{formatAssignmentPeriod(assignment)}</dd></div><div className="sm:col-span-2"><dt className="text-xs text-muted-foreground">แต่งตั้งโดย</dt><dd className="mt-1 text-sm font-medium">{assignment.appointedBy}</dd></div></dl></CardContent></Card>}
      <Card><CardContent className="space-y-4 px-5 md:px-6"><div><h2 className="text-base font-semibold">ประวัติวาระของวิทยาลัย</h2><p className="mt-1 text-xs text-muted-foreground">ระบบเลือกผู้มีสิทธิ์จากวันเริ่มต้นและวันสิ้นสุดโดยอัตโนมัติ</p></div>{!isReady ? <div className="flex min-h-32 items-center justify-center gap-2 text-sm text-muted-foreground"><span className="material-symbols-outlined animate-spin">progress_activity</span>กำลังโหลดวาระ</div> : collegeTerms.length === 0 ? <div className="py-10 text-center text-sm text-muted-foreground">ไม่พบข้อมูลวาระ</div> : <div className="space-y-2">{collegeTerms.map((term) => { const active = isRoleAssignmentActive(term, clock); const expired = new Date(term.endsAt).getTime() <= clock.getTime(); return <div key={term.id} className="flex flex-col gap-2 rounded-2xl border border-border p-4 sm:flex-row sm:items-center sm:justify-between"><div className="min-w-0"><p className="truncate text-sm font-medium">{term.userName}</p><p className="mt-1 text-xs text-muted-foreground">{formatAssignmentPeriod(term)}</p></div><Badge variant={active ? "success" : expired ? "secondary" : "info"} className="h-auto self-start py-1 sm:self-auto">{active ? "ปัจจุบัน" : expired ? "สิ้นสุดแล้ว" : "วาระถัดไป"}</Badge></div>; })}</div>}</CardContent></Card>
    </div>
  );
}
