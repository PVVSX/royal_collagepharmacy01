"use client";

import { useState } from "react";
import Link from "next/link";
import { collegeProgramsData } from "@/roles/shared/data";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Footer from "@/roles/shared/components/layout/Footer";
import { PageShell } from "@/roles/shared/components/layout/PageShell";

export default function ByCollegePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [collegeFilter, setCollegeFilter] = useState("ทุกวิทยาลัย");

  const filtered = collegeProgramsData.filter((col) => {
    const matchCollege = collegeFilter === "ทุกวิทยาลัย" || col.name === collegeFilter;
    const matchSearch = searchQuery === "" ||
      col.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      col.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      col.courseList.some((c) => c.name.toLowerCase().includes(searchQuery.toLowerCase()) || c.code.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchCollege && matchSearch;
  });

  return (
    <>
      <PageShell>
        <header className="mb-5"><h1 className="text-lg md:text-xl font-semibold mb-1">หลักสูตรแยกตามวิทยาลัย</h1><p className="text-xs text-muted-foreground">โครงสร้างหลักสูตรแยกตามสังกัดวิทยาลัย</p></header>

        <Tabs defaultValue="by-college" className="mb-4">
          <TabsList className="h-9">
            <TabsTrigger value="programs" className="text-xs" asChild><Link href="/member/programs">หลักสูตรทั้งหมด</Link></TabsTrigger>
            <TabsTrigger value="courses" className="text-xs" asChild><Link href="/member/programs/all">รายวิชาทั้งหมด</Link></TabsTrigger>
            <TabsTrigger value="by-college" className="text-xs" asChild><Link href="/member/programs/by-college">แยกตามวิทยาลัย</Link></TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Search + Filter */}
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="relative flex-1 max-w-sm">
            <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground text-lg">search</span>
            <Input placeholder="ค้นหาวิทยาลัยหรือวิชา..." className="pl-9 h-9 text-sm" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          </div>
          <select className="bg-card border border-border rounded-md px-3 py-1.5 text-sm h-9 outline-none focus:border-ring" value={collegeFilter} onChange={(e) => setCollegeFilter(e.target.value)}>
            <option>ทุกวิทยาลัย</option><option>วคบท.</option><option>CPAT</option><option>วภช.</option><option>สมุนไพร</option><option>วภท.</option>
          </select>
        </div>

        <p className="text-xs text-muted-foreground mb-4">
          {searchQuery || collegeFilter !== "ทุกวิทยาลัย"
            ? `พบ ${filtered.length} วิทยาลัย (จากทั้งหมด ${collegeProgramsData.length})`
            : `พบ ${collegeProgramsData.length} วิทยาลัย`}
        </p>

        {filtered.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <span className="material-symbols-outlined text-4xl mb-2 block">search_off</span>
            <p className="text-sm">ไม่พบวิทยาลัยที่ค้นหา</p>
          </div>
        ) : (
          <Accordion type="single" defaultValue={filtered[0]?.name} collapsible className="space-y-3">
            {filtered.map((college) => (
              <AccordionItem key={college.name} value={college.name} className="bg-card rounded-lg card-shadow border px-5">
                <AccordionTrigger className="hover:no-underline py-4">
                  <div className="flex items-center gap-3 text-left">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0"><span className="material-symbols-outlined text-primary text-xl">school</span></div>
                    <div className="flex-1 min-w-0"><h3 className="text-sm font-semibold">{college.name}</h3><p className="text-xs text-muted-foreground truncate">{college.fullName}</p></div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground pr-4 flex-shrink-0">
                      <span>{college.programs} หลักสูตร</span><span>{college.courses} รายวิชา</span><Badge variant="secondary" className="text-xs opacity-90 px-1.5 py-0">{college.students} คน</Badge>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pb-4">
                  {college.courseList.length > 0 ? (
                    <Table><TableHeader><TableRow><TableHead className="text-xs h-8">รหัสวิชา</TableHead><TableHead className="text-xs h-8">ชื่อรายวิชา</TableHead><TableHead className="text-xs h-8">หน่วยกิต</TableHead><TableHead className="text-xs h-8">สถานะ</TableHead></TableRow></TableHeader>
                      <TableBody>{college.courseList.map((c) => (
                        <TableRow key={c.code}><TableCell className="text-xs py-2 font-medium">{c.code}</TableCell><TableCell className="text-xs py-2">{c.name}</TableCell><TableCell className="text-xs py-2">{c.credits}</TableCell><TableCell className="text-xs py-2"><Badge variant={c.status === "active" ? "default" : "secondary"} className="text-xs opacity-90 px-1.5 py-0">{c.status === "active" ? "เปิดสอน" : "ปิดรับสมัคร"}</Badge></TableCell></TableRow>
                      ))}</TableBody></Table>
                  ) : (
                    <div className="py-6 text-center text-xs text-muted-foreground">ยังไม่มีรายวิชาในวิทยาลัยนี้</div>
                  )}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
      </PageShell>
      <Footer />
    </>
  );
}
