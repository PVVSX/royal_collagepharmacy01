"use client";

// ════════════════════════════════════════════════════════════════════════════
// Public Verification — หน้าตรวจสอบสาธารณะ (สแกน QR จาก Professional Passport)
// แสดงเฉพาะข้อมูลที่เปิดเผยได้ (ไม่มีเลขบัตร ปชช./ที่อยู่) — สำหรับหน่วยงานภายนอกยืนยันตัวตน
// ════════════════════════════════════════════════════════════════════════════

import { use } from "react";
import Link from "next/link";
import {
  findByVerifyTokenSync,
  fullNameTh,
  fullNameEn,
  formatThaiDate,
  credentialTypeLabels,
  licenseStatusLabels,
  endorsementLabels,
  type DisclosureField,
} from "@/lib/domain";

export default function VerifyPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params);
  const p = findByVerifyTokenSync(token);

  if (!p) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-muted/30 p-6 text-center">
        <span className="material-symbols-outlined mb-3 text-5xl text-red-500">gpp_bad</span>
        <h1 className="text-xl font-bold">ไม่พบข้อมูล Professional Profile</h1>
        <p className="mt-1 text-sm text-muted-foreground">รหัสตรวจสอบ <span className="font-mono">{token}</span> ไม่ถูกต้องหรือถูกยกเลิก</p>
      </div>
    );
  }

  const licMeta = licenseStatusLabels[p.license.status];
  const verifiedCompetencies = p.competencies.filter((c) => c.verification.status === "verified").length;
  // เคารพ disclosure scope: แสดงเฉพาะ field ที่เจ้าของยินยอมเปิดเผยผ่าน QR สาธารณะ
  const show = (f: DisclosureField) => p.disclosure.publicFields.includes(f);

  return (
    <div className="flex min-h-screen flex-col items-center bg-gradient-to-b from-primary/5 to-muted/20 p-4 py-10">
      <div className="w-full max-w-md overflow-hidden rounded-2xl border border-border bg-card shadow-lg">
        {/* Header */}
        <div className="border-b-2 border-primary bg-primary/[0.06] px-6 py-5 text-center">
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-md border border-border bg-white p-1.5">
            <img src={p.issuingAuthority.logoUrl} alt="ตรา" className="h-full w-full object-contain" />
          </div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
            <span className="material-symbols-outlined text-[15px]">verified</span>
            ยืนยันโดย{p.issuingAuthority.regulatorTh}
          </div>
        </div>

        {/* Identity */}
        <div className="flex flex-col items-center px-6 py-6 text-center">
          <div className="h-24 w-20 overflow-hidden rounded-md border-2 border-border bg-muted shadow-sm">
            <img src={p.identity.photoUrl} alt={fullNameTh(p)} className="h-full w-full object-cover object-top" />
          </div>
          <h1 className="mt-3 text-lg font-bold">{fullNameTh(p)}</h1>
          <p className="text-sm text-muted-foreground">{fullNameEn(p)}</p>

          <div className="mt-4 grid w-full grid-cols-2 gap-2 text-left">
            <Cell label="เลขที่ใบประกอบฯ" value={p.license.licenseNumber} />
            <Cell label="สถานะใบอนุญาต" value={licMeta.th} tone={licMeta.tone} />
            <Cell label="รหัสสมาชิก" value={p.memberId} />
            <Cell label="หมดอายุ" value={formatThaiDate(p.license.expiresAt)} />
          </div>

          {/* Specializations */}
          {show("specializations") && (
            <div className="mt-4 w-full text-left">
              <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">ความเชี่ยวชาญเฉพาะทาง</div>
              <div className="space-y-1.5">
                {p.specializations.map((s) => (
                  <div key={s.id} className="flex items-center justify-between rounded-lg border border-border px-3 py-2">
                    <span className="text-xs font-medium">{s.specialtyTh} · {s.collegeShort}</span>
                    <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-primary">{credentialTypeLabels[s.type]}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Endorsements */}
          {show("endorsements") && p.endorsements.length > 0 && (
            <div className="mt-4 w-full text-left">
              <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">สิทธิเฉพาะทาง</div>
              <div className="flex flex-wrap gap-1.5">
                {p.endorsements.map((e) => (
                  <span key={e.id} className="inline-flex items-center gap-1 rounded-full border border-border bg-muted/40 px-2 py-0.5 text-[11px] font-medium">
                    <span className="material-symbols-outlined text-[13px] text-primary">{endorsementLabels[e.kind].icon}</span>
                    {endorsementLabels[e.kind].th}
                  </span>
                ))}
              </div>
            </div>
          )}

          {(show("competencies") || show("cpd")) && (
            <div className="mt-4 flex w-full items-center justify-center gap-6 rounded-lg bg-muted/40 py-3 text-center">
              {show("competencies") && (
                <div>
                  <div className="text-lg font-bold text-primary">{verifiedCompetencies}</div>
                  <div className="text-[10px] text-muted-foreground">สมรรถนะที่รับรอง</div>
                </div>
              )}
              {show("competencies") && show("cpd") && <div className="h-8 w-px bg-border" />}
              {show("cpd") && (
                <div>
                  <div className="text-lg font-bold text-primary">{p.cpd.currentCredits}</div>
                  <div className="text-[10px] text-muted-foreground">หน่วยกิต CPD</div>
                </div>
              )}
            </div>
          )}

          <p className="mt-3 flex items-center justify-center gap-1 text-[10px] text-muted-foreground">
            <span className="material-symbols-outlined text-[12px]">privacy_tip</span>
            แสดงเฉพาะข้อมูลที่เจ้าของยินยอมเปิดเผย
          </p>
        </div>

        {/* Footer */}
        <div className="border-t border-border bg-muted/20 px-6 py-3 text-center text-[11px] text-muted-foreground">
          ตรวจสอบเมื่อ {formatThaiDate(new Date().toISOString())} · รหัส <span className="font-mono">{p.verifyToken}</span>
        </div>
      </div>
      <Link href="/" className="mt-4 text-xs text-muted-foreground hover:text-primary">← กลับหน้าหลัก</Link>
    </div>
  );
}

function Cell({ label, value, tone }: { label: string; value: string; tone?: "ok" | "warn" | "danger" }) {
  const color = tone === "danger" ? "text-red-600" : tone === "warn" ? "text-amber-600" : "text-foreground";
  return (
    <div className="rounded-lg border border-border px-3 py-2">
      <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className={`mt-0.5 text-sm font-semibold ${color}`}>{value}</div>
    </div>
  );
}
