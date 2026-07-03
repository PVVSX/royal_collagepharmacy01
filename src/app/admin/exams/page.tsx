"use client";

import { useState } from "react";
import { useMockDb } from "@/context/MockDbContext";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const statusMap: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; label: string }> = {
  pending: { variant: "outline", label: "รอการตรวจสอบ" },
  approved: { variant: "secondary", label: "มีสิทธิ์สอบ" },
  rejected: { variant: "destructive", label: "ไม่มีสิทธิ์สอบ" },
  passed: { variant: "default", label: "สอบผ่าน" },
  failed: { variant: "destructive", label: "สอบไม่ผ่าน" },
};

export default function ExamsManagementPage() {
  const { examRequests, updateExamRequestStatus } = useMockDb();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<string>("all");

  const filteredExams = examRequests.filter((req) => {
    const matchesSearch = 
      req.studentName.toLowerCase().includes(searchQuery.toLowerCase()) || 
      req.studentId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.program.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab = activeTab === "all" || req.status === activeTab;
    return matchesSearch && matchesTab;
  });

  return (
    <div className="p-4 md:p-6 pb-24 max-w-[1280px] mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">จัดการการสอบประเมินความรู้</h1>
        <p className="text-sm text-slate-500 mt-1">ตรวจสอบสิทธิ์การสอบและบันทึกผลสอบของผู้เข้าศึกษา</p>
      </div>

      <Card className="card-shadow">
        <CardHeader className="pb-4 border-b">
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <div className="flex bg-slate-100/80 p-1 rounded-lg w-fit">
              {[
                { id: "all", label: "ทั้งหมด" },
                { id: "pending", label: "รอตรวจสิทธิ์" },
                { id: "approved", label: "รอสอบ" },
                { id: "passed", label: "สอบผ่าน" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
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
                placeholder="ค้นหาผู้เข้าศึกษา, หลักสูตร..."
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
                  <TableHead>ข้อมูลผู้เข้าศึกษา</TableHead>
                  <TableHead>หลักสูตร</TableHead>
                  <TableHead>ประเภทการสอบ</TableHead>
                  <TableHead>สมุดประจำตัว (Logbook)</TableHead>
                  <TableHead>สถานะ</TableHead>
                  <TableHead className="text-right">จัดการผลสอบ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredExams.length > 0 ? (
                  filteredExams.map((req) => {
                    const statusInfo = statusMap[req.status];
                    return (
                      <TableRow key={req.id} className="group">
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium text-slate-900">{req.studentName}</span>
                            <span className="text-xs text-slate-500">{req.studentId}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-slate-600">{req.program}</TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="text-slate-900">{req.examType}</span>
                            {req.examDate && <span className="text-xs text-slate-500">สอบ: {req.examDate}</span>}
                          </div>
                        </TableCell>
                        <TableCell>
                          <a href="#" className="flex items-center gap-1 text-sm text-blue-600 hover:underline">
                            <span className="material-symbols-outlined text-base">description</span>
                            ดูไฟล์แนบ
                          </a>
                        </TableCell>
                        <TableCell>
                          <Badge variant={statusInfo.variant} className="font-medium">
                            {statusInfo.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          {req.status === "pending" ? (
                            <div className="flex items-center justify-end gap-2">
                              <Button size="sm" variant="outline" className="h-8" onClick={() => updateExamRequestStatus(req.id, "approved")}>ให้สิทธิ์สอบ</Button>
                            </div>
                          ) : req.status === "approved" ? (
                            <div className="flex items-center justify-end gap-2">
                              <Button size="sm" variant="default" className="h-8 bg-emerald-600 hover:bg-emerald-700" onClick={() => updateExamRequestStatus(req.id, "passed")}>สอบผ่าน</Button>
                              <Button size="sm" variant="destructive" className="h-8" onClick={() => updateExamRequestStatus(req.id, "failed")}>สอบไม่ผ่าน</Button>
                            </div>
                          ) : (
                            <span className="text-slate-400 text-sm">ประเมินแล้ว</span>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="h-32 text-center text-slate-500">
                      ไม่พบข้อมูลผู้ขอสอบ
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
