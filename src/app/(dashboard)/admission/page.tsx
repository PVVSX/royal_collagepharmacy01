"use client";

import { useState, useRef } from "react";
import { profileData, financeData } from "@/data";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import Footer from "@/components/layout/Footer";
import { PersonalInfoCard } from "@/components/profile/PersonalInfoCard";
import { AddressCard } from "@/components/profile/AddressCard";
import { WorkplaceCard } from "@/components/profile/WorkplaceCard";
import { useMockDb } from "@/context/MockDbContext";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

// ─── Types ───────────────────────────────────────────────────────────────────

type Mode = "study" | "exam";

// ─── Data ────────────────────────────────────────────────────────────────────

const STEPS = [
  { id: 1, title: "เลือกหลักสูตร" },
  { id: 2, title: "ตรวจสอบประวัติ" },
  { id: 3, title: "ยืนยันการสมัคร" },
];

const colleges = [
  {
    id: "วิทยาลัยเภสัชบำบัด",
    name: "วิทยาลัยเภสัชบำบัด",
    abbr: "วภท.",
    icon: "local_hospital",
    studyDesc: "หลักสูตรวุฒิบัตรฯ สาขาเภสัชบำบัด (BCP) ฝึกอบรม 2–3 ปี",
    examDesc: "สอบประเมินความรู้ Board Certified Pharmacotherapy (BCP)",
    credits: 36,
    duration: "2–3 ปี",
    gradient: "from-blue-600 to-cyan-500",
    accent: "bg-blue-500/10 border-blue-500/30 text-blue-700 dark:text-blue-300",
    dot: "bg-blue-500",
    ring: "ring-blue-500/30",
    activeBg: "bg-blue-500/5 border-blue-500",
  },
  {
    id: "วิทยาลัยการคุ้มครองผู้บริโภค",
    name: "วิทยาลัยการคุ้มครองผู้บริโภคด้านยาฯ",
    abbr: "วคบท.",
    icon: "shield",
    studyDesc: "หนังสืออนุมัติฯ สาขาการคุ้มครองผู้บริโภคด้านยาและสุขภาพ",
    examDesc: "สอบหนังสืออนุมัติฯ สาขาการคุ้มครองผู้บริโภคด้านยาและสุขภาพ",
    credits: 20,
    duration: "5 ปี",
    gradient: "from-orange-500 to-amber-400",
    accent: "bg-orange-500/10 border-orange-500/30 text-orange-700 dark:text-orange-300",
    dot: "bg-orange-500",
    ring: "ring-orange-500/30",
    activeBg: "bg-orange-500/5 border-orange-500",
  },
  {
    id: "วิทยาลัยเภสัชกรรมชุมชน",
    name: "วิทยาลัยเภสัชกรรมชุมชน",
    abbr: "วภช.",
    icon: "storefront",
    studyDesc: "หนังสืออนุมัติฯ สาขาเภสัชกรรมชุมชน ต้องมีประสบการณ์ ≥ 10 ปี",
    examDesc: "สอบหนังสืออนุมัติฯ สาขาเภสัชกรรมชุมชน (ประเมินตามเกณฑ์)",
    credits: 0,
    duration: "ประเมินตามเกณฑ์",
    gradient: "from-emerald-600 to-green-400",
    accent: "bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300",
    dot: "bg-emerald-500",
    ring: "ring-emerald-500/30",
    activeBg: "bg-emerald-500/5 border-emerald-500",
  },
  {
    id: "วิทยาลัยการบริหารเภสัชกิจ",
    name: "วิทยาลัยการบริหารเภสัชกิจ",
    abbr: "CPAT",
    icon: "business_center",
    studyDesc: "วุฒิบัตรฯ สาขาการบริหารเภสัชกิจ หลักสูตร 4 โมดูล ประเมิน 12 ด้าน",
    examDesc: "สอบวุฒิบัตรฯ สาขาการบริหารเภสัชกิจ (ผ่านครบ 12 ด้าน)",
    credits: 24,
    duration: "2–3 ปี",
    gradient: "from-violet-600 to-purple-400",
    accent: "bg-violet-500/10 border-violet-500/30 text-violet-700 dark:text-violet-300",
    dot: "bg-violet-500",
    ring: "ring-violet-500/30",
    activeBg: "bg-violet-500/5 border-violet-500",
  },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdmissionPage() {
  const { settings, admissions, setAdmissions } = useMockDb();

  const [mode, setMode] = useState<Mode | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedCollege, setSelectedCollege] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [payingApp, setPayingApp] = useState<typeof admissions[0] | null>(null);

  // Payment dialog state
  const [payRef, setPayRef] = useState("");
  const [payAmount, setPayAmount] = useState("");
  const [payFile, setPayFile] = useState<File | null>(null);
  const [payError, setPayError] = useState("");
  const [payCopied, setPayCopied] = useState("");
  const [payDone, setPayDone] = useState(false);
  const payFileRef = useRef<HTMLInputElement>(null);

  const openPayment = (app: typeof admissions[0]) => {
    setPayingApp(app);
    setPayRef(`REG-${app.id}`);
    setPayAmount("3500");
    setPayFile(null);
    setPayError("");
    setPayCopied("");
    setPayDone(false);
  };

  const handlePayFile = (f?: File) => {
    setPayError("");
    if (!f) { setPayFile(null); return; }
    if (!['image/jpeg','image/png','application/pdf'].includes(f.type)) { setPayError("รองรับเฉพาะ JPG, PNG, PDF"); return; }
    if (f.size > 5 * 1024 * 1024) { setPayError("ไฟล์ไม่เกิน 5MB"); return; }
    setPayFile(f);
  };

  const handlePaySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!payRef.trim()) { setPayError("กรุณากรอกเลขที่อ้างอิง"); return; }
    if (!payAmount || Number(payAmount) <= 0) { setPayError("กรุณาระบุจำนวนเงิน"); return; }
    if (!payFile) { setPayError("กรุณาแนบสลิปการโอนเงิน"); return; }
    toast.success("ส่งหลักฐานการชำระเงินเรียบร้อย", { description: "เจ้าหน้าที่จะตรวจสอบภายใน 1-2 วันทำการ" });
    setPayDone(true);
  };

  const handleNext = () => {
    if (currentStep === 3) {
      submitApplication();
    } else {
      setCurrentStep((p) => Math.min(p + 1, 3));
    }
  };

  const handlePrev = () => setCurrentStep((p) => Math.max(p - 1, 1));

  const submitApplication = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      const newId = `APP-2026-${Math.floor(Math.random() * 1000).toString().padStart(3, "0")}`;
      setAdmissions((prev) => [
        {
          id: newId,
          name: `${profileData.personalInfo.firstName} ${profileData.personalInfo.lastName}`,
          license: profileData.personalInfo.licenseNumber || "รอตรวจสอบ",
          program: selectedCollege || "ไม่ระบุ",
          date: new Date().toLocaleDateString("th-TH", { year: "numeric", month: "short", day: "numeric" }),
          status: "pending",
        },
        ...prev,
      ]);
      toast.success(mode === "study" ? "ส่งใบสมัครเรียนเรียบร้อยแล้ว" : "ส่งใบสมัครสอบเรียบร้อยแล้ว", {
        description: "ระบบได้รับข้อมูลของคุณแล้ว กรุณารอการตรวจสอบจากเจ้าหน้าที่",
      });
      setIsComplete(true);
    }, 1500);
  };

  // ── Closed ──────────────────────────────────────────────────────────────────
  if (!settings.admissionOpen) {
    return (
      <div className="p-4 md:p-6 pb-16 max-w-[1280px] mx-auto min-h-[70vh] flex flex-col items-center justify-center text-center">
        <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-6">
          <span className="material-symbols-outlined text-4xl text-slate-400">event_busy</span>
        </div>
        <h1 className="text-3xl font-bold text-foreground mb-2">ปิดรับสมัคร</h1>
        <p className="text-muted-foreground max-w-md">
          ขณะนี้อยู่นอกช่วงเวลาการเปิดรับสมัคร<br />
          กรุณาติดตามประกาศเปิดรับสมัครรอบถัดไปทางหน้าเว็บไซต์
        </p>
        <Button className="mt-6" onClick={() => window.history.back()}>กลับไปหน้าก่อนหน้า</Button>
      </div>
    );
  }

  // ── Complete ─────────────────────────────────────────────────────────────────
  if (isComplete) {
    return (
      <div className="p-4 md:p-6 pb-16 max-w-[1024px] mx-auto min-h-[70vh] flex flex-col items-center justify-center text-center animate-in fade-in zoom-in-95 duration-500">
        <div className="w-24 h-24 bg-green-100 dark:bg-green-500/20 rounded-full flex items-center justify-center mb-6 shadow-sm">
          <span className="material-symbols-outlined text-green-600 dark:text-green-400 text-5xl">check_circle</span>
        </div>
        <h1 className="text-3xl font-bold mb-2">
          {mode === "study" ? "ส่งใบสมัครเรียนสำเร็จแล้ว!" : "ส่งใบสมัครสอบสำเร็จแล้ว!"}
        </h1>
        <p className="text-muted-foreground max-w-md mb-8">
          ระบบได้รับข้อมูลการสมัครของคุณเรียบร้อยแล้ว<br />
          คุณสามารถติดตามสถานะได้ที่เมนู <strong>“ข้อมูลของฉัน”</strong>
        </p>
        <div className="flex gap-4">
          <Button variant="outline" onClick={() => (window.location.href = "/dashboard")}>กลับหน้าหลัก</Button>
          <Button onClick={() => (window.location.href = "/students")}>ดูสถานะการสมัคร</Button>
        </div>
      </div>
    );
  }

  // ── Mode Selection ────────────────────────────────────────────────────────────
  if (!mode) {
    return (
      <>
        <div className="p-4 md:p-6 pb-16 max-w-[900px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Header */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary text-xs font-semibold px-3 py-1 rounded-full mb-4">
              <span className="material-symbols-outlined text-sm">school</span>
              ระบบรับสมัคร Online Admission
            </div>
            <h1 className="text-2xl md:text-3xl font-bold mb-3 tracking-tight">คุณต้องการสมัครประเภทใด?</h1>
            <p className="text-muted-foreground text-sm max-w-md mx-auto">
              เลือกประเภทการสมัครเพื่อเริ่มกระบวนการ ทั้งสองประเภทใช้ขั้นตอนเดียวกัน
            </p>
          </div>

          {/* Mode Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* สมัครเรียน */}
            <motion.button
              whileHover={{ y: -4, scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setMode("study")}
              className="group text-left rounded-2xl border-2 border-border bg-card p-0 overflow-hidden shadow-sm hover:shadow-lg hover:border-primary/50 transition-all duration-300 w-full"
            >
              {/* Gradient top banner */}
              <div className="h-2 w-full bg-gradient-to-r from-primary to-[#5C5C00]" />
              <div className="p-7">
                <div className="flex items-start justify-between mb-5">
                  <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <span className="material-symbols-outlined text-3xl text-primary">school</span>
                  </div>
                  <span className="material-symbols-outlined text-muted-foreground/30 group-hover:text-primary/30 text-4xl transition-colors">arrow_forward</span>
                </div>
                <h2 className="text-xl font-bold mb-2">สมัครเรียน</h2>
                <p className="text-sm text-muted-foreground mb-5 leading-relaxed">
                  สมัครเข้าฝึกอบรมหลักสูตรวุฒิบัตร / หนังสืออนุมัติ เพื่อรับการฝึกอบรมในสถาบันฝึกอบรมที่รับรอง
                </p>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary" className="text-xs gap-1">
                    <span className="material-symbols-outlined text-[13px]">timeline</span> 3 ขั้นตอน
                  </Badge>
                  <Badge variant="secondary" className="text-xs gap-1">
                    <span className="material-symbols-outlined text-[13px]">menu_book</span> 4 วิทยาลัย
                  </Badge>
                </div>
              </div>
            </motion.button>

            {/* สมัครสอบ */}
            <motion.button
              whileHover={{ y: -4, scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setMode("exam")}
              className="group text-left rounded-2xl border-2 border-border bg-card p-0 overflow-hidden shadow-sm hover:shadow-lg hover:border-amber-500/50 transition-all duration-300 w-full"
            >
              {/* Gradient top banner */}
              <div className="h-2 w-full bg-gradient-to-r from-amber-500 to-orange-400" />
              <div className="p-7">
                <div className="flex items-start justify-between mb-5">
                  <div className="w-14 h-14 rounded-xl bg-amber-500/10 flex items-center justify-center group-hover:bg-amber-500/20 transition-colors">
                    <span className="material-symbols-outlined text-3xl text-amber-600">quiz</span>
                  </div>
                  <span className="material-symbols-outlined text-muted-foreground/30 group-hover:text-amber-400/50 text-4xl transition-colors">arrow_forward</span>
                </div>
                <h2 className="text-xl font-bold mb-2">สมัครสอบ</h2>
                <p className="text-sm text-muted-foreground mb-5 leading-relaxed">
                  สมัครสอบประเมินความรู้เพื่อรับวุฒิบัตร / หนังสืออนุมัติ หลังผ่านการฝึกอบรมหรือมีคุณสมบัติครบ
                </p>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary" className="text-xs gap-1">
                    <span className="material-symbols-outlined text-[13px]">timeline</span> 3 ขั้นตอน
                  </Badge>
                  <Badge variant="secondary" className="text-xs gap-1">
                    <span className="material-symbols-outlined text-[13px]">workspace_premium</span> 4 วิทยาลัย
                  </Badge>
                </div>
              </div>
            </motion.button>
          </div>

          {/* Info note */}
          <p className="text-center text-xs text-muted-foreground mt-8">
            <span className="material-symbols-outlined text-[14px] align-middle mr-1">info</span>
            ทั้งสองประเภทใช้ข้อมูลประวัติส่วนตัวที่ลงทะเบียนไว้แล้วโดยอัตโนมัติ
          </p>

          {/* ── สถานะการสมัคร ───────────────────────────────────────────────── */}
          <div className="mt-12">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-primary">receipt_long</span>
                สถานะการสมัคร
              </h2>
              <span className="text-xs text-muted-foreground">{admissions.length} รายการ</span>
            </div>

            {admissions.length === 0 ? (
              <div className="border border-dashed border-border rounded-xl py-10 text-center text-muted-foreground">
                <span className="material-symbols-outlined text-3xl mb-2 block">inbox</span>
                <p className="text-sm">ยังไม่มีประวัติการสมัคร</p>
              </div>
            ) : (
              <div className="border border-border rounded-xl overflow-hidden bg-card divide-y divide-border">
                {/* Table header */}
                <div className="hidden md:grid grid-cols-[1fr_1.5fr_100px_auto] gap-4 px-5 py-2.5 bg-muted/40 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  <span>เลขที่คำร้อง</span>
                  <span>วิทยาลัย/หลักสูตร</span>
                  <span>วันที่ยื่น</span>
                  <span className="text-right">สถานะ</span>
                </div>
                {admissions.map((app) => {
                  const statusMap: Record<string, { label: string; color: string; icon: string }> = {
                    pending:   { label: "รอดำเนินการ", color: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/30", icon: "pending" },
                    approved:  { label: "อนุมัติแล้ว",  color: "bg-green-50 text-green-700 border-green-200 dark:bg-green-500/10 dark:text-green-400 dark:border-green-500/30", icon: "check_circle" },
                    rejected:  { label: "ไม่ผ่านการพิจารณา", color: "bg-red-50 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/30", icon: "cancel" },
                    reviewing: { label: "กำลังตรวจสอบ", color: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/30", icon: "manage_search" },
                  };
                  const s = statusMap[app.status] ?? statusMap.pending;
                  const isApproved = app.status === "approved";
                  return (
                    <div key={app.id} className="grid grid-cols-1 md:grid-cols-[1fr_1.5fr_100px_auto] gap-2 md:gap-4 px-5 py-4 hover:bg-muted/20 transition-colors items-center">
                      <div>
                        <span className="font-mono text-xs text-primary font-semibold">{app.id}</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium leading-snug">{app.program}</p>
                        <p className="text-xs text-muted-foreground">{app.name}</p>
                      </div>
                      <div className="flex items-center">
                        <span className="text-xs text-muted-foreground">{app.date}</span>
                      </div>
                      <div className="flex md:justify-end items-center gap-2 flex-wrap">
                        <span className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-1 rounded-full border ${s.color}`}>
                          <span className="material-symbols-outlined text-[13px]">{s.icon}</span>
                          {s.label}
                        </span>
                        {isApproved && (
                          <Button
                            size="sm"
                            className="h-7 px-3 text-xs gap-1 bg-green-600 hover:bg-green-700 text-white shadow-none"
                            onClick={() => openPayment(app)}
                          >
                            <span className="material-symbols-outlined text-[14px]">payments</span>
                            ชำระเงิน
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* ── Payment Dialog ────────────────────────────────────────────── */}
          {payingApp && (
            <Dialog open onOpenChange={(o) => { if (!o) setPayingApp(null); }}>
              <DialogContent className="max-h-[92vh] overflow-y-auto p-0 sm:max-w-5xl">
                {payDone ? (
                  <div className="flex min-h-[380px] flex-col items-center justify-center text-center px-6 py-12">
                    <div className="w-16 h-16 bg-green-100 dark:bg-green-500/20 rounded-full flex items-center justify-center mb-5">
                      <span className="material-symbols-outlined text-green-600 dark:text-green-400 text-4xl">check_circle</span>
                    </div>
                    <DialogTitle className="text-xl mb-2">ส่งหลักฐานการชำระเงินแล้ว</DialogTitle>
                    <DialogDescription className="max-w-sm">
                      เจ้าหน้าที่จะตรวจสอบหลักฐานและยืนยันการลงทะเบียนภายใน 1–2 วันทำการ
                    </DialogDescription>
                    <Button className="mt-6 min-w-32" onClick={() => setPayingApp(null)}>ปิด</Button>
                  </div>
                ) : (
                  <>
                    <DialogHeader className="border-b border-border px-6 py-5 pr-16">
                      <DialogTitle className="text-lg">รายละเอียดการลงทะเบียนและชำระเงิน</DialogTitle>
                      <DialogDescription className="text-sm">
                        {payingApp.program} · เลขที่คำร้อง {payingApp.id}
                      </DialogDescription>
                    </DialogHeader>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
                      {/* Left — Enrollment Details */}
                      <div className="lg:col-span-7 border-r border-border p-6 space-y-5">
                        {/* Program info */}
                        <div>
                          <h3 className="text-sm font-semibold mb-3 pb-2 border-b border-border">ข้อมูลการลงทะเบียน</h3>
                          <div className="space-y-2.5 text-sm">
                            {[
                              { label: "วิทยาลัย/หลักสูตร",   value: payingApp.program },
                              { label: "ผู้ลงทะเบียน",        value: payingApp.name },
                              { label: "เลขที่ใบประกอบวิชาชีพ", value: profileData.personalInfo.licenseNumber || "รอตรวจสอบ" },
                              { label: "ปีการฝึกอบรม",        value: "2569" },
                              { label: "วันเริ่มอบรม",         value: "1 กันยายน 2569" },
                              { label: "วันสิ้นสุด",           value: "31 สิงหาคม 2572" },
                              { label: "สถานที่",              value: "ราชวิทยาลัยเภสัชกรรมแห่งประเทศไทย" },
                              { label: "รหัสลงทะเบียน",       value: payingApp.id },
                            ].map(({ label, value }) => (
                              <div key={label} className="flex gap-3">
                                <span className="text-muted-foreground w-44 flex-shrink-0">{label}</span>
                                <span className="font-medium">{value}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Fee breakdown */}
                        <div>
                          <h3 className="text-sm font-semibold mb-3 pb-2 border-b border-border">รายการค่าธรรมเนียม</h3>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">ค่าธรรมเนียมการอบรม</span>
                              <span>3,000 บาท</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">ค่าสมาชิกรายปี</span>
                              <span>500 บาท</span>
                            </div>
                            <div className="flex justify-between font-semibold pt-2 border-t border-border">
                              <span>รวมทั้งสิ้น</span>
                              <span className="text-primary text-base">3,500 บาท</span>
                            </div>
                          </div>
                        </div>

                        {/* Bank accounts */}
                        <div>
                          <h3 className="text-sm font-semibold mb-3 pb-2 border-b border-border">ช่องทางโอนเงิน</h3>
                          <div className="space-y-3">
                            {financeData.bankAccounts.map((acc, i) => (
                              <div key={i} className="flex items-center justify-between rounded-lg border border-border bg-muted/30 px-4 py-3">
                                <div>
                                  <p className="text-xs text-muted-foreground">{acc.bank} · {acc.branch}</p>
                                  <p className="text-xs text-muted-foreground">{acc.accountName}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="font-mono text-sm font-bold text-primary">{acc.accountNumber}</span>
                                  <button
                                    type="button"
                                    onClick={async () => {
                                      await navigator.clipboard.writeText(acc.accountNumber);
                                      setPayCopied(acc.accountNumber);
                                      setTimeout(() => setPayCopied(""), 1800);
                                    }}
                                    className="text-muted-foreground hover:text-foreground transition-colors"
                                  >
                                    <span className="material-symbols-outlined text-[16px]">
                                      {payCopied === acc.accountNumber ? "check" : "content_copy"}
                                    </span>
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Right — Upload slip */}
                      <form className="lg:col-span-5 p-6 space-y-4" onSubmit={handlePaySubmit}>
                        <h3 className="text-sm font-semibold pb-2 border-b border-border">แจ้งหลักฐานการชำระเงิน</h3>

                        <div className="space-y-1.5">
                          <label className="text-xs font-medium">เลขที่อ้างอิง / Reference No.</label>
                          <Input value={payRef} onChange={(e) => setPayRef(e.target.value)} placeholder="REG-APP-2026-001" />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs font-medium">จำนวนเงินที่โอน</label>
                          <div className="relative">
                            <Input
                              type="number" min="0.01" step="0.01"
                              className="pr-12"
                              value={payAmount}
                              onChange={(e) => setPayAmount(e.target.value)}
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">บาท</span>
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <span className="text-xs font-medium">สลิป / หลักฐานการโอน</span>
                          <input
                            ref={payFileRef}
                            type="file"
                            className="hidden"
                            accept=".jpg,.jpeg,.png,.pdf"
                            onChange={(e) => handlePayFile(e.target.files?.[0])}
                          />
                          <button
                            type="button"
                            onClick={() => payFileRef.current?.click()}
                            className="flex min-h-32 w-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-muted/30 p-4 text-center hover:border-primary transition-colors"
                          >
                            <span className={`material-symbols-outlined mb-1 text-4xl ${payFile ? "text-primary" : "text-muted-foreground"}`}>
                              {payFile ? "check_circle" : "cloud_upload"}
                            </span>
                            <span className="text-xs font-medium break-all">{payFile ? payFile.name : "คลิกเพื่อเลือกไฟล์"}</span>
                            <span className="text-xs text-muted-foreground mt-1">JPG, PNG หรือ PDF · ไม่เกิน 5MB</span>
                          </button>
                        </div>

                        {payError && (
                          <p role="alert" className="rounded-lg bg-destructive/10 px-3 py-2 text-xs text-destructive">{payError}</p>
                        )}

                        <Button type="submit" className="w-full gap-2">
                          <span className="material-symbols-outlined text-[18px]">send</span>
                          ส่งหลักฐานการชำระเงิน
                        </Button>
                      </form>
                    </div>
                  </>
                )}
              </DialogContent>
            </Dialog>
          )}
        </div>
        <Footer />
      </>
    );
  }

  // ── Multi-step Flow ──────────────────────────────────────────────────────────
  const isStudy = mode === "study";
  const modeColor = isStudy ? "text-primary" : "text-amber-600";
  const modeBg = isStudy ? "bg-primary" : "bg-amber-500";
  const modeRing = isStudy ? "ring-primary/20" : "ring-amber-500/20";
  const selectedCollegeObj = colleges.find((c) => c.id === selectedCollege);

  return (
    <>
      <div className="p-4 md:p-6 pb-16 max-w-[1024px] mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

        {/* Header */}
        <div className="flex items-center gap-3 mb-2">
          <button
            onClick={() => { setMode(null); setCurrentStep(1); setSelectedCollege(""); }}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <span className="material-symbols-outlined text-base">arrow_back</span> เปลี่ยนประเภท
          </button>
          <span className="text-muted-foreground/30">|</span>
          <div className={`flex items-center gap-1.5 text-sm font-semibold ${modeColor}`}>
            <span className="material-symbols-outlined text-base">
              {isStudy ? "school" : "quiz"}
            </span>
            {isStudy ? "สมัครเรียน" : "สมัครสอบ"}
          </div>
        </div>

        {/* Stepper */}
        <div className="flex items-center justify-between relative px-4 md:px-10 mb-2">
          {/* Track background */}
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-muted -z-10 rounded-full" />
          {/* Track progress */}
          <div
            className={`absolute left-0 top-1/2 -translate-y-1/2 h-1 ${modeBg} -z-10 rounded-full transition-all duration-500 ease-in-out`}
            style={{ width: `${((currentStep - 1) / (STEPS.length - 1)) * 100}%` }}
          />
          {STEPS.map((step) => {
            const isActive = step.id === currentStep;
            const isCompleted = step.id < currentStep;
            return (
              <div key={step.id} className="flex flex-col items-center gap-2">
                <div
                  className={`w-9 h-9 md:w-10 md:h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 shadow-sm
                    ${isActive ? `${modeBg} text-white scale-110 ring-4 ${modeRing}` :
                      isCompleted ? `${modeBg} text-white` :
                      "bg-card border-2 border-muted text-muted-foreground"}`}
                >
                  {isCompleted ? <span className="material-symbols-outlined text-lg">check</span> : step.id}
                </div>
                <span className={`text-[10px] md:text-xs font-medium absolute top-12 whitespace-nowrap ${isActive ? modeColor : "text-muted-foreground"}`}>
                  {step.title}
                </span>
              </div>
            );
          })}
        </div>

        {/* Step Content */}
        <div className="mt-12">
          <AnimatePresence mode="wait">

            {/* ── STEP 1: เลือกหลักสูตร ───────────────────────────────────────── */}
            {currentStep === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.3 }}
              >
                <div className="mb-5">
                  <h2 className="text-lg font-bold mb-1">
                    เลือกวิทยาลัยและหลักสูตรที่ต้องการ{isStudy ? "สมัครเรียน" : "สมัครสอบ"}
                  </h2>
                  <p className="text-sm text-muted-foreground">กรุณาเลือก 1 วิทยาลัย</p>
                </div>

                <div className="divide-y divide-border border border-border rounded-xl overflow-hidden bg-card">
                  {colleges.map((college, idx) => {
                    const isSelected = selectedCollege === college.id;
                    return (
                      <button
                        key={college.id}
                        onClick={() => setSelectedCollege(college.id)}
                        className={`w-full text-left flex items-center gap-5 px-5 py-5 transition-colors duration-150
                          ${isSelected
                            ? "bg-primary/5 border-l-4 border-l-primary"
                            : "hover:bg-muted/40 border-l-4 border-l-transparent"
                          }`}
                      >
                        {/* Radio indicator */}
                        <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-colors
                          ${isSelected ? "border-primary bg-primary" : "border-border"}`}>
                          {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-baseline gap-2 mb-0.5">
                            <span className={`font-semibold text-[15px] ${isSelected ? "text-foreground" : "text-foreground"}`}>
                              {college.name}
                            </span>
                            <span className="text-xs text-muted-foreground font-mono">({college.abbr})</span>
                          </div>
                          <p className="text-xs text-muted-foreground leading-relaxed">
                            {isStudy ? college.studyDesc : college.examDesc}
                          </p>
                        </div>

                        {/* Meta */}
                        <div className="hidden md:flex flex-col items-end gap-1 flex-shrink-0 text-right">
                          {college.credits > 0 && (
                            <span className="text-xs text-muted-foreground">{college.credits} หน่วยกิต</span>
                          )}
                          <span className="text-xs text-muted-foreground">{college.duration}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* ── STEP 2: ประวัติส่วนตัว ──────────────────────────────────────── */}
            {currentStep === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div className="bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 p-4 rounded-xl flex items-start gap-3">
                  <span className="material-symbols-outlined text-amber-500 mt-0.5">auto_awesome</span>
                  <div>
                    <h4 className="font-semibold text-amber-800 dark:text-amber-400 text-sm">ดึงข้อมูลอัตโนมัติสำเร็จ!</h4>
                    <p className="text-xs text-amber-700/80 dark:text-amber-400/80 mt-1">
                      ระบบได้ดึงข้อมูลประวัติของคุณมากรอกให้แล้ว กรุณาตรวจสอบความถูกต้องก่อนไปขั้นตอนถัดไป
                    </p>
                  </div>
                </div>
                <PersonalInfoCard data={profileData.personalInfo} isReadOnly={true} />
                <AddressCard title="ที่อยู่ตามบัตรประชาชน" icon="home" data={profileData.personalInfo} isReadOnly={true} showContactInfo={false} />
                <AddressCard title="ที่อยู่ปัจจุบัน/ที่ติดต่อได้" icon="contact_mail" data={profileData.personalInfo} isReadOnly={true} showContactInfo={true} />
                <WorkplaceCard data={profileData.workHistory} isReadOnly={true} />
              </motion.div>
            )}

            {/* ── STEP 3: ยืนยัน ───────────────────────────────────────────────── */}
            {currentStep === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="card-shadow border-t-4 border-t-green-500">
                  <CardHeader className="text-center pb-2">
                    <div className="w-16 h-16 bg-green-100 dark:bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="material-symbols-outlined text-green-600 dark:text-green-400 text-3xl">task_alt</span>
                    </div>
                    <CardTitle className="text-xl">สรุปการ{isStudy ? "สมัครเรียน" : "สมัครสอบ"}</CardTitle>
                    <CardDescription>กรุณาตรวจสอบข้อมูลทั้งหมดอีกครั้งก่อนกดส่งคำร้อง</CardDescription>
                  </CardHeader>
                  <CardContent className="mt-4">
                    <div className="bg-muted/30 p-5 rounded-xl border space-y-0 divide-y divide-border">
                      {/* ประเภทการสมัคร */}
                      <div className="flex justify-between items-center py-3">
                        <span className="text-sm text-muted-foreground">ประเภทการสมัคร</span>
                        <Badge className={`text-sm px-3 py-1 border-0 ${isStudy ? "bg-primary/10 text-primary" : "bg-amber-500/10 text-amber-700"}`}>
                          <span className="material-symbols-outlined text-[14px] mr-1">{isStudy ? "school" : "quiz"}</span>
                          {isStudy ? "สมัครเรียน" : "สมัครสอบ"}
                        </Badge>
                      </div>
                      {/* หลักสูตร */}
                      <div className="flex justify-between items-center py-3">
                        <span className="text-sm text-muted-foreground">วิทยาลัยที่เลือก</span>
                        <div className="text-right">
                          <div className="text-sm font-semibold">{selectedCollegeObj?.name}</div>
                          <div className="text-xs text-muted-foreground">{selectedCollegeObj?.abbr}</div>
                        </div>
                      </div>
                      {/* ผู้สมัคร */}
                      <div className="flex justify-between items-center py-3">
                        <span className="text-sm text-muted-foreground">ผู้สมัคร</span>
                        <span className="text-sm font-semibold">
                          {profileData.personalInfo.title}{profileData.personalInfo.firstName} {profileData.personalInfo.lastName}
                        </span>
                      </div>
                      {/* เลขที่ใบประกอบ */}
                      <div className="flex justify-between items-center py-3">
                        <span className="text-sm text-muted-foreground">เลขที่ใบประกอบวิชาชีพ</span>
                        <span className="text-sm font-semibold font-mono">{profileData.personalInfo.licenseNumber}</span>
                      </div>
                    </div>

                    {/* Disclaimer */}
                    <div className="mt-5 flex items-start gap-2.5 p-4 rounded-xl bg-muted/30 border border-border/50 text-xs text-muted-foreground">
                      <span className="material-symbols-outlined text-[16px] mt-0.5 flex-shrink-0">info</span>
                      <p>
                        เมื่อกดส่งคำร้อง ระบบจะบันทึกข้อมูลการสมัครของคุณและแจ้งไปยังเจ้าหน้าที่เพื่อดำเนินการต่อไป
                        เจ้าหน้าที่จะติดต่อกลับผ่านอีเมลที่ลงทะเบียนไว้
                      </p>
                    </div>

                    {/* Print */}
                    <div className="mt-5 flex justify-center">
                      <Button
                        variant="outline"
                        className="gap-2 border-primary/20 text-primary hover:bg-primary/5"
                        onClick={() => window.open("/print/admission", "_blank")}
                      >
                        <span className="material-symbols-outlined text-[18px]">print</span>
                        พิมพ์ใบสมัคร (PDF)
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

          </AnimatePresence>
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center pt-6 mt-4 border-t">
          <Button
            variant="outline"
            onClick={handlePrev}
            disabled={currentStep === 1}
            className="w-24 gap-1"
          >
            <span className="material-symbols-outlined text-sm">arrow_back</span> กลับ
          </Button>

          <Button
            onClick={handleNext}
            disabled={(currentStep === 1 && !selectedCollege) || isSubmitting}
            className={`w-40 gap-1 shadow-sm ${currentStep === 3 ? "bg-green-600 hover:bg-green-700 text-white" : ""}`}
          >
            {isSubmitting ? (
              <>
                <span className="material-symbols-outlined animate-spin text-sm">progress_activity</span>
                กำลังส่ง...
              </>
            ) : currentStep === 3 ? (
              <>
                <span className="material-symbols-outlined text-sm">send</span>
                ส่งคำร้อง
              </>
            ) : (
              <>
                ถัดไป
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </>
            )}
          </Button>
        </div>

      </div>
      <Footer />
    </>
  );
}
