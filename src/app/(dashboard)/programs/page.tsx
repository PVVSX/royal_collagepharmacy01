"use client";

import { toast } from "sonner";
import { useState } from "react";
import Link from "next/link";
import { programsData } from "@/data";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const PAGE_SIZE = 3;

export default function ProgramsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [collegeFilter, setCollegeFilter] = useState("ทุกวิทยาลัย");
  const [page, setPage] = useState(1);

  // Filter
  const filtered = programsData.filter((p) => {
    const matchSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchCollege = collegeFilter === "ทุกวิทยาลัย" || p.college === collegeFilter;
    return matchSearch && matchCollege;
  });

  // Paginate
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="p-4 md:p-6 pb-16 max-w-[1280px] mx-auto">
      <header className="mb-5">
        <h1 className="text-lg md:text-xl font-semibold mb-1">หลักสูตรและรายวิชา</h1>
        <p className="text-xs text-muted-foreground">ภาพรวมหลักสูตรทั้งหมดของวิทยาลัยเภสัชกรรม</p>
      </header>

      <Tabs defaultValue="programs" className="mb-4">
        <TabsList className="h-9">
          <TabsTrigger value="programs" className="text-xs" asChild><Link href="/programs">หลักสูตรทั้งหมด</Link></TabsTrigger>
          <TabsTrigger value="courses" className="text-xs" asChild><Link href="/programs/all">รายวิชาทั้งหมด</Link></TabsTrigger>
          <TabsTrigger value="by-college" className="text-xs" asChild><Link href="/programs/by-college">แยกตามวิทยาลัย</Link></TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1 max-w-sm">
          <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground text-lg">search</span>
          <Input
            placeholder="ค้นหาหลักสูตร..."
            className="pl-9 h-9 text-sm"
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
          />
        </div>
        <select
          className="bg-card border border-border rounded-md px-3 py-1.5 text-sm h-9 outline-none focus:border-ring"
          value={collegeFilter}
          onChange={(e) => { setCollegeFilter(e.target.value); setPage(1); }}
        >
          <option>ทุกวิทยาลัย</option><option>วคบท.</option><option>CPAT</option><option>วภช.</option><option>สมุนไพร</option><option>วภท.</option>
        </select>
      </div>

      <p className="text-xs text-muted-foreground mb-4">
        {searchQuery || collegeFilter !== "ทุกวิทยาลัย"
          ? `พบ ${filtered.length} หลักสูตร (จากทั้งหมด ${programsData.length})`
          : `พบ ${programsData.length} หลักสูตร`}
      </p>

      {filtered.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <span className="material-symbols-outlined text-4xl mb-2 block">search_off</span>
          <p className="text-sm">ไม่พบหลักสูตรที่ค้นหา</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {paginated.map((p) => (
              <Card key={p.id} className="card-shadow hover:border-primary/40 transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-center gap-1.5 mb-2">
                    <Badge variant="outline" className="text-xs opacity-90 px-1.5 py-0">{p.college}</Badge>
                    <Badge variant={p.status === "active" ? "default" : "secondary"} className="text-xs opacity-90 px-1.5 py-0">
                      {p.status === "active" ? "เปิดรับสมัคร" : "กำลังดำเนินการ"}
                    </Badge>
                  </div>
                  <h3 className="text-sm font-semibold mb-1.5 line-clamp-2">{p.title}</h3>
                  <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{p.description}</p>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
                    <span className="flex items-center gap-1"><span className="material-symbols-outlined text-sm">bookmark</span>{p.credits} หน่วยกิต</span>
                    <span className="flex items-center gap-1"><span className="material-symbols-outlined text-sm">schedule</span>{p.duration}</span>
                  </div>
                  <div className="flex -space-x-2 mt-4 pt-3 border-t border-border/50 mb-3">
                    {["male_1", "female_2", "male_2"].slice(0, (p.id % 3) + 1).map((avatar, i) => (
                      <div key={i} className="w-7 h-7 rounded-full border-2 border-card overflow-hidden bg-muted">
                        <img src={`/images/assets/member/learning/instructors/${avatar}.png`} alt="Instructor" className="w-full h-full object-cover" />
                      </div>
                    ))}
                    <span className="text-[10px] text-muted-foreground ml-3 self-center">คณาจารย์ประจำวิชา</span>
                  </div>
                  <Button
                    variant="link"
                    className="p-0 h-auto text-xs text-primary gap-1"
                    onClick={() => toast.info(`ดูรายละเอียดหลักสูตร\n\n${p.title}\nวิทยาลัย: ${p.collegeFull}\nรหัส: ${p.code}\nหน่วยกิต: ${p.credits}\nระยะเวลา: ${p.duration}\nผู้เข้าศึกษา: ${p.students} คน\n\n${p.description}`)}
                  >
                    ดูรายละเอียด <span className="material-symbols-outlined text-sm">arrow_forward</span>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-1.5 mt-6">
              <Button
                variant="outline" size="icon" className="h-7 w-7"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                <span className="material-symbols-outlined text-sm">chevron_left</span>
              </Button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                <Button
                  key={n}
                  variant={page === n ? "default" : "outline"}
                  size="icon"
                  className="h-7 w-7 text-xs"
                  onClick={() => setPage(n)}
                >
                  {n}
                </Button>
              ))}
              <Button
                variant="outline" size="icon" className="h-7 w-7"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                <span className="material-symbols-outlined text-sm">chevron_right</span>
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
