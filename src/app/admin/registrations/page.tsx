"use client";

import { useState } from "react";
import { useMockDb, Status } from "@/providers/mock-db-provider";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PageShell } from "@/roles/shared/components/layout/PageShell";

const statusMap: Record<Status, { variant: "warning" | "success" | "danger"; label: string }> = {
  pending: { variant: "warning", label: "รอการตรวจสอบ" },
  approved: { variant: "success", label: "ยืนยันการลงทะเบียนแล้ว" },
  rejected: { variant: "danger", label: "ไม่อนุมัติ/ถูกยกเลิก" },
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
    <PageShell bottom="roomy">
      <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-content tracking-tight">ตรวจสอบการลงทะเบียนเรียน</h1>
          <p className="text-sm text-content-muted mt-1">อนุมัติและยืนยันสิทธิ์การลงทะเบียนรายวิชาของผู้เข้าศึกษาเข้าสู่ระบบวิทยาลัย</p>
        </div>
      </div>

      <Card className="card-shadow">
        <CardHeader className="pb-4 border-b">
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <div className="flex bg-surface-sunken p-1 rounded-lg w-fit">
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
                      ? "bg-surface-raised text-brand shadow-sm"
                      : "text-content-muted hover:text-content hover:bg-surface-container-high"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            
            <div className="relative w-full sm:w-64">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-content-muted text-lg">search</span>
              <Input
                placeholder="ค้นหารหัสประจำตัว, ชื่อ, รหัสวิชา..."
                className="pl-9 bg-surface-container-low"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-surface-container-low">
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
                        <TableCell className="font-medium text-content">{reg.id}</TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium text-content">{reg.studentName}</span>
                            <span className="text-xs text-content-muted">{reg.studentId}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium text-content">{reg.courseCode}</span>
                            <span className="text-xs text-content-muted">{reg.courseTitle}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-content-muted">{reg.term}</TableCell>
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
                                className="h-8 border-success-border text-success hover:bg-success-soft"
                                onClick={() => updateRegistrationStatus(reg.id, "approved")}
                              >
                                ยืนยันสิทธิ์
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="h-8 border-danger-border text-danger hover:bg-danger-soft"
                                onClick={() => updateRegistrationStatus(reg.id, "rejected")}
                              >
                                ยกเลิก
                              </Button>
                            </div>
                          ) : (
                            <Button size="sm" variant="ghost" className="h-8 text-content-muted">
                              <span className="material-symbols-outlined text-lg">visibility</span>
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="h-32 text-center text-content-muted">
                      ไม่พบข้อมูลการลงทะเบียนเรียน
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </PageShell>
  );
}
