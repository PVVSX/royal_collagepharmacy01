"use client";

import Footer from "@/roles/shared/components/layout/Footer";
import { toast } from "sonner";
import { useState } from "react";
import Link from "next/link";
import { allCoursesData } from "@/roles/shared/data";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { PageShell } from "@/roles/shared/components/layout/PageShell";
import {
  getResponsibleInstitution,
  RESPONSIBLE_INSTITUTION_LABEL,
} from "@/roles/shared/features/courses/responsible-institution";

const PAGE_SIZE = 7;

export default function AllCoursesPage() {
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [collegeFilter, setCollegeFilter] = useState("ทุกวิทยาลัย");

  const filtered = allCoursesData.filter((c) => {
    const normalizedSearch = searchQuery.trim().toLowerCase();
    const responsibleInstitution = getResponsibleInstitution(c.college);
    const matchSearch =
      normalizedSearch === "" ||
      c.title.toLowerCase().includes(normalizedSearch) ||
      c.code.toLowerCase().includes(normalizedSearch) ||
      c.college.toLowerCase().includes(normalizedSearch) ||
      responsibleInstitution.toLowerCase().includes(normalizedSearch);
    const matchCollege = collegeFilter === "ทุกวิทยาลัย" || c.college === collegeFilter;
    return matchSearch && matchCollege;
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <PageShell>
      <header className="mb-5">
        <h1 className="text-lg md:text-xl font-semibold mb-1">รายวิชาทั้งหมด</h1>
        <p className="text-xs text-muted-foreground">เรียกดูรายวิชาทั้งหมดที่มีการเปิดสอน</p>
      </header>

      <Tabs defaultValue="courses" className="mb-4 min-w-0">
        <div className="max-w-full overflow-x-auto pb-1 sm:pb-0">
          <TabsList className="h-9 min-w-max">
            <TabsTrigger value="programs" className="text-xs" asChild><Link href="/member/programs">หลักสูตรทั้งหมด</Link></TabsTrigger>
            <TabsTrigger value="courses" className="text-xs" asChild><Link href="/member/programs/all">รายวิชาทั้งหมด</Link></TabsTrigger>
            <TabsTrigger value="by-college" className="text-xs" asChild><Link href="/member/programs/by-college">แยกตามวิทยาลัย</Link></TabsTrigger>
          </TabsList>
        </div>
      </Tabs>

      {/* Search + Filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative w-full flex-1 sm:max-w-sm">
          <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground text-lg">search</span>
          <Input placeholder="ค้นหาวิชา รหัส หรือสถาบัน..." className="pl-9 h-9 text-sm" value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }} />
        </div>
        <select className="h-9 w-full rounded-md border border-border bg-card px-3 py-1.5 text-sm outline-none focus:border-ring sm:w-auto" value={collegeFilter} onChange={(e) => { setCollegeFilter(e.target.value); setPage(1); }}>
          <option>ทุกวิทยาลัย</option><option>วคบท.</option><option>CPAT</option><option>วภช.</option><option>สมุนไพร</option><option>วภท.</option>
        </select>
      </div>

      <p className="text-xs text-muted-foreground mb-4">
        {searchQuery || collegeFilter !== "ทุกวิทยาลัย"
          ? `พบ ${filtered.length} รายวิชา (จากทั้งหมด ${allCoursesData.length})`
          : `พบ ${allCoursesData.length} รายวิชา`}
      </p>

      {filtered.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <span className="material-symbols-outlined text-4xl mb-2 block">search_off</span>
          <p className="text-sm">ไม่พบรายวิชาที่ค้นหา</p>
        </div>
      ) : (
        <div className="min-w-0 overflow-hidden rounded-lg border bg-card card-shadow">
          <Table className="min-w-[760px] xl:min-w-[960px]">
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs h-10">รหัสวิชา</TableHead>
                <TableHead className="text-xs h-10">ชื่อรายวิชา</TableHead>
                <TableHead className="hidden xl:table-cell text-xs h-10 min-w-[240px]">{RESPONSIBLE_INSTITUTION_LABEL}</TableHead>
                <TableHead className="text-xs h-10">หน่วยกิต</TableHead>
                <TableHead className="text-xs h-10">ที่นั่ง/ความจุ</TableHead>
                <TableHead className="text-xs h-10">สถานะ</TableHead>
                <TableHead className="text-xs h-10 text-right">รายละเอียด</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginated.map((course) => {
                const responsibleInstitution = getResponsibleInstitution(course.college);

                return (
                  <TableRow key={course.code}>
                    <TableCell className="text-xs py-3 font-medium">{course.code}</TableCell>
                    <TableCell className="min-w-[220px] whitespace-normal text-xs py-3">
                      <span>{course.title}</span>
                      <span className="mt-1 block text-3xs leading-relaxed text-muted-foreground xl:hidden">
                        ผู้รับผิดชอบ: {responsibleInstitution}
                      </span>
                    </TableCell>
                    <TableCell className="hidden xl:table-cell min-w-[240px] whitespace-normal text-xs py-3">
                      <span className="font-medium text-foreground">{responsibleInstitution}</span>
                      <span className="mt-0.5 block text-3xs text-muted-foreground">รหัสสังกัด {course.college}</span>
                    </TableCell>
                    <TableCell className="text-xs py-3">{course.credits}</TableCell>
                    <TableCell className="text-xs py-3">
                      <div className="flex items-center gap-2 min-w-[120px]">
                        <Progress value={(course.enrolled / course.capacity) * 100} className="h-1.5 flex-1" />
                        <span className="text-xs text-muted-foreground">{course.enrolled}/{course.capacity}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs py-3">
                      <Badge variant={course.status === "active" ? "default" : "secondary"} className="text-xs opacity-90 px-1.5 py-0">
                        {course.status === "active" ? "เปิดสอน" : "ปิดรับสมัคร"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs py-3 text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        aria-label={`ดูรายละเอียดรายวิชา ${course.title}`}
                        onClick={() => toast.info(`ดูรายวิชา: ${course.title}\nรหัส: ${course.code}\n${RESPONSIBLE_INSTITUTION_LABEL}: ${responsibleInstitution}\nหน่วยกิต: ${course.credits}\nที่นั่ง: ${course.enrolled}/${course.capacity}`)}
                      >
                        <span className="material-symbols-outlined text-muted-foreground text-base">visibility</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          <div className="flex flex-col items-center gap-2 border-t px-4 py-2.5 text-xs text-muted-foreground sm:flex-row sm:justify-between">
            <span className="text-center sm:text-left">แสดง {(page - 1) * PAGE_SIZE + 1} ถึง {Math.min(page * PAGE_SIZE, filtered.length)} จาก {filtered.length} รายการ</span>
            <div className="flex max-w-full items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
              <Button variant="outline" size="icon" className="h-7 w-7 shrink-0" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
                <span className="material-symbols-outlined text-sm">chevron_left</span>
              </Button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
                <Button key={n} variant={page === n ? "default" : "outline"} size="icon" className="h-7 w-7 shrink-0 text-xs" onClick={() => setPage(n)}>{n}</Button>
              ))}
              <Button variant="outline" size="icon" className="h-7 w-7 shrink-0" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
                <span className="material-symbols-outlined text-sm">chevron_right</span>
              </Button>
            </div>
          </div>
        </div>
      )}
      <Footer />
    </PageShell>
  );
}
