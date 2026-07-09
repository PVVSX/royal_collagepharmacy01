"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useMockDb } from "@/context/MockDbContext";

export default function AdminFinancePage() {
  const { payments, updatePaymentStatus } = useMockDb();
  const [searchTerm, setSearchTerm] = useState("");

  const handleApprove = (id: string) => {
    toast.success(`อนุมัติรายการชำระเงิน ${id} และสร้างใบเสร็จเรียบร้อยแล้ว`);
    updatePaymentStatus(id, "approved");
  };

  const handleReject = (id: string) => {
    toast.error(`ปฏิเสธรายการชำระเงิน ${id} แล้ว (แจ้งให้ผู้เข้าศึกษาอัปโหลดใหม่)`);
    updatePaymentStatus(id, "rejected");
  };

  const filteredPayments = payments.filter(p => 
    p.name.includes(searchTerm) || p.id.includes(searchTerm) || p.studentId.includes(searchTerm)
  );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">ตรวจสอบการเงิน</h1>
          <p className="text-muted-foreground mt-1">ตรวจสอบสลิปโอนเงิน อนุมัติการชำระเงิน และออกใบเสร็จรับเงิน</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="shadow-sm border-amber-200 bg-amber-50">
          <CardContent className="p-6">
            <p className="text-sm font-medium text-amber-700">รอตรวจสอบสลิป</p>
            <p className="text-3xl font-bold text-amber-900 mt-2">{payments.filter(p => p.status === 'pending').length}</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-green-200 bg-green-50">
          <CardContent className="p-6">
            <p className="text-sm font-medium text-green-700">อนุมัติแล้ว (สัปดาห์นี้)</p>
            <p className="text-3xl font-bold text-green-900 mt-2">12</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-slate-200">
          <CardContent className="p-6">
            <p className="text-sm font-medium text-slate-500">ยอดรวมที่ตรวจสอบแล้ว (เดือนนี้)</p>
            <p className="text-3xl font-bold text-slate-900 mt-2">฿345,000</p>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm border-slate-200">
        <CardContent className="p-6">
          <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
            <div className="relative w-full md:w-96">
              <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-muted-foreground">
                <span className="material-symbols-outlined text-[20px]">search</span>
              </span>
              <Input 
                placeholder="ค้นหารหัสอ้างอิง, ชื่อ หรือรหัสประจำตัว..." 
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="gap-2 text-slate-700">
                <span className="material-symbols-outlined text-[18px]">file_download</span> ออกรายงานบัญชี
              </Button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-y">
                <tr>
                  <th className="px-4 py-3 font-medium">รหัสอ้างอิง</th>
                  <th className="px-4 py-3 font-medium">ผู้เข้าศึกษา</th>
                  <th className="px-4 py-3 font-medium">ประเภทการชำระ</th>
                  <th className="px-4 py-3 font-medium text-right">จำนวนเงิน</th>
                  <th className="px-4 py-3 font-medium">วันที่แจ้งโอน</th>
                  <th className="px-4 py-3 font-medium">สถานะ</th>
                  <th className="px-4 py-3 font-medium text-right">ตรวจสอบ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPayments.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-mono text-slate-900">{item.id}</td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-900">{item.name}</div>
                      <div className="text-xs text-slate-500">{item.studentId}</div>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{item.type}</td>
                    <td className="px-4 py-3 font-semibold text-right text-slate-900">฿{item.amount.toLocaleString()}</td>
                    <td className="px-4 py-3 text-slate-600">{item.date}</td>
                    <td className="px-4 py-3">
                      {item.status === 'pending' && <Badge variant="outline" className="bg-amber-50 text-amber-600 border-amber-200">รอตรวจสอบสลิป</Badge>}
                      {item.status === 'approved' && <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">ออกใบเสร็จแล้ว</Badge>}
                      {item.status === 'rejected' && <Badge variant="outline" className="bg-red-50 text-red-600 border-red-200">สลิปไม่ถูกต้อง</Badge>}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {item.status === 'pending' ? (
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm" className="h-8 border-primary/20 text-primary hover:bg-primary/5">
                              <span className="material-symbols-outlined text-[16px] mr-1">receipt_long</span> ตรวจสลิป
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-[500px]">
                            <DialogHeader>
                              <DialogTitle>ตรวจสอบหลักฐานการโอนเงิน</DialogTitle>
                            </DialogHeader>
                            <div className="py-4 space-y-4">
                              <div className="bg-slate-100 rounded-lg h-64 flex items-center justify-center text-slate-400 font-medium">
                                [ ภาพจำลองสลิปโอนเงิน ]
                              </div>
                              <div className="grid grid-cols-2 gap-4 text-sm">
                                <div><span className="text-slate-500">ชื่อผู้โอน:</span> <span className="font-medium">{item.name}</span></div>
                                <div><span className="text-slate-500">ยอดที่ต้องชำระ:</span> <span className="font-bold text-primary">฿{item.amount.toLocaleString()}</span></div>
                                <div><span className="text-slate-500">วันเวลาที่โอน:</span> <span className="font-medium">{item.date} 14:30</span></div>
                                <div><span className="text-slate-500">ธนาคาร:</span> <span className="font-medium">ธ.กสิกรไทย</span></div>
                              </div>
                              <div className="flex gap-2 pt-4 border-t">
                                <Button className="flex-1 bg-green-600 hover:bg-green-700" onClick={() => handleApprove(item.id)}>
                                  <span className="material-symbols-outlined text-[18px] mr-1">check_circle</span> ยืนยันยอดเงินถูกต้อง
                                </Button>
                                <Button variant="outline" className="flex-1 text-red-600 hover:bg-red-50 hover:text-red-700 border-red-200" onClick={() => handleReject(item.id)}>
                                  <span className="material-symbols-outlined text-[18px] mr-1">cancel</span> ปฏิเสธ (สลิปไม่ชัด)
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      ) : (
                        <Button variant="ghost" size="sm" className="h-8 text-slate-500">
                          <span className="material-symbols-outlined text-[18px] mr-1">visibility</span> รายละเอียด
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
