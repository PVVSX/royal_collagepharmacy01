"use client";

import { use, useState } from "react";
import { studentDetailData, profileData, registrationData, financeData, requestsData } from "@/data";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PersonalInfoCard } from "@/components/profile/PersonalInfoCard";
import { AddressCard } from "@/components/profile/AddressCard";
import { WorkplaceCard } from "@/components/profile/WorkplaceCard";

const icon20 = "material-symbols-outlined text-[20px]";
const icon18 = "material-symbols-outlined text-[18px]";

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
  const s = studentDetailData; // In real app, fetch based on studentId
  const [activeTab, setActiveTab] = useState("personal");

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-[1280px]">
      {/* Breadcrumb & Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-2">
            <a href="/admin/students" className="hover:text-primary transition-colors">รายชื่อผู้เข้าศึกษา</a>
            <span className={`${icon18} text-muted-foreground/50`}>chevron_right</span>
            <span className="text-primary font-medium flex items-center gap-1">
              {studentId}
            </span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">ข้อมูลผู้เข้าศึกษา</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2 text-slate-700 bg-white border-slate-200 shadow-sm">
            <span className={icon18}>edit</span> แก้ไขข้อมูล
          </Button>
          <Button className="gap-2 bg-slate-900 hover:bg-slate-800 text-white shadow-sm">
            <span className={icon18}>autorenew</span> อัปเดตสถานะ
          </Button>
        </div>
      </div>

      {/* Hero Header Card */}
      <Card className="shadow-sm border-slate-200 overflow-hidden">
        <div className="h-24 bg-gradient-to-r from-slate-800 to-slate-900"></div>
        <CardContent className="p-6 relative pt-0">
          <div className="flex flex-col md:flex-row gap-6 items-start md:items-end -mt-12 mb-6">
            <div className="w-24 h-24 rounded-xl border-4 border-white shadow-md bg-white overflow-hidden shrink-0">
              <img src="/Karina_new.jpg" alt={s.name} className="w-full h-full object-cover object-top" />
            </div>
            <div className="flex-1 space-y-1">
              <h2 className="text-2xl font-bold text-slate-900">{s.name}</h2>
              <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500">
                <span className="flex items-center gap-1"><span className={icon18}>badge</span> รหัส: {s.id}</span>
                <span className="flex items-center gap-1"><span className={icon18}>assignment_ind</span> ใบประกอบ: {s.licenseNumber}</span>
                <span className="flex items-center gap-1"><span className={icon18}>mail</span> {profileData.personalInfo.email}</span>
                <span className="flex items-center gap-1"><span className={icon18}>call</span> {profileData.personalInfo.phone}</span>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 px-3 py-1 text-sm">
                กำลังศึกษา (Active)
              </Badge>
              <div className="text-sm font-medium text-slate-600">
                {s.college} (ปีการศึกษา {s.academicYear})
              </div>
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
            <div>
              <p className="text-xs text-slate-500 mb-1">หน่วยกิต CPE</p>
              <p className="text-xl font-bold text-slate-900">{s.cpeCredits} <span className="text-sm text-slate-500 font-normal">/ {s.cpeTarget}</span></p>
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-1">หน่วยกิตสะสม</p>
              <p className="text-xl font-bold text-slate-900">{s.creditsEarned} <span className="text-sm text-slate-500 font-normal">/ {s.creditsTotal}</span></p>
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-1">วิชาที่ลงทะเบียน</p>
              <p className="text-xl font-bold text-slate-900">{s.registeredCourses}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-1">ยอดค้างชำระ</p>
              <p className="text-xl font-bold text-red-600">฿0.00</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs Layout */}
      <Card className="shadow-sm border-slate-200">
        <div className="flex border-b border-border overflow-x-auto bg-slate-50 px-2 rounded-t-xl">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-3.5 text-sm font-medium whitespace-nowrap transition-colors border-b-2 ${
                activeTab === tab.key
                  ? "border-primary text-primary"
                  : "border-transparent text-slate-500 hover:text-slate-900"
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
              <PersonalInfoCard data={profileData.personalInfo} isReadOnly={true} />
              <AddressCard title="ที่อยู่ตามบัตรประชาชน" icon="home" data={profileData.personalInfo} isReadOnly={true} showContactInfo={false} />
              <AddressCard title="ที่อยู่ปัจจุบัน/ที่ติดต่อได้" icon="contact_mail" data={profileData.personalInfo} isReadOnly={true} showContactInfo={true} />
              <WorkplaceCard data={profileData.workHistory} isReadOnly={true} />
            </div>
          )}

          {/* ---- Education Timeline ---- */}
          {activeTab === "education" && (
            <div className="animate-in fade-in slide-in-from-right-4">
              <h3 className="text-lg font-bold border-b border-border pb-2 mb-6">ประวัติการศึกษา</h3>
              <div className="relative border-l-2 border-border ml-3 space-y-8">
                {s.educationTimeline.map((edu, i) => (
                  <div key={i} className="relative pl-8">
                    <span
                      className={`absolute -left-[9px] top-1.5 w-4 h-4 rounded-full ring-4 ring-card ${
                        edu.isCurrent ? "bg-primary" : "bg-muted-foreground/30"
                      }`}
                    />
                    <h4 className="font-bold text-sm">{edu.degree}</h4>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {edu.institution} — {edu.field}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">{edu.period}</p>
                  </div>
                ))}
              </div>
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
              <div className="rounded-md border overflow-hidden">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50 font-medium text-slate-500">
                    <tr>
                      <th className="px-4 py-3">รหัสวิชา</th>
                      <th className="px-4 py-3">ชื่อวิชา</th>
                      <th className="px-4 py-3">หน่วยกิต</th>
                      <th className="px-4 py-3">สถานะ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {registrationData.courses.map((course, i) => (
                      <tr key={i} className="hover:bg-slate-50">
                        <td className="px-4 py-3 font-mono">{course.code}</td>
                        <td className="px-4 py-3">{course.title}</td>
                        <td className="px-4 py-3">{course.credits}</td>
                        <td className="px-4 py-3">
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">ลงทะเบียนแล้ว</Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ---- Finance ---- */}
          {activeTab === "finance" && (
            <div className="animate-in fade-in slide-in-from-right-4">
              <h3 className="text-lg font-bold border-b border-border pb-2 mb-6">ประวัติการชำระเงิน</h3>
              <div className="space-y-4">
                {financeData.items.map((item, i) => (
                  <div key={i} className="flex flex-col md:flex-row md:items-center justify-between p-4 rounded-lg border bg-card gap-4">
                    <div>
                      <div className="font-semibold text-sm">{item.description}</div>
                      <div className="text-xs text-muted-foreground mt-1">กำหนดชำระ: {item.dueDate}</div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-base font-bold text-primary">฿{item.amount.toLocaleString()}</div>
                      <Badge variant="outline" className={item.status === "paid" ? "bg-green-50 text-green-700 border-green-200" : "bg-amber-50 text-amber-700 border-amber-200"}>
                        {item.status === "paid" ? "ชำระแล้ว" : "รอชำระเงิน"}
                      </Badge>
                    </div>
                  </div>
                ))}
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
                        <span className="material-symbols-outlined text-slate-400 text-base">description</span>
                        {req.type}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">ยื่นเมื่อ: {req.date}</div>
                    </div>
                    <div className="flex gap-2 items-center">
                      <Badge variant="outline" className={
                        req.status === "approved" ? "bg-green-50 text-green-700 border-green-200" :
                        req.status === "pending" ? "bg-amber-50 text-amber-700 border-amber-200" :
                        "bg-red-50 text-red-700 border-red-200"
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
    </div>
  );
}
