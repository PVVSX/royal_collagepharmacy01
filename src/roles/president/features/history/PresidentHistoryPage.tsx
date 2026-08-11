"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { usePresidentAccess } from "@/roles/president/president-access";
import { REQUEST_STATUS_META } from "@/roles/shared/features/requests/request-schema";
import { useRequestStore } from "@/roles/shared/features/requests/request-store";
import { isPresidentFinalizedRequest } from "@/roles/president/features/signatures/president-signature";

function finalDecisionAt(request: { updatedAt: string; events: { actorRole: string; type: string; createdAt: string }[] }) {
  return [...request.events].reverse().find((event) => event.actorRole === "president" && (event.type === "signed" || event.type === "rejected"))?.createdAt ?? request.updatedAt;
}

function formatDateTime(value: string) {
  return new Date(value).toLocaleString("th-TH", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Bangkok" });
}

export default function PresidentHistoryPage() {
  const { assignment } = usePresidentAccess();
  const { requests, isReady, storageError } = useRequestStore();
  const [search, setSearch] = useState("");
  const history = useMemo(() => {
    const query = search.trim().toLocaleLowerCase("th-TH");
    return requests
      .filter((request) => request.collegeCode === assignment?.collegeCode)
      .filter(isPresidentFinalizedRequest)
      .filter((request) => !query || [request.id, request.title, request.requester.name, request.mockSignature?.documentFingerprint ?? ""].some((value) => value.toLocaleLowerCase("th-TH").includes(query)))
      .sort((left, right) => finalDecisionAt(right).localeCompare(finalDecisionAt(left)));
  }, [assignment?.collegeCode, requests, search]);

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <header><h1 className="text-2xl font-bold tracking-tight">ประวัติการพิจารณา</h1><p className="mt-1 text-sm text-muted-foreground">คำร้องที่ประธานของ {assignment?.collegeCode} ลงนามหรือไม่อนุมัติแล้ว</p></header>
      {storageError && <div role="alert" className="rounded-2xl border border-warning-border bg-warning-soft p-3 text-xs text-warning-on-soft">{storageError}</div>}
      <Card><CardContent className="space-y-4 px-4 md:px-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><h2 className="text-base font-semibold">รายการย้อนหลัง</h2><p className="mt-1 text-xs text-muted-foreground">{isReady ? `${history.length} รายการ` : "กำลังโหลด"}</p></div><div className="relative w-full sm:w-80"><span className="material-symbols-outlined pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-lg text-muted-foreground">search</span><Input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="ค้นหาเลขที่ ชื่อ หรือรหัสอ้างอิง" aria-label="ค้นหาประวัติการพิจารณา" className="pl-9" /></div></div>
        <div className="overflow-x-auto rounded-2xl border border-border"><table className="w-full min-w-[840px] text-left text-sm"><thead className="bg-muted/50 text-xs text-muted-foreground"><tr><th className="px-4 py-3 font-medium">เลขที่คำร้อง</th><th className="px-4 py-3 font-medium">ผู้ยื่น</th><th className="px-4 py-3 font-medium">เรื่อง</th><th className="px-4 py-3 font-medium">ผลการพิจารณา</th><th className="px-4 py-3 font-medium">วันเวลา</th><th className="px-4 py-3 font-medium">รหัสอ้างอิง</th><th className="px-4 py-3 text-right font-medium">ดูข้อมูล</th></tr></thead><tbody className="divide-y divide-border">
          {!isReady ? <tr><td colSpan={7} className="px-4 py-14 text-center text-muted-foreground"><span className="material-symbols-outlined mr-2 animate-spin align-middle">progress_activity</span>กำลังโหลดประวัติ</td></tr> : history.map((request) => <tr key={request.id} className="hover:bg-muted/30"><td className="px-4 py-3 font-mono text-xs font-medium">{request.id}</td><td className="px-4 py-3"><p className="font-medium">{request.requester.name}</p><p className="text-xs text-muted-foreground">{request.requester.memberId}</p></td><td className="max-w-xs px-4 py-3"><p className="truncate font-medium">{request.title}</p><p className="text-xs text-muted-foreground">{request.typeLabel}</p></td><td className="px-4 py-3"><Badge variant={REQUEST_STATUS_META[request.status].variant} className="h-auto py-1">{REQUEST_STATUS_META[request.status].label}</Badge></td><td className="whitespace-nowrap px-4 py-3 text-xs text-muted-foreground">{formatDateTime(finalDecisionAt(request))}</td><td className="px-4 py-3 font-mono text-xs text-muted-foreground">{request.mockSignature?.documentFingerprint ?? "-"}</td><td className="px-4 py-3 text-right"><Button asChild variant="outline" size="sm"><Link href={`/president/signatures/${encodeURIComponent(request.id)}`}>รายละเอียด</Link></Button></td></tr>)}
          {isReady && history.length === 0 && <tr><td colSpan={7} className="px-4 py-14 text-center"><span className="material-symbols-outlined text-4xl text-muted-foreground">history</span><p className="mt-2 text-sm font-medium">ยังไม่มีประวัติการพิจารณา</p><p className="mt-1 text-xs text-muted-foreground">รายการจะปรากฏหลังลงนามหรือบันทึกผลไม่อนุมัติ</p></td></tr>}
        </tbody></table></div>
      </CardContent></Card>
    </div>
  );
}
