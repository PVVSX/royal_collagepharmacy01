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

// ─── Data ────────────────────────────────────────────────────────────────────

const STEPS = [
  { id: 1, title: "เลือกสาขาที่สอบ" },
  { id: 2, title: "ตรวจสอบคุณสมบัติ" },
  { id: 3, title: "ยืนยันการสมัคร" },
];

const colleges = [
  {
    id: "วิทยาลัยเภสัชบำบัด",
    name: "วิทยาลัยเภสัชบำบัด",
    abbr: "วภท.",
    icon: "local_hospital",
    examDesc: "สอบประเมินความรู้ Board Certified Pharmacotherapy (BCP) — สอบข้อเขียน, ปากเปล่าข้างเตียง, โครงร่างวิทยานิพนธ์",
    credential: "วุฒิบัตรฯ สาขาเภสัชบำบัด",
  },
  {
    id: "วิทยาลัยการคุ้มครองผู้บริโภค",
    name: "วิทยาลัยการคุ้มครองผู้บริโภคด้านยาฯ",
    abbr: "วคบท.",
    icon: "shield",
    examDesc: "สอบหนังสืออนุมัติฯ สาขาการคุ้มครองผู้บริโภคด้านยาและสุขภาพ",
    credential: "หนังสืออนุมัติฯ สาขาการคุ้มครองผู้บริโภคฯ",
  },
  {
    id: "วิทยาลัยเภสัชกรรมชุมชน",
    name: "วิทยาลัยเภสัชกรรมชุมชน",
    abbr: "วภช.",
    icon: "storefront",
    examDesc: "สอบหนังสืออนุมัติฯ สาขาเภสัชกรรมชุมชน (ประเมินตามเกณฑ์ ต้องมีประสบการณ์ ≥ 10 ปี)",
    credential: "หนังสืออนุมัติฯ สาขาเภสัชกรรมชุมชน",
  },
  {
    id: "วิทยาลัยการบริหารเภสัชกิจ",
    name: "วิทยาลัยการบริหารเภสัชกิจ",
    abbr: "CPAT",
    icon: "business_center",
    examDesc: "สอบวุฒิบัตรฯ สาขาการบริหารเภสัชกิจ (ประเมินให้ผ่านครบ 12 ด้าน)",
    credential: "วุฒิบัตรฯ สาขาการบริหารเภสัชกิจ",
  },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ExamApplicationPage() {
  const { settings, admissions, setAdmissions } = useMockDb();

  const [started, setStarted] = useState(false);
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
    setPayRef(`EXM-${app.id}`);
    setPayAmount("2500");
    setPayFile(null);
    setPayError("");
    setPayCopied("");
    setPayDone(false);
  };

  const handlePayFile = (f?: File) => {
    setPayError("");
    if (!f) { setPayFile(null); return; }
    if (!['image/jpeg', 'image/png', 'application/pdf'].includes(f.type)) { setPayError("รองรับเฉพาะ JPG, PNG, PDF"); return; }
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
    if (currentStep === 3) submitApplication();
    else setCurrentStep((p) => Math.min(p + 1, 3));
  };

  const handlePrev = () => setCurrentStep((p) => Math.max(p - 1, 1));

  const submitApplication = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      const newId = `EXM-2569-${Math.floor(Math.random() * 1000).toString().padStart(3, "0")}`;
      setAdmissions((prev) => [
        {
          id: newId,
          name: `${profileData.personalInfo.title}${profileData.personalInfo.firstName} ${profileData.personalInfo.lastName}`,
          license: profileData.personalInfo.licenseNumber || "รอตรวจสอบ",
          program: selectedCollege || "ไม่ระบุ",
          date: new Date().toLocaleDateString("th-TH", { year: "numeric", month: "short", day: "numeric" }),
          status: "pending",
        },
        ...prev,
      ]);
      toast.success("ส่งใบสมัครสอบเรียบร้อยแล้ว", {
        description: "ระบบได้รับข้อมูลของคุณแล้ว กรุณารอการตรวจสอบจากเจ้าหน้าที่",
      });
      setIsComplete(true);
    }, 1500);
  };

  const resetToLanding = () => {
    setStarted(false);
    setCurrentStep(1);
    setSelectedCollege("");
  };

  // ── Closed ──────────────────────────────────────────────────────────────────
  if (!settings.admissionOpen) {
    return (
      <div className="p-4 md:p-6 pb-16 max-w-[1280px] mx-auto min-h-[70vh] flex flex-col items-center justify-center text-center">
        <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-6">
          <span className="material-symbols-outlined text-4xl text-muted-foreground">event_busy</span>
        </div>
        <h1 className="text-3xl font-bold text-foreground mb-2">ปิดรับสมัครสอบ</h1>
        <p className="text-muted-foreground max-w-md">
          ขณะนี้อยู่นอกช่วงเวลาการเปิดรับสมัครสอบ<br />
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
        <h1 className="text-3xl font-bold mb-2">ส่งใบสมัครสอบสำเร็จแล้ว!</h1>
        <p className="text-muted-foreground max-w-md mb-8">
          ระบบได้รับข้อมูลการสมัครสอบของคุณเรียบร้อยแล้ว<br />
          คุณสามารถติดตามสถานะได้ที่หน้านี้ หรือเมนู <strong>“ข้อมูลของฉัน”</strong>
        </p>
        <div className="flex gap-4">
          <Button variant="outline" onClick={() => { setIsComplete(false); resetToLanding(); }}>กลับหน้าสมัครสอบ</Button>
          <Button onClick={() => (window.location.href = "/students")}>ดูสถานะการสมัคร</Button>
        </div>
      </div>
    );
  }

  // ── Landing: สถานะการสมัคร + ปุ่มเริ่มสมัครสอบ ───────────────────────────────
  if (!started) {
    return (
      <>
        <div className="p-4 md:p-6 pb-16 max-w-[900px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Header */}
          <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden mb-8">
            <div className="border-b-2 border-primary bg-gradient-to-r from-primary/[0.07] to-transparent px-6 py-5">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-2xl text-primary">quiz</span>
                </div>
                <div>
                  <h1 className="text-lg md:text-xl font-bold tracking-tight">ระบบสมัครสอบหนังสืออนุมัติ / วุฒิบัตร</h1>
                  <p className="text-sm text-muted-foreground">สมัครสอบประเมินความรู้เพื่อรับหนังสืออนุมัติ / วุฒิบัตรแสดงความรู้ความชำนาญฯ</p>
                </div>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-6 py-4">
              <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px]">info</span>
                ระบบจะดึงประวัติวิชาชีพที่ลงทะเบียนไว้มาใช้โดยอัตโนมัติ
              </p>
              <Button className="gap-1.5 shrink-0" onClick={() => setStarted(true)}>
                <span className="material-symbols-outlined text-[18px]">edit_document</span>
                เริ่มสมัครสอบ
              </Button>
            </div>
          </div>

          {/* ── สถานะการสมัคร ───────────────────────────────────────────────── */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-primary">receipt_long</span>
                สถานะการสมัครสอบ
              </h2>
              <span className="text-xs text-muted-foreground">{admissions.length} รายการ</span>
            </div>

            {admissions.length === 0 ? (
              <div className="border border-dashed border-border rounded-xl py-10 text-center text-muted-foreground">
                <span className="material-symbols-outlined text-3xl mb-2 block">inbox</span>
                <p className="text-sm">ยังไม่มีประวัติการสมัครสอบ</p>
              </div>
            ) : (
              <div className="border border-border rounded-xl overflow-hidden bg-card divide-y divide-border">
                <div className="hidden md:grid grid-cols-[1fr_1.5fr_100px_auto] gap-4 px-5 py-2.5 bg-muted/40 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  <span>เลขที่คำร้อง</span>
                  <span>วิทยาลัย/สาขาที่สอบ</span>
                  <span>วันที่ยื่น</span>
                  <span className="text-right">สถานะ</span>
                </div>
                {admissions.map((app) => {
                  const statusMap: Record<string, { label: string; color: string; icon: string }> = {
                    pending: { label: "รอดำเนินการ", color: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/30", icon: "pending" },
                    approved: { label: "อนุมัติให้สอบ", color: "bg-green-50 text-green-700 border-green-200 dark:bg-green-500/10 dark:text-green-400 dark:border-green-500/30", icon: "check_circle" },
                    rejected: { label: "ไม่ผ่านการพิจารณา", color: "bg-red-50 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/30", icon: "cancel" },
                    reviewing: { label: "กำลังตรวจสอบ", color: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/30", icon: "manage_search" },
                  };
                  const s = statusMap[app.status] ?? statusMap.pending;
                  const isApproved = app.status === "approved";
                  return (
                    <div key={app.id} className="grid grid-cols-1 md:grid-cols-[1fr_1.5fr_100px_auto] gap-2 md:gap-4 px-5 py-4 hover:bg-muted/20 transition-colors items-center">
                      <div><span className="font-mono text-xs text-primary font-semibold">{app.id}</span></div>
                      <div>
                        <p className="text-sm font-medium leading-snug">{app.program}</p>
                        <p className="text-xs text-muted-foreground">{app.name}</p>
                      </div>
                      <div className="flex items-center"><span className="text-xs text-muted-foreground">{app.date}</span></div>
                      <div className="flex md:justify-end items-center gap-2 flex-wrap">
                        <span className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-1 rounded-full border ${s.color}`}>
                          <span className="material-symbols-outlined text-[13px]">{s.icon}</span>
                          {s.label}
                        </span>
                        {isApproved && (
                          <Button size="sm" className="h-7 px-3 text-xs gap-1 bg-green-600 hover:bg-green-700 text-white shadow-none" onClick={() => openPayment(app)}>
                            <span className="material-symbols-outlined text-[14px]">payments</span>
                            ชำระค่าสมัครสอบ
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
                      เจ้าหน้าที่จะตรวจสอบหลักฐานและยืนยันสิทธิ์การสอบภายใน 1–2 วันทำการ
                    </DialogDescription>
                    <Button className="mt-6 min-w-32" onClick={() => setPayingApp(null)}>ปิด</Button>
                  </div>
                ) : (
                  <>
                    <DialogHeader className="border-b border-border px-6 py-5 pr-16">
                      <DialogTitle className="text-lg">รายละเอียดการสมัครสอบและชำระเงิน</DialogTitle>
                      <DialogDescription className="text-sm">
                        {payingApp.program} · เลขที่คำร้อง {payingApp.id}
                      </DialogDescription>
                    </DialogHeader>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
                      {/* Left — Exam Details */}
                      <div className="lg:col-span-7 border-r border-border p-6 space-y-5">
                        <div>
                          <h3 className="text-sm font-semibold mb-3 pb-2 border-b border-border">ข้อมูลการสมัครสอบ</h3>
                          <div className="space-y-2.5 text-sm">
                            {[
                              { label: "วิทยาลัย/สาขาที่สอบ", value: payingApp.program },
                              { label: "ผู้สมัครสอบ", value: payingApp.name },
                              { label: "เลขที่ใบประกอบวิชาชีพ", value: profileData.personalInfo.licenseNumber || "รอตรวจสอบ" },
                              { label: "รอบการสอบ", value: "ครั้งที่ 2/2569" },
                              { label: "วันสอบ (โดยประมาณ)", value: "15 กันยายน 2569" },
                              { label: "สถานที่สอบ", value: "ราชวิทยาลัยเภสัชกรรมแห่งประเทศไทย" },
                              { label: "รหัสอ้างอิง", value: payingApp.id },
                            ].map(({ label, value }) => (
                              <div key={label} className="flex gap-3">
                                <span className="text-muted-foreground w-44 flex-shrink-0">{label}</span>
                                <span className="font-medium">{value}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div>
                          <h3 className="text-sm font-semibold mb-3 pb-2 border-b border-border">รายการค่าธรรมเนียม</h3>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">ค่าสมัครสอบหนังสืออนุมัติ/วุฒิบัตร</span>
                              <span>2,500 บาท</span>
                            </div>
                            <div className="flex justify-between font-semibold pt-2 border-t border-border">
                              <span>รวมทั้งสิ้น</span>
                              <span className="text-primary text-base">2,500 บาท</span>
                            </div>
                          </div>
                        </div>

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
                          <Input value={payRef} onChange={(e) => setPayRef(e.target.value)} placeholder="EXM-2569-001" />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs font-medium">จำนวนเงินที่โอน</label>
                          <div className="relative">
                            <Input type="number" min="0.01" step="0.01" className="pr-12" value={payAmount} onChange={(e) => setPayAmount(e.target.value)} />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">บาท</span>
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <span className="text-xs font-medium">สลิป / หลักฐานการโอน</span>
                          <input ref={payFileRef} type="file" className="hidden" accept=".jpg,.jpeg,.png,.pdf" onChange={(e) => handlePayFile(e.target.files?.[0])} />
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

  // ── Multi-step Flow (สมัครสอบ) ───────────────────────────────────────────────
  const selectedCollegeObj = colleges.find((c) => c.id === selectedCollege);

  return (
    <>
      <div className="p-4 md:p-6 pb-16 max-w-[1024px] mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

        {/* Header */}
        <div className="flex items-center gap-3 mb-2">
          <button
            onClick={resetToLanding}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <span className="material-symbols-outlined text-base">arrow_back</span> กลับหน้าสถานะ
          </button>
          <span className="text-muted-foreground/30">|</span>
          <div className="flex items-center gap-1.5 text-sm font-semibold text-primary">
            <span className="material-symbols-outlined text-base">quiz</span>
            สมัครสอบหนังสืออนุมัติ / วุฒิบัตร
          </div>
        </div>

        {/* Stepper */}
        <div className="flex items-center justify-between relative px-4 md:px-10 mb-2">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-muted -z-10 rounded-full" />
          <div
            className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-primary -z-10 rounded-full transition-all duration-500 ease-in-out"
            style={{ width: `${((currentStep - 1) / (STEPS.length - 1)) * 100}%` }}
          />
          {STEPS.map((step) => {
            const isActive = step.id === currentStep;
            const isCompleted = step.id < currentStep;
            return (
              <div key={step.id} className="flex flex-col items-center gap-2">
                <div
                  className={`w-9 h-9 md:w-10 md:h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 shadow-sm
                    ${isActive ? "bg-primary text-white scale-110 ring-4 ring-primary/20" :
                      isCompleted ? "bg-primary text-white" :
                      "bg-card border-2 border-muted text-muted-foreground"}`}
                >
                  {isCompleted ? <span className="material-symbols-outlined text-lg">check</span> : step.id}
                </div>
                <span className={`text-[10px] md:text-xs font-medium absolute top-12 whitespace-nowrap ${isActive ? "text-primary" : "text-muted-foreground"}`}>
                  {step.title}
                </span>
              </div>
            );
          })}
        </div>

        {/* Step Content */}
        <div className="mt-12">
          <AnimatePresence mode="wait">

            {/* ── STEP 1: เลือกสาขาที่สอบ ────────────────────────────────────── */}
            {currentStep === 1 && (
              <motion.div key="step1" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.3 }}>
                <div className="mb-5">
                  <h2 className="text-lg font-bold mb-1">เลือกวิทยาลัยและสาขาที่ต้องการสมัครสอบ</h2>
                  <p className="text-sm text-muted-foreground">กรุณาเลือก 1 สาขา</p>
                </div>

                <div className="divide-y divide-border border border-border rounded-xl overflow-hidden bg-card">
                  {colleges.map((college) => {
                    const isSelected = selectedCollege === college.id;
                    return (
                      <button
                        key={college.id}
                        onClick={() => setSelectedCollege(college.id)}
                        className={`w-full text-left flex items-center gap-5 px-5 py-5 transition-colors duration-150
                          ${isSelected ? "bg-primary/5 border-l-4 border-l-primary" : "hover:bg-muted/40 border-l-4 border-l-transparent"}`}
                      >
                        <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-colors ${isSelected ? "border-primary bg-primary" : "border-border"}`}>
                          {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-baseline gap-2 mb-0.5">
                            <span className="font-semibold text-[15px] text-foreground">{college.name}</span>
                            <span className="text-xs text-muted-foreground font-mono">({college.abbr})</span>
                          </div>
                          <p className="text-xs text-muted-foreground leading-relaxed">{college.examDesc}</p>
                        </div>
                        <div className="hidden md:flex flex-col items-end gap-1 flex-shrink-0 text-right">
                          <span className="material-symbols-outlined text-primary/60">{college.icon}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* ── STEP 2: ตรวจสอบคุณสมบัติ ───────────────────────────────────── */}
            {currentStep === 2 && (
              <motion.div key="step2" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.3 }} className="space-y-6">
                <div className="bg-primary/5 border border-primary/20 p-4 rounded-xl flex items-start gap-3">
                  <span className="material-symbols-outlined text-primary mt-0.5">auto_awesome</span>
                  <div>
                    <h4 className="font-semibold text-primary text-sm">ดึงประวัติวิชาชีพอัตโนมัติสำเร็จ</h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      ระบบดึงประวัติของคุณมาใช้ประกอบการสมัครสอบแล้ว กรุณาตรวจสอบความถูกต้องก่อนไปขั้นตอนถัดไป
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
              <motion.div key="step3" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.3 }}>
                <Card className="card-shadow border-t-4 border-t-primary">
                  <CardHeader className="text-center pb-2">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="material-symbols-outlined text-primary text-3xl">task_alt</span>
                    </div>
                    <CardTitle className="text-xl">สรุปการสมัครสอบ</CardTitle>
                    <CardDescription>กรุณาตรวจสอบข้อมูลทั้งหมดอีกครั้งก่อนกดส่งคำร้อง</CardDescription>
                  </CardHeader>
                  <CardContent className="mt-4">
                    <div className="bg-muted/30 p-5 rounded-xl border space-y-0 divide-y divide-border">
                      <div className="flex justify-between items-center py-3">
                        <span className="text-sm text-muted-foreground">ประเภทคำร้อง</span>
                        <Badge className="text-sm px-3 py-1 border-0 bg-primary/10 text-primary">
                          <span className="material-symbols-outlined text-[14px] mr-1">quiz</span>
                          สมัครสอบ
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center py-3">
                        <span className="text-sm text-muted-foreground">วิทยาลัย/สาขาที่สอบ</span>
                        <div className="text-right">
                          <div className="text-sm font-semibold">{selectedCollegeObj?.name}</div>
                          <div className="text-xs text-muted-foreground">{selectedCollegeObj?.credential}</div>
                        </div>
                      </div>
                      <div className="flex justify-between items-center py-3">
                        <span className="text-sm text-muted-foreground">ผู้สมัครสอบ</span>
                        <span className="text-sm font-semibold">
                          {profileData.personalInfo.title}{profileData.personalInfo.firstName} {profileData.personalInfo.lastName}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-3">
                        <span className="text-sm text-muted-foreground">เลขที่ใบประกอบวิชาชีพ</span>
                        <span className="text-sm font-semibold font-mono">{profileData.personalInfo.licenseNumber}</span>
                      </div>
                    </div>

                    <div className="mt-5 flex items-start gap-2.5 p-4 rounded-xl bg-muted/30 border border-border/50 text-xs text-muted-foreground">
                      <span className="material-symbols-outlined text-[16px] mt-0.5 flex-shrink-0">info</span>
                      <p>
                        เมื่อกดส่งคำร้อง ระบบจะบันทึกข้อมูลการสมัครสอบและแจ้งไปยังเจ้าหน้าที่เพื่อพิจารณาคุณสมบัติ
                        เจ้าหน้าที่จะติดต่อกลับผ่านอีเมลที่ลงทะเบียนไว้
                      </p>
                    </div>

                    <div className="mt-5 flex justify-center">
                      <Button variant="outline" className="gap-2 border-primary/20 text-primary hover:bg-primary/5" onClick={() => window.open("/print/admission", "_blank")}>
                        <span className="material-symbols-outlined text-[18px]">print</span>
                        พิมพ์ใบสมัครสอบ (PDF)
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
          <Button variant="outline" onClick={handlePrev} disabled={currentStep === 1} className="w-24 gap-1">
            <span className="material-symbols-outlined text-sm">arrow_back</span> กลับ
          </Button>
          <Button
            onClick={handleNext}
            disabled={(currentStep === 1 && !selectedCollege) || isSubmitting}
            className="w-40 gap-1 shadow-sm"
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
