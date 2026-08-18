"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useMockDb } from "@/providers/mock-db-provider";
import { toast } from "sonner";
import { useAuditLog } from "@/roles/shared/features/audit";
import { usePortalSession } from "@/roles/shared/features/roles/use-portal-session";
import {
  commitAuditedSystemSettingChange,
  createSystemSettingAuditInput,
  type AuditedSystemSetting,
} from "@/roles/admin/features/governance/system-settings-audit";

export default function AdminSettingsPage() {
  const { settings, updateSettings } = useMockDb();
  const { session } = usePortalSession();
  const { appendEvent, isReady: isAuditReady } = useAuditLog();
  const [settingReason, setSettingReason] = useState("");
  const [settingError, setSettingError] = useState("");

  const handleToggle = (setting: AuditedSystemSetting, label: string) => {
    if (!session || session.role !== "super_admin") {
      setSettingError("ไม่พบสิทธิ์ผู้ดูแลระบบสูงสุดสำหรับการเปลี่ยน System Settings");
      return;
    }
    if (!settingReason.trim()) {
      setSettingError("กรุณาระบุเหตุผลก่อนเปลี่ยน System Settings");
      return;
    }
    const before = settings[setting];
    const after = !before;
    try {
      const result = commitAuditedSystemSettingChange({
        appendAudit: () => appendEvent(createSystemSettingAuditInput({
          session,
          setting,
          before,
          after,
          reason: settingReason,
        })),
        commit: () => updateSettings({ [setting]: after }),
      });
      if (result === "audit_failed") {
        setSettingError("บันทึก User Audit Log ไม่สำเร็จ จึงยังไม่เปลี่ยน System Settings");
        return;
      }
      setSettingError("");
      setSettingReason("");
      toast.success(`${label} ${after ? "เปิด" : "ปิด"}ใช้งานแล้ว`);
    } catch (error) {
      setSettingError(error instanceof Error ? error.message : "ไม่สามารถเปลี่ยน System Settings ได้");
    }
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
                      <td className="px-4 py-3 font-medium text-foreground">ภญ. ปาริชาติ สุขเกษม</td>
                      <td className="px-4 py-3 text-muted-foreground">parichat@pharmacy.or.th</td>
                      <td className="px-4 py-3"><span className="px-2 py-1 bg-info-soft text-info-on-soft rounded-full text-xs font-medium">Royal College Staff</span></td>
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
              <div className="space-y-2">
                <label htmlFor="system-setting-reason" className="text-sm font-medium text-foreground">
                  เหตุผลการเปลี่ยนแปลง <span className="text-danger">*</span>
                </label>
                <Textarea
                  id="system-setting-reason"
                  value={settingReason}
                  onChange={(event) => { setSettingReason(event.target.value); setSettingError(""); }}
                  placeholder="ระบุเหตุผลที่ตรวจสอบย้อนหลังได้ก่อนเปิดหรือปิดบริการ"
                  aria-invalid={Boolean(settingError && !settingReason.trim())}
                  aria-describedby={settingError ? "system-setting-error" : "system-setting-help"}
                />
                <p id="system-setting-help" className="text-xs text-muted-foreground">ระบบจะบันทึกผู้ดำเนินการ Scope สถานะเดิม–ใหม่ เหตุผล และเวลา ก่อนเปลี่ยนค่า</p>
                {settingError ? <p id="system-setting-error" role="alert" className="rounded-xl border border-danger-border bg-danger-soft p-3 text-sm text-danger-on-soft">{settingError}</p> : null}
              </div>
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="font-semibold text-foreground">ระบบรับสมัครผู้เข้าศึกษาใหม่ (Admission)</h4>
                  <p className="text-sm text-content-muted">เปิดให้ผู้เข้าศึกษาส่งใบสมัครเข้าฝึกอบรม</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-sm font-medium ${settings.admissionOpen ? 'text-success' : 'text-content-muted'}`}>
                    {settings.admissionOpen ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}
                  </span>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={settings.admissionOpen}
                    aria-label="เปิดหรือปิดระบบรับสมัครผู้เข้าศึกษาใหม่"
                    disabled={!isAuditReady}
                    onClick={() => handleToggle("admissionOpen", "ระบบรับสมัครผู้เข้าศึกษาใหม่")}
                    className={`w-12 h-6 rounded-full relative shadow-inner transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${settings.admissionOpen ? 'bg-success' : 'bg-surface-container-low'}`}
                  >
                    <div className={`absolute top-1 w-4 h-4 bg-content-inverse rounded-full shadow transition-all ${settings.admissionOpen ? 'right-1' : 'left-1'}`}></div>
                  </button>
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
                  <button
                    type="button"
                    role="switch"
                    aria-checked={settings.registrationOpen}
                    aria-label="เปิดหรือปิดระบบลงทะเบียนรายวิชา"
                    disabled={!isAuditReady}
                    onClick={() => handleToggle("registrationOpen", "ระบบลงทะเบียนรายวิชา")}
                    className={`w-12 h-6 rounded-full relative shadow-inner transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${settings.registrationOpen ? 'bg-success' : 'bg-surface-container-low'}`}
                  >
                    <div className={`absolute top-1 w-4 h-4 bg-content-inverse rounded-full shadow transition-all ${settings.registrationOpen ? 'right-1' : 'left-1'}`}></div>
                  </button>
                </div>
              </div>
              
            </div>
            
            <div className="mt-6 flex justify-end">
              <p className="text-xs text-muted-foreground">แต่ละรายการจะบันทึกทันทีหลัง User Audit Log สำเร็จ</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
