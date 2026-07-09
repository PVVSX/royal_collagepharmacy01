"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useMockDb } from "@/context/MockDbContext";

export default function AdminProgramsPage() {
  const { programs } = useMockDb();

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">จัดการหลักสูตร</h1>
          <p className="text-muted-foreground mt-1">จัดการรายวิชาและหลักสูตรการฝึกอบรม Board Certification</p>
        </div>
        <Button className="gap-2 bg-slate-900 hover:bg-slate-800 text-white">
          <span className="material-symbols-outlined text-[18px]">add</span> เพิ่มวิทยาลัย/หลักสูตรใหม่
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
        {programs.map((program) => (
          <Card key={program.id} className="shadow-sm border-slate-200 hover:shadow-md transition-shadow">
            <CardHeader className="pb-3 flex flex-row justify-between items-start">
              <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <span className="material-symbols-outlined text-2xl">menu_book</span>
              </div>
              <Badge variant="outline" className={program.status === 'active' ? "bg-green-50 text-green-700 border-green-200" : "bg-slate-100 text-slate-600 border-slate-200"}>
                {program.status === 'active' ? "เปิดรับสมัคร" : "แบบร่าง"}
              </Badge>
            </CardHeader>
            <CardContent>
              <h3 className="font-bold text-lg mb-1 line-clamp-2">{program.name}</h3>
              <p className="text-sm text-slate-500 mb-4">รหัสอ้างอิง: {program.id}</p>
              
              <div className="flex justify-between items-center text-sm mb-6 border-t pt-4">
                <div className="text-slate-600">
                  ผู้เข้าศึกษาที่ลงทะเบียน
                </div>
                <div className="font-semibold text-slate-900">
                  {program.studentsCount} คน
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" className="flex-1 text-slate-700">
                  <span className="material-symbols-outlined text-[18px] mr-1">edit</span> แก้ไข
                </Button>
                <Button variant="ghost" className="px-3 text-slate-500 hover:text-slate-900">
                  <span className="material-symbols-outlined text-[20px]">more_vert</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
