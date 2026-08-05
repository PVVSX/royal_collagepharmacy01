"use client";

import { useState } from "react";
import Link from "next/link";
import { useMockDb, Status } from "@/providers/mock-db-provider";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PageShell } from "@/roles/shared/components/layout/PageShell";
import { RESPONSIBLE_INSTITUTION_LABEL } from "@/roles/shared/features/courses/responsible-institution";

const statusMap: Record<Status, { variant: "warning" | "success" | "danger"; label: string }> = {
  pending: { variant: "warning", label: "รอตรวจสอบ" },
  approved: { variant: "success", label: "อนุมัติแล้ว" },
  rejected: { variant: "danger", label: "ไม่อนุมัติ" },
};

export default function CoursesPage() {
  const { courseRequests, updateCourseRequestStatus } = useMockDb();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<Status | "all">("all");

  const filteredRequests = courseRequests.filter((req) => {
    const matchesSearch = 
      req.courseTitle.toLowerCase().includes(searchQuery.toLowerCase()) || 
      req.courseCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.collegeName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab = activeTab === "all" || req.status === activeTab;
    return matchesSearch && matchesTab;
  });

  return (
    <PageShell bottom="roomy">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-content tracking-tight">จัดการรายวิชา (Course Management)</h1>
          <p className="text-sm text-content-muted mt-1">
            ตรวจสอบคำขอเปิดรายวิชาและ{RESPONSIBLE_INSTITUTION_LABEL}
          </p>
        </div>
        <Link href="/admin/courses/create">
          <Button className="gap-2">
            <span className="material-symbols-outlined text-lg">add</span>
            ยื่นขอเปิดรายวิชาใหม่
          </Button>
        </Link>
      </div>

      <Card className="min-w-0 card-shadow">
        <CardHeader className="pb-4 border-b">
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <div className="min-w-0 max-w-full overflow-x-auto pb-1 sm:pb-0">
              <div className="flex w-max rounded-lg bg-surface-sunken p-1">
                {[
                  { id: "all", label: "ทั้งหมด" },
                  { id: "pending", label: "รอตรวจสอบ" },
                  { id: "approved", label: "อนุมัติแล้ว" },
                  { id: "rejected", label: "ไม่อนุมัติ" },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as Status | "all")}
                    className={`shrink-0 rounded-md px-4 py-1.5 text-sm font-medium transition-all ${
                      activeTab === tab.id
                        ? "bg-surface-raised text-brand shadow-sm"
                        : "text-content-muted hover:text-content hover:bg-surface-container-high"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="relative w-full sm:w-64">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-content-muted text-lg">
                search
              </span>
              <Input
                placeholder="ค้นหารหัส ชื่อวิชา หรือสถาบัน..."
                className="pl-9 bg-surface-container-low"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="min-w-0 p-0">
          <Table className="min-w-[920px]">
            <TableHeader className="bg-surface-container-low">
              <TableRow>
                <TableHead className="w-[120px]">รหัสวิชา</TableHead>
                <TableHead>ชื่อรายวิชา / หลักสูตร</TableHead>
                <TableHead className="min-w-[220px]">{RESPONSIBLE_INSTITUTION_LABEL}</TableHead>
                <TableHead>วันที่ยื่นคำขอ</TableHead>
                <TableHead>สถานะ</TableHead>
                <TableHead className="text-right">จัดการ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRequests.length > 0 ? (
                filteredRequests.map((req) => {
                  const statusInfo = statusMap[req.status];
                  return (
                    <TableRow key={req.id} className="group">
                      <TableCell className="font-medium text-content">
                        {req.courseCode}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium text-content">{req.courseTitle}</span>
                          <span className="text-xs text-content-muted">{req.type} • {req.duration}</span>
                        </div>
                      </TableCell>
                      <TableCell className="whitespace-normal text-content-muted">{req.collegeName}</TableCell>
                      <TableCell className="text-content-muted">{req.submittedAt}</TableCell>
                      <TableCell>
                        <Badge variant={statusInfo.variant} className="font-medium">
                          {statusInfo.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {req.status === "pending" ? (
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8 border-success-border text-success hover:bg-success-soft"
                              onClick={() => updateCourseRequestStatus(req.id, "approved")}
                            >
                              อนุมัติ
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8 border-danger-border text-danger hover:bg-danger-soft"
                              onClick={() => updateCourseRequestStatus(req.id, "rejected")}
                            >
                              ปฏิเสธ
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
                    ไม่พบข้อมูลรายวิชา
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </PageShell>
  );
}
