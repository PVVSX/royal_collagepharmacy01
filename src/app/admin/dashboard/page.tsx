"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const icon20 = "material-symbols-outlined text-xl";

export default function AdminDashboardPage() {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-admin-content">ภาพรวมระบบ (Admin Dashboard)</h1>
          <p className="text-muted-foreground mt-1">ยินดีต้อนรับกลับมา, ผู้ดูแลระบบ</p>
        </div>
        <div className="flex gap-3">
          <Button className="gap-2 bg-admin-action hover:bg-admin-action-hover text-content-inverse rounded-full">
            <span className={icon20}>download</span> รายงานสรุป (PDF)
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="shadow-sm border-admin-border">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <p className="text-sm font-medium text-admin-content-muted">ผู้เข้าศึกษาทั้งหมด</p>
                <p className="text-3xl font-bold text-admin-content">1,248</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-admin-metric-info-soft flex items-center justify-center text-admin-metric-info">
                <span className="material-symbols-outlined">group</span>
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-success font-medium flex items-center">
                <span className="material-symbols-outlined text-base">trending_up</span> +12%
              </span>
              <span className="text-admin-content-muted ml-2">จากเดือนที่แล้ว</span>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-admin-border">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <p className="text-sm font-medium text-admin-content-muted">คำร้องสมัครสอบรออนุมัติ</p>
                <p className="text-3xl font-bold text-admin-content">45</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-admin-metric-warning-soft flex items-center justify-center text-admin-metric-warning">
                <span className="material-symbols-outlined">pending_actions</span>
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-warning font-medium flex items-center">
                ต้องดำเนินการด่วน
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-admin-border">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <p className="text-sm font-medium text-admin-content-muted">ตรวจสอบการชำระเงิน</p>
                <p className="text-3xl font-bold text-admin-content">12</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-admin-metric-success-soft flex items-center justify-center text-admin-metric-success">
                <span className="material-symbols-outlined">payments</span>
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-admin-content-muted">รอตรวจสอบสลิปโอนเงิน</span>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-admin-border">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <p className="text-sm font-medium text-admin-content-muted">หลักสูตรที่เปิดรับ</p>
                <p className="text-3xl font-bold text-admin-content">8</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-admin-metric-accent-soft flex items-center justify-center text-admin-metric-accent">
                <span className="material-symbols-outlined">menu_book</span>
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-admin-content-muted">วิทยาลัยเภสัชกรรมบำบัด</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        {/* Recent Applications */}
        <Card className="lg:col-span-2 shadow-sm border-admin-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2 border-b">
            <CardTitle className="text-lg font-bold">คำร้องสมัครสอบล่าสุด</CardTitle>
            <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80">ดูทั้งหมด</Button>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y">
              {[
                { name: "ภก. สมชาย ใจดี", program: "เภสัชบำบัด", date: "24 มิ.ย. 2569", status: "pending" },
                { name: "ภญ. สมหญิง รักชาติ", program: "เภสัชกรรมชุมชน", date: "23 มิ.ย. 2569", status: "pending" },
                { name: "ภก. มานะ อดทน", program: "การคุ้มครองผู้บริโภค", date: "22 มิ.ย. 2569", status: "approved" },
                { name: "ภญ. กานดา ศรีสุข", program: "เภสัชอุตสาหการ", date: "21 มิ.ย. 2569", status: "approved" },
              ].map((item, i) => (
                <div key={i} className="p-4 flex items-center justify-between hover:bg-admin-surface-soft transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-admin-surface flex items-center justify-center text-admin-content-secondary font-bold">
                      {item.name.charAt(4)}
                    </div>
                    <div>
                      <p className="font-semibold text-admin-content">{item.name}</p>
                      <p className="text-sm text-muted-foreground">{item.program} • {item.date}</p>
                    </div>
                  </div>
                  <div>
                    {item.status === 'pending' ? (
                      <Badge variant="warning" className="text-warning">รอตรวจสอบ</Badge>
                    ) : (
                      <Badge variant="success" className="text-success">อนุมัติแล้ว</Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="shadow-sm border-admin-border">
          <CardHeader className="pb-2 border-b">
            <CardTitle className="text-lg font-bold">เมนูด่วน</CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-3">
            <Button variant="outline" className="w-full justify-start gap-3 h-12 text-admin-action-text hover:text-primary hover:bg-primary/5">
              <span className="material-symbols-outlined text-primary">add_circle</span> เพิ่มประกาศข่าวสารใหม่
            </Button>
            <Button variant="outline" className="w-full justify-start gap-3 h-12 text-admin-action-text hover:text-primary hover:bg-primary/5">
              <span className="material-symbols-outlined text-primary">manage_accounts</span> จัดการสิทธิ์แอดมิน
            </Button>
            <Button variant="outline" className="w-full justify-start gap-3 h-12 text-admin-action-text hover:text-primary hover:bg-primary/5">
              <span className="material-symbols-outlined text-primary">summarize</span> ออกรายงาน ก.พ.
            </Button>
            <Button variant="outline" className="w-full justify-start gap-3 h-12 text-admin-action-text hover:text-primary hover:bg-primary/5">
              <span className="material-symbols-outlined text-primary">mail</span> ส่งอีเมลแจ้งเตือนผู้เข้าศึกษา
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
