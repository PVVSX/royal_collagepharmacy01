"use client";

import { useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useMockDb } from "@/providers/mock-db-provider";
import { PageShell } from "@/roles/shared/components/layout/PageShell";
import { LoadingState } from "@/roles/shared/components/workspace/WorkspacePrimitives";
import {
  SensitiveViewAuditBoundary,
  useSensitiveViewAudit,
} from "@/roles/shared/features/audit";
import { formatSubjectResultValue } from "@/roles/shared/features/academic";
import { registrationStatusMeta } from "@/roles/shared/features/registration";
import { usePortalSession } from "@/roles/shared/features/roles/use-portal-session";
import { StaffPageHeader } from "@/roles/staff/components/StaffPageHeader";

export default function StaffRegistrationOversightPage() {
  const { session, isReady: isSessionReady } = usePortalSession();
  const { registrations, subjectResults, academicStudents, courseOfferings, academicTeachers, isLoaded } = useMockDb();
  const [search, setSearch] = useState("");
  const filtered = useMemo(() => {
    const query = search.trim().toLocaleLowerCase("th-TH");
    return registrations.filter((registration) => !query || [registration.id, registration.studentName, registration.studentId, registration.courseCode, registration.courseTitle].some((value) => value.toLocaleLowerCase("th-TH").includes(query)));
  }, [registrations, search]);
  const resultAudit = useMemo(() => subjectResults.map((result) => {
    const student = academicStudents.find((item) => item.id === result.studentId);
    const offering = courseOfferings.find((item) => item.id === result.courseOfferingId);
    const teacher = academicTeachers.find((item) => item.id === result.teacherId);
    const latestRevision = result.revisions.at(-1);
    return {
      id: result.id,
      student: student?.name ?? result.studentId,
      course: offering?.courseCode ?? result.courseOfferingId,
      result: formatSubjectResultValue(result.currentValue ?? result.draftValue),
      state: result.status === "published" ? "ประกาศแล้ว" : result.status === "revised" ? "แก้ไขแล้ว" : result.status === "draft" ? "ฉบับร่าง" : "รอบันทึกผล",
      revision: result.status === "revised" && latestRevision?.previousValue
        ? `${formatSubjectResultValue(latestRevision.previousValue)} → ${formatSubjectResultValue(latestRevision.newValue)}`
        : "—",
      teacher: teacher?.name ?? result.teacherId,
    };
  }), [academicStudents, academicTeachers, courseOfferings, subjectResults]);
  const sensitiveViewAudit = useSensitiveViewAudit({
    enabled: isSessionReady && isLoaded && session?.role === "royal_college_staff",
    session,
    resource: {
      type: "registration_oversight",
      id: "royal-college-registration-and-results",
      label: "การลงทะเบียนและผลแบบผ่าน/ไม่ผ่านส่วนกลาง",
      organisationId: session?.organisation.id,
    },
  });

  if (!isSessionReady || !isLoaded) {
    return <PageShell size="full"><LoadingState label="กำลังโหลดข้อมูล Registration และ Audit" /></PageShell>;
  }

  return (
    <PageShell size="full" className="space-y-6">
      <StaffPageHeader title="Registration Oversight" description="ติดตามสถานะข้ามสถาบันเพื่อช่วยตรวจกรณีผิดปกติ โดยการตัดสินคำขอและผลแบบผ่าน/ไม่ผ่านยังเป็นหน้าที่ของอาจารย์" eyebrow="Read-only oversight" />
      <SensitiveViewAuditBoundary status={sensitiveViewAudit.status} onRetry={sensitiveViewAudit.retry}>
      <div className="rounded-2xl border border-info-border bg-info-soft p-4 text-sm text-info-on-soft"><strong>ขอบเขตการทำงาน:</strong> หน้านี้ไม่แสดงปุ่มอนุมัติ ปฏิเสธ หรือแก้ผล เจ้าหน้าที่ใช้ข้อมูลเพื่อประสานงานและ Audit เท่านั้น</div>
      <Card><CardHeader className="border-b border-border sm:flex-row sm:items-end sm:justify-between"><div><CardTitle>สถานะคำขอลงทะเบียน</CardTitle><p className="mt-1 text-xs text-muted-foreground">ข้อมูลจาก Registration Workflow กลาง</p></div><Input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="ค้นหานักศึกษา รายวิชา หรือรหัสคำขอ" aria-label="ค้นหาคำขอลงทะเบียน" className="mt-3 sm:mt-0 sm:w-80" /></CardHeader><CardContent className="px-0"><div className="overflow-x-auto"><table className="w-full min-w-[860px] text-left text-sm"><thead className="bg-muted/50 text-xs text-muted-foreground"><tr><th scope="col" className="px-5 py-3 font-medium">คำขอ</th><th scope="col" className="px-5 py-3 font-medium">นักศึกษา</th><th scope="col" className="px-5 py-3 font-medium">รายวิชา</th><th scope="col" className="px-5 py-3 font-medium">ภาคการศึกษา</th><th scope="col" className="px-5 py-3 font-medium">สถานะ</th><th scope="col" className="px-5 py-3 font-medium">อัปเดตล่าสุด</th></tr></thead><tbody className="divide-y divide-border">{filtered.map((registration) => <tr key={registration.id}><td className="px-5 py-3 font-mono text-xs font-medium">{registration.id}</td><td className="px-5 py-3"><p className="font-medium">{registration.studentName}</p><p className="text-xs text-muted-foreground">{registration.studentId}</p></td><td className="px-5 py-3"><p className="font-medium">{registration.courseCode}</p><p className="text-xs text-muted-foreground">{registration.courseTitle}</p></td><td className="px-5 py-3">{registration.term}</td><td className="px-5 py-3"><Badge variant={registrationStatusMeta[registration.status].variant}>{registrationStatusMeta[registration.status].label}</Badge></td><td className="px-5 py-3 text-xs text-muted-foreground">{new Date(registration.updatedAt).toLocaleString("th-TH", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Bangkok" })}</td></tr>)}</tbody></table>{filtered.length === 0 ? <div className="py-14 text-center"><span aria-hidden="true" className="material-symbols-outlined text-4xl text-muted-foreground">fact_check</span><p className="mt-2 text-sm font-medium">ไม่พบคำขอลงทะเบียน</p><p className="mt-1 text-xs text-muted-foreground">ข้อมูลอาจยังไม่ถูกส่งเข้าระบบหรือไม่ตรงกับคำค้นหา</p></div> : null}</div></CardContent></Card>
      <Card><CardHeader><CardTitle>ผลแบบผ่าน/ไม่ผ่านและประวัติการแก้ไข</CardTitle><p className="text-xs text-muted-foreground">มุมมองตรวจสอบย้อนหลังเท่านั้น การแก้ผลต้องทำโดยอาจารย์ที่ได้รับมอบหมาย</p></CardHeader><CardContent className="px-0"><div className="overflow-x-auto"><table className="w-full min-w-[760px] text-left text-sm"><thead className="bg-muted/50 text-xs text-muted-foreground"><tr><th scope="col" className="px-5 py-3 font-medium">นักศึกษา</th><th scope="col" className="px-5 py-3 font-medium">รายวิชา</th><th scope="col" className="px-5 py-3 font-medium">ผลล่าสุด</th><th scope="col" className="px-5 py-3 font-medium">สถานะ</th><th scope="col" className="px-5 py-3 font-medium">ประวัติการแก้ไข</th><th scope="col" className="px-5 py-3 font-medium">ผู้สอน</th></tr></thead><tbody className="divide-y divide-border">{resultAudit.map((result) => <tr key={result.id}><td className="px-5 py-3 font-medium">{result.student}</td><td className="px-5 py-3 font-mono text-xs">{result.course}</td><td className="px-5 py-3 font-semibold">{result.result}</td><td className="px-5 py-3"><Badge variant={result.state === "แก้ไขแล้ว" ? "warning" : result.state === "ประกาศแล้ว" ? "success" : "neutral"}>{result.state}</Badge></td><td className="px-5 py-3">{result.revision}</td><td className="px-5 py-3 text-muted-foreground">{result.teacher}</td></tr>)}</tbody></table></div></CardContent></Card>
      </SensitiveViewAuditBoundary>
    </PageShell>
  );
}
