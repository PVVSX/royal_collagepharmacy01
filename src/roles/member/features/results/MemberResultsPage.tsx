"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useMockDb } from "@/providers/mock-db-provider";
import { PageShell } from "@/roles/shared/components/layout/PageShell";
import { EmptyState, LoadingState } from "@/roles/shared/components/workspace/WorkspacePrimitives";
import { formatSubjectResultValue } from "@/roles/shared/features/academic";
import { usePortalSession } from "@/roles/shared/features/roles/use-portal-session";

function formatDateTime(value?: string) {
  return value ? new Intl.DateTimeFormat("th-TH", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Bangkok" }).format(new Date(value)) : "—";
}

export default function MemberResultsPage() {
  const db = useMockDb();
  const { session, isReady } = usePortalSession();
  if (!db.isLoaded || !isReady) return <PageShell><LoadingState label="กำลังโหลดผลการประเมิน" /></PageShell>;
  const memberId = session?.userId ?? "";
  const enrolled = db.registrations.filter((item) => item.studentId === memberId && item.status === "enrolled");
  const results = db.subjectResults.filter((item) => item.studentId === memberId && (item.status === "published" || item.status === "revised"));
  const pending = enrolled.filter((registration) => !results.some((result) => result.courseOfferingId === registration.courseOfferingId)).length;

  return <PageShell className="space-y-6"><header><h1 className="text-2xl font-bold">ผลการประเมินรายวิชา</h1><p className="mt-1 text-sm text-muted-foreground">แสดงผลล่าสุดที่ประกาศอย่างเป็นทางการและประวัติการแก้ไข</p></header><section className="grid gap-3 sm:grid-cols-3" aria-label="สรุปผลการประเมิน">{[{ label: "ประกาศผลแล้ว", value: results.length }, { label: "อยู่ระหว่างดำเนินการ", value: pending }, { label: "รายการที่มีการแก้ไข", value: results.filter((item) => item.status === "revised").length }].map((item) => <Card key={item.label}><CardContent className="p-4"><p className="text-xs text-muted-foreground">{item.label}</p><p className="mt-1 text-2xl font-bold">{item.value}</p></CardContent></Card>)}</section><Card><CardHeader><CardTitle className="text-lg">ผลรายวิชา</CardTitle></CardHeader><CardContent className="p-0"><div className="overflow-x-auto"><Table className="min-w-[760px]"><TableHeader><TableRow><TableHead>รายวิชา</TableHead><TableHead>ภาคการศึกษา</TableHead><TableHead>ผลการประเมิน</TableHead><TableHead>สถานะ</TableHead><TableHead>วันที่ประกาศ</TableHead><TableHead>ขั้นตอนถัดไป</TableHead></TableRow></TableHeader><TableBody>{results.map((result) => { const offering = db.courseOfferings.find((item) => item.id === result.courseOfferingId); const didNotPass = result.currentValue === "U"; return <TableRow key={result.id}><TableCell><p className="font-medium">{offering?.courseCode ?? result.courseOfferingId}</p><p className="mt-1 text-xs text-muted-foreground">{offering?.courseTitle}</p></TableCell><TableCell>{offering?.term ?? "—"}</TableCell><TableCell><strong className={didNotPass ? "text-danger" : "text-success"}>{formatSubjectResultValue(result.currentValue)}</strong></TableCell><TableCell><Badge variant={result.status === "revised" ? "info" : "success"}>{result.status === "revised" ? "แก้ไขแล้ว" : "ประกาศแล้ว"}</Badge></TableCell><TableCell>{formatDateTime(result.publishedAt ?? result.updatedAt)}</TableCell><TableCell className="max-w-xs whitespace-normal text-sm text-muted-foreground">{didNotPass ? "รอประกาศแนวทางดำเนินการสำหรับรายวิชานี้" : "ไม่มีรายการที่ต้องดำเนินการ"}</TableCell></TableRow>; })}</TableBody></Table></div>{results.length === 0 && <div className="p-5"><EmptyState title="ยังไม่มีผลที่ประกาศ" description="ผลจะแสดงเมื่อกระบวนการประกาศเสร็จสมบูรณ์" /></div>}</CardContent></Card></PageShell>;
}
