"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useMockDb } from "@/providers/mock-db-provider";
import { PageShell } from "@/roles/shared/components/layout/PageShell";
import {
  EmptyState,
  LoadingState,
  MetricCard,
  ScopeBadge,
  WorkspaceHeader,
} from "@/roles/shared/components/workspace/WorkspacePrimitives";
import {
  formatSubjectResultValue,
  isAcademicAffiliationActive,
  isAcademicAssignmentActive,
  selectInstitutionStudents,
  selectInstitutionTeachers,
  type AcademicActor,
} from "@/roles/shared/features/academic";
import {
  SensitiveViewAuditBoundary,
  useSensitiveViewAudit,
} from "@/roles/shared/features/audit";
import { usePortalSession } from "@/roles/shared/features/roles/use-portal-session";
import InstitutionResourceManagement from "./InstitutionResourceManagement";

type InstitutionSection = "dashboard" | "students" | "teachers" | "assignments" | "courses" | "registrations" | "results";

function formatDate(value?: string) {
  if (!value) return "ปัจจุบัน";
  return new Intl.DateTimeFormat("th-TH", { dateStyle: "medium", timeZone: "Asia/Bangkok" }).format(new Date(value));
}

export default function InstitutionWorkspacePage({ section }: { section: InstitutionSection }) {
  const { session, isReady: isSessionReady } = usePortalSession();
  const db = useMockDb();
  const [query, setQuery] = useState("");
  const [teacherId, setTeacherId] = useState("");
  const [courseOfferingId, setCourseOfferingId] = useState("");
  const [startsAt, setStartsAt] = useState("2026-08-01");
  const [endsAt, setEndsAt] = useState("");
  const [formError, setFormError] = useState("");

  const institutionId = session?.role === "institution_admin" ? session.organisation.id : "";
  const institution = db.academicInstitutions.find((item) => item.id === institutionId);
  const studentAffiliations = useMemo(() => db.studentAffiliations.filter((item) => item.institutionId === institutionId), [db.studentAffiliations, institutionId]);
  const teacherAffiliations = useMemo(() => db.teacherAffiliations.filter((item) => item.institutionId === institutionId), [db.teacherAffiliations, institutionId]);
  const activeStudentAffiliations = studentAffiliations.filter((item) => isAcademicAffiliationActive(item));
  const activeTeacherAffiliations = teacherAffiliations.filter((item) => isAcademicAffiliationActive(item));
  const students = selectInstitutionStudents(db.academicStudents, studentAffiliations, institutionId);
  const teachers = selectInstitutionTeachers(db.academicTeachers, teacherAffiliations, institutionId);
  const offerings = db.courseOfferings.filter((item) => item.institutionId === institutionId);
  const offeringIds = useMemo(() => new Set(offerings.map((item) => item.id)), [offerings]);
  const assignments = db.teachingAssignments.filter((item) => (
    item.institutionId === institutionId &&
    offeringIds.has(item.courseOfferingId) &&
    isAcademicAssignmentActive(item)
  ));
  const registrations = db.registrations.filter((item) => item.institutionId === institutionId && Boolean(item.courseOfferingId && offeringIds.has(item.courseOfferingId)));
  const results = db.subjectResults.filter((item) => offeringIds.has(item.courseOfferingId));
  const actor: AcademicActor | null = session ? { userId: session.userId, userName: session.displayName, role: session.role, organisationId: session.organisation.id } : null;
  const isSensitiveSection = section === "students" || section === "registrations" || section === "results";
  const sensitiveViewAudit = useSensitiveViewAudit({
    enabled: isSessionReady && db.isLoaded && isSensitiveSection && Boolean(institution),
    session,
    resource: {
      type: `institution_${section}`,
      id: `${institutionId || "unresolved-institution"}:${section}`,
      label: institution ? `${section} · ${institution.name}` : "ข้อมูลภายในสถาบัน",
      organisationId: institutionId || undefined,
    },
  });

  if (!isSessionReady || !db.isLoaded) return <PageShell size="full"><LoadingState label="กำลังตรวจสอบ Institution Scope" /></PageShell>;

  const submitAssignment = (event: React.FormEvent) => {
    event.preventDefault();
    if (!teacherId || !courseOfferingId || !startsAt || !actor) {
      setFormError("กรุณาเลือกอาจารย์ รายวิชา และวันเริ่มมอบหมาย");
      return;
    }
    const teacherInScope = activeTeacherAffiliations.some((item) => item.teacherId === teacherId);
    const courseInScope = offerings.some((item) => item.id === courseOfferingId);
    if (!teacherInScope || !courseInScope) {
      setFormError("อาจารย์หรือรายวิชาอยู่นอก Institution Scope");
      return;
    }
    try {
      db.assignTeacherToCourse({ teacherId, courseOfferingId, actor, startsAt: new Date(startsAt).toISOString(), endsAt: endsAt ? new Date(endsAt).toISOString() : undefined });
      toast.success("มอบหมายอาจารย์ให้รายวิชาแล้ว");
      setTeacherId(""); setCourseOfferingId(""); setEndsAt(""); setFormError("");
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "ไม่สามารถบันทึก Teaching Assignment ได้");
    }
  };

  const renderDashboard = () => <><WorkspaceHeader eyebrow="Institution workspace" title="ภาพรวมสถาบัน" description={`ติดตามข้อมูลภายใต้ ${institution?.name ?? "สถาบันของคุณ"} โดยไม่ตัดสิน Registration หรือผลแทนอาจารย์`} action={{ href: "/institution/assignments", label: "จัด Teaching Assignment", icon: "assignment_ind" }} /><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><MetricCard label="ผู้เรียนในสถาบัน" value={students.length} note="ตาม Student Affiliation" icon="school" /><MetricCard label="อาจารย์ในสถาบัน" value={teachers.length} note="ตาม Teacher Affiliation" icon="co_present" /><MetricCard label="รายวิชาและรุ่นเรียน" value={offerings.length} note="เฉพาะที่สถาบันเปิด" icon="menu_book" /><MetricCard label="รอตรวจลงทะเบียน" value={registrations.filter((item) => item.status === "pending").length} note="อาจารย์ผู้รับผิดชอบเป็นผู้พิจารณา" icon="pending_actions" emphasis="warning" /></div><div className="grid gap-6 lg:grid-cols-2"><Card className="border-border"><CardHeader><CardTitle className="text-lg">สถานะ Registration</CardTitle></CardHeader><CardContent className="space-y-3">{["pending", "needs_info", "awaiting_payment", "enrolled"].map((status) => <div key={status} className="flex items-center justify-between rounded-xl bg-muted/40 px-4 py-3"><span className="text-sm text-muted-foreground">{status}</span><span className="font-semibold tabular-nums">{registrations.filter((item) => item.status === status).length}</span></div>)}</CardContent></Card><Card className="border-border"><CardHeader><CardTitle className="text-lg">สถานะผลแบบผ่าน/ไม่ผ่าน</CardTitle></CardHeader><CardContent className="space-y-3">{["pending", "draft", "published", "revised"].map((status) => <div key={status} className="flex items-center justify-between rounded-xl bg-muted/40 px-4 py-3"><span className="text-sm text-muted-foreground">{status}</span><span className="font-semibold tabular-nums">{results.filter((item) => item.status === status).length}</span></div>)}</CardContent></Card></div></>;

  const renderStudents = () => { const visible = students.filter((student) => `${student.name} ${student.id} ${student.licenseNumber}`.toLowerCase().includes(query.toLowerCase())); return <><WorkspaceHeader eyebrow="Institution scope" title="ผู้เข้ารับการฝึกอบรมในสถาบัน" description="เห็นเฉพาะผู้เรียนที่มี Student Affiliation ซึ่งยังมีผลในสถาบันปัจจุบัน" /><Card className="border-border"><CardHeader className="gap-3 sm:flex-row sm:items-center sm:justify-between"><CardTitle className="text-lg">รายชื่อผู้เรียน</CardTitle><Input aria-label="ค้นหาผู้เรียน" placeholder="ค้นหาชื่อ รหัส หรือเลขใบอนุญาต" value={query} onChange={(event) => setQuery(event.target.value)} className="sm:max-w-xs" /></CardHeader><CardContent className="p-0"><Table><TableHeader><TableRow><TableHead>รหัส</TableHead><TableHead>ชื่อ</TableHead><TableHead>เลขใบอนุญาต</TableHead><TableHead>Affiliation</TableHead><TableHead>สถานะ</TableHead></TableRow></TableHeader><TableBody>{visible.map((student) => { const affiliation = activeStudentAffiliations.find((item) => item.studentId === student.id); return <TableRow key={student.id}><TableCell>{student.id}</TableCell><TableCell className="font-medium">{student.name}</TableCell><TableCell>{student.licenseNumber}</TableCell><TableCell><p className="text-sm">{formatDate(affiliation?.startsAt)} – {formatDate(affiliation?.endsAt)}</p></TableCell><TableCell><Badge variant="success">มีผล</Badge></TableCell></TableRow>; })}</TableBody></Table>{visible.length === 0 ? <div className="p-5"><EmptyState title="ไม่พบผู้เรียน" description="ไม่มีผู้เรียนใน Institution Scope ที่ตรงกับคำค้น" /></div> : null}</CardContent></Card></>; };

  const renderTeachers = () => <><WorkspaceHeader eyebrow="Institution scope" title="อาจารย์ในสถาบัน" description="แสดง Teacher Affiliation ที่ยังมีผล ซึ่งเป็นเงื่อนไขก่อนมอบหมายรายวิชา" /><div className="grid gap-4 md:grid-cols-2">{teachers.map((teacher) => { const teacherAssignments = assignments.filter((item) => item.teacherId === teacher.id); return <Card key={teacher.id} className="border-border"><CardContent className="p-5"><div className="flex items-start justify-between"><div><h2 className="font-semibold">{teacher.name}</h2><p className="mt-1 text-xs text-muted-foreground">{teacher.id}</p></div><Badge variant="success">อยู่ในสถาบัน</Badge></div><p className="mt-4 text-sm text-muted-foreground">ได้รับมอบหมาย {teacherAssignments.length} รายวิชา</p></CardContent></Card>; })}</div>{teachers.length === 0 ? <EmptyState title="ยังไม่มีอาจารย์ในสถาบัน" description="เพิ่ม Teacher Affiliation ก่อนสร้าง Teaching Assignment" /> : null}</>;

  const renderAssignments = () => <><WorkspaceHeader eyebrow="Teaching assignment" title="มอบหมายอาจารย์ให้รายวิชา" description="การมอบหมายมีผลเฉพาะอาจารย์และรายวิชาภายในสถาบันเดียวกัน" /><div className="grid gap-6 xl:grid-cols-[22rem_minmax(0,1fr)]"><Card className="h-fit border-border"><CardHeader><CardTitle className="text-lg">เพิ่ม Assignment</CardTitle></CardHeader><CardContent><form onSubmit={submitAssignment} className="space-y-4" noValidate>{formError ? <div id="assignment-error" role="alert" className="rounded-xl border border-danger-border bg-danger-soft p-3 text-sm text-danger">{formError}</div> : null}<div className="space-y-1.5"><label htmlFor="assignment-teacher" className="text-sm font-medium">อาจารย์</label><select id="assignment-teacher" value={teacherId} onChange={(event) => { setTeacherId(event.target.value); setFormError(""); }} aria-invalid={Boolean(formError && !teacherId)} aria-describedby={formError ? "assignment-error" : undefined} className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm"><option value="">เลือกอาจารย์</option>{teachers.map((teacher) => <option key={teacher.id} value={teacher.id}>{teacher.name}</option>)}</select></div><div className="space-y-1.5"><label htmlFor="assignment-course" className="text-sm font-medium">รายวิชาและรุ่นเรียน</label><select id="assignment-course" value={courseOfferingId} onChange={(event) => { setCourseOfferingId(event.target.value); setFormError(""); }} aria-invalid={Boolean(formError && !courseOfferingId)} aria-describedby={formError ? "assignment-error" : undefined} className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm"><option value="">เลือกรายวิชา</option>{offerings.map((offering) => <option key={offering.id} value={offering.id}>{offering.courseCode} · รุ่น {offering.section}</option>)}</select></div><div className="grid grid-cols-2 gap-3"><div className="space-y-1.5"><label htmlFor="assignment-start" className="text-sm font-medium">เริ่ม</label><Input id="assignment-start" type="date" value={startsAt} onChange={(event) => setStartsAt(event.target.value)} /></div><div className="space-y-1.5"><label htmlFor="assignment-end" className="text-sm font-medium">สิ้นสุด (ถ้ามี)</label><Input id="assignment-end" type="date" value={endsAt} onChange={(event) => setEndsAt(event.target.value)} /></div></div><Button type="submit" className="w-full">บันทึก Assignment</Button></form></CardContent></Card><Card className="border-border"><CardHeader><CardTitle className="text-lg">Teaching Assignment ปัจจุบัน</CardTitle></CardHeader><CardContent className="p-0"><div className="overflow-x-auto"><Table><TableHeader><TableRow><TableHead>อาจารย์</TableHead><TableHead>รายวิชา</TableHead><TableHead>ช่วงเวลา</TableHead><TableHead>ผู้กำหนด</TableHead></TableRow></TableHeader><TableBody>{assignments.map((assignment) => { const teacher = teachers.find((item) => item.id === assignment.teacherId); const offering = offerings.find((item) => item.id === assignment.courseOfferingId); return <TableRow key={assignment.id}><TableCell className="font-medium">{teacher?.name ?? assignment.teacherId}</TableCell><TableCell>{offering?.courseCode}<p className="text-xs text-muted-foreground">{offering?.courseTitle}</p></TableCell><TableCell className="text-sm">{formatDate(assignment.startsAt)} – {formatDate(assignment.endsAt)}</TableCell><TableCell className="text-sm text-muted-foreground">{assignment.assignedBy}</TableCell></TableRow>; })}</TableBody></Table></div>{assignments.length === 0 ? <div className="p-5"><EmptyState title="ยังไม่มี Teaching Assignment" description="เลือกอาจารย์และรายวิชาภายในสถาบันเพื่อเริ่มมอบหมาย" /></div> : null}</CardContent></Card></div></>;

  const renderCourses = () => <><WorkspaceHeader eyebrow="Institution courses" title="รายวิชาและรุ่นเรียนของสถาบัน" description="เห็นเฉพาะ Course Offering ที่สถาบันปัจจุบันเป็นผู้เปิด" /><div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{offerings.map((offering) => <Card key={offering.id} className="border-border"><CardContent className="p-5"><div className="flex items-center justify-between gap-3"><ScopeBadge>{offering.term}</ScopeBadge><Badge variant={offering.status === "open" ? "success" : "secondary"}>{offering.status === "open" ? "เปิด" : "ปิด"}</Badge></div><h2 className="mt-4 font-semibold">{offering.courseCode} · {offering.courseTitle}</h2><p className="mt-2 text-sm text-muted-foreground">รุ่น {offering.section} · {offering.credits} หน่วยกิต</p><p className="mt-3 text-xs text-muted-foreground">อาจารย์ที่มอบหมาย {assignments.filter((item) => item.courseOfferingId === offering.id).length} คน</p></CardContent></Card>)}</div>{offerings.length === 0 ? <EmptyState title="ยังไม่มีรายวิชาในสถาบัน" description="Course Offering จะแสดงเมื่อถูกเปิดภายใต้ Institution Scope ปัจจุบัน" /> : null}</>;

  const renderRegistrations = () => <><WorkspaceHeader eyebrow="Read-only oversight" title="ติดตามสถานะ Registration" description="ผู้ดูแลสถาบันติดตามภาพรวมได้ แต่ไม่มี Action อนุมัติหรือปฏิเสธแทนอาจารย์" /><Card className="border-border"><CardContent className="p-0"><div className="overflow-x-auto"><Table><TableHeader><TableRow><TableHead>ผู้เรียน</TableHead><TableHead>รายวิชา</TableHead><TableHead>สถานะ</TableHead><TableHead>ผู้ดำเนินการล่าสุด</TableHead></TableRow></TableHeader><TableBody>{registrations.map((registration) => { const latest = registration.history.at(-1); return <TableRow key={registration.id}><TableCell><p className="font-medium">{registration.studentName}</p><p className="text-xs text-muted-foreground">{registration.studentId}</p></TableCell><TableCell>{registration.courseCode}<p className="text-xs text-muted-foreground">{registration.courseTitle}</p></TableCell><TableCell><Badge variant={registration.status === "enrolled" ? "success" : registration.status === "rejected" ? "danger" : "secondary"}>{registration.status}</Badge></TableCell><TableCell className="text-sm text-muted-foreground">{latest?.actorName ?? latest?.actor ?? "System Actor"}</TableCell></TableRow>; })}</TableBody></Table></div>{registrations.length === 0 ? <div className="p-5"><EmptyState title="ยังไม่มีคำขอลงทะเบียนในสถาบัน" description="รายการจะแสดงเมื่อมีคำขอใน Course Offering ภายใต้ Institution Scope ปัจจุบัน" /></div> : null}</CardContent></Card></>;

  const renderResults = () => <><WorkspaceHeader eyebrow="Read-only oversight" title="ติดตามผลแบบผ่าน/ไม่ผ่าน" description="ผู้ดูแลสถาบันดูสถานะและผลล่าสุดได้ แต่ไม่มีสิทธิ์บันทึก ประกาศ หรือแก้ผล" /><Card className="border-border"><CardContent className="p-0"><div className="overflow-x-auto"><Table><TableHeader><TableRow><TableHead scope="col">ผู้เรียน</TableHead><TableHead scope="col">รายวิชา</TableHead><TableHead scope="col">สถานะ</TableHead><TableHead scope="col">ผลล่าสุด</TableHead><TableHead scope="col">จำนวนครั้งที่แก้ไข</TableHead></TableRow></TableHeader><TableBody>{results.map((result) => { const student = students.find((item) => item.id === result.studentId); const offering = offerings.find((item) => item.id === result.courseOfferingId); return <TableRow key={result.id}><TableCell className="font-medium">{student?.name ?? result.studentId}</TableCell><TableCell>{offering?.courseCode}<p className="text-xs text-muted-foreground">{offering?.courseTitle}</p></TableCell><TableCell><Badge variant={result.status === "published" ? "success" : result.status === "revised" ? "info" : "secondary"}>{result.status}</Badge></TableCell><TableCell className="text-base font-bold">{formatSubjectResultValue(result.currentValue)}</TableCell><TableCell>{result.revisions.length}</TableCell></TableRow>; })}</TableBody></Table></div>{results.length === 0 ? <div className="p-5"><EmptyState title="ยังไม่มีผลในสถาบัน" description="เมื่ออาจารย์ประกาศผล รายการจะปรากฏที่นี่" /></div> : null}</CardContent></Card></>;

  const content = section === "dashboard" ? renderDashboard() : section === "students" ? renderStudents() : section === "teachers" ? renderTeachers() : section === "assignments" ? renderAssignments() : section === "courses" ? renderCourses() : section === "registrations" ? renderRegistrations() : renderResults();
  const pageContent = <>{content}{section === "students" || section === "teachers" || section === "courses" ? <InstitutionResourceManagement section={section} /> : null}</>;
  return <PageShell size="full" className="space-y-6">{isSensitiveSection ? <SensitiveViewAuditBoundary status={sensitiveViewAudit.status} onRetry={sensitiveViewAudit.retry}>{pageContent}</SensitiveViewAuditBoundary> : pageContent}</PageShell>;
}
