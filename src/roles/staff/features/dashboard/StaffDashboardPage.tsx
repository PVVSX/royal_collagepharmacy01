import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageShell } from "@/roles/shared/components/layout/PageShell";
import { StaffPageHeader } from "@/roles/staff/components/StaffPageHeader";

const metrics = [
  { label: "คำร้องรอตรวจ", value: "4", note: "มี 1 รายการต้องขอข้อมูลเพิ่ม", icon: "description", tone: "bg-warning-soft text-warning-on-soft" },
  { label: "Payment Exception", value: "2", note: "รอตรวจหลักฐานและกระทบยอด", icon: "receipt_long", tone: "bg-danger-soft text-danger-on-soft" },
  { label: "เอกสารรอจัดคิว", value: "3", note: "เลือกลำดับลงนามก่อนส่ง", icon: "draw", tone: "bg-info-soft text-info-on-soft" },
  { label: "งานครบกำหนดวันนี้", value: "6", note: "รวมหลักสูตร สอบ และใบรับรอง", icon: "event_upcoming", tone: "bg-success-soft text-success-on-soft" },
] as const;

const shortcuts = [
  { href: "/staff/requests", icon: "description", label: "ตรวจคำร้อง", detail: "ตรวจเอกสาร ขอข้อมูลเพิ่ม และส่งต่อ Workflow" },
  { href: "/staff/finance", icon: "payments", label: "กระทบยอดการเงิน", detail: "ดู Invoice, Exception, Cancellation และ Refund" },
  { href: "/staff/signatures", icon: "draw", label: "เตรียมคิวลงนาม", detail: "ตรวจความครบถ้วนและเลือกลำดับผู้ลงนาม" },
  { href: "/staff/audit", icon: "history", label: "Business Audit", detail: "ติดตามผู้ดำเนินการ เหตุผล หลักฐาน และค่าก่อนหลัง" },
] as const;

const activity = [
  ["กระทบยอด INV-REG-MEMBER-001", "เจ้าหน้าที่ราชวิทยาลัย ก.", "10:24 น."],
  ["ส่งคำร้อง อ.1-2569-003 กลับขอข้อมูล", "เจ้าหน้าที่ทะเบียน ข.", "09:48 น."],
  ["เตรียมเอกสารลงนามแบบสองระดับ", "เจ้าหน้าที่เอกสาร ค.", "09:15 น."],
] as const;

export default function StaffDashboardPage() {
  return (
    <PageShell size="full" className="space-y-6">
      <StaffPageHeader
        title="ภาพรวมงานราชวิทยาลัย"
        description="Workspace เดียวสำหรับงานส่วนกลาง การเงิน การเตรียมลงนาม และการตรวจสอบย้อนหลัง"
        eyebrow="Organisation Scope: ราชวิทยาลัย"
        actions={<Button asChild variant="outline"><Link href="/staff/audit"><span aria-hidden="true" className="material-symbols-outlined text-lg">manage_search</span>เปิด Audit</Link></Button>}
      />

      <section aria-label="สรุปงาน" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <Card key={metric.label}><CardContent className="p-5"><div className="flex items-start justify-between gap-3"><div><p className="text-sm font-medium text-muted-foreground">{metric.label}</p><p className="mt-2 text-3xl font-bold text-foreground">{metric.value}</p></div><span aria-hidden="true" className={`material-symbols-outlined flex h-10 w-10 items-center justify-center rounded-full ${metric.tone}`}>{metric.icon}</span></div><p className="mt-3 text-xs text-muted-foreground">{metric.note}</p></CardContent></Card>
        ))}
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(18rem,1fr)]">
        <Card><CardHeader><CardTitle className="text-lg">งานที่ใช้บ่อย</CardTitle></CardHeader><CardContent className="grid gap-3 sm:grid-cols-2">{shortcuts.map((item) => <Link key={item.href} href={item.href} className="group rounded-2xl border border-border bg-card p-4 transition-colors hover:border-primary/40 hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"><span aria-hidden="true" className="material-symbols-outlined text-primary">{item.icon}</span><h2 className="mt-3 font-semibold text-foreground group-hover:text-primary">{item.label}</h2><p className="mt-1 text-sm text-muted-foreground">{item.detail}</p></Link>)}</CardContent></Card>
        <Card><CardHeader><CardTitle className="text-lg">กิจกรรมล่าสุด</CardTitle></CardHeader><CardContent><ol className="space-y-4">{activity.map(([title, actor, time]) => <li key={title} className="border-l-2 border-primary/30 pl-3"><p className="text-sm font-medium text-foreground">{title}</p><p className="mt-1 text-xs text-muted-foreground">{actor} · {time}</p></li>)}</ol><div className="mt-5 rounded-xl border border-info-border bg-info-soft p-3 text-xs text-info-on-soft"><strong>ขอบเขต:</strong> ผลการเรียนแบบผ่าน/ไม่ผ่านแสดงเพื่อการตรวจสอบย้อนหลังเท่านั้น เจ้าหน้าที่แก้ผลแทนอาจารย์ไม่ได้</div></CardContent></Card>
      </div>
    </PageShell>
  );
}
