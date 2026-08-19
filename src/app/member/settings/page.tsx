"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { PageShell } from "@/roles/shared/components/layout/PageShell";
import { useMemberPreferences } from "@/roles/member/features/settings/member-preferences";

export default function SettingsPage() {
  const { preferences, setPreferences } = useMemberPreferences();

  return (
    <PageShell className="space-y-6">
      <header><h1 className="text-2xl font-bold">การตั้งค่า</h1><p className="mt-1 text-sm text-muted-foreground">กำหนดภาษาและช่องทางรับข่าวสารสำหรับบัญชีนี้</p></header>
      <div className="grid gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2 text-lg"><span aria-hidden="true" className="material-symbols-outlined text-primary">language</span>ภาษาแสดงผล</CardTitle><CardDescription>การเลือกจะถูกจดจำในอุปกรณ์นี้</CardDescription></CardHeader>
          <CardContent>
            <fieldset className="grid gap-3 sm:grid-cols-2"><legend className="sr-only">เลือกภาษา</legend>
              {([{ value: "th", label: "ภาษาไทย" }, { value: "en", label: "English" }] as const).map((option) => (
                <label key={option.value} className="flex cursor-pointer items-center gap-3 rounded-xl border border-border p-4 has-[:checked]:border-primary has-[:checked]:bg-primary/5">
                  <input type="radio" name="locale" value={option.value} checked={preferences.locale === option.value} onChange={() => setPreferences({ locale: option.value })} className="h-4 w-4 accent-primary" />
                  <span className="font-medium">{option.label}</span>
                </label>
              ))}
            </fieldset>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2 text-lg"><span aria-hidden="true" className="material-symbols-outlined text-primary">notifications_active</span>ช่องทางการแจ้งเตือน</CardTitle><CardDescription>เลือกข่าวสารที่ต้องการรับจากระบบ</CardDescription></CardHeader>
          <CardContent className="divide-y">
            <PreferenceRow label="การแจ้งเตือนภายในเว็บไซต์" checked={preferences.webNotifications} onCheckedChange={(checked) => setPreferences({ webNotifications: checked })} />
            <PreferenceRow label="การแจ้งเตือนทางอีเมล" checked={preferences.emailNotifications} onCheckedChange={(checked) => setPreferences({ emailNotifications: checked })} />
            <PreferenceRow label="ข่าวสารและกิจกรรมวิชาการ" checked={preferences.academicNews} onCheckedChange={(checked) => setPreferences({ academicNews: checked })} />
          </CardContent>
        </Card>
      </div>
      <p className="rounded-xl border border-border bg-muted/30 p-4 text-sm text-muted-foreground">การเปลี่ยนรหัสผ่านและการกู้คืนบัญชีดำเนินการผ่านหน่วยงานที่ดูแลทะเบียนสมาชิก เพื่อยืนยันตัวตนก่อนแก้ไขข้อมูลสำคัญ</p>
    </PageShell>
  );
}

function PreferenceRow({ label, checked, onCheckedChange }: { label: string; checked: boolean; onCheckedChange: (checked: boolean) => void }) {
  return <div className="flex items-center justify-between gap-4 py-4 first:pt-0 last:pb-0"><span className="text-sm font-medium">{label}</span><Switch checked={checked} onCheckedChange={onCheckedChange} aria-label={label} /></div>;
}
