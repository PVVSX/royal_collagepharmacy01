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

const PAGE_SIZE = 3;

export default function AllCoursesPage() {
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [collegeFilter, setCollegeFilter] = useState("ทุกวิทยาลัย");

  const filtered = allCoursesData.filter((c) => {
    const matchSearch = c.title.toLowerCase().includes(searchQuery.toLowerCase()) || c.code.toLowerCase().includes(searchQuery.toLowerCase());
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

      <Tabs defaultValue="courses" className="mb-4">
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
          <Input placeholder="ค้นหาวิชา..." className="pl-9 h-9 text-sm" value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }} />
        </div>
        <select className="bg-card border border-border rounded-md px-3 py-1.5 text-sm h-9 outline-none focus:border-ring" value={collegeFilter} onChange={(e) => { setCollegeFilter(e.target.value); setPage(1); }}>
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
        <div className="bg-card rounded-lg card-shadow border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs h-10">รหัสวิชา</TableHead>
                <TableHead className="text-xs h-10">ชื่อรายวิชา</TableHead>
                <TableHead className="text-xs h-10">หน่วยกิต</TableHead>
                <TableHead className="text-xs h-10">ที่นั่ง/ความจุ</TableHead>
                <TableHead className="text-xs h-10">สถานะ</TableHead>
                <TableHead className="text-xs h-10 text-right">รายละเอียด</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginated.map((course) => (
                <TableRow key={course.code}>
                  <TableCell className="text-xs py-3 font-medium">{course.code}</TableCell>
                  <TableCell className="text-xs py-3">{course.title}</TableCell>
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
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => toast.info(`ดูรายวิชา: ${course.title}\nรหัส: ${course.code}\nหน่วยกิต: ${course.credits}\nที่นั่ง: ${course.enrolled}/${course.capacity}`)}>
                      <span className="material-symbols-outlined text-muted-foreground text-base">visibility</span>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="px-4 py-2.5 border-t flex justify-between items-center text-xs text-muted-foreground">
            <span>แสดง {(page - 1) * PAGE_SIZE + 1} ถึง {Math.min(page * PAGE_SIZE, filtered.length)} จาก {filtered.length} รายการ</span>
            <div className="flex items-center gap-1">
              <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
                <span className="material-symbols-outlined text-sm">chevron_left</span>
              </Button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
                <Button key={n} variant={page === n ? "default" : "outline"} size="icon" className="h-7 w-7 text-xs" onClick={() => setPage(n)}>{n}</Button>
              ))}
              <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
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
