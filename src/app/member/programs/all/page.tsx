"use client";

import { useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PageShell } from "@/roles/shared/components/layout/PageShell";
import { courseCatalog, courseInstitutions, type CollegeCode } from "@/roles/shared/features/courses/course-catalog";

export default function AllCoursesPage() {
  const [query, setQuery] = useState("");
  const [college, setCollege] = useState<"all" | CollegeCode>("all");
  const [kind, setKind] = useState<"all" | "course" | "short_course">("all");
  const normalized = query.trim().toLocaleLowerCase("th-TH");
  const visible = courseCatalog.filter((item) => {
    const institution = courseInstitutions[item.responsibleInstitutionId as keyof typeof courseInstitutions];
    const haystack = `${item.code ?? ""} ${item.titleTh} ${item.titleEn} ${item.collegeCode} ${institution?.name ?? ""}`.toLocaleLowerCase("th-TH");
    return (!normalized || haystack.includes(normalized)) && (college === "all" || item.collegeCode === college) && (kind === "all" || item.kind === kind);
  });

  return (
    <PageShell className="space-y-5">
      <header><h1 className="text-2xl font-bold">รายวิชาและหลักสูตรระยะสั้น</h1><p className="mt-1 text-sm text-muted-foreground">ค้นหารายการเปิดสอนจากทุกวิทยาลัยและสถาบัน</p></header>
      <ProgramTabs value="courses" />
      <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto_auto]">
        <Input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="ค้นหาชื่อ รหัส วิทยาลัย หรือสถาบัน" aria-label="ค้นหารายวิชา" />
        <select value={college} onChange={(event) => setCollege(event.target.value as "all" | CollegeCode)} aria-label="กรองตามวิทยาลัย" className="h-10 rounded-md border border-border bg-card px-3 text-sm"><option value="all">ทุกวิทยาลัย</option>{(["วคบท.", "CPAT", "วภช.", "สมุนไพร", "วภท."] as CollegeCode[]).map((code) => <option key={code}>{code}</option>)}</select>
        <select value={kind} onChange={(event) => setKind(event.target.value as typeof kind)} aria-label="กรองตามประเภทรายการ" className="h-10 rounded-md border border-border bg-card px-3 text-sm"><option value="all">ทุกประเภท</option><option value="course">รายวิชาปกติ</option><option value="short_course">หลักสูตรระยะสั้น</option></select>
      </div>
      <p className="text-sm text-muted-foreground">พบ {visible.length} รายการ</p>
      <div className="overflow-x-auto rounded-xl border border-border bg-card"><Table className="min-w-[900px]"><TableHeader><TableRow><TableHead>รหัส</TableHead><TableHead>ชื่อรายการ</TableHead><TableHead>ประเภท</TableHead><TableHead>สถาบันที่รับผิดชอบ</TableHead><TableHead>หน่วยกิต</TableHead><TableHead>ระยะเวลา</TableHead><TableHead>สถานะ</TableHead></TableRow></TableHeader><TableBody>{visible.map((item) => { const institution = courseInstitutions[item.responsibleInstitutionId as keyof typeof courseInstitutions]; return <TableRow key={item.id}><TableCell className="font-mono text-xs">{item.code ?? "ไม่กำหนดรหัส"}</TableCell><TableCell className="max-w-sm whitespace-normal"><p className="font-medium">{item.titleTh}</p><p className="mt-1 text-xs text-muted-foreground">{item.titleEn}</p></TableCell><TableCell><Badge variant="secondary">{item.kind === "short_course" ? "หลักสูตรระยะสั้น" : item.classification === "required" ? "วิชาบังคับ" : "วิชาทั่วไป"}</Badge></TableCell><TableCell className="max-w-xs whitespace-normal"><p>{institution?.name}</p><p className="mt-1 font-mono text-xs text-muted-foreground">{institution?.code}</p></TableCell><TableCell>{item.credits}</TableCell><TableCell>{item.duration}</TableCell><TableCell><Badge variant={item.status === "active" ? "success" : "neutral"}>{item.status === "active" ? "เปิดสอน" : "ปิดรับ"}</Badge></TableCell></TableRow>; })}</TableBody></Table>{visible.length === 0 && <div className="p-12 text-center text-sm text-muted-foreground">ไม่พบรายการที่ตรงกับเงื่อนไข</div>}</div>
    </PageShell>
  );
}

function ProgramTabs({ value }: { value: string }) {
  return <Tabs value={value}><TabsList className="h-auto max-w-full justify-start overflow-x-auto"><TabsTrigger value="programs" asChild><Link href="/member/programs">ภาพรวมหลักสูตร</Link></TabsTrigger><TabsTrigger value="courses" asChild><Link href="/member/programs/all">รายวิชาทั้งหมด</Link></TabsTrigger><TabsTrigger value="by-college" asChild><Link href="/member/programs/by-college">แยกตามวิทยาลัย</Link></TabsTrigger></TabsList></Tabs>;
}
