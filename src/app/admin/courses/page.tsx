"use client";

import { useState } from "react";
import Link from "next/link";
import { useMockDb, Status } from "@/context/MockDbContext";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const statusMap: Record<Status, { variant: "default" | "secondary" | "destructive" | "outline"; label: string }> = {
  pending: { variant: "outline", label: "รอตรวจสอบ" },
  approved: { variant: "default", label: "อนุมัติแล้ว" },
  rejected: { variant: "destructive", label: "ไม่อนุมัติ" },
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
    <div className="p-4 md:p-6 pb-24 max-w-[1280px] mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">จัดการรายวิชา (Course Management)</h1>
          <p className="text-sm text-slate-500 mt-1">
            อนุมัติการเปิดรายวิชาใหม่จากวิทยาลัยต่างๆ
          </p>
        </div>
        <Link href="/admin/courses/create">
          <Button className="gap-2">
            <span className="material-symbols-outlined text-lg">add</span>
            ยื่นขอเปิดรายวิชาใหม่
          </Button>
        </Link>
      </div>

      <Card className="card-shadow">
        <CardHeader className="pb-4 border-b">
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <div className="flex bg-slate-100/80 p-1 rounded-lg w-fit">
              {[
                { id: "all", label: "ทั้งหมด" },
                { id: "pending", label: "รอตรวจสอบ" },
                { id: "approved", label: "อนุมัติแล้ว" },
                { id: "rejected", label: "ไม่อนุมัติ" },
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
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">
                search
              </span>
              <Input
                placeholder="ค้นหารหัส หรือ ชื่อวิชา..."
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
                  <TableHead className="w-[120px]">รหัสวิชา</TableHead>
                  <TableHead>ชื่อรายวิชา / หลักสูตร</TableHead>
                  <TableHead>วิทยาลัย</TableHead>
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
                        <TableCell className="font-medium text-slate-900">
                          {req.courseCode}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium text-slate-900">{req.courseTitle}</span>
                            <span className="text-xs text-slate-500">{req.type} • {req.duration}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-slate-600">{req.collegeName}</TableCell>
                        <TableCell className="text-slate-500">{req.submittedAt}</TableCell>
                        <TableCell>
                          <Badge variant={statusInfo.variant} className="font-medium">
                            {statusInfo.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          {req.status === "pending" ? (
                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="h-8 text-emerald-600 border-emerald-200 hover:bg-emerald-50 hover:border-emerald-300"
                                onClick={() => updateCourseRequestStatus(req.id, "approved")}
                              >
                                อนุมัติ
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="h-8 text-rose-600 border-rose-200 hover:bg-rose-50 hover:border-rose-300"
                                onClick={() => updateCourseRequestStatus(req.id, "rejected")}
                              >
                                ปฏิเสธ
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
                      ไม่พบข้อมูลรายวิชา
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
