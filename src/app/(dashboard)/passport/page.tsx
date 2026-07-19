"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import {
  getCurrentPassportSync,
  fullNameTh,
  fullNameEn,
  ageFromDob,
  maskCitizenId,
  formatThaiDate,
  cpdProgressPct,
  cpdRemaining,
  competenciesByCluster,
  effectiveLevel,
  daysUntilLicenseExpiry,
  verifyUrl,
  proficiencyLabels,
  licenseStatusLabels,
  credentialTypeLabels,
  verificationLabels,
  type Verification,
  type ProficiencyLevel,
} from "@/lib/domain";

// ─── UI helpers ──────────────────────────────────────────────────────────────

const toneClass: Record<string, string> = {
  ok: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/30",
  warn: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:border-amber-500/30",
  danger: "bg-red-50 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-300 dark:border-red-500/30",
  muted: "bg-muted text-muted-foreground border-border",
};

function VerifyBadge({ verification }: { verification: Verification }) {
  const meta = verificationLabels[verification.status];
  const icon =
    verification.status === "verified" ? "verified"
    : verification.status === "pending" ? "hourglass_top"
    : verification.status === "rejected" ? "cancel"
    : "edit_note";
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium ${toneClass[meta.tone]}`}
      title={verification.verifiedBy ? `${meta.th} · ${verification.verifiedBy}` : meta.th}
    >
      <span className="material-symbols-outlined text-[13px]">{icon}</span>
      {meta.th}
    </span>
  );
}

/** แถบระดับความชำนาญ 1–4 */
function ProficiencyMeter({ level, verified }: { level: ProficiencyLevel; verified: boolean }) {
  return (
    <div className="flex items-center gap-0.5" title={proficiencyLabels[level]}>
      {[1, 2, 3, 4].map((n) => (
        <span
          key={n}
          className={`h-1.5 w-5 rounded-full ${
            n <= level ? (verified ? "bg-primary" : "bg-primary/40") : "bg-muted"
          }`}
        />
      ))}
    </div>
  );
}

/** หัวข้อ section แบบเอกสารราชการ */
function SectionHeader({ label, icon, sub }: { label: string; icon: string; sub?: string }) {
  return (
    <div className="mb-4 flex items-center gap-2.5 border-b border-border pb-3">
      <span className="material-symbols-outlined text-[20px] text-primary">{icon}</span>
      <div>
        <h2 className="text-[15px] font-bold tracking-tight text-foreground">{label}</h2>
        {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
      </div>
    </div>
  );
}

function Field({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className={`mt-0.5 text-sm font-medium text-foreground ${mono ? "font-mono" : ""}`}>{value}</div>
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function PassportPage() {
  const p = getCurrentPassportSync();
  const clusters = competenciesByCluster(p);
  const [origin, setOrigin] = useState("");

  // อ่าน origin หลัง mount เพื่อประกอบลิงก์/QR ตรวจสอบแบบ absolute (client-only)
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setOrigin(window.location.origin), []);

  const licMeta = licenseStatusLabels[p.license.status];
  const expiryDays = daysUntilLicenseExpiry(p);
  const qrData = encodeURIComponent(verifyUrl(p.verifyToken, origin));

  return (
    <div className="mx-auto max-w-[1180px] space-y-5 p-4 pb-16 md:p-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <a href="/dashboard" className="transition-colors hover:text-primary">หน้าหลัก</a>
        <span className="material-symbols-outlined text-[16px] text-muted-foreground/50">chevron_right</span>
        <span className="flex items-center gap-1 font-medium text-primary">
          <span className="material-symbols-outlined text-[16px]">badge</span> หนังสือเดินทางวิชาชีพ
        </span>
      </div>

      {/* ══ Official Document Header ══ */}
      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <div className="border-b-2 border-primary bg-gradient-to-r from-primary/[0.07] to-transparent px-6 py-4">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-md border border-border bg-white p-1.5">
              <img src={p.issuingAuthority.logoUrl} alt="ตราสัญลักษณ์" className="h-full w-full object-contain" />
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-base font-bold leading-tight text-foreground md:text-lg">{p.issuingAuthority.nameTh}</h1>
              <p className="text-xs text-muted-foreground">{p.issuingAuthority.nameEn}</p>
              <p className="mt-0.5 text-[11px] text-muted-foreground">ภายใต้การกำกับของ{p.issuingAuthority.regulatorTh} · {p.issuingAuthority.regulatorEn}</p>
            </div>
            <div className="hidden shrink-0 text-right md:block">
              <div className="inline-flex items-center gap-1.5 rounded-md border border-primary/30 bg-primary/5 px-3 py-1 text-xs font-semibold text-primary">
                <span className="material-symbols-outlined text-[15px]">badge</span>
                หนังสือเดินทางวิชาชีพ
              </div>
              <p className="mt-1 text-[11px] text-muted-foreground">Professional Passport</p>
            </div>
          </div>
        </div>

        {/* Identity band (A) */}
        <div className="grid grid-cols-1 gap-6 px-6 py-6 md:grid-cols-[auto_1fr_auto]">
          {/* Photo */}
          <div className="flex flex-col items-center gap-2">
            <div className="h-32 w-28 overflow-hidden rounded-md border-2 border-border bg-muted shadow-sm">
              <img src={p.identity.photoUrl} alt={fullNameTh(p)} className="h-full w-full object-cover object-top" />
            </div>
            <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold ${toneClass[licMeta.tone]}`}>
              <span className="material-symbols-outlined text-[13px]">
                {licMeta.tone === "ok" ? "verified_user" : "gpp_maybe"}
              </span>
              ใบอนุญาต{licMeta.th}
            </span>
          </div>

          {/* Identity fields */}
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-foreground md:text-2xl">{fullNameTh(p)}</h2>
              <p className="text-sm text-muted-foreground">{fullNameEn(p)} · อายุ {ageFromDob(p.identity.dateOfBirth)} ปี</p>
            </div>
            <div className="grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-3">
              <Field label="รหัสสมาชิก" value={p.memberId} mono />
              <Field label="เลขที่ใบประกอบวิชาชีพ" value={p.license.licenseNumber} mono />
              <Field label="เลขบัตรประชาชน" value={maskCitizenId(p.identity.citizenId)} mono />
              <Field label="วันเกิด" value={formatThaiDate(p.identity.dateOfBirth)} />
              <Field label="สัญชาติ" value={p.identity.nationality} />
              <Field label="อีเมล" value={p.identity.email} />
            </div>
            {/* focus areas */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">สาขาที่มุ่งพัฒนา:</span>
              {p.focusAreas.map((f) => (
                <span key={f} className="rounded-full border border-primary/20 bg-primary/5 px-2.5 py-0.5 text-xs font-medium text-primary">{f}</span>
              ))}
            </div>
          </div>

          {/* License + QR */}
          <div className="flex flex-col items-center gap-3 md:w-52 md:border-l md:border-border md:pl-6">
            <div className="w-full rounded-lg border border-border bg-muted/30 p-3 text-xs">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-muted-foreground">รอบต่ออายุ</span>
                <span className="font-semibold">{p.license.renewalCycle}</span>
              </div>
              <div className="mb-2 flex items-center justify-between">
                <span className="text-muted-foreground">หมดอายุ</span>
                <span className="font-semibold">{formatThaiDate(p.license.expiresAt)}</span>
              </div>
              <div className={`rounded-md px-2 py-1 text-center text-[11px] font-medium ${expiryDays < 180 ? toneClass.warn : toneClass.ok}`}>
                {expiryDays > 0 ? `เหลืออีก ${expiryDays} วัน` : "หมดอายุแล้ว"}
              </div>
            </div>
            <div className="flex flex-col items-center rounded-lg border border-border bg-white p-2">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${qrData}`}
                alt="QR ตรวจสอบ"
                className="h-24 w-24"
              />
              <span className="mt-1 font-mono text-[10px] text-muted-foreground">{p.verifyToken}</span>
              <span className="text-[10px] text-muted-foreground">สแกนเพื่อตรวจสอบ</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap items-center justify-end gap-2 border-t border-border bg-muted/20 px-6 py-3">
          <Button variant="outline" size="sm" className="gap-1.5" onClick={() => {
            const url = origin + verifyUrl(p.verifyToken);
            navigator.clipboard?.writeText(url).then(() => toast.success("คัดลอกลิงก์ตรวจสอบแล้ว")).catch(() => {});
          }}>
            <span className="material-symbols-outlined text-[16px]">link</span> คัดลอกลิงก์ตรวจสอบ
          </Button>
          <Button variant="outline" size="sm" className="gap-1.5" onClick={() => window.print()}>
            <span className="material-symbols-outlined text-[16px]">print</span> พิมพ์
          </Button>
        </div>
      </div>

      {/* ══ D. Competencies (FIP) ══ */}
      <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <SectionHeader label="สมรรถนะวิชาชีพ (Competencies)" icon="radar" sub="อ้างอิงกรอบสมรรถนะสากล FIP Global Competency Framework — 4 ด้าน" />
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {clusters.map(({ cluster, ratings, averageLevel }) => (
            <div key={cluster.id} className="rounded-lg border border-border bg-background/40 p-4">
              <div className="mb-3 flex items-start gap-2.5">
                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                  <span className="material-symbols-outlined text-[18px]">{cluster.icon}</span>
                </span>
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-bold text-foreground">{cluster.labelTh}</h3>
                  <p className="text-[11px] text-muted-foreground">{cluster.labelEn}</p>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-primary">{averageLevel.toFixed(1)}</div>
                  <div className="text-[10px] text-muted-foreground">/ 4.0</div>
                </div>
              </div>
              <div className="space-y-2.5">
                {ratings.length === 0 && (
                  <p className="text-xs text-muted-foreground">ยังไม่มีการประเมินในด้านนี้</p>
                )}
                {ratings.map(({ area, rating }) => (
                  <div key={area.id} className="flex items-center justify-between gap-3">
                    <span className="min-w-0 flex-1 truncate text-xs text-foreground" title={area.labelTh}>{area.labelTh}</span>
                    <div className="flex shrink-0 items-center gap-2">
                      <ProficiencyMeter level={effectiveLevel(rating)} verified={rating.verification.status === "verified"} />
                      <span className="material-symbols-outlined text-[14px]" style={{
                        color: rating.verification.status === "verified" ? "var(--primary)" : "var(--muted-foreground)",
                      }} title={rating.verification.status === "verified" ? "ยืนยันแล้ว" : "แจ้งด้วยตนเอง"}>
                        {rating.verification.status === "verified" ? "verified" : "person"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        {/* legend */}
        <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-border pt-3 text-[11px] text-muted-foreground">
          <span className="flex items-center gap-1.5"><span className="h-1.5 w-5 rounded-full bg-primary" /> ระดับที่ถูกรับรอง</span>
          <span className="flex items-center gap-1.5"><span className="h-1.5 w-5 rounded-full bg-primary/40" /> แจ้งด้วยตนเอง</span>
          <span>ระดับ: 1 พื้นฐาน · 2 ปฏิบัติได้ · 3 ชำนาญ · 4 เชี่ยวชาญ</span>
        </div>
      </div>

      {/* ══ Two-column: Specializations + Qualifications ══ */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* C. Specializations */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <SectionHeader label="ความเชี่ยวชาญเฉพาะทาง" icon="workspace_premium" sub="วุฒิบัตร / หนังสืออนุมัติ" />
          <div className="space-y-3">
            {p.specializations.map((s) => (
              <div key={s.id} className="rounded-lg border border-border p-4">
                <div className="mb-1.5 flex items-center justify-between gap-2">
                  <span className="rounded-md bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary">{credentialTypeLabels[s.type]}</span>
                  <VerifyBadge verification={s.verification} />
                </div>
                <h3 className="text-sm font-semibold leading-snug text-foreground">{s.titleTh}</h3>
                <p className="mt-1 text-xs text-muted-foreground">สาขา{s.specialtyTh} · {s.collegeShort}</p>
                {typeof s.progress === "number" && (
                  <div className="mt-2.5">
                    <div className="mb-1 flex justify-between text-[11px]">
                      <span className="text-muted-foreground">ความคืบหน้าการฝึกอบรม</span>
                      <span className="font-semibold text-primary">{s.progress}%</span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                      <div className="h-full rounded-full bg-primary" style={{ width: `${s.progress}%` }} />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* B. Qualifications */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <SectionHeader label="คุณวุฒิการศึกษา" icon="history_edu" />
          <div className="space-y-3">
            {p.qualifications.map((q) => (
              <div key={q.id} className="rounded-lg border border-border p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">{q.degreeTh}</h3>
                    <p className="mt-0.5 text-xs font-medium text-primary">{q.institution}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{q.field} · จบปี {q.graduationYear}{q.gpa ? ` · GPA ${q.gpa}` : ""}</p>
                  </div>
                  <VerifyBadge verification={q.verification} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ══ E. CPD ══ */}
      <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <SectionHeader label="การศึกษาต่อเนื่อง (CPD/CPE)" icon="school" sub={`เกณฑ์ต่ออายุใบอนุญาต: ${p.cpd.targetCredits} หน่วยกิต/รอบ 5 ปี (ปีละ ≥ ${p.cpd.perYearMinimum})`} />
        <div className="grid grid-cols-1 gap-6 md:grid-cols-[280px_1fr]">
          <div className="rounded-lg border border-border bg-primary/5 p-4">
            <div className="flex items-end justify-between">
              <div>
                <div className="text-3xl font-bold text-primary">{p.cpd.currentCredits}</div>
                <div className="text-xs text-muted-foreground">จาก {p.cpd.targetCredits} หน่วยกิต</div>
              </div>
              <div className="text-right text-xs">
                <div className="font-semibold text-foreground">{cpdProgressPct(p)}%</div>
                <div className="text-muted-foreground">เหลือ {cpdRemaining(p)}</div>
              </div>
            </div>
            <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-muted">
              <div className="h-full rounded-full bg-primary" style={{ width: `${cpdProgressPct(p)}%` }} />
            </div>
            <div className="mt-3 flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <span className="material-symbols-outlined text-[14px]">event</span>
              รอบสิ้นสุด {formatThaiDate(p.cpd.cycleExpiresAt)}
            </div>
          </div>
          <div className="space-y-2">
            {p.cpd.activities.map((a) => (
              <div key={a.id} className="flex items-center justify-between gap-3 rounded-lg border border-border px-4 py-2.5">
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium text-foreground">{a.title}</div>
                  <div className="text-[11px] text-muted-foreground">{a.category} · {formatThaiDate(a.date)}</div>
                </div>
                <span className="shrink-0 rounded-md bg-primary/10 px-2 py-1 text-xs font-bold text-primary">+{a.credits}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ══ Two-column: Experience + Academic ══ */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* F. Experience */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <SectionHeader label="ประสบการณ์วิชาชีพ" icon="work" />
          <div className="relative ml-3 space-y-5 border-l-2 border-primary/20">
            {p.experience.map((e) => (
              <div key={e.id} className="relative pl-6">
                <span className={`absolute -left-[7px] top-1 h-3 w-3 rounded-full ring-4 ring-card ${e.isCurrent ? "bg-primary" : "bg-muted-foreground/40"}`} />
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">{e.position}</h3>
                    <p className="text-xs font-medium text-primary">{e.organization}</p>
                    <p className="mt-0.5 text-[11px] text-muted-foreground">
                      {e.startYear} – {e.isCurrent ? "ปัจจุบัน" : e.endYear}{e.employmentType ? ` · ${e.employmentType}` : ""}
                    </p>
                    {e.responsibilities && <p className="mt-1 text-xs text-muted-foreground">{e.responsibilities}</p>}
                  </div>
                  <VerifyBadge verification={e.verification} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* G. Academic work */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <SectionHeader label="ผลงานวิชาการและวิจัย" icon="biotech" />
          <div className="space-y-3">
            {p.academicWork.map((a) => (
              <div key={a.id} className="rounded-lg border border-border p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="mb-1 inline-flex items-center gap-1 rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                      {a.kind === "publication" ? "ตีพิมพ์" : a.kind === "research_project" ? "โครงการวิจัย" : a.kind === "speaker" ? "วิทยากร" : "รางวัล"}
                    </div>
                    <h3 className="text-sm font-medium leading-snug text-foreground">{a.title}</h3>
                    <p className="mt-1 text-[11px] text-muted-foreground">
                      {a.role ? `${a.role} · ` : ""}{a.venue ? `${a.venue} · ` : ""}ปี {a.year}
                    </p>
                  </div>
                  <VerifyBadge verification={a.verification} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer note */}
      <p className="flex items-center justify-center gap-1.5 text-center text-[11px] text-muted-foreground">
        <span className="material-symbols-outlined text-[14px]">shield</span>
        ข้อมูลนี้เป็นหนังสือเดินทางวิชาชีพมาตรฐานกลาง ออกโดย{p.issuingAuthority.nameTh} · ปรับปรุงล่าสุด {formatThaiDate(p.updatedAt)}
      </p>

      <Footer />
    </div>
  );
}
