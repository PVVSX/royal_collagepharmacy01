"use client";

import Footer from "@/components/layout/Footer";
import { toast } from "sonner";
import { useState } from "react";
import { studentDetailData, profileData, registrationData, financeData, requestsData } from "@/data";
import { currentMemberPassport } from "@/lib/domain";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { PersonalInfoCard } from "@/components/profile/PersonalInfoCard";
import { AddressCard } from "@/components/profile/AddressCard";
import { WorkplaceCard } from "@/components/profile/WorkplaceCard";

const icon20 = "material-symbols-outlined text-[20px]";
const icon18 = "material-symbols-outlined text-[18px]";

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

  const icon16 = "material-symbols-outlined text-[16px]";

  return (
    <div className="p-4 md:p-6 pb-16 max-w-[1280px] mx-auto space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <a href="/dashboard" className="hover:text-primary transition-colors">หน้าหลัก</a>
        <span className={`${icon18} text-muted-foreground/50`}>chevron_right</span>
        <span className="text-primary font-medium flex items-center gap-1">
          <span className={icon18}>person</span> ข้อมูลของฉัน
        </span>
      </div>

      {/* Hero Banner Section */}
      <div className="relative rounded-3xl overflow-hidden bg-card border shadow-sm">
        {/* Banner Background */}
        <div className="h-36 md:h-52 w-full bg-gradient-to-r from-[#6b7030] via-[#555a20] to-[#3a3f10] relative overflow-hidden">
          <div className="absolute inset-0 opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/diagmonds-light.png')]" />
          {/* Logo Watermark */}
          <div className="absolute -right-10 md:-right-20 top-1/2 -translate-y-1/2 opacity-[0.08] pointer-events-none mix-blend-screen">
            <img src="/watermark_council.png" alt="Watermark" className="w-[300px] h-[300px] md:w-[450px] md:h-[450px] object-contain" />
          </div>
          {/* Decorative gradients */}
          <div className="absolute -left-20 -top-20 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        </div>
        
        <div className="px-6 pb-6 md:px-8 md:pb-8 relative">
          <div className="flex flex-col md:flex-row justify-between gap-6">
            {/* Avatar & Basic Info */}
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
              {/* Profile Picture with Completion Ring */}
              <div className="relative shrink-0 -mt-16 md:-mt-20 z-10 group">
                <div className="absolute inset-0 rounded-full border-[6px] border-emerald-500/20" />
                <div className="absolute inset-0 rounded-full border-[6px] border-emerald-500" style={{ clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 50%)" }} />
                <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-card shadow-2xl overflow-hidden bg-white relative">
                  <img src="/somchai_profile.png" alt={s.name} className="w-full h-full object-cover object-top" />
                </div>
                {/* Completion badge */}
                <div className="absolute bottom-1 md:bottom-2 right-1 md:right-2 bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-md border-2 border-card">
                  100%
                </div>
              </div>

              <div className="text-center md:text-left pt-2 md:pt-4 flex-1">
                <div className="flex flex-col md:flex-row md:items-end justify-center md:justify-start gap-2 md:gap-3 mb-1">
                  <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
                    {profileData.personalInfo.title}{profileData.personalInfo.firstName} {profileData.personalInfo.lastName}
                    <span className="text-base md:text-lg text-muted-foreground font-medium ml-2">ภ.บ., BCP Candidate</span>
                  </h1>
                  <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 mb-1 shrink-0">
                    กำลังศึกษา
                  </Badge>
                </div>
                
                {/* Workplace & Context */}
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 text-sm text-foreground/80 font-medium mb-3">
                  <span className="flex items-center gap-1.5"><span className="material-symbols-outlined text-[16px] text-primary">work</span> {profileData.workHistory.position}, {profileData.workHistory.currentWorkplace}</span>
                  <span className="text-muted-foreground/30 hidden md:inline">•</span>
                  <span className="text-muted-foreground">{s.college} — ปีการศึกษา {s.trainingYear}</span>
                </div>
                
                {/* Specialty Tags */}
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-4">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mr-1">สาขาที่มุ่งพัฒนา:</span>
                  {currentMemberPassport.focusAreas.map((area) => (
                    <Badge key={area} variant="secondary" className="bg-[#4D5A2D]/10 text-[#4D5A2D] dark:text-[#c4c48a] dark:bg-[#4D5A2D]/20 border border-[#4D5A2D]/20 font-medium px-2.5 py-0.5 shadow-sm">
                      <span className="material-symbols-outlined text-[12px] mr-1 text-[#4D5A2D] dark:text-[#c4c48a]">stars</span> {area}
                    </Badge>
                  ))}
                </div>

                {/* IDs & Contact */}
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-5 gap-y-2 text-xs md:text-sm text-muted-foreground bg-muted/30 p-2.5 rounded-lg border border-border/50 inline-flex">
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
                    <div className="relative w-[340px] h-[540px] rounded-[24px] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.4)] bg-gradient-to-br from-[#737300] to-[#4a4a00] text-white flex flex-col items-center p-6">
                      <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '16px 16px' }}></div>
                      <div className="relative z-10 flex items-center gap-3 w-full pb-4 mb-5 mt-2">
                        <div className="bg-white p-1 rounded-md shrink-0">
                          <img src="/logo_pharmacy.jpg" alt="Logo" className="w-8 h-8 object-contain" />
                        </div>
                        <div className="text-left">
                          <div className="font-bold text-sm tracking-tight leading-tight drop-shadow-sm">ราชวิทยาลัยเภสัชกรรมแห่งประเทศไทย</div>
                          <div className="text-[9px] opacity-80 tracking-wider">ROYAL PHARMACY COLLEGE OF THAILAND</div>
                        </div>
                      </div>
                      <div className="relative z-10 flex flex-col items-center text-center w-full">
                        <div className="w-24 h-24 rounded-full border-4 border-white/30 overflow-hidden shadow-xl bg-white/10 shrink-0 mb-3">
                          <img src="/somchai_profile.png" alt="Profile" className="w-full h-full object-cover object-top" />
                        </div>
                        <h2 className="text-xl font-bold mt-1">{profileData.personalInfo.title}{profileData.personalInfo.firstName} {profileData.personalInfo.lastName}</h2>
                        <div className="text-sm opacity-90 mb-1">{profileData.personalInfo.title} {profileData.personalInfo.firstNameEn} {profileData.personalInfo.lastNameEn}</div>
                        <div className="mt-2 bg-white/20 px-3 py-1 rounded-full text-xs font-medium backdrop-blur-sm">
                          สมาชิกราชวิทยาลัย
                        </div>
                      </div>
                      <div className="relative z-10 w-full mt-5 space-y-2 text-sm bg-black/10 p-3.5 rounded-lg backdrop-blur-sm">
                        <div className="flex justify-between items-center px-1">
                          <span className="opacity-70 text-xs">เลขที่ใบประกอบฯ</span>
                          <span className="font-medium tracking-wide">{profileData.personalInfo.licenseNumber}</span>
                        </div>
                        <div className="flex justify-between items-center px-1">
                          <span className="opacity-70 text-xs">สถานะ</span>
                          <span className="font-medium text-green-300">ปกติ (Active)</span>
                        </div>
                      </div>
                      <div className="relative z-10 mt-auto flex flex-col items-center bg-white text-black p-3 rounded-lg shadow-xl w-full max-w-[200px] mb-2">
                        <div className="w-24 h-24 bg-muted rounded-md overflow-hidden shrink-0">
                          <img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(currentMemberPassport.verifyToken)}`} alt="QR Code" className="w-full h-full" />
                        </div>
                        <span className="text-[10px] text-muted-foreground font-medium mt-2">สแกนเพื่อยืนยันตัวตน</span>
                      </div>
                    </div>
                    <div className="mt-6 flex gap-3 w-full justify-center">
                      <Button variant="outline" className="gap-2 bg-white/10 hover:bg-white/20 text-white border-white/20 backdrop-blur-md rounded-full px-5 h-10 shadow-lg">
                        <span className="material-symbols-outlined text-[18px]">download</span> บันทึกรูปภาพ
                      </Button>
                      <Button className="gap-2 bg-white text-primary hover:bg-white/90 rounded-full px-5 h-10 shadow-lg font-medium">
                        <span className="material-symbols-outlined text-[18px]">share</span> แชร์บัตร
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
              <div className="text-[10px] text-muted-foreground text-right mt-0.5">เหลืออีก {s.cpdTarget - s.cpdCredits} หน่วยกิต</div>
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
              <div className="text-[10px] text-muted-foreground text-right mt-0.5">ครึ่งทางแล้ว!</div>
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
              <div className="text-[10px] text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 px-2 py-0.5 rounded-md mt-2 inline-flex w-max items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" /> กำลังดำเนินการสอบ 1 วิชา
              </div>
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
              <div className="text-[10px] text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 px-2 py-0.5 rounded-md mt-2 inline-flex w-max items-center gap-1">
                <span className="material-symbols-outlined text-[12px]">verified</span> สถานะ: ปกติ (Active)
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Layout - Sidebar Tabs + Content Panel */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left Sidebar Tabs */}
        <div className="w-full lg:w-64 shrink-0 flex flex-row lg:flex-col gap-2 overflow-x-auto lg:overflow-x-visible pb-2 lg:pb-0 scrollbar-hide">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
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
        <div className="flex-1">
          <Card className="min-h-[500px] border shadow-sm bg-card rounded-lg overflow-hidden">
            <CardContent className="p-6 md:p-8">
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
                  <div className="relative border-l-2 border-primary/30 ml-4 space-y-8 mt-6">
                    {s.educationTimeline.map((edu, i) => (
                      <div key={i} className="relative pl-8">
                        <span
                          className={`absolute -left-[9px] top-1.5 w-4 h-4 rounded-full ring-4 ring-card ${
                            edu.isCurrent ? "bg-primary shadow-lg" : "bg-muted-foreground/30"
                          }`}
                        />
                        <h4 className="font-bold text-base text-foreground">{edu.degree}</h4>
                        <p className="text-sm font-medium text-primary mt-1">
                          {edu.institution} — {edu.field}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1 bg-muted px-2 py-1 rounded-md inline-block">{edu.period}</p>
                      </div>
                    ))}
                  </div>
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
                    <div className="bg-primary/5 p-6 rounded-lg border border-primary/10">
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
                          <div key={i} className="flex gap-4 p-4 rounded-lg border bg-card hover:border-primary/30 transition-colors">
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
                    <Button variant="outline" size="sm" className="h-8 text-xs gap-1 rounded-full"><span className={icon18}>add</span> เพิ่มผลงาน</Button>
                  </div>
                  
                  <div className="space-y-8">
                    <div>
                      <h4 className="text-sm font-semibold mb-3 flex items-center gap-2"><span className="material-symbols-outlined text-primary text-lg">science</span> โครงการวิจัย</h4>
                      <div className="grid gap-3">
                        {profileData.research.projects.map((proj, i) => (
                          <div key={i} className="p-4 rounded-lg border bg-card hover:shadow-sm transition-shadow">
                            <div className="font-semibold text-sm mb-2">{proj.title}</div>
                            <div className="flex flex-wrap gap-4 text-xs">
                              <span className="flex items-center gap-1 bg-muted px-2 py-1 rounded-md text-muted-foreground"><span className="material-symbols-outlined text-[14px]">person</span> บทบาท: {proj.role}</span>
                              <span className="flex items-center gap-1 bg-muted px-2 py-1 rounded-md text-muted-foreground"><span className="material-symbols-outlined text-[14px]">calendar_today</span> {proj.period}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-semibold mb-3 flex items-center gap-2"><span className="material-symbols-outlined text-primary text-lg">article</span> ผลงานตีพิมพ์ / นำเสนอวิชาการ</h4>
                      <div className="space-y-2">
                        {profileData.research.publications.map((pub, i) => (
                          <div key={i} className="flex gap-3 text-sm p-3 rounded-lg hover:bg-muted/50 transition-colors">
                            <div className="text-primary mt-0.5"><span className="material-symbols-outlined text-[18px]">workspace_premium</span></div>
                            <div>
                              <span className="font-medium">{pub.title}</span> <span className="text-muted-foreground font-semibold ml-1">({pub.year})</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-primary/5 p-5 rounded-lg border border-primary/20">
                      <h4 className="text-sm font-semibold mb-2 text-primary flex items-center gap-2"><span className="material-symbols-outlined text-lg">lightbulb</span> ความสนใจด้านงานวิจัย (Research Interest)</h4>
                      <p className="text-sm leading-relaxed">{profileData.research.interest}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* ---- Registration Tab ---- */}
              {activeTab === "registration" && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                  <h3 className="text-xl font-bold flex items-center gap-2 border-b border-border pb-3 mb-6"><span className="material-symbols-outlined text-primary">how_to_reg</span> วิชาที่ลงทะเบียน (เทอมปัจจุบัน)</h3>
                  <div className="rounded-lg border overflow-hidden shadow-sm">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-muted font-medium text-muted-foreground">
                        <tr>
                          <th className="px-5 py-3.5">รหัสวิชา</th>
                          <th className="px-5 py-3.5">ชื่อวิชา</th>
                          <th className="px-5 py-3.5 text-center">หน่วยกิต</th>
                          <th className="px-5 py-3.5">สถานะ</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y bg-card">
                        {registrationData.courses.map((course, i) => (
                          <tr key={i} className="hover:bg-muted/30 transition-colors">
                            <td className="px-5 py-4 font-mono font-medium">{course.code}</td>
                            <td className="px-5 py-4 font-medium">{course.title}</td>
                            <td className="px-5 py-4 text-center font-bold text-primary">{course.credits}</td>
                            <td className="px-5 py-4">
                              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">ลงทะเบียนแล้ว</Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* ---- Finance Tab ---- */}
              {activeTab === "finance" && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                  <h3 className="text-xl font-bold flex items-center gap-2 border-b border-border pb-3 mb-6"><span className="material-symbols-outlined text-primary">payments</span> ประวัติการชำระเงิน</h3>
                  <div className="space-y-3">
                    {financeData.items.map((item, i) => (
                      <div key={i} className="flex flex-col md:flex-row md:items-center justify-between p-5 rounded-lg border bg-card gap-4 hover:shadow-sm transition-shadow">
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${item.status === 'paid' ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'}`}>
                            <span className="material-symbols-outlined">{item.status === 'paid' ? 'check' : 'schedule'}</span>
                          </div>
                          <div>
                            <div className="font-bold text-sm">{item.description}</div>
                            <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                              <span className="material-symbols-outlined text-[12px]">calendar_today</span> 
                              กำหนดชำระ: {item.dueDate}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 pl-14 md:pl-0">
                          <div className="text-lg font-bold text-foreground">฿{item.amount.toLocaleString()}</div>
                          <Badge variant="outline" className={`min-w-[80px] justify-center ${item.status === "paid" ? "bg-green-50 text-green-700 border-green-200" : "bg-amber-50 text-amber-700 border-amber-200"}`}>
                            {item.status === "paid" ? "ชำระแล้ว" : "รอชำระเงิน"}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ---- Requests Tab ---- */}
              {activeTab === "requests" && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                  <h3 className="text-xl font-bold flex items-center gap-2 border-b border-border pb-3 mb-6"><span className="material-symbols-outlined text-primary">description</span> คำร้องของฉัน</h3>
                  <div className="space-y-3">
                    {requestsData.map((req, i) => (
                      <div key={i} className="flex flex-col md:flex-row md:items-center justify-between p-5 rounded-lg border bg-card gap-4 hover:shadow-sm transition-shadow">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center shrink-0 text-muted-foreground">
                            <span className="material-symbols-outlined">draft</span>
                          </div>
                          <div>
                            <div className="font-bold text-sm">{req.type}</div>
                            <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                              <span className="material-symbols-outlined text-[12px]">calendar_clock</span> 
                              ยื่นเมื่อ: {req.date}
                            </div>
                          </div>
                        </div>
                        <div className="pl-14 md:pl-0">
                          <Badge variant="outline" className={
                            req.status === "approved" ? "bg-green-50 text-green-700 border-green-200" :
                            req.status === "pending" ? "bg-amber-50 text-amber-700 border-amber-200" :
                            "bg-red-50 text-red-700 border-red-200"
                          }>
                            {req.status === "approved" ? "อนุมัติแล้ว" : req.status === "pending" ? "รอดำเนินการ" : "ปฏิเสธ"}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ---- Documents Tab ---- */}
              {activeTab === "documents" && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                  <h3 className="text-xl font-bold flex items-center gap-2 border-b border-border pb-3 mb-6"><span className="material-symbols-outlined text-primary">folder</span> เอกสารของฉัน</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                    {[
                      { name: "บัตรประจำตัวผู้เข้าศึกษา", ext: "PDF", icon: "badge" },
                      { name: "ใบรับรองการเป็นผู้เข้าศึกษา", ext: "PDF", icon: "school" },
                      { name: "ใบแจ้งผลการศึกษา (Transcript)", ext: "PDF", icon: "description" },
                      { name: "ใบเสร็จรับเงินค่าลงทะเบียน", ext: "PDF", icon: "receipt" }
                    ].map((doc, i) => (
                      <div key={i} className="flex flex-col items-center justify-center p-6 rounded-lg border bg-card hover:bg-primary/5 hover:border-primary/50 transition-all text-center cursor-pointer group" onClick={() => toast.info(`กำลังดาวน์โหลด: ${doc.name}`)}>
                        <div className="w-16 h-16 rounded-full bg-muted group-hover:bg-primary/10 flex items-center justify-center mb-4 transition-colors">
                          <span className="material-symbols-outlined text-3xl text-muted-foreground group-hover:text-primary transition-colors">{doc.icon}</span>
                        </div>
                        <span className="text-sm font-bold group-hover:text-primary transition-colors">{doc.name}</span>
                        <span className="text-xs font-semibold text-muted-foreground mt-1 bg-muted px-2 py-0.5 rounded-full group-hover:bg-background">{doc.ext}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </CardContent>
          </Card>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}
