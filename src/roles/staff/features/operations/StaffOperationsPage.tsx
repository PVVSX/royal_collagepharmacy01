"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { PageShell } from "@/roles/shared/components/layout/PageShell";
import { createAuditActorSnapshot, useAuditLog } from "@/roles/shared/features/audit";
import { usePortalSession } from "@/roles/shared/features/roles/use-portal-session";
import { StaffPageHeader } from "@/roles/staff/components/StaffPageHeader";

export type StaffOperationDomain = "courses" | "exams" | "research" | "certificates" | "news_help";
type OperationStatus = "draft" | "pending" | "needs_info" | "ready" | "published";

interface OperationRecord {
  id: string;
  name: string;
  owner: string;
  updatedAt: string;
  status: OperationStatus;
}

const domainConfig: Record<StaffOperationDomain, {
  title: string;
  description: string;
  eyebrow: string;
  primaryAction: string;
  emptyText: string;
  records: readonly OperationRecord[];
}> = {
  courses: {
    title: "หลักสูตรและ Course Master",
    description: "ดูแลข้อมูลหลักสูตร รายวิชาส่วนกลาง รุ่นเรียน และสถานะการเปิดใช้ โดยไม่เปลี่ยน Teaching Assignment ของสถาบัน",
    eyebrow: "งานวิชาการส่วนกลาง",
    primaryAction: "เพิ่ม Course Master",
    emptyText: "ไม่พบหลักสูตรหรือรายวิชา",
    records: [
      { id: "BCP-101", name: "เภสัชบำบัดพื้นฐาน", owner: "ส่วนกลาง", updatedAt: "18 ส.ค. 2569", status: "published" },
      { id: "วภท-301", name: "องค์ความรู้ทางเภสัชบำบัดเฉพาะทาง", owner: "วิทยาลัยเภสัชบำบัด", updatedAt: "17 ส.ค. 2569", status: "ready" },
      { id: "วภช-204", name: "ระบบบริการเภสัชกรรมชุมชน", owner: "วิทยาลัยเภสัชกรรมชุมชน", updatedAt: "15 ส.ค. 2569", status: "draft" },
    ],
  },
  exams: {
    title: "งานสอบและคำขอสมัครสอบ",
    description: "ติดตามรอบสอบ ตรวจเอกสารสมัคร และจัดการสถานะงานสอบในขอบเขตราชวิทยาลัย",
    eyebrow: "Exam Operations",
    primaryAction: "สร้างรอบสอบ",
    emptyText: "ไม่พบงานสอบ",
    records: [
      { id: "EXM-2569-178", name: "สอบประเมินความรู้ขั้นสุดท้าย", owner: "ภก. สมชาย ใจดี", updatedAt: "18 ส.ค. 2569", status: "needs_info" },
      { id: "EXM-2569-181", name: "สอบปากเปล่าข้างเตียงผู้ป่วย", owner: "ภญ. สุภาวดี รักษาดี", updatedAt: "18 ส.ค. 2569", status: "pending" },
      { id: "ROUND-02/69", name: "รอบสอบเดือนตุลาคม 2569", owner: "ฝ่ายจัดสอบ", updatedAt: "16 ส.ค. 2569", status: "ready" },
    ],
  },
  research: {
    title: "งานวิจัย",
    description: "ติดตามการส่งผลงาน ตรวจความครบถ้วน และประวัติการพิจารณา โดยคงข้อมูลต้นฉบับทุกครั้ง",
    eyebrow: "Research Workflow",
    primaryAction: "เพิ่มรอบตรวจ",
    emptyText: "ไม่พบผลงานวิจัย",
    records: [
      { id: "RES-2569-014", name: "การใช้ยาปฏิชีวนะอย่างสมเหตุผล", owner: "ภญ. คารินา วัฒนกุล", updatedAt: "18 ส.ค. 2569", status: "pending" },
      { id: "RES-2569-011", name: "ผลลัพธ์การบริบาลผู้ป่วยโรคเรื้อรัง", owner: "ภก. นที วัฒนา", updatedAt: "15 ส.ค. 2569", status: "ready" },
    ],
  },
  certificates: {
    title: "ใบรับรองและเอกสาร",
    description: "จัดเตรียมใบรับรอง ตรวจหลักฐานต้นทาง และส่งเอกสารที่พร้อมเข้าสู่ Signature Workflow",
    eyebrow: "Document Operations",
    primaryAction: "เตรียมเอกสาร",
    emptyText: "ไม่พบใบรับรองหรือเอกสาร",
    records: [
      { id: "CERT-2569-033", name: "หนังสือรับรองผลการฝึกอบรม", owner: "ภก. สมชาย ใจดี", updatedAt: "18 ส.ค. 2569", status: "ready" },
      { id: "CERT-2569-034", name: "หนังสือรับรองภาษาอังกฤษ", owner: "ภญ. สุภาวดี รักษาดี", updatedAt: "18 ส.ค. 2569", status: "pending" },
    ],
  },
  news_help: {
    title: "ข่าวสารและ Help Center",
    description: "จัดการประกาศ เนื้อหาช่วยเหลือ และสถานะเผยแพร่สำหรับผู้ใช้ทุก Workspace",
    eyebrow: "Content Operations",
    primaryAction: "สร้างเนื้อหา",
    emptyText: "ไม่พบข่าวสารหรือบทความช่วยเหลือ",
    records: [
      { id: "NEWS-069", name: "กำหนดการลงทะเบียนภาค 1/2569", owner: "ฝ่ายสื่อสารองค์กร", updatedAt: "18 ส.ค. 2569", status: "published" },
      { id: "HELP-021", name: "วิธีติดตามสถานะคำขอลงทะเบียน", owner: "Help Center", updatedAt: "17 ส.ค. 2569", status: "draft" },
      { id: "NEWS-070", name: "ประกาศกำหนดการสอบรอบถัดไป", owner: "ฝ่ายจัดสอบ", updatedAt: "16 ส.ค. 2569", status: "ready" },
    ],
  },
};

const statusMeta = {
  draft: { label: "ฉบับร่าง", variant: "neutral" as const },
  pending: { label: "รอตรวจ", variant: "warning" as const },
  needs_info: { label: "ต้องการข้อมูลเพิ่ม", variant: "danger" as const },
  ready: { label: "พร้อมดำเนินการ", variant: "info" as const },
  published: { label: "เผยแพร่แล้ว", variant: "success" as const },
};

function storageKey(domain: StaffOperationDomain) {
  return `royal-college.staff-operations.${domain}.v1`;
}

function readRecords(domain: StaffOperationDomain): OperationRecord[] {
  const serialized = window.localStorage.getItem(storageKey(domain));
  if (!serialized) return domainConfig[domain].records.map((record) => ({ ...record }));
  try {
    const parsed: unknown = JSON.parse(serialized);
    if (!Array.isArray(parsed)) throw new Error("invalid records");
    return parsed.filter((item): item is OperationRecord => (
      item && typeof item === "object" &&
      typeof item.id === "string" && typeof item.name === "string" &&
      typeof item.owner === "string" && typeof item.updatedAt === "string" &&
      (item.status === "draft" || item.status === "pending" || item.status === "needs_info" || item.status === "ready" || item.status === "published")
    ));
  } catch {
    return domainConfig[domain].records.map((record) => ({ ...record }));
  }
}

function formatToday() {
  return new Intl.DateTimeFormat("th-TH", { dateStyle: "medium", timeZone: "Asia/Bangkok" }).format(new Date());
}

export default function StaffOperationsPage({ domain }: { domain: StaffOperationDomain }) {
  const config = domainConfig[domain];
  const { session } = usePortalSession();
  const { appendEvent } = useAuditLog();
  const [records, setRecords] = useState<OperationRecord[]>(() => [...config.records]);
  const [isHydrated, setIsHydrated] = useState(false);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [nextStatus, setNextStatus] = useState<OperationStatus>("draft");
  const [reason, setReason] = useState("");
  const [evidence, setEvidence] = useState("");
  const [formError, setFormError] = useState("");

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setRecords(readRecords(domain));
    setIsHydrated(true);
  }, [domain]);

  useEffect(() => {
    if (!isHydrated) return;
    window.localStorage.setItem(storageKey(domain), JSON.stringify(records));
  }, [domain, isHydrated, records]);

  const filtered = useMemo(() => {
    const query = search.trim().toLocaleLowerCase("th-TH");
    return records.filter((record) => (
      (status === "all" || record.status === status) &&
      (!query || [record.id, record.name, record.owner].some((value) => value.toLocaleLowerCase("th-TH").includes(query)))
    ));
  }, [records, search, status]);

  const auditActor = session?.role === "royal_college_staff" ? createAuditActorSnapshot(session) : null;
  const addDraft = () => {
    if (!auditActor || !session) return;
    const id = `${domain.toUpperCase()}-${Date.now().toString(36).toUpperCase()}`;
    const record: OperationRecord = { id, name: "รายการใหม่รอระบุรายละเอียด", owner: session.displayName, updatedAt: formatToday(), status: "draft" };
    const auditEvent = appendEvent({
      actor: auditActor,
      action: "business_record.create",
      resource: { type: domain, id, label: record.name, organisationId: session.organisation.id },
      before: null,
      after: record,
      reason: `สร้างรายการใน ${config.title}`,
      evidenceReference: `workspace:${domain}`,
    });
    if (!auditEvent) {
      toast.error("บันทึก User Audit Log ไม่สำเร็จ จึงยังไม่สร้างรายการ");
      return;
    }
    setRecords((current) => [record, ...current]);
    toast.success(`สร้าง ${id} เป็นฉบับร่างแล้ว`);
  };

  const openRecord = (record: OperationRecord) => {
    setSelectedId(record.id);
    setName(record.name);
    setNextStatus(record.status);
    setReason("");
    setEvidence("");
    setFormError("");
  };

  const closeRecord = () => {
    setSelectedId(null);
    setFormError("");
  };

  const saveRecord = () => {
    const current = records.find((record) => record.id === selectedId);
    if (!current || !auditActor || !session) return;
    const normalizedName = name.trim();
    const normalizedReason = reason.trim();
    if (!normalizedName || !normalizedReason) {
      setFormError("กรุณาระบุชื่อรายการและเหตุผลการเปลี่ยนแปลง");
      return;
    }
    const updated: OperationRecord = { ...current, name: normalizedName, status: nextStatus, updatedAt: formatToday() };
    const auditEvent = appendEvent({
      actor: auditActor,
      action: "business_record.update",
      resource: { type: domain, id: current.id, label: normalizedName, organisationId: session.organisation.id },
      before: current,
      after: updated,
      reason: normalizedReason,
      ...(evidence.trim() ? { evidenceReference: evidence.trim() } : {}),
    });
    if (!auditEvent) {
      setFormError("บันทึก User Audit Log ไม่สำเร็จ จึงยังไม่เปลี่ยนข้อมูล");
      return;
    }
    setRecords((items) => items.map((item) => item.id === updated.id ? updated : item));
    closeRecord();
    toast.success(`บันทึก ${updated.id} แล้ว`);
  };

  return (
    <PageShell size="full" className="space-y-6">
      <StaffPageHeader title={config.title} description={config.description} eyebrow={config.eyebrow} actions={<Button onClick={addDraft}><span aria-hidden="true" className="material-symbols-outlined text-lg">add</span>{config.primaryAction}</Button>} />
      <Card><CardContent className="space-y-4 px-4 md:px-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div><h2 className="font-semibold text-foreground">รายการดำเนินงาน</h2><p aria-live="polite" className="mt-1 text-xs text-muted-foreground">แสดง {filtered.length} จาก {records.length} รายการ</p></div>
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
            <Input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="ค้นหารหัส ชื่อ หรือผู้เกี่ยวข้อง" aria-label={`ค้นหา${config.title}`} className="sm:w-72" />
            <label className="sr-only" htmlFor={`staff-${domain}-status`}>กรองสถานะ</label>
            <select id={`staff-${domain}-status`} value={status} onChange={(event) => setStatus(event.target.value)} className="h-8 rounded-2xl border border-border bg-background px-3 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring">
              <option value="all">ทุกสถานะ</option><option value="draft">ฉบับร่าง</option><option value="pending">รอตรวจ</option><option value="needs_info">ต้องการข้อมูลเพิ่ม</option><option value="ready">พร้อมดำเนินการ</option><option value="published">เผยแพร่แล้ว</option>
            </select>
          </div>
        </div>
        <div className="overflow-x-auto rounded-2xl border border-border">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="bg-muted/50 text-xs text-muted-foreground"><tr><th scope="col" className="px-4 py-3 font-medium">รหัส</th><th scope="col" className="px-4 py-3 font-medium">รายการ</th><th scope="col" className="px-4 py-3 font-medium">ผู้เกี่ยวข้อง</th><th scope="col" className="px-4 py-3 font-medium">อัปเดตล่าสุด</th><th scope="col" className="px-4 py-3 font-medium">สถานะ</th><th scope="col" className="px-4 py-3 text-right font-medium">ดำเนินการ</th></tr></thead>
            <tbody className="divide-y divide-border">{filtered.map((record) => <tr key={record.id} className="hover:bg-muted/30"><td className="px-4 py-3 font-mono text-xs font-medium">{record.id}</td><td className="px-4 py-3 font-medium">{record.name}</td><td className="px-4 py-3 text-muted-foreground">{record.owner}</td><td className="whitespace-nowrap px-4 py-3 text-muted-foreground">{record.updatedAt}</td><td className="px-4 py-3"><Badge variant={statusMeta[record.status].variant}>{statusMeta[record.status].label}</Badge></td><td className="px-4 py-3 text-right"><Button variant="outline" size="sm" onClick={() => openRecord(record)}>เปิดรายละเอียด</Button></td></tr>)}</tbody>
          </table>
          {filtered.length === 0 ? <div className="px-4 py-14 text-center"><span aria-hidden="true" className="material-symbols-outlined text-4xl text-muted-foreground">search_off</span><p className="mt-2 text-sm font-medium">{config.emptyText}</p><p className="mt-1 text-xs text-muted-foreground">ลองเปลี่ยนคำค้นหาหรือตัวกรองสถานะ</p><Button className="mt-4" variant="outline" onClick={() => { setSearch(""); setStatus("all"); }}>ล้างตัวกรอง</Button></div> : null}
        </div>
      </CardContent></Card>

      <Dialog open={Boolean(selectedId)} onOpenChange={(open) => { if (!open) closeRecord(); }}>
        <DialogContent aria-describedby="staff-operation-description">
          <DialogHeader><DialogTitle>รายละเอียดรายการ</DialogTitle><DialogDescription id="staff-operation-description">ทุกการเปลี่ยนแปลงจะบันทึกข้อมูลก่อน–หลัง ผู้ดำเนินการ เหตุผล และเวลาใน User Audit Log</DialogDescription></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5"><label htmlFor="staff-operation-name" className="text-sm font-medium">ชื่อรายการ</label><Input id="staff-operation-name" value={name} onChange={(event) => { setName(event.target.value); setFormError(""); }} /></div>
            <div className="space-y-1.5"><label htmlFor="staff-operation-status" className="text-sm font-medium">สถานะ</label><select id="staff-operation-status" value={nextStatus} onChange={(event) => setNextStatus(event.target.value as OperationStatus)} className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm"><option value="draft">ฉบับร่าง</option><option value="pending">รอตรวจ</option><option value="needs_info">ต้องการข้อมูลเพิ่ม</option><option value="ready">พร้อมดำเนินการ</option><option value="published">เผยแพร่แล้ว</option></select></div>
            <div className="space-y-1.5"><label htmlFor="staff-operation-reason" className="text-sm font-medium">เหตุผล</label><Textarea id="staff-operation-reason" value={reason} onChange={(event) => { setReason(event.target.value); setFormError(""); }} aria-invalid={Boolean(formError && !reason.trim())} aria-describedby={formError ? "staff-operation-error" : undefined} /></div>
            <div className="space-y-1.5"><label htmlFor="staff-operation-evidence" className="text-sm font-medium">Evidence Reference (ถ้ามี)</label><Input id="staff-operation-evidence" value={evidence} onChange={(event) => setEvidence(event.target.value)} /></div>
            {formError ? <p id="staff-operation-error" role="alert" className="rounded-xl border border-danger-border bg-danger-soft p-3 text-sm text-danger">{formError}</p> : null}
          </div>
          <DialogFooter><Button variant="outline" onClick={closeRecord}>ยกเลิก</Button><Button onClick={saveRecord}>บันทึก</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </PageShell>
  );
}
