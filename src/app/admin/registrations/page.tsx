"use client";

import { useState } from "react";
import { useMockDb, Status } from "@/context/MockDbContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const statusMap: Record<Status, { variant: "default" | "secondary" | "destructive" | "outline"; label: string }> = {
  pending: { variant: "outline", label: "รอการตรวจสอบ" },
  approved: { variant: "default", label: "ยืนยันการลงทะเบียนแล้ว" },
  rejected: { variant: "destructive", label: "ไม่อนุมัติ/ถูกยกเลิก" },
};

export default function RegistrationsApprovalPage() {
  const { registrations, updateRegistrationStatus } = useMockDb();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<Status | "all">("all");

  const filteredRegistrations = registrations.filter((reg) => {
    const matchesSearch = 
      reg.studentName.toLowerCase().includes(searchQuery.toLowerCase()) || 
      reg.courseCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      reg.studentId.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab = activeTab === "all" || reg.status === activeTab;
    return matchesSearch && matchesTab;
  });

  return (
    <div className="p-4 md:p-6 pb-24 max-w-[1280px] mx-auto">
      <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">ตรวจสอบการลงทะเบียนเรียน</h1>
          <p className="text-sm text-slate-500 mt-1">อนุมัติและยืนยันสิทธิ์การลงทะเบียนรายวิชาของผู้เข้าศึกษาเข้าสู่ระบบวิทยาลัย</p>
        </div>
      </div>

      <Card className="card-shadow">
        <CardHeader className="pb-4 border-b">
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <div className="flex bg-slate-100/80 p-1 rounded-lg w-fit">
              {[
                { id: "all", label: "ทั้งหมด" },
                { id: "pending", label: "รอตรวจสอบ" },
                { id: "approved", label: "ยืนยันแล้ว" },
                { id: "rejected", label: "ถูกยกเลิก" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as Status | "all")}
                  className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
                    activeTab === tab.id
                      ? "bg-white text-primary shadow-sm"
                      : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            
            <div className="relative w-full sm:w-64">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">search</span>
              <Input
                placeholder="ค้นหารหัสประจำตัว, ชื่อ, รหัสวิชา..."
                className="pl-9 bg-slate-50/50"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-50/50">
                <TableRow>
                  <TableHead className="w-[120px]">รหัสการลงทะเบียน</TableHead>
                  <TableHead>ข้อมูลผู้เข้าศึกษา</TableHead>
                  <TableHead>รายวิชาที่ลงทะเบียน</TableHead>
                  <TableHead>ภาคการศึกษา</TableHead>
                  <TableHead>สถานะ</TableHead>
                  <TableHead className="text-right">จัดการ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRegistrations.length > 0 ? (
                  filteredRegistrations.map((reg) => {
                    const statusInfo = statusMap[reg.status];
                    return (
                      <TableRow key={reg.id} className="group">
                        <TableCell className="font-medium text-slate-900">{reg.id}</TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium text-slate-900">{reg.studentName}</span>
                            <span className="text-xs text-slate-500">{reg.studentId}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium text-slate-900">{reg.courseCode}</span>
                            <span className="text-xs text-slate-500">{reg.courseTitle}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-slate-600">{reg.term}</TableCell>
                        <TableCell>
                          <Badge variant={statusInfo.variant} className="font-medium">
                            {statusInfo.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          {reg.status === "pending" ? (
                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="h-8 text-emerald-600 border-emerald-200 hover:bg-emerald-50 hover:border-emerald-300"
                                onClick={() => updateRegistrationStatus(reg.id, "approved")}
                              >
                                ยืนยันสิทธิ์
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="h-8 text-rose-600 border-rose-200 hover:bg-rose-50 hover:border-rose-300"
                                onClick={() => updateRegistrationStatus(reg.id, "rejected")}
                              >
                                ยกเลิก
                              </Button>
                            </div>
                          ) : (
                            <Button size="sm" variant="ghost" className="h-8 text-slate-400">
                              <span className="material-symbols-outlined text-lg">visibility</span>
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="h-32 text-center text-slate-500">
                      ไม่พบข้อมูลการลงทะเบียนเรียน
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
