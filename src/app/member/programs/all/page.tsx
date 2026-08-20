"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ProgramSectionNav } from "@/roles/member/features/programs/ProgramSectionNav";
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
      <ProgramSectionNav active="all" />
      <Card>
        <CardContent className="p-5">
          <form
            role="search"
            onSubmit={(event) => event.preventDefault()}
            className="grid gap-4 md:grid-cols-2 lg:grid-cols-[minmax(0,1fr)_minmax(10rem,0.28fr)_minmax(11rem,0.32fr)]"
          >
            <div className="md:col-span-2 lg:col-span-1">
              <label htmlFor="course-search" className="mb-1.5 block text-sm font-medium">ค้นหารายวิชา</label>
              <Input
                id="course-search"
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="ค้นหาชื่อ รหัส วิทยาลัย หรือสถาบัน"
                className="h-11 rounded-xl text-sm"
              />
            </div>
            <div>
              <label htmlFor="course-college" className="mb-1.5 block text-sm font-medium">วิทยาลัย</label>
              <select
                id="course-college"
                value={college}
                onChange={(event) => setCollege(event.target.value as "all" | CollegeCode)}
                className="h-11 w-full rounded-xl border border-border bg-background px-3 text-sm text-foreground outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30"
              >
                <option value="all">ทุกวิทยาลัย</option>
                {(["วคบท.", "CPAT", "วภช.", "สมุนไพร", "วภท."] as CollegeCode[]).map((code) => <option key={code}>{code}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="course-kind" className="mb-1.5 block text-sm font-medium">ประเภทรายการ</label>
              <select
                id="course-kind"
                value={kind}
                onChange={(event) => setKind(event.target.value as typeof kind)}
                className="h-11 w-full rounded-xl border border-border bg-background px-3 text-sm text-foreground outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30"
              >
                <option value="all">ทุกประเภท</option>
                <option value="course">รายวิชาปกติ</option>
                <option value="short_course">หลักสูตรระยะสั้น</option>
              </select>
            </div>
          </form>
          <p role="status" aria-live="polite" className="mt-4 border-t border-border pt-4 text-sm text-muted-foreground">
            พบ <strong className="font-semibold tabular-nums text-foreground">{visible.length}</strong> รายการ
          </p>
        </CardContent>
      </Card>
      <div className="overflow-x-auto rounded-xl border border-border bg-card"><Table className="min-w-[900px]"><TableHeader><TableRow><TableHead>รหัส</TableHead><TableHead>ชื่อรายการ</TableHead><TableHead>ประเภท</TableHead><TableHead>สถาบันที่รับผิดชอบ</TableHead><TableHead>หน่วยกิต</TableHead><TableHead>ระยะเวลา</TableHead><TableHead>สถานะ</TableHead></TableRow></TableHeader><TableBody>{visible.map((item) => { const institution = courseInstitutions[item.responsibleInstitutionId as keyof typeof courseInstitutions]; return <TableRow key={item.id}><TableCell className="font-mono text-xs">{item.code ?? "ไม่กำหนดรหัส"}</TableCell><TableCell className="max-w-sm whitespace-normal"><p className="font-medium">{item.titleTh}</p><p className="mt-1 text-xs text-muted-foreground">{item.titleEn}</p></TableCell><TableCell><Badge variant="secondary">{item.kind === "short_course" ? "หลักสูตรระยะสั้น" : item.classification === "required" ? "วิชาบังคับ" : "วิชาทั่วไป"}</Badge></TableCell><TableCell className="max-w-xs whitespace-normal"><p>{institution?.name}</p><p className="mt-1 font-mono text-xs text-muted-foreground">{institution?.code}</p></TableCell><TableCell>{item.credits}</TableCell><TableCell>{item.duration}</TableCell><TableCell><Badge variant={item.status === "active" ? "success" : "neutral"}>{item.status === "active" ? "เปิดสอน" : "ปิดรับ"}</Badge></TableCell></TableRow>; })}</TableBody></Table>{visible.length === 0 && <div className="p-12 text-center text-sm text-muted-foreground">ไม่พบรายการที่ตรงกับเงื่อนไข</div>}</div>
    </PageShell>
  );
}
