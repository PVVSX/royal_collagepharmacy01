"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  StudentRecordBadge,
  type TrainingStatus,
} from "@/roles/shared/features/student-records";

const mockStudents = [
  { id: "RPC-2569-001", name: "ภญ. คาริน่า ยู", program: "เภสัชบำบัด", year: "2569", trainingStatus: "normal", email: "karina@example.com" },
  { id: "RPC-2569-002", name: "ภก. สมชาย ใจดี", program: "เภสัชบำบัด", year: "2569", trainingStatus: "normal", email: "somchai@example.com" },
  { id: "RPC-2568-124", name: "ภญ. สมหญิง รักชาติ", program: "เภสัชกรรมชุมชน", year: "2568", trainingStatus: "maintaining", email: "somying@example.com" },
  { id: "RPC-2567-089", name: "ภก. มานะ อดทน", program: "การคุ้มครองผู้บริโภค", year: "2567", trainingStatus: "completed", email: "mana@example.com" },
  { id: "RPC-2568-201", name: "ภญ. กานดา ศรีสุข", program: "เภสัชอุตสาหการ", year: "2568", trainingStatus: "resigned", email: "kanda@example.com" },
] satisfies readonly {
  id: string;
  name: string;
  program: string;
  year: string;
  trainingStatus: TrainingStatus;
  email: string;
}[];

export default function AdminStudentsPage() {
  const [students] = useState(mockStudents);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredStudents = students.filter(s => 
    s.name.includes(searchTerm) || s.id.includes(searchTerm) || s.program.includes(searchTerm)
  );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-content">รายชื่อผู้เข้าศึกษา</h1>
          <p className="text-muted-foreground mt-1">จัดการข้อมูลและประวัติการศึกษาของผู้เข้ารับการฝึกอบรมทั้งหมด</p>
        </div>
        <Button className="gap-2 bg-brand text-brand-foreground hover:bg-brand-strong">
          <span className="material-symbols-outlined text-lg">add</span> เพิ่มผู้เข้าศึกษาใหม่
        </Button>
      </div>

      <Card className="shadow-sm border-border">
        <CardContent className="p-6">
          <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
            <div className="relative w-full md:w-96">
              <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-muted-foreground">
                <span className="material-symbols-outlined text-xl">search</span>
              </span>
              <Input 
                placeholder="ค้นหาชื่อ, รหัสประจำตัว หรืออีเมล..." 
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="gap-2 text-content">
                <span className="material-symbols-outlined text-lg">file_download</span> Export CSV
              </Button>
              <Button variant="outline" className="gap-2 text-content">
                <span className="material-symbols-outlined text-lg">filter_list</span> ตัวกรอง
              </Button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-content-muted uppercase bg-surface-sunken border-y">
                <tr>
                  <th className="px-4 py-3 font-medium">รหัสประจำตัว</th>
                  <th className="px-4 py-3 font-medium">ชื่อ-นามสกุล</th>
                  <th className="px-4 py-3 font-medium">หลักสูตร</th>
                  <th className="px-4 py-3 font-medium">ปีการศึกษา</th>
                  <th className="px-4 py-3 font-medium">อีเมล</th>
                  <th className="px-4 py-3 font-medium">สถานะการฝึกอบรม</th>
                  <th className="px-4 py-3 font-medium text-right">จัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredStudents.map((item) => (
                  <tr key={item.id} className="hover:bg-surface-sunken transition-colors">
                    <td className="px-4 py-3 font-semibold text-content">{item.id}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-neutral-soft flex items-center justify-center text-neutral-on-soft font-bold text-xs">
                          {item.name.charAt(4)}
                        </div>
                        <span className="font-medium text-content">{item.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-content-muted">{item.program}</td>
                    <td className="px-4 py-3 text-content-muted">{item.year}</td>
                    <td className="px-4 py-3 text-content-muted">{item.email}</td>
                    <td className="px-4 py-3">
                      <StudentRecordBadge
                        kind="training"
                        status={item.trainingStatus}
                      />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <a href={`/admin/students/${item.id}`}>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-content-muted hover:text-primary" title="ดูข้อมูล">
                          <span className="material-symbols-outlined text-lg">visibility</span>
                        </Button>
                      </a>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-content-muted hover:text-primary" title="แก้ไข">
                        <span className="material-symbols-outlined text-lg">edit</span>
                      </Button>
                    </td>
                  </tr>
                ))}
                {filteredStudents.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-content-muted">
                      ไม่พบข้อมูลผู้เข้าศึกษาที่ค้นหา
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-border">
            <span className="text-sm text-content-muted">แสดง {filteredStudents.length} จาก 1,248 รายการ</span>
            <div className="flex gap-1">
              <Button variant="outline" size="sm" disabled>ก่อนหน้า</Button>
              <Button variant="outline" size="sm" className="bg-primary/5 border-primary/20 text-primary">1</Button>
              <Button variant="outline" size="sm">2</Button>
              <Button variant="outline" size="sm">3</Button>
              <Button variant="outline" size="sm">...</Button>
              <Button variant="outline" size="sm">ถัดไป</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
