"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useMockDb } from "@/context/MockDbContext";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const statusMap: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; label: string }> = {
  pending_approval: { variant: "outline", label: "รอการอนุมัติออกวุฒิบัตร" },
  issued: { variant: "default", label: "ออกวุฒิบัตรแล้ว" },
};

export default function CertificatesManagementPage() {
  const { certificates, updateCertificateStatus } = useMockDb();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<string>("all");

  const filteredCerts = certificates.filter((req) => {
    const matchesSearch = 
      req.studentName.toLowerCase().includes(searchQuery.toLowerCase()) || 
      req.studentId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.program.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab = activeTab === "all" || req.status === activeTab;
    return matchesSearch && matchesTab;
  });

  const handleIssue = (id: string) => {
    updateCertificateStatus(id, "issued");
    toast.success("ออกวุฒิบัตรสำเร็จ", {
      description: "ระบบได้สร้างวุฒิบัตรและจัดส่งให้ผู้เข้าศึกษาผ่านระบบเรียบร้อยแล้ว",
    });
  };

  return (
    <div className="p-4 md:p-6 pb-24 max-w-[1280px] mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">ออกหนังสือรับรองและวุฒิบัตร</h1>
        <p className="text-sm text-slate-500 mt-1">อนุมัติและออกวุฒิบัตรวิชาชีพเภสัชกรรมให้กับผู้ที่สอบผ่านเกณฑ์ (สภาเภสัชกรรม)</p>
      </div>

      <Card className="card-shadow">
        <CardHeader className="pb-4 border-b">
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <div className="flex bg-slate-100/80 p-1 rounded-lg w-fit">
              {[
                { id: "all", label: "ทั้งหมด" },
                { id: "pending_approval", label: "รอการอนุมัติ" },
                { id: "issued", label: "ออกวุฒิบัตรแล้ว" },
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
                  <TableHead>ข้อมูลเภสัชกร</TableHead>
                  <TableHead>หลักสูตรวุฒิบัตร</TableHead>
                  <TableHead>วันที่ส่งผลสอบ</TableHead>
                  <TableHead>สถานะ</TableHead>
                  <TableHead className="text-right">จัดการ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCerts.length > 0 ? (
                  filteredCerts.map((req) => {
                    const statusInfo = statusMap[req.status];
                    return (
                      <TableRow key={req.id} className="group">
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium text-slate-900">{req.studentName}</span>
                            <span className="text-xs text-slate-500">{req.studentId}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-slate-900 font-medium">{req.program}</TableCell>
                        <TableCell className="text-slate-500">{req.issuedAt}</TableCell>
                        <TableCell>
                          <Badge variant={statusInfo.variant} className="font-medium">
                            {statusInfo.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          {req.status === "pending_approval" ? (
                            <Button size="sm" variant="default" className="h-8 bg-primary hover:bg-primary/90" onClick={() => handleIssue(req.id)}>
                              อนุมัติและออกวุฒิบัตร
                            </Button>
                          ) : (
                            <Button size="sm" variant="outline" className="h-8 gap-1">
                              <span className="material-symbols-outlined text-sm">download</span>
                              ดาวน์โหลดวุฒิบัตร
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="h-32 text-center text-slate-500">
                      ไม่พบข้อมูลผู้ขอวุฒิบัตร
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
