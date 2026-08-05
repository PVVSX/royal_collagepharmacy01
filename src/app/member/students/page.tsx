"use client";

import Footer from "@/roles/shared/components/layout/Footer";
import { toast } from "sonner";
import { useState } from "react";
import { studentDetailData, profileData, registrationData } from "@/roles/shared/data";
import { currentMemberPassport } from "@/roles/shared/member/domain";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { PersonalInfoCard } from "@/roles/shared/member/components/PersonalInfoCard";
import { AddressCard } from "@/roles/shared/member/components/AddressCard";
import { WorkplaceCard } from "@/roles/shared/member/components/WorkplaceCard";
import { PageShell } from "@/roles/shared/components/layout/PageShell";
import { ResearchSubmissionDialog } from "@/roles/member/features/research/components/ResearchSubmissionDialog";
import {
  EducationTimeline,
  MockFeeRuleNote,
  StudentRecordBadge,
  studentDocuments,
} from "@/roles/shared/features/student-records";

const icon20 = "material-symbols-outlined text-xl";
const icon18 = "material-symbols-outlined text-lg";

const tabs = [
  { key: "personal", icon: "badge", label: "ข้อมูลส่วนตัว" },
  { key: "education", icon: "history_edu", label: "การศึกษา" },
  { key: "work", icon: "work", label: "ประวัติการทำงาน" },
  { key: "research", icon: "biotech", label: "ผลงานวิจัย" },
  { key: "registration", icon: "how_to_reg", label: "การลงทะเบียน" },
  { key: "documents", icon: "folder", label: "เอกสารของฉัน" },
];

export default function StudentsPage() {
  const s = studentDetailData;
  const [activeTab, setActiveTab] = useState("personal");
  const [researchSubmissionOpen, setResearchSubmissionOpen] = useState(false);

  const icon16 = "material-symbols-outlined text-base";

  return (
    <PageShell className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <a href="/member/dashboard" className="hover:text-primary transition-colors">หน้าหลัก</a>
        <span className={`${icon18} text-muted-foreground/50`}>chevron_right</span>
        <span className="text-primary font-medium flex items-center gap-1">
          <span className={icon18}>person</span> ข้อมูลของฉัน
        </span>
      </div>

      {/* Hero Banner Section */}
      <div className="relative rounded-3xl overflow-hidden bg-card border shadow-sm">
        {/* Banner Background */}
        <div className="relative h-36 w-full overflow-hidden bg-gradient-to-r from-profile-hero-start via-profile-hero-middle to-profile-hero-end md:h-52">
          <div className="profile-hero-pattern absolute inset-0" />
          {/* Logo Watermark */}
          <div className="profile-watermark absolute -right-10 top-1/2 -translate-y-1/2 mix-blend-screen pointer-events-none md:-right-20">
            <img src="/watermark_council.png" alt="Watermark" className="w-[300px] h-[300px] md:w-[450px] md:h-[450px] object-contain" />
          </div>
          {/* Decorative gradients */}
          <div className="absolute -left-20 -top-20 w-64 h-64 bg-content-inverse/10 rounded-full blur-3xl pointer-events-none" />
        </div>
        
        <div className="px-6 pb-6 md:px-8 md:pb-8 relative">
          <div className="flex flex-col md:flex-row justify-between gap-6">
            {/* Avatar & Basic Info */}
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
              {/* Profile Picture with Completion Ring */}
              <div className="relative shrink-0 -mt-16 md:-mt-20 z-10 group">
                <div className="absolute inset-0 rounded-full border-[6px] border-status-active/20" />
                <div className="absolute inset-0 rounded-full border-[6px] border-status-active [clip-path:polygon(0_0,100%_0,100%_100%,0_50%)]" />
                <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-card shadow-2xl overflow-hidden bg-card relative">
                  <img src="/somchai_profile.png" alt={s.name} className="w-full h-full object-cover object-top" />
                </div>
                {/* Completion badge */}
                <div className="absolute bottom-1 right-1 rounded-full border-2 border-card bg-status-active px-2 py-0.5 text-3xs font-bold text-status-active-on-solid shadow-md md:bottom-2 md:right-2">
                  100%
                </div>
              </div>

              <div className="text-center md:text-left pt-2 md:pt-4 flex-1">
                <div className="flex flex-col md:flex-row md:items-end justify-center md:justify-start gap-2 md:gap-3 mb-1">
                  <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
                    {profileData.personalInfo.title}{profileData.personalInfo.firstName} {profileData.personalInfo.lastName}
                    <span className="text-base md:text-lg text-muted-foreground font-medium ml-2">ภ.บ., BCP Candidate</span>
                  </h1>
                  <StudentRecordBadge
                    kind="training"
                    status={s.trainingStatus}
                    className="mb-1 shrink-0"
                  />
                </div>
                
                {/* Workplace & Context */}
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 text-sm text-foreground/80 font-medium mb-3">
                  <span className="flex items-center gap-1.5"><span className="material-symbols-outlined text-base text-primary">work</span> {profileData.workHistory.position}, {profileData.workHistory.currentWorkplace}</span>
                  <span className="text-muted-foreground/30 hidden md:inline">•</span>
                  <span className="text-muted-foreground">{s.college} — ปีการศึกษา {s.trainingYear}</span>
                </div>
                
                {/* Specialty Tags */}
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-4">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mr-1">สาขาที่มุ่งพัฒนา:</span>
                  {currentMemberPassport.focusAreas.map((area) => (
                    <Badge key={area} variant="brand" className="border-brand-deep/20 bg-brand-deep/10 px-2.5 py-0.5 font-medium text-brand-deep shadow-sm dark:bg-brand-deep/20 dark:text-brand-highlight">
                      <span className="material-symbols-outlined text-xs mr-1">stars</span> {area}
                    </Badge>
                  ))}
                </div>

                {/* IDs & Contact */}
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-5 gap-y-2 text-xs md:text-sm text-muted-foreground bg-muted/30 p-2.5 rounded-xl border border-border/50 inline-flex">
                  <div className="flex items-center gap-1.5 font-medium">
                    <span className={icon16}>badge</span> วภท-2568-001
                  </div>
                  <div className="flex items-center gap-1.5 font-medium">
                    <span className={icon16}>verified</span> ใบประกอบฯ: {s.licenseNumber}
                  </div>
                  <div className="w-px h-4 bg-border hidden md:block" />
                  <div className="flex items-center gap-1.5">
                    <span className={icon16}>mail</span> {profileData.personalInfo.email}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className={icon16}>call</span> {profileData.personalInfo.phone}
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-col items-center md:items-end gap-3 pt-2 md:pt-4">
              <div className="flex gap-2">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="gap-2 h-10 rounded-full shadow-sm bg-background">
                      <span className={icon18}>badge</span> บัตรดิจิทัล
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md bg-transparent border-none shadow-none flex flex-col items-center justify-center p-0 [&>button]:hidden">
                    <div className="relative flex h-[540px] w-[340px] flex-col items-center overflow-hidden rounded-[24px] bg-gradient-to-br from-brand to-membership-card-end p-6 text-content-inverse shadow-membership-card">
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_2px_2px,var(--content-inverse)_1px,transparent_0)] bg-[length:16px_16px] opacity-10" />
                      <div className="relative z-10 flex items-center gap-3 w-full pb-4 mb-5 mt-2">
                        <div className="bg-card p-1 rounded-md shrink-0">
                          <img src="/logo_pharmacy.jpg" alt="Logo" className="w-8 h-8 object-contain" />
                        </div>
                        <div className="text-left">
                          <div className="font-bold text-sm tracking-tight leading-tight drop-shadow-sm">ราชวิทยาลัยเภสัชกรรมแห่งประเทศไทย</div>
                          <div className="text-micro opacity-80 tracking-wider">ROYAL PHARMACY COLLEGE OF THAILAND</div>
                        </div>
                      </div>
                      <div className="relative z-10 flex flex-col items-center text-center w-full">
                        <div className="w-24 h-24 rounded-full border-4 border-content-inverse/30 overflow-hidden shadow-xl bg-content-inverse/10 shrink-0 mb-3">
                          <img src="/somchai_profile.png" alt="Profile" className="w-full h-full object-cover object-top" />
                        </div>
                        <h2 className="text-xl font-bold mt-1">{profileData.personalInfo.title}{profileData.personalInfo.firstName} {profileData.personalInfo.lastName}</h2>
                        <div className="text-sm opacity-90 mb-1">{profileData.personalInfo.title} {profileData.personalInfo.firstNameEn} {profileData.personalInfo.lastNameEn}</div>
                        <div className="mt-2 bg-card/20 px-3 py-1 rounded-full text-xs font-medium backdrop-blur-sm">
                          สมาชิกราชวิทยาลัย
                        </div>
                      </div>
                      <div className="relative z-10 w-full mt-5 space-y-2 text-sm bg-scrim-faint p-3.5 rounded-xl backdrop-blur-sm">
                        <div className="flex justify-between items-center px-1">
                          <span className="opacity-70 text-xs">เลขที่ใบประกอบฯ</span>
                          <span className="font-medium tracking-wide">{profileData.personalInfo.licenseNumber}</span>
                        </div>
                        <div className="flex justify-between items-center px-1">
                          <span className="opacity-70 text-xs">สถานะ</span>
                          <span className="font-medium text-status-active-on-dark">ปกติ (Active)</span>
                        </div>
                      </div>
                      <div className="relative z-10 mt-auto flex flex-col items-center bg-logo-surface text-membership-card-content p-3 rounded-xl shadow-xl w-full max-w-[200px] mb-2">
                        <div className="w-24 h-24 bg-muted rounded-md overflow-hidden shrink-0">
                          <img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(currentMemberPassport.verifyToken)}`} alt="QR Code" className="w-full h-full" />
                        </div>
                        <span className="text-3xs text-muted-foreground font-medium mt-2">สแกนเพื่อยืนยันตัวตน</span>
                      </div>
                    </div>
                    <div className="mt-6 flex gap-3 w-full justify-center">
                      <Button variant="outline" className="gap-2 bg-content-inverse/10 hover:bg-content-inverse/20 text-content-inverse border-content-inverse/20 backdrop-blur-md rounded-full px-5 h-10 shadow-lg">
                        <span className="material-symbols-outlined text-lg">download</span> บันทึกรูปภาพ
                      </Button>
                      <Button variant="default" className="gap-2 bg-content-inverse text-primary hover:bg-content-inverse/90 rounded-full px-5 h-10 shadow-lg font-medium">
                        <span className="material-symbols-outlined text-lg">share</span> แชร์บัตร
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
                <Button variant="default" className="gap-2 h-10 rounded-full shadow-sm" onClick={() => window.open("/print/profile", "_blank")}>
                  <span className={icon18}>print</span> พิมพ์ประวัติ
                </Button>
                <Button variant="outline" size="icon" className="h-10 w-10 rounded-full shadow-sm bg-background" title="แชร์" onClick={() => {
                  if (navigator.share) { navigator.share({ title: "บัตรประจำตัวผู้เข้าศึกษา", text: `${s.name} — ${s.id}`, url: window.location.href }).catch(() => {}); }
                  else { navigator.clipboard.writeText(window.location.href).then(() => toast.info("คัดลอกลิงก์แล้ว!")); }
                }}>
                  <span className={icon18}>share</span>
                </Button>
              </div>
            </div>
          </div>

          {/* Quick Stats Banner */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-8 border-t border-border/60 pt-6 relative">
            <div className="flex flex-col gap-2 relative">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0 shadow-inner">
                  <span className={icon20}>workspace_premium</span>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider">หน่วยกิต CPD</div>
                  <div className="font-bold text-lg text-primary">{s.cpdCredits}<span className="text-sm font-normal text-muted-foreground">/{s.cpdTarget}</span></div>
                </div>
              </div>
              {/* Progress bar */}
              <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden mt-1">
                <div className="h-full bg-primary rounded-full transition-all duration-1000" style={{ width: `${(s.cpdCredits / s.cpdTarget) * 100}%` }} />
              </div>
              <div className="text-3xs text-muted-foreground text-right mt-0.5">เหลืออีก {s.cpdTarget - s.cpdCredits} หน่วยกิต</div>
            </div>
            
            <div className="flex flex-col gap-2 relative md:border-l border-border/50 md:pl-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0 shadow-inner">
                  <span className={icon20}>library_books</span>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider">หน่วยกิตสะสม</div>
                  <div className="font-bold text-lg">{s.creditsEarned}<span className="text-sm font-normal text-muted-foreground">/{s.creditsTotal}</span></div>
                </div>
              </div>
              {/* Progress bar */}
              <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden mt-1">
                <div className="h-full bg-primary rounded-full transition-all duration-1000" style={{ width: `${(s.creditsEarned / s.creditsTotal) * 100}%` }} />
              </div>
              <div className="text-3xs text-muted-foreground text-right mt-0.5">ครึ่งทางแล้ว!</div>
            </div>

            <div className="flex flex-col justify-center gap-1 relative border-t md:border-t-0 md:border-l border-border/50 pt-4 md:pt-0 md:pl-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0 shadow-inner">
                  <span className={icon20}>history_edu</span>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider">ลงทะเบียนเทอมนี้</div>
                  <div className="font-bold text-lg">{s.registeredCourses} <span className="text-sm font-normal text-muted-foreground">วิชา</span></div>
                </div>
              </div>
              <Badge variant="warning" className="mt-2 inline-flex h-auto w-max items-center gap-1 border-0 text-3xs font-normal">
                <span className="w-1.5 h-1.5 rounded-full bg-warning animate-pulse" /> กำลังดำเนินการสอบ 1 วิชา
              </Badge>
            </div>

            <div className="flex flex-col justify-center gap-1 relative border-t md:border-t-0 md:border-l border-border/50 pt-4 md:pt-0 md:pl-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0 shadow-inner">
                  <span className={icon20}>event_available</span>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider">ปีการศึกษาที่เข้า</div>
                  <div className="font-bold text-lg">2568</div>
                </div>
              </div>
              <div className="mt-2">
                <StudentRecordBadge
                  kind="training"
                  status={s.trainingStatus}
                  className="h-auto text-3xs font-normal"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Layout - Sidebar Tabs + Content Panel */}
      <div className="flex min-w-0 flex-col gap-6 lg:flex-row">
        {/* Left Sidebar Tabs */}
        <div className="w-full lg:w-64 shrink-0 flex flex-row lg:flex-col gap-2 overflow-x-auto lg:overflow-x-visible pb-2 lg:pb-0 scrollbar-hide">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
                activeTab === tab.key
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "bg-card/50 text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <span className={icon18}>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Right Content Panel */}
        <div className="min-w-0 flex-1">
          <Card className="min-h-[500px] min-w-0 overflow-hidden rounded-2xl border bg-card shadow-sm">
            <CardContent className="min-w-0 p-6 md:p-8">
              {/* ---- Personal Info ---- */}
              {activeTab === "personal" && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                  <div className="flex justify-between items-center border-b border-border pb-3 mb-6">
                    <h3 className="text-xl font-bold flex items-center gap-2"><span className="material-symbols-outlined text-primary">badge</span> ข้อมูลพื้นฐาน</h3>
                  </div>
                  <PersonalInfoCard data={profileData.personalInfo} isReadOnly={true} />
                  <AddressCard title="ที่อยู่ตามบัตรประชาชน" icon="home" data={profileData.personalInfo} isReadOnly={true} showContactInfo={false} />
                  <AddressCard title="ที่อยู่ปัจจุบัน/ที่ติดต่อได้" icon="contact_mail" data={profileData.personalInfo} isReadOnly={true} showContactInfo={true} />
                  <WorkplaceCard data={profileData.workHistory} isReadOnly={true} />
                </div>
              )}

              {/* ---- Education Timeline ---- */}
              {activeTab === "education" && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                  <h3 className="text-xl font-bold flex items-center gap-2 border-b border-border pb-3 mb-6"><span className="material-symbols-outlined text-primary">history_edu</span> ประวัติการศึกษา</h3>
                  <EducationTimeline entries={s.educationTimeline} />
                </div>
              )}

              {/* ---- Work History ---- */}
              {activeTab === "work" && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                  <div className="flex justify-between items-center border-b border-border pb-3 mb-6">
                    <h3 className="text-xl font-bold flex items-center gap-2"><span className="material-symbols-outlined text-primary">work</span> ประวัติการทำงาน</h3>
                    <Button variant="outline" size="sm" className="h-8 text-xs gap-1 rounded-full"><span className={icon18}>edit</span> ขอแก้ไขประวัติ</Button>
                  </div>
                  <div className="space-y-6">
                    <div className="bg-primary/5 p-6 rounded-2xl border border-primary/10">
                      <h4 className="text-sm font-semibold mb-5 flex items-center gap-2 text-primary"><span className="material-symbols-outlined">apartment</span> ที่ทำงานปัจจุบัน</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                          <label className="block text-xs text-muted-foreground mb-1 uppercase tracking-wider font-semibold">สถานที่ทำงาน</label>
                          <div className="text-sm font-medium">{profileData.workHistory.currentWorkplace}</div>
                        </div>
                        <div>
                          <label className="block text-xs text-muted-foreground mb-1 uppercase tracking-wider font-semibold">เบอร์โทรศัพท์ที่ทำงาน</label>
                          <div className="text-sm font-medium">{profileData.workHistory.workplacePhone}</div>
                        </div>
                        <div>
                          <label className="block text-xs text-muted-foreground mb-1 uppercase tracking-wider font-semibold">ตำแหน่ง</label>
                          <div className="text-sm font-medium">{profileData.workHistory.position}</div>
                        </div>
                        <div>
                          <label className="block text-xs text-muted-foreground mb-1 uppercase tracking-wider font-semibold">ระดับ</label>
                          <div className="text-sm font-medium">{profileData.workHistory.level}</div>
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-xs text-muted-foreground mb-1 uppercase tracking-wider font-semibold">หน้าที่ความรับผิดชอบหลัก</label>
                          <div className="text-sm p-3 bg-card rounded-lg border">{profileData.workHistory.responsibilities}</div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-semibold mb-3">ประสบการณ์ทำงานย้อนหลัง</h4>
                      <div className="space-y-3">
                        {profileData.workHistory.previousJobs.map((job, i) => (
                          <div key={i} className="flex gap-4 p-4 rounded-xl border bg-card hover:border-primary/30 transition-colors">
                            <div className="w-16 shrink-0 text-sm font-bold text-primary pt-0.5">{job.year}</div>
                            <div>
                              <div className="text-sm font-bold">{job.position}</div>
                              <div className="text-sm text-muted-foreground mt-0.5">{job.workplace}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ---- Research & Publications ---- */}
              {activeTab === "research" && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                  <div className="flex justify-between items-center border-b border-border pb-3 mb-6">
                    <h3 className="text-xl font-bold flex items-center gap-2"><span className="material-symbols-outlined text-primary">biotech</span> ผลงานวิจัยและวิชาการ</h3>
                    <Button variant="outline" size="sm" className="h-8 text-xs gap-1 rounded-full" onClick={() => setResearchSubmissionOpen(true)}><span className={icon18}>add</span> เพิ่มผลงาน</Button>
                  </div>
                  
                  <div className="space-y-8">
                    <div>
                      <h4 className="text-sm font-semibold mb-3 flex items-center gap-2"><span className="material-symbols-outlined text-primary text-lg">science</span> โครงการวิจัย</h4>
                      <div className="grid gap-3">
                        {profileData.research.projects.map((proj, i) => (
                          <div key={i} className="p-4 rounded-xl border bg-card hover:shadow-sm transition-shadow">
                            <div className="font-semibold text-sm mb-2">{proj.title}</div>
                            <div className="flex flex-wrap gap-4 text-xs">
                              <span className="flex items-center gap-1 bg-muted px-2 py-1 rounded-md text-muted-foreground"><span className="material-symbols-outlined text-sm">person</span> บทบาท: {proj.role}</span>
                              <span className="flex items-center gap-1 bg-muted px-2 py-1 rounded-md text-muted-foreground"><span className="material-symbols-outlined text-sm">calendar_today</span> {proj.period}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-semibold mb-3 flex items-center gap-2"><span className="material-symbols-outlined text-primary text-lg">article</span> ผลงานตีพิมพ์ / นำเสนอวิชาการ</h4>
                      <div className="space-y-2">
                        {profileData.research.publications.map((pub, i) => (
                          <div key={i} className="flex gap-3 text-sm p-3 rounded-xl hover:bg-muted/50 transition-colors">
                            <div className="text-primary mt-0.5"><span className="material-symbols-outlined text-lg">workspace_premium</span></div>
                            <div>
                              <span className="font-medium">{pub.title}</span> <span className="text-muted-foreground font-semibold ml-1">({pub.year})</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-primary/5 p-5 rounded-2xl border border-primary/20">
                      <h4 className="text-sm font-semibold mb-2 text-primary flex items-center gap-2"><span className="material-symbols-outlined text-lg">lightbulb</span> ความสนใจด้านงานวิจัย (Research Interest)</h4>
                      <p className="text-sm leading-relaxed">{profileData.research.interest}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* ---- Registration Tab ---- */}
              {activeTab === "registration" && (
                <div className="min-w-0 animate-in fade-in slide-in-from-bottom-4 duration-300">
                  <h3 className="text-xl font-bold flex items-center gap-2 border-b border-border pb-3 mb-6"><span className="material-symbols-outlined text-primary">how_to_reg</span> วิชาที่ลงทะเบียน (เทอมปัจจุบัน)</h3>
                  <div className="w-full max-w-full overflow-x-auto overscroll-x-contain rounded-xl border shadow-sm">
                    <table className="min-w-[900px] w-full text-sm text-left">
                      <caption className="sr-only">
                        สถานะการลงทะเบียน การชำระเงิน และการตรวจสลิปของแต่ละวิชา
                      </caption>
                      <thead className="bg-muted font-medium text-muted-foreground">
                        <tr>
                          <th className="px-5 py-3.5">รหัสวิชา</th>
                          <th className="px-5 py-3.5">ชื่อวิชา</th>
                          <th className="px-5 py-3.5 text-center">หน่วยกิต</th>
                          <th className="px-5 py-3.5">การลงทะเบียน</th>
                          <th className="px-5 py-3.5">การชำระเงิน</th>
                          <th className="px-5 py-3.5">การตรวจสลิป</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y bg-card">
                        {registrationData.courses.map((course) => (
                          <tr key={course.code} className="hover:bg-muted/30 transition-colors">
                            <td className="px-5 py-4 font-mono font-medium">{course.code}</td>
                            <td className="px-5 py-4 font-medium">{course.title}</td>
                            <td className="px-5 py-4 text-center font-bold text-primary">{course.credits}</td>
                            <td className="px-5 py-4">
                              <StudentRecordBadge
                                kind="enrollment"
                                status={course.enrollmentStatus}
                              />
                            </td>
                            <td className="px-5 py-4">
                              <StudentRecordBadge
                                kind="billing"
                                status={course.billingStatus}
                              />
                            </td>
                            <td className="px-5 py-4">
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

              {/* ---- Documents Tab ---- */}
              {activeTab === "documents" && (
                <div className="min-w-0 animate-in fade-in slide-in-from-bottom-4 duration-300">
                  <h3 className="text-xl font-bold flex items-center gap-2 border-b border-border pb-3 mb-6"><span className="material-symbols-outlined text-primary">folder</span> เอกสารของฉัน</h3>
                  <div className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {studentDocuments.map((doc) => (
                      <button
                        key={doc.id}
                        type="button"
                        className="group flex min-h-48 min-w-0 cursor-pointer flex-col items-center justify-center rounded-2xl border bg-card p-6 text-center transition-all hover:border-primary/50 hover:bg-primary/5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 active:scale-[0.98]"
                        onClick={() => toast.info(`กำลังดาวน์โหลด: ${doc.name}`)}
                        aria-label={`ดาวน์โหลด ${doc.name}`}
                      >
                        <div className="w-16 h-16 rounded-full bg-muted group-hover:bg-primary/10 flex items-center justify-center mb-4 transition-colors">
                          <span className="material-symbols-outlined text-3xl text-muted-foreground group-hover:text-primary transition-colors">{doc.icon}</span>
                        </div>
                        <span className="max-w-full break-words text-sm font-bold transition-colors group-hover:text-primary">{doc.name}</span>
                        <span className="text-xs font-semibold text-muted-foreground mt-1 bg-muted px-2 py-0.5 rounded-full group-hover:bg-background">{doc.extension}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

            </CardContent>
          </Card>
        </div>
      </div>
      
      <ResearchSubmissionDialog open={researchSubmissionOpen} onOpenChange={setResearchSubmissionOpen} />
      <Footer />
    </PageShell>
  );
}
