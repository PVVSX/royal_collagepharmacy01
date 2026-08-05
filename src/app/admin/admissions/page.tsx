"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useMockDb } from "@/providers/mock-db-provider";

export default function AdminAdmissionsPage() {
  const { admissions, updateAdmissionStatus } = useMockDb();
  const [searchTerm, setSearchTerm] = useState("");

  const handleApprove = (id: string) => {
    toast.success(`อนุมัติคำร้อง ${id} เรียบร้อยแล้ว`);
    updateAdmissionStatus(id, "approved");
  };

  const handleReject = (id: string) => {
    toast.error(`ปฏิเสธคำร้อง ${id} แล้ว`);
    updateAdmissionStatus(id, "rejected");
  };

  const filteredAdmissions = admissions.filter(a => 
    a.name.includes(searchTerm) || a.id.includes(searchTerm) || a.program.includes(searchTerm)
  );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-content">อนุมัติการสมัครสอบ</h1>
          <p className="text-muted-foreground mt-1">ตรวจสอบและพิจารณาคำร้องขอเข้ารับการฝึกอบรม</p>
        </div>
      </div>

      <Card className="shadow-sm border-border">
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div className="relative w-full max-w-sm">
              <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-muted-foreground">
                <span className="material-symbols-outlined text-xl">search</span>
              </span>
              <Input 
                placeholder="ค้นหาชื่อ, รหัสคำร้อง หรือหลักสูตร..." 
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="gap-2 text-content">
                <span className="material-symbols-outlined text-lg">filter_list</span> ตัวกรอง
              </Button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-content-muted uppercase bg-surface-sunken border-y">
                <tr>
                  <th className="px-4 py-3 font-medium">รหัสคำร้อง</th>
                  <th className="px-4 py-3 font-medium">ชื่อผู้สมัคร</th>
                  <th className="px-4 py-3 font-medium">เลขที่ใบประกอบ</th>
                  <th className="px-4 py-3 font-medium">หลักสูตรที่สมัคร</th>
                  <th className="px-4 py-3 font-medium">วันที่ส่งคำร้อง</th>
                  <th className="px-4 py-3 font-medium">สถานะ</th>
                  <th className="px-4 py-3 font-medium text-right">การจัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredAdmissions.map((item) => (
                  <tr key={item.id} className="hover:bg-surface-sunken transition-colors">
                    <td className="px-4 py-3 font-medium text-content">{item.id}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                          {item.name.charAt(4)}
                        </div>
                        <span className="font-medium text-content">{item.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-content-muted">{item.license}</td>
                    <td className="px-4 py-3 text-content-muted">{item.program}</td>
                    <td className="px-4 py-3 text-content-muted">{item.date}</td>
                    <td className="px-4 py-3">
                      {item.status === 'pending' && <Badge variant="warning">รอตรวจสอบ</Badge>}
                      {item.status === 'approved' && <Badge variant="success">อนุมัติแล้ว</Badge>}
                      {item.status === 'rejected' && <Badge variant="danger">ปฏิเสธ</Badge>}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {item.status === 'pending' ? (
                        <div className="flex items-center justify-end gap-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="h-8 border-success-border text-success hover:bg-success-soft"
                            onClick={() => handleApprove(item.id)}
                          >
                            <span className="material-symbols-outlined text-base mr-1">check_circle</span> อนุมัติ
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="h-8 border-danger-border text-danger hover:bg-danger-soft"
                            onClick={() => handleReject(item.id)}
                          >
                            <span className="material-symbols-outlined text-base mr-1">cancel</span> ปฏิเสธ
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-content-muted hover:text-primary" onClick={() => window.open("/print/admission", "_blank")} title="ดูใบสมัคร">
                            <span className="material-symbols-outlined text-lg">visibility</span>
                          </Button>
                        </div>
                      ) : (
                        <Button variant="ghost" size="sm" className="h-8 text-content-muted hover:text-primary">
                          <span className="material-symbols-outlined text-lg mr-1">visibility</span> ดูรายละเอียด
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
                {filteredAdmissions.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-content-muted">
                      ไม่พบข้อมูลคำร้องที่ค้นหา
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-border">
            <span className="text-sm text-content-muted">แสดง {filteredAdmissions.length} จาก {admissions.length} รายการ</span>
            <div className="flex gap-1">
              <Button variant="outline" size="sm" disabled>ก่อนหน้า</Button>
              <Button variant="outline" size="sm" className="bg-primary/5 border-primary/20 text-primary">1</Button>
              <Button variant="outline" size="sm">2</Button>
              <Button variant="outline" size="sm">ถัดไป</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
