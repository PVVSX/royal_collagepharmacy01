"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useMockDb } from "@/providers/mock-db-provider";
import { PageShell } from "@/roles/shared/components/layout/PageShell";
import { EmptyState, LoadingState, WorkspaceHeader } from "@/roles/shared/components/workspace/WorkspacePrimitives";
import { formatSubjectResultValue } from "@/roles/shared/features/academic";
import { usePortalSession } from "@/roles/shared/features/roles/use-portal-session";

function formatDateTime(value?: string) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("th-TH", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Bangkok" }).format(new Date(value));
}

export default function MemberResultsPage() {
  const db = useMockDb();
  const { session, isReady } = usePortalSession();
  if (!db.isLoaded || !isReady) return <PageShell><LoadingState label="กำลังโหลดผลการเรียน" /></PageShell>;

  const memberId = session?.role === "student" ? session.userId : "";
  const enrolledRegistrations = db.registrations.filter((item) => item.studentId === memberId && item.status === "enrolled");
  const visibleResults = db.subjectResults.filter((item) => (
    item.studentId === memberId && (item.status === "published" || item.status === "revised")
  ));
  const pendingCount = enrolledRegistrations.filter((registration) => (
    !visibleResults.some((result) => result.courseOfferingId === registration.courseOfferingId)
  )).length;

  return <PageShell className="space-y-6"><WorkspaceHeader eyebrow="My academic results" title="ผลการเรียนแบบผ่าน/ไม่ผ่าน" description="แสดงเฉพาะผลล่าสุดที่อาจารย์ประกาศแล้ว และแจ้งเมื่อมีการแก้ไขผล" /><div className="grid gap-3 sm:grid-cols-3"><Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">ประกาศผลแล้ว</p><p className="mt-1 text-2xl font-bold text-foreground">{visibleResults.length}</p></CardContent></Card><Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">รอประกาศผล</p><p className="mt-1 text-2xl font-bold text-warning">{pendingCount}</p></CardContent></Card><Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">มีการแก้ไข</p><p className="mt-1 text-2xl font-bold text-info">{visibleResults.filter((item) => item.status === "revised").length}</p></CardContent></Card></div><Card className="border-border"><CardHeader><CardTitle className="text-base">ผลรายวิชา</CardTitle></CardHeader><CardContent className="p-0"><div className="overflow-x-auto"><Table><TableHeader><TableRow><TableHead scope="col">รายวิชา</TableHead><TableHead scope="col">ภาคการศึกษา</TableHead><TableHead scope="col">ผลล่าสุด</TableHead><TableHead scope="col">สถานะ</TableHead><TableHead scope="col">วันประกาศ</TableHead></TableRow></TableHeader><TableBody>{visibleResults.map((result) => { const offering = db.courseOfferings.find((item) => item.id === result.courseOfferingId); return <TableRow key={result.id}><TableCell><p className="font-medium">{offering?.courseCode ?? result.courseOfferingId}</p><p className="text-xs text-muted-foreground">{offering?.courseTitle}</p></TableCell><TableCell>{offering?.term ?? "—"}</TableCell><TableCell><span className="text-base font-bold text-primary">{formatSubjectResultValue(result.currentValue)}</span></TableCell><TableCell>{result.status === "revised" ? <Badge variant="info">แก้ไขแล้ว</Badge> : <Badge variant="success">ประกาศแล้ว</Badge>}</TableCell><TableCell className="text-sm text-muted-foreground">{formatDateTime(result.publishedAt)}</TableCell></TableRow>; })}</TableBody></Table></div>{visibleResults.length === 0 ? <div className="p-5"><EmptyState icon="fact_check" title="ยังไม่มีผลที่ประกาศ" description="ผลจะปรากฏเมื่ออาจารย์ประจำรายวิชาประกาศแล้ว" /></div> : null}</CardContent></Card>{visibleResults.filter((item) => item.status === "revised").map((result) => { const offering = db.courseOfferings.find((item) => item.id === result.courseOfferingId); const latestRevision = result.revisions.at(-1); return <Card key={`${result.id}-revision`} className="border-info-border bg-info-soft"><CardContent className="p-5"><div className="flex items-start gap-3"><span aria-hidden="true" className="material-symbols-outlined text-info-on-soft">history</span><div><div className="flex flex-wrap items-center gap-2"><h2 className="font-semibold text-info-on-soft">{offering?.courseCode} มีการแก้ไขผล</h2><Badge variant="info">ผลล่าสุด {formatSubjectResultValue(result.currentValue)}</Badge></div><p className="mt-2 text-sm text-info-on-soft">ผลเดิม {formatSubjectResultValue(latestRevision?.previousValue)} → ผลใหม่ {formatSubjectResultValue(latestRevision?.newValue ?? result.currentValue)}</p><p className="mt-1 text-xs text-info-on-soft/80">เหตุผล: {latestRevision?.reason ?? "ปรับปรุงตามการทบทวนผล"} · {formatDateTime(latestRevision?.createdAt)}</p></div></div></CardContent></Card>; })}</PageShell>;
}
