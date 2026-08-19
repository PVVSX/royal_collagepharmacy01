"use client";

import { useState } from "react";
import Link from "next/link";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageShell } from "@/roles/shared/components/layout/PageShell";
import { colleges } from "@/roles/shared/data";
import { groupCoursesByCollege } from "@/roles/shared/features/courses/course-catalog";

export default function ByCollegePage() {
  const [query, setQuery] = useState("");
  const normalized = query.trim().toLocaleLowerCase("th-TH");
  const groups = groupCoursesByCollege().map((group) => ({ ...group, courses: group.courses.filter((item) => !normalized || `${item.code ?? ""} ${item.titleTh} ${item.titleEn}`.toLocaleLowerCase("th-TH").includes(normalized)) })).filter((group) => group.courses.length > 0);
  return <PageShell className="space-y-5"><header><h1 className="text-2xl font-bold">รายการแยกตามวิทยาลัย</h1><p className="mt-1 text-sm text-muted-foreground">ดูรายวิชาปกติและหลักสูตรระยะสั้นตามหน่วยงานเจ้าของหลักสูตร</p></header><Tabs value="by-college"><TabsList><TabsTrigger value="programs" asChild><Link href="/member/programs">ภาพรวมหลักสูตร</Link></TabsTrigger><TabsTrigger value="courses" asChild><Link href="/member/programs/all">รายวิชาทั้งหมด</Link></TabsTrigger><TabsTrigger value="by-college" asChild><Link href="/member/programs/by-college">แยกตามวิทยาลัย</Link></TabsTrigger></TabsList></Tabs><Input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="ค้นหารายวิชาในทุกวิทยาลัย" aria-label="ค้นหารายวิชาแยกตามวิทยาลัย" className="max-w-xl" /><Accordion type="multiple" defaultValue={groups.slice(0, 1).map((group) => group.collegeCode)} className="space-y-3">{groups.map((group) => <AccordionItem key={group.collegeCode} value={group.collegeCode} className="rounded-xl border border-border bg-card px-5"><AccordionTrigger className="hover:no-underline"><span className="min-w-0 text-left"><span className="block font-semibold">{colleges[group.collegeCode].fullName}</span><span className="mt-1 block text-xs text-muted-foreground">{group.courses.length} รายการ</span></span></AccordionTrigger><AccordionContent><div className="divide-y rounded-lg border border-border">{group.courses.map((item) => <div key={item.id} className="grid gap-2 p-4 sm:grid-cols-[110px_minmax(0,1fr)_auto] sm:items-center"><span className="font-mono text-xs text-muted-foreground">{item.code ?? "ไม่มีรหัสวิชา"}</span><span><span className="block font-medium">{item.titleTh}</span><span className="mt-1 block text-xs text-muted-foreground">{item.titleEn} · {item.duration}</span></span><Badge variant="secondary">{item.kind === "short_course" ? "หลักสูตรระยะสั้น" : item.classification === "required" ? "วิชาบังคับ" : "วิชาทั่วไป"}</Badge></div>)}</div></AccordionContent></AccordionItem>)}</Accordion>{groups.length === 0 && <div className="py-14 text-center text-sm text-muted-foreground">ไม่พบรายการที่ค้นหา</div>}</PageShell>;
}
