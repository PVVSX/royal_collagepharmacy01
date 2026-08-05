"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useMockDb } from "@/providers/mock-db-provider";
import { toast } from "sonner";

export default function AdminSettingsPage() {
  const { settings, updateSettings } = useMockDb();

  const handleToggleAdmission = () => {
    updateSettings({ admissionOpen: !settings.admissionOpen });
    toast.success(`ระบบรับสมัครผู้เข้าศึกษาใหม่ ${!settings.admissionOpen ? 'เปิด' : 'ปิด'} ใช้งานแล้ว`);
  };

  const handleToggleRegistration = () => {
    updateSettings({ registrationOpen: !settings.registrationOpen });
    toast.success(`ระบบลงทะเบียนรายวิชา ${!settings.registrationOpen ? 'เปิด' : 'ปิด'} ใช้งานแล้ว`);
  };
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">ตั้งค่าระบบ</h1>
        <p className="text-muted-foreground mt-1">จัดการผู้ดูแลระบบและตั้งค่าการทำงานหลักของเว็บไซต์</p>
      </div>

      <div className="space-y-6 mt-6">
        {/* Admin Management */}
        <Card className="shadow-sm border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><span className="material-symbols-outlined text-primary">admin_panel_settings</span> จัดการผู้ดูแลระบบ</CardTitle>
            <CardDescription>เพิ่ม ลบ หรือแก้ไขสิทธิ์การเข้าถึงของแอดมินในระบบ</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex gap-4">
                <Input placeholder="กรอกอีเมลเพื่อเชิญแอดมินใหม่..." className="max-w-md" />
                <Button className="bg-brand hover:bg-brand-deep text-brand-foreground">ส่งคำเชิญ</Button>
              </div>

              <div className="mt-6 border rounded-lg overflow-hidden">
                <table className="w-full text-sm text-left">
                  <thead className="bg-surface-container-low text-content-muted border-b">
                    <tr>
                      <th className="px-4 py-3 font-medium">ชื่อผู้ใช้งาน</th>
                      <th className="px-4 py-3 font-medium">อีเมล</th>
                      <th className="px-4 py-3 font-medium">สิทธิ์ (Role)</th>
                      <th className="px-4 py-3 font-medium text-right">จัดการ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    <tr>
                      <td className="px-4 py-3 font-medium text-foreground">System Admin</td>
                      <td className="px-4 py-3 text-muted-foreground">admin@pharmacy.or.th</td>
                      <td className="px-4 py-3"><span className="px-2 py-1 bg-brand-soft text-brand-on-soft rounded-full text-xs font-medium">Super Admin</span></td>
                      <td className="px-4 py-3 text-right">
                        <Button variant="ghost" size="sm" className="text-muted-foreground" disabled>ไม่อนุญาตให้ลบ</Button>
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-medium text-foreground">ฝ่ายการเงิน สภาฯ</td>
                      <td className="px-4 py-3 text-muted-foreground">finance@pharmacy.or.th</td>
                      <td className="px-4 py-3"><span className="px-2 py-1 bg-info-soft text-info-on-soft rounded-full text-xs font-medium">Finance Admin</span></td>
                      <td className="px-4 py-3 text-right">
                        <Button variant="ghost" size="sm" className="text-danger hover:text-danger/90 hover:bg-danger-soft">ลบสิทธิ์</Button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* System Toggles */}
        <Card className="shadow-sm border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><span className="material-symbols-outlined text-primary">toggle_on</span> เปิด-ปิดระบบบริการ</CardTitle>
            <CardDescription>ควบคุมการใช้งานฟีเจอร์ต่างๆ ของผู้เข้าศึกษาตามช่วงเวลาที่กำหนด</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="font-semibold text-foreground">ระบบรับสมัครผู้เข้าศึกษาใหม่ (Admission)</h4>
                  <p className="text-sm text-content-muted">เปิดให้ผู้เข้าศึกษาส่งใบสมัครเข้าฝึกอบรม</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-sm font-medium ${settings.admissionOpen ? 'text-success' : 'text-content-muted'}`}>
                    {settings.admissionOpen ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}
                  </span>
                  <div 
                    onClick={handleToggleAdmission}
                    className={`w-12 h-6 rounded-full relative cursor-pointer shadow-inner transition-colors ${settings.admissionOpen ? 'bg-success' : 'bg-surface-container-low'}`}
                  >
                    <div className={`absolute top-1 w-4 h-4 bg-content-inverse rounded-full shadow transition-all ${settings.admissionOpen ? 'right-1' : 'left-1'}`}></div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg bg-surface-container">
                <div>
                  <h4 className="font-semibold text-foreground">ระบบลงทะเบียนรายวิชา (Registration)</h4>
                  <p className="text-sm text-content-muted">เปิดให้ผู้เข้าศึกษาลงทะเบียนเรียนในเทอมปัจจุบัน</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-sm font-medium ${settings.registrationOpen ? 'text-success' : 'text-content-muted'}`}>
                    {settings.registrationOpen ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}
                  </span>
                  <div 
                    onClick={handleToggleRegistration}
                    className={`w-12 h-6 rounded-full relative cursor-pointer shadow-inner transition-colors ${settings.registrationOpen ? 'bg-success' : 'bg-surface-container-low'}`}
                  >
                    <div className={`absolute top-1 w-4 h-4 bg-content-inverse rounded-full shadow transition-all ${settings.registrationOpen ? 'right-1' : 'left-1'}`}></div>
                  </div>
                </div>
              </div>
              
            </div>
            
            <div className="mt-6 flex justify-end">
              <Button className="bg-primary hover:bg-primary/90">บันทึกการตั้งค่า</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
