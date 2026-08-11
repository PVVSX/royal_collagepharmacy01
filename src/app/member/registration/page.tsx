"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { registrationData } from "@/roles/shared/data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useMockDb } from "@/providers/mock-db-provider";
import { PageShell } from "@/roles/shared/components/layout/PageShell";
import { currentMemberPassport } from "@/roles/shared/member/domain/member";
import {
  findLicenseRegistryRecord,
  getLicenseEligibility,
  LicenseEligibilityNotice,
} from "@/roles/shared/features/license-eligibility";
import {
  registrationStatusMeta,
  type RegistrationRecord,
  type RegistrationStatus,
} from "@/roles/shared/features/registration";
import type { RegistrationCourseRecord } from "@/roles/shared/features/student-records";

type Course = RegistrationCourseRecord;
type CourseViewStatus = RegistrationStatus | "available" | "full";

const courseStatusMeta = {
  available: { label: "ว่าง", variant: "success" },
  full: { label: "เต็ม", variant: "danger" },
  ...registrationStatusMeta,
} as const;

const activeRegistrationStatuses = new Set<RegistrationStatus>([
  "submitted",
  "pending",
  "needs_info",
  "approved",
  "drop_pending",
]);

function activeRegistrationForCourse(
  registrations: readonly RegistrationRecord[],
  courseCode: string,
) {
  return registrations.find((registration) => (
    registration.courseCode === courseCode && activeRegistrationStatuses.has(registration.status)
  ));
}

export default function RegistrationPage() {
  const {
    settings,
    registrations,
    submitRegistrations,
    resubmitRegistration,
    requestRegistrationDrop,
  } = useMockDb();
  const [selectedCodes, setSelectedCodes] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const member = currentMemberPassport;
  const licenseRegistryRecord = findLicenseRegistryRecord(member.license.licenseNumber);
  const licenseStatus = licenseRegistryRecord?.status ?? "unverified";
  const eligibility = getLicenseEligibility(licenseStatus);
  const memberName = `${member.identity.titleTh}${member.identity.firstNameTh} ${member.identity.lastNameTh}`;
  const memberRegistrations = useMemo(
    () => registrations.filter((registration) => registration.studentId === member.memberId),
    [member.memberId, registrations],
  );

  const selectedCourses = registrationData.courses.filter((course) => selectedCodes.has(course.code));
  const activeRegistrations = memberRegistrations.filter((registration) => (
    activeRegistrationStatuses.has(registration.status)
  ));
  const selectedCoursesCount = activeRegistrations.length + selectedCourses.length;
  const selectedCredits = activeRegistrations.reduce((sum, registration) => sum + registration.credits, 0) +
    selectedCourses.reduce((sum, course) => sum + course.credits, 0);
  const displayedCourses = registrationData.courses.filter((course) => (
    course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    course.code.toLowerCase().includes(searchQuery.toLowerCase())
  ));

  if (!settings.registrationOpen) {
    return (
      <PageShell className="min-h-[70vh] flex flex-col items-center justify-center text-center">
        <div className="w-20 h-20 bg-neutral-soft rounded-full flex items-center justify-center mb-6">
          <span className="material-symbols-outlined text-4xl text-content-muted">event_busy</span>
        </div>
        <h1 className="text-3xl font-bold text-content mb-2">ปิดระบบลงทะเบียน</h1>
        <p className="text-content-muted max-w-md">
          ขณะนี้อยู่นอกช่วงเวลาการเปิดลงทะเบียนรายวิชา<br />
          กรุณาตรวจสอบปฏิทินการศึกษาสำหรับกำหนดการลงทะเบียนรอบถัดไป
        </p>
        <Button className="mt-6" onClick={() => window.history.back()}>กลับไปหน้าก่อนหน้า</Button>
      </PageShell>
    );
  }

  const canSelect = (course: Course) => (
    eligibility.canRegisterCourses &&
    course.enrolled < course.capacity &&
    selectedCoursesCount < registrationData.maxCourses &&
    selectedCredits + course.credits <= registrationData.maxCredits
  );

  const handleAdd = (course: Course) => {
    if (!canSelect(course)) {
      toast.error("ไม่สามารถเพิ่มรายวิชานี้ได้ กรุณาตรวจสอบจำนวนวิชา หน่วยกิต และสถานะใบอนุญาต");
      return;
    }
    setSelectedCodes((previous) => new Set(previous).add(course.code));
  };

  const handleRemoveSelection = (courseCode: string) => {
    setSelectedCodes((previous) => {
      const next = new Set(previous);
      next.delete(courseCode);
      return next;
    });
  };

  const handleSubmit = () => {
    if (!eligibility.canRegisterCourses || selectedCourses.length === 0) return;
    const created = submitRegistrations(selectedCourses.map((course) => ({
      studentId: member.memberId,
      studentName: memberName,
      courseId: course.code,
      courseCode: course.code,
      courseTitle: course.title,
      credits: course.credits,
      term: "1/2569",
    })));
    if (created.length === 0) {
      toast.error("ไม่พบรายวิชาใหม่สำหรับส่งลงทะเบียน");
      return;
    }
    setSelectedCodes(new Set());
    toast.success(`ส่งคำขอลงทะเบียน ${created.length} วิชาแล้ว`, {
      description: "เจ้าหน้าที่จะตรวจสอบก่อนเปิดให้ชำระเงิน",
    });
  };

  const handleDropRequest = (registration: RegistrationRecord) => {
    if (!window.confirm(`ยืนยันส่งคำขอถอนวิชา ${registration.courseCode}?`)) return;
    requestRegistrationDrop(registration.id, "ผู้เข้าศึกษาขอถอนผ่านระบบ");
    toast.success("ส่งคำขอถอนแล้ว");
  };

  return (
    <PageShell bottom="roomy">
      <LicenseEligibilityNotice
        status={licenseStatus}
        licenseNumber={member.license.licenseNumber}
        checkedAt={licenseRegistryRecord?.checkedAt}
        compact
        className="mb-4"
      />

      <div className="bg-warning-soft border border-warning-border rounded-lg p-3 mb-4 flex items-start gap-2">
        <span className="material-symbols-outlined text-warning-on-soft text-base mt-0.5">warning</span>
        <div>
          <p className="text-xs font-medium text-warning-on-soft">หมดเขตลงทะเบียน {registrationData.deadline}</p>
          <p className="text-xs text-warning-on-soft/80 mt-0.5">เลือกวิชา ตรวจสอบรายการ แล้วส่งให้เจ้าหน้าที่อนุมัติ</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-5">
        {[
          { label: "วิชารวมคำขอ", value: `${selectedCoursesCount}/${registrationData.maxCourses}` },
          { label: "หน่วยกิตรวม", value: `${selectedCredits}/${registrationData.maxCredits}` },
        ].map((summary) => (
          <Card key={summary.label}>
            <CardContent className="p-3 text-center">
              <p className="text-xs text-muted-foreground">{summary.label}</p>
              <p className="text-lg font-bold text-primary mt-0.5">{summary.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {selectedCourses.length > 0 && (
        <Card className="card-shadow mb-5 border-brand-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">ตรวจสอบก่อนส่ง ({selectedCourses.length} วิชา)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {selectedCourses.map((course) => (
              <div key={course.code} className="flex items-center justify-between gap-3 rounded-lg bg-surface-container-low px-3 py-2">
                <div>
                  <p className="text-sm font-medium">{course.code} · {course.title}</p>
                  <p className="text-xs text-content-muted">{course.credits} หน่วยกิต · {course.schedule}</p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => handleRemoveSelection(course.code)}>เอาออก</Button>
              </div>
            ))}
            <div className="rounded-lg border border-warning-border bg-warning-soft px-3 py-2 text-xs text-warning-on-soft">
              หลังส่งคำขอ กรุณารอเจ้าหน้าที่ตรวจสอบและอนุมัติก่อน จึงจะสามารถชำระเงินได้
            </div>
            <Button className="w-full" onClick={handleSubmit} disabled={!eligibility.canRegisterCourses}>
              ส่งคำขอลงทะเบียน
            </Button>
          </CardContent>
        </Card>
      )}

      <Card className="card-shadow mb-6">
        <CardHeader className="pb-0 pt-4 px-5">
          <div className="flex items-center justify-between gap-3">
            <CardTitle className="text-sm flex-shrink-0">รายวิชาที่เปิดลงทะเบียน</CardTitle>
            <div className="relative flex-1 max-w-sm">
              <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground text-lg">search</span>
              <Input placeholder="ค้นหาวิชา..." className="pl-9 h-8 text-xs" value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0 mt-3">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs h-9">รหัส</TableHead>
                <TableHead className="text-xs h-9">ชื่อรายวิชา</TableHead>
                <TableHead className="text-xs h-9">หน่วยกิต</TableHead>
                <TableHead className="text-xs h-9">วัน/เวลา</TableHead>
                <TableHead className="text-xs h-9">ที่นั่ง</TableHead>
                <TableHead className="text-xs h-9">สถานะ</TableHead>
                <TableHead className="text-xs h-9">จัดการ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayedCourses.map((course) => {
                const registration = activeRegistrationForCourse(memberRegistrations, course.code);
                const isSelected = selectedCodes.has(course.code);
                const status: CourseViewStatus = registration?.status ?? (isSelected ? "selected" : course.enrolled >= course.capacity ? "full" : "available");
                const statusInfo = courseStatusMeta[status];
                return (
                  <TableRow key={course.code}>
                    <TableCell className="text-xs py-2.5 font-medium">{course.code}</TableCell>
                    <TableCell className="text-xs py-2.5">
                      <p>{course.title}</p>
                      {registration?.reviewReason && <p className="mt-1 text-xs text-danger">หมายเหตุ: {registration.reviewReason}</p>}
                    </TableCell>
                    <TableCell className="text-xs py-2.5">{course.credits}</TableCell>
                    <TableCell className="text-xs py-2.5">{course.schedule}</TableCell>
                    <TableCell className="text-xs py-2.5">{course.enrolled}/{course.capacity}</TableCell>
                    <TableCell className="text-xs py-2.5"><Badge variant={statusInfo.variant}>{statusInfo.label}</Badge></TableCell>
                    <TableCell className="text-xs py-2.5">
                      {status === "available" && (
                        <Button variant="link" size="sm" className="h-auto p-0 text-xs" disabled={!canSelect(course)} onClick={() => handleAdd(course)}>+ เพิ่ม</Button>
                      )}
                      {status === "selected" && (
                        <Button variant="link" size="sm" className="h-auto p-0 text-xs text-danger" onClick={() => handleRemoveSelection(course.code)}>เอาออก</Button>
                      )}
                      {status === "needs_info" && registration && (
                        <Button variant="link" size="sm" className="h-auto p-0 text-xs" onClick={() => { resubmitRegistration(registration.id); toast.success("ส่งข้อมูลกลับไปตรวจสอบแล้ว"); }}>ส่งตรวจใหม่</Button>
                      )}
                      {status === "approved" && registration && (
                        <Button variant="link" size="sm" className="h-auto p-0 text-xs text-danger" onClick={() => handleDropRequest(registration)}>ขอถอน</Button>
                      )}
                      {status !== "available" && status !== "selected" && status !== "needs_info" && status !== "approved" && <span className="text-content-muted">—</span>}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </PageShell>
  );
}
