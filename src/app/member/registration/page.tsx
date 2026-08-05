"use client";

import { useState } from "react";
import { registrationData as initialData } from "@/roles/shared/data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useMockDb } from "@/providers/mock-db-provider";
import { PageShell } from "@/roles/shared/components/layout/PageShell";

type Course = typeof initialData.courses[number];

const statusMap: Record<string, { variant: "success" | "danger" | "brand"; label: string }> = {
  available: { variant: "success", label: "ว่าง" },
  full: { variant: "danger", label: "เต็ม" },
  registered: { variant: "brand", label: "ลงทะเบียนแล้ว" },
};

export default function RegistrationPage() {
  const { settings } = useMockDb();
  const [courses, setCourses] = useState<Course[]>(initialData.courses);
  const [searchQuery, setSearchQuery] = useState("");
  const d = initialData;

  if (!settings.registrationOpen) {
    return (
      <PageShell className="min-h-[70vh] flex flex-col items-center justify-center text-center">
        <div className="w-20 h-20 bg-neutral-soft rounded-full flex items-center justify-center mb-6">
          <span className="material-symbols-outlined text-4xl text-content-muted">event_busy</span>
        </div>
        <h1 className="text-3xl font-bold text-content mb-2">ปิดระบบลงทะเบียน</h1>
        <p className="text-content-muted max-w-md">
          ขณะนี้อยู่นอกช่วงเวลาการเปิดลงทะเบียนรายวิชา<br />
          กรุณาตรวจสอบปฏิทินการศึกษาสำหรับกำหนดการลงทะเบียนรอบถัดไป
        </p>
        <Button className="mt-6" onClick={() => window.history.back()}>
          กลับไปหน้าก่อนหน้า
        </Button>
      </PageShell>
    );
  }

  const displayedCourses = courses.filter((c) =>
    c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedCoursesCount = courses.filter((c) => c.status === "registered").length;
  const selectedCredits = courses.filter((c) => c.status === "registered").reduce((sum, c) => sum + c.credits, 0);

  const handleAdd = (code: string) => {
    setCourses((prev) => prev.map((c) => c.code === code ? { ...c, status: "registered" as const, enrolled: c.enrolled + 1 } : c));
  };

  const handleWithdraw = (code: string) => {
    if (confirm("คุณต้องการถอนการลงทะเบียนวิชานี้?")) {
      setCourses((prev) => prev.map((c) => c.code === code ? { ...c, status: "available" as const, enrolled: c.enrolled - 1 } : c));
    }
  };

  return (
    <PageShell bottom="roomy">
      <div className="bg-warning-soft border border-warning-border rounded-lg p-3 mb-4 flex items-start gap-2">
        <span className="material-symbols-outlined text-warning-on-soft text-base mt-0.5">warning</span>
        <div><p className="text-xs font-medium text-warning-on-soft">หมดเขตลงทะเบียน {d.deadline}</p><p className="text-xs text-warning-on-soft/80 mt-0.5">กรุณาลงทะเบียนก่อนกำหนด</p></div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-5">
        {[
          { label: "วิชาที่เลือก", value: `${selectedCoursesCount}/${d.maxCourses}` },
          { label: "หน่วยกิต", value: `${selectedCredits}/${d.maxCredits}` },
        ].map((s) => (
          <Card key={s.label}><CardContent className="p-3 text-center"><p className="text-xs text-muted-foreground">{s.label}</p><p className="text-lg font-bold text-primary mt-0.5">{s.value}</p></CardContent></Card>
        ))}
      </div>

      <Card className="card-shadow mb-6"><CardHeader className="pb-0 pt-4 px-5"><div className="flex items-center justify-between gap-3"><CardTitle className="text-sm flex-shrink-0">รายวิชาที่เปิดลงทะเบียน</CardTitle><div className="relative flex-1 max-w-sm"><span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground text-lg">search</span><Input placeholder="ค้นหาวิชา..." className="pl-9 h-8 text-xs" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} /></div></div></CardHeader>
        <CardContent className="p-0 mt-3">
          <Table><TableHeader><TableRow><TableHead className="text-xs h-9">รหัส</TableHead><TableHead className="text-xs h-9">ชื่อรายวิชา</TableHead><TableHead className="text-xs h-9">หน่วยกิต</TableHead><TableHead className="text-xs h-9">วัน/เวลา</TableHead><TableHead className="text-xs h-9">ห้อง</TableHead><TableHead className="text-xs h-9">ที่นั่ง</TableHead><TableHead className="text-xs h-9">สถานะ</TableHead><TableHead className="text-xs h-9">จัดการ</TableHead></TableRow></TableHeader>
            <TableBody>{displayedCourses.map((c) => { const st = statusMap[c.status] || { variant: "outline" as const, label: c.status }; return (
              <TableRow key={c.code}><TableCell className="text-xs py-2.5 font-medium">{c.code}</TableCell><TableCell className="text-xs py-2.5">{c.title}</TableCell><TableCell className="text-xs py-2.5">{c.credits}</TableCell><TableCell className="text-xs py-2.5">{c.schedule}</TableCell><TableCell className="text-xs py-2.5">{c.room}</TableCell><TableCell className="text-xs py-2.5">{c.enrolled}/{c.capacity}</TableCell><TableCell className="text-xs py-2.5"><Badge variant={st.variant} className="text-xs opacity-90 px-1.5 py-0">{st.label}</Badge></TableCell><TableCell className="text-xs py-2.5">{c.status === "available" ? <Button variant="link" size="sm" className="text-primary h-auto p-0 text-xs" onClick={() => handleAdd(c.code)}>+ เพิ่ม</Button> : c.status === "registered" ? <Button variant="link" size="sm" className="text-destructive h-auto p-0 text-xs" onClick={() => handleWithdraw(c.code)}>ถอน</Button> : <span className="text-muted-foreground">-</span>}</TableCell></TableRow>
            );})}</TableBody></Table>
        </CardContent>
      </Card>

    </PageShell>
  );
}
