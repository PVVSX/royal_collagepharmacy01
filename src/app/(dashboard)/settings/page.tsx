"use client";

import { useState } from "react";
import Footer from "@/components/layout/Footer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import {
  getCurrentPassportSync,
  disclosureFieldLabels,
  type DisclosureField,
} from "@/lib/domain";

export default function SettingsPage() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

  const passport = getCurrentPassportSync();
  const [publicFields, setPublicFields] = useState<DisclosureField[]>(passport.disclosure.publicFields);

  const toggleDisclosureField = (field: DisclosureField) => {
    setPublicFields((prev) =>
      prev.includes(field) ? prev.filter((f) => f !== field) : [...prev, field]
    );
  };

  const handleSaveDisclosure = () => {
    toast.success("บันทึกการตั้งค่าการเปิดเผยข้อมูลเรียบร้อยแล้ว");
  };

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("กรุณากรอกข้อมูลให้ครบถ้วน");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("รหัสผ่านใหม่ไม่ตรงกัน");
      return;
    }
    toast.success("เปลี่ยนรหัสผ่านเรียบร้อยแล้ว");
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  return (
    <div className="flex flex-col min-h-full p-4 md:p-6 pb-16 max-w-[1280px] mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">ตั้งค่าบัญชีและความปลอดภัย</h1>
        <p className="text-sm text-muted-foreground mt-1">จัดการรหัสผ่าน การยืนยันตัวตน และการแจ้งเตือน</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 mb-8">
        
        {/* Change Password */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">lock</span>
                เปลี่ยนรหัสผ่าน (Change Password)
              </CardTitle>
              <CardDescription>อัปเดตรหัสผ่านของคุณเพื่อความปลอดภัยของบัญชี</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">รหัสผ่านปัจจุบัน</label>
                  <Input type="password" placeholder="••••••••" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">รหัสผ่านใหม่</label>
                  <Input type="password" placeholder="••••••••" value={newPassword} onChange={e => setNewPassword(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">ยืนยันรหัสผ่านใหม่</label>
                  <Input type="password" placeholder="••••••••" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
                </div>
                <Button type="submit" className="mt-2">บันทึกรหัสผ่าน</Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">shield_locked</span>
                ความปลอดภัย (Security)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">การยืนยันตัวตนแบบสองขั้นตอน (2FA)</p>
                  <p className="text-sm text-muted-foreground">เพิ่มความปลอดภัยด้วยการใช้รหัส OTP ผ่านมือถือ</p>
                </div>
                <Switch checked={twoFactorEnabled} onCheckedChange={setTwoFactorEnabled} />
              </div>
              <div className="border-t pt-4 flex items-center justify-between">
                <div>
                  <p className="font-medium">ประวัติการเข้าสู่ระบบ</p>
                  <p className="text-sm text-muted-foreground">ตรวจสอบอุปกรณ์ที่ใช้เข้าสู่ระบบล่าสุด</p>
                </div>
                <Button variant="outline" size="sm" onClick={() => toast.info("กำลังโหลดข้อมูลประวัติ...")}>ตรวจสอบ</Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Preferences */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">notifications_active</span>
                การแจ้งเตือน
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium">รับแจ้งเตือนผ่านเว็บ</div>
                <Switch checked={notificationsEnabled} onCheckedChange={setNotificationsEnabled} />
              </div>
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium">รับแจ้งเตือนผ่านอีเมล</div>
                <Switch checked={true} />
              </div>
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium">จดหมายข่าววิชาการ</div>
                <Switch checked={false} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">policy</span>
                ความเป็นส่วนตัว
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">คุณสามารถจัดการความยินยอมในการเก็บข้อมูลตามนโยบาย PDPA ได้ที่นี่</p>
              <Button variant="outline" className="w-full justify-start" onClick={() => toast.info("หน้านโยบายความเป็นส่วนตัว")}>
                <span className="material-symbols-outlined text-[18px] mr-2">description</span>
                จัดการข้อมูลส่วนบุคคล
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">qr_code_2</span>
                การเปิดเผยข้อมูลผ่าน QR สาธารณะ
              </CardTitle>
              <CardDescription>เลือกข้อมูลที่จะแสดงเมื่อมีคนสแกน QR ตรวจสอบตัวตนของคุณ</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {(Object.keys(disclosureFieldLabels) as DisclosureField[]).map((field) => (
                <div key={field} className="flex items-center justify-between">
                  <div className="text-sm font-medium">{disclosureFieldLabels[field]}</div>
                  <Switch
                    checked={publicFields.includes(field)}
                    onCheckedChange={() => toggleDisclosureField(field)}
                  />
                </div>
              ))}
              <Button size="sm" className="mt-2 w-full" onClick={handleSaveDisclosure}>
                บันทึกการเปิดเผยข้อมูล
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
}
