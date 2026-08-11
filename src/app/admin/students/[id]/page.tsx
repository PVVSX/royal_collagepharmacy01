"use client";

import { use, useMemo, useState } from "react";
import {
  studentDetailData,
  profileData,
  registrationData,
  financeData,
  requestsData,
  resolveMockPaymentOwner,
} from "@/roles/shared/data";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PersonalInfoCard } from "@/roles/shared/member/components/PersonalInfoCard";
import { AddressCard } from "@/roles/shared/member/components/AddressCard";
import { WorkplaceCard } from "@/roles/shared/member/components/WorkplaceCard";
import { PageShell } from "@/roles/shared/components/layout/PageShell";
import Link from "next/link";
import {
  EducationTimeline,
  MockFeeRuleNote,
  StudentRecordBadge,
  getEstimatedOutstandingAmount,
  getMockPaymentBreakdown,
  getOutstandingBaseAmount,
  mergeStudentRecordPaymentStatuses,
} from "@/roles/shared/features/student-records";
import { useMockDb } from "@/providers/mock-db-provider";
import {
  findLicenseRegistryRecord,
  getLicenseEligibility,
  StudentStandingBadge,
} from "@/roles/shared/features/license-eligibility";
import { continuingEducationStatusMeta } from "@/roles/shared/member/domain/selectors";
import {
  adminStudentDirectory,
  findAdminStudent,
  getAdminStudentName,
} from "@/roles/admin/features/students/student-directory";

const icon18 = "material-symbols-outlined text-lg";

const tabs = [
  { key: "personal", icon: "badge", label: "ข้อมูลส่วนตัว" },
  { key: "education", icon: "history_edu", label: "การศึกษา" },
  { key: "work", icon: "work", label: "ประวัติการทำงาน" },
  { key: "registration", icon: "how_to_reg", label: "การลงทะเบียน" },
  { key: "finance", icon: "payments", label: "การเงิน" },
  { key: "requests", icon: "description", label: "คำร้อง" },
];

export default function AdminStudentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const studentId = resolvedParams.id;
  const directoryStudent = findAdminStudent(studentId) ?? adminStudentDirectory[1];
  const s = {
    ...studentDetailData,
    id: directoryStudent.id,
    name: getAdminStudentName(directoryStudent),
    licenseNumber: directoryStudent.licenseNumber,
    college: directoryStudent.collegeShort,
    collegeShort: directoryStudent.collegeShort,
    program: directoryStudent.program,
    trainingYear: directoryStudent.year,
    trainingStatus: directoryStudent.trainingStatus,
    cpdCredits: directoryStudent.cpdCredits,
    cpdTarget: directoryStudent.cpdTarget,
  };
  const selectedPersonalInfo = {
    ...profileData.personalInfo,
    title: directoryStudent.title,
    firstName: directoryStudent.firstName,
    lastName: directoryStudent.lastName,
    firstNameEn: directoryStudent.firstNameEn,
    lastNameEn: directoryStudent.lastNameEn,
    licenseNumber: directoryStudent.licenseNumber,
    email: directoryStudent.email,
    phone: directoryStudent.phone,
  };
  const [activeTab, setActiveTab] = useState("personal");
  const { payments } = useMockDb();
  const financeItems = useMemo(
    () => mergeStudentRecordPaymentStatuses(
      financeData.items,
      payments,
      resolveMockPaymentOwner(studentId),
    ),
    [payments, studentId],
  );
  const outstandingBaseAmount = getOutstandingBaseAmount(financeItems);
  const estimatedOutstandingAmount = getEstimatedOutstandingAmount(financeItems);
  const licenseRegistryRecord = findLicenseRegistryRecord(s.licenseNumber);
  const licenseEligibility = getLicenseEligibility(licenseRegistryRecord?.status ?? "unverified");
  const continuingEducationStatus = continuingEducationStatusMeta[directoryStudent.continuingEducationStatus];

  return (
    <PageShell bottom="none" className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 p-0 md:p-0">
      {/* Breadcrumb & Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-2">
            <Link href="/admin/students" className="hover:text-primary transition-colors">รายชื่อผู้เข้าศึกษา</Link>
            <span className={`${icon18} text-muted-foreground/50`}>chevron_right</span>
            <span className="text-primary font-medium flex items-center gap-1">
              {studentId}
            </span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-content">ข้อมูลผู้เข้าศึกษา</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2 text-content bg-surface-raised border-border shadow-sm">
            <span className={icon18}>edit</span> แก้ไขข้อมูล
          </Button>
          <Button className="gap-2 shadow-sm">
            <span className={icon18}>autorenew</span> อัปเดตสถานะ
          </Button>
        </div>
      </div>

      {/* Hero Header Card */}
      <Card className="shadow-sm border-border overflow-hidden">
        <div className="h-24 bg-gradient-to-r from-brand-strong to-brand"></div>
        <CardContent className="p-6 relative pt-0">
          <div className="flex flex-col md:flex-row gap-6 items-start md:items-end -mt-12 mb-6">
            <div className="w-24 h-24 rounded-xl border-4 border-surface-raised shadow-md bg-surface-raised overflow-hidden shrink-0">
              <img src="/somchai_profile.png" alt={s.name} className="w-full h-full object-cover object-top" />
            </div>
            <div className="flex-1 space-y-1">
              <h2 className="text-2xl font-bold text-content">{s.name}</h2>
              <div className="flex flex-wrap items-center gap-3 text-sm text-content-muted">
                <span className="flex items-center gap-1"><span className={icon18}>badge</span> รหัส: {s.id}</span>
                <span className="flex items-center gap-1"><span className={icon18}>assignment_ind</span> ใบประกอบ: {s.licenseNumber}</span>
                <span className="flex items-center gap-1"><span className={icon18}>mail</span> {selectedPersonalInfo.email}</span>
                <span className="flex items-center gap-1"><span className={icon18}>call</span> {selectedPersonalInfo.phone}</span>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <StudentRecordBadge
                kind="training"
                status={s.trainingStatus}
                className="px-3 py-1 text-sm"
              />
              <div className="flex items-center gap-2 text-xs font-medium text-content-muted">
                <span>สถานภาพผู้เข้าศึกษา</span>
                <StudentStandingBadge standing={licenseEligibility.studentStanding} />
              </div>
              <div className="flex items-center gap-2 text-xs font-medium text-content-muted">
                <span>สถานะการศึกษาต่อเนื่อง</span>
                <Badge variant={continuingEducationStatus.variant}>{continuingEducationStatus.label}</Badge>
              </div>
              <div className="text-sm font-medium text-content-muted">
                {s.college} (ปีการศึกษา {s.trainingYear})
              </div>
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-surface-container-low rounded-xl border border-border">
            <div>
              <p className="text-xs text-content-muted mb-1">หน่วยกิต CPD</p>
              <p className="text-xl font-bold text-content">{s.cpdCredits} <span className="text-sm text-content-muted font-normal">/ {s.cpdTarget}</span></p>
            </div>
            <div>
              <p className="text-xs text-content-muted mb-1">หน่วยกิตสะสม</p>
              <p className="text-xl font-bold text-content">{s.creditsEarned} <span className="text-sm text-content-muted font-normal">/ {s.creditsTotal}</span></p>
            </div>
            <div>
              <p className="text-xs text-content-muted mb-1">วิชาที่ลงทะเบียน</p>
              <p className="text-xl font-bold text-content">{s.registeredCourses}</p>
            </div>
            <div>
              <p className="text-xs text-content-muted mb-1">ยอดค้างชำระ</p>
              <p className="text-xl font-bold text-danger">
                ฿{outstandingBaseAmount.toLocaleString()}
              </p>
              <p className="mt-0.5 text-xs text-content-muted">
                ประมาณการรวมค่าธรรมเนียม ฿{estimatedOutstandingAmount.toLocaleString()}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs Layout */}
      <Card className="shadow-sm border-border">
        <div className="flex border-b border-border overflow-x-auto bg-surface-container-low px-2 rounded-t-xl">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-3.5 text-sm font-medium whitespace-nowrap transition-colors border-b-2 ${
                activeTab === tab.key
                  ? "border-primary text-primary"
                  : "border-transparent text-content-muted hover:text-content"
              }`}
            >
              <span className={icon18}>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-6 md:p-8 min-h-[500px]">
          {/* ---- Personal Info ---- */}
          {activeTab === "personal" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
              <PersonalInfoCard data={selectedPersonalInfo} isReadOnly={true} />
              <AddressCard title="ที่อยู่ตามบัตรประชาชน" icon="home" data={selectedPersonalInfo} isReadOnly={true} showContactInfo={false} />
              <AddressCard title="ที่อยู่ปัจจุบัน/ที่ติดต่อได้" icon="contact_mail" data={selectedPersonalInfo} isReadOnly={true} showContactInfo={true} />
              <WorkplaceCard data={profileData.workHistory} isReadOnly={true} />
            </div>
          )}

          {/* ---- Education Timeline ---- */}
          {activeTab === "education" && (
            <div className="animate-in fade-in slide-in-from-right-4">
              <h3 className="text-lg font-bold border-b border-border pb-2 mb-6">ประวัติการศึกษา</h3>
              <EducationTimeline entries={s.educationTimeline} />
            </div>
          )}

          {/* ---- Work History ---- */}
          {activeTab === "work" && (
            <div className="animate-in fade-in slide-in-from-right-4">
              <h3 className="text-lg font-bold border-b border-border pb-2 mb-6">ประสบการณ์ทำงานย้อนหลัง</h3>
              <div className="space-y-3">
                {profileData.workHistory.previousJobs.map((job, i) => (
                  <div key={i} className="flex gap-4 p-4 rounded-lg border bg-card">
                    <div className="w-16 shrink-0 text-sm font-medium text-muted-foreground pt-0.5">{job.year}</div>
                    <div>
                      <div className="text-sm font-semibold">{job.position}</div>
                      <div className="text-sm text-muted-foreground">{job.workplace}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ---- Registration ---- */}
          {activeTab === "registration" && (
            <div className="animate-in fade-in slide-in-from-right-4">
              <h3 className="text-lg font-bold border-b border-border pb-2 mb-6">วิชาที่ลงทะเบียน (เทอมปัจจุบัน)</h3>
              <div className="overflow-x-auto rounded-lg border">
                <table className="min-w-[860px] w-full text-sm text-left">
                  <caption className="sr-only">
                    สถานะการลงทะเบียน การชำระเงิน และการตรวจสลิปของแต่ละวิชา
                  </caption>
                  <thead className="bg-surface-container-low font-medium text-content-muted">
                    <tr>
                      <th className="px-4 py-3">รหัสวิชา</th>
                      <th className="px-4 py-3">ชื่อวิชา</th>
                      <th className="px-4 py-3">หน่วยกิต</th>
                      <th className="px-4 py-3">การลงทะเบียน</th>
                      <th className="px-4 py-3">การชำระเงิน</th>
                      <th className="px-4 py-3">การตรวจสลิป</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {registrationData.courses.map((course) => (
                      <tr key={course.code} className="hover:bg-surface-container-low">
                        <td className="px-4 py-3 font-mono">{course.code}</td>
                        <td className="px-4 py-3">{course.title}</td>
                        <td className="px-4 py-3">{course.credits}</td>
                        <td className="px-4 py-3">
                          <StudentRecordBadge
                            kind="enrollment"
                            status={course.enrollmentStatus}
                          />
                        </td>
                        <td className="px-4 py-3">
                          <StudentRecordBadge
                            kind="billing"
                            status={course.billingStatus}
                          />
                        </td>
                        <td className="px-4 py-3">
                          <StudentRecordBadge
                            kind="slipReview"
                            status={course.slipReviewStatus}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-4">
                <MockFeeRuleNote />
              </div>
            </div>
          )}

          {/* ---- Finance ---- */}
          {activeTab === "finance" && (
            <div className="animate-in fade-in slide-in-from-right-4">
              <h3 className="text-lg font-bold border-b border-border pb-2 mb-6">ประวัติการชำระเงิน</h3>
              <div className="mb-4">
                <MockFeeRuleNote />
              </div>
              <div className="space-y-4">
                {financeItems.map((item) => {
                  const breakdown = getMockPaymentBreakdown(
                    item.amount,
                    item.billingStatus,
                  );

                  return (
                    <div key={item.id} className="flex flex-col gap-4 rounded-lg border bg-card p-4 md:flex-row md:items-center md:justify-between">
                      <div>
                        <div className="font-semibold text-sm">{item.description}</div>
                        <div className="text-xs text-muted-foreground mt-1">กำหนดชำระ: {item.dueDate}</div>
                        {item.billingStatus !== "paid" && (
                          <div className="mt-2 text-xs text-muted-foreground">
                            ประมาณการยอดชำระ ฿{breakdown.total.toLocaleString()}
                            {breakdown.lateFee > 0
                              ? ` (ค่าปรับ ฿${breakdown.lateFee.toLocaleString()})`
                              : ""}
                          </div>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-3 md:justify-end">
                        <div className="text-base font-bold text-primary">฿{item.amount.toLocaleString()}</div>
                        <StudentRecordBadge
                          kind="billing"
                          status={item.billingStatus}
                        />
                        <StudentRecordBadge
                          kind="slipReview"
                          status={item.slipReviewStatus}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ---- Requests ---- */}
          {activeTab === "requests" && (
            <div className="animate-in fade-in slide-in-from-right-4">
              <h3 className="text-lg font-bold border-b border-border pb-2 mb-6">ประวัติคำร้อง</h3>
              <div className="space-y-4">
                {requestsData.map((req, i) => (
                  <div key={i} className="flex flex-col md:flex-row md:items-center justify-between p-4 rounded-lg border bg-card gap-4">
                    <div>
                      <div className="font-semibold text-sm flex items-center gap-2">
                        <span className="material-symbols-outlined text-content-muted text-base">description</span>
                        {req.type}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">ยื่นเมื่อ: {req.date}</div>
                    </div>
                    <div className="flex gap-2 items-center">
                      <Badge variant={
                        req.status === "approved" ? "success" :
                        req.status === "pending" ? "warning" :
                        "danger"
                      }>
                        {req.status === "approved" ? "อนุมัติ" : req.status === "pending" ? "รอดำเนินการ" : "ปฏิเสธ"}
                      </Badge>
                      <Button variant="ghost" size="sm" className="h-8">ดูรายละเอียด</Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </Card>
    </PageShell>
  );
}
