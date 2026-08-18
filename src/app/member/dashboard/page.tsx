"use client";

import Link from "next/link";
import Footer from "@/roles/shared/components/layout/Footer";
import { dashboardData, cpdData } from "@/roles/shared/data";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { PageShell } from "@/roles/shared/components/layout/PageShell";

const iconClass = "material-symbols-outlined text-xl";
const chartTones = [
  { progress: "chart1", marker: "bg-chart-1" },
  { progress: "chart2", marker: "bg-chart-2" },
  { progress: "chart3", marker: "bg-chart-3" },
  { progress: "chart4", marker: "bg-chart-4" },
] as const;

export default function DashboardPage() {
  const d = dashboardData;

  return (
    <PageShell>
      <header className="mb-5 overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <div className="border-b-2 border-primary bg-gradient-to-r from-primary/[0.07] to-transparent px-5 py-4 md:px-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-2xs font-semibold uppercase tracking-wider text-primary">ระบบสารสนเทศสมาชิก · ราชวิทยาลัยเภสัชกรรมแห่งประเทศไทย</p>
              <h1 className="mt-0.5 text-lg font-bold tracking-tight md:text-xl">ยินดีต้อนรับ, {d.studentName}</h1>
              <p className="text-xs text-muted-foreground">รหัสสมาชิก: <span className="font-mono">{d.studentId}</span></p>
            </div>
            <Link
              href="/member/passport"
              className="inline-flex items-center gap-2 self-start rounded-lg border border-primary/30 bg-primary/5 px-3.5 py-2 text-sm font-semibold text-primary transition-colors hover:bg-primary/10 sm:self-auto"
            >
              <span className="material-symbols-outlined text-lg">badge</span>
              เปิดหนังสือเดินทางวิชาชีพ
            </Link>
          </div>
        </div>
      </header>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        {[
          { icon: "workspace_premium", label: "หน่วยกิต CPD", value: `${cpdData.currentCredits}/${cpdData.targetCredits}`, color: "text-primary", bg: "bg-primary/10", border: false, borderDestructive: false },
          { icon: "credit_score", label: "หน่วยกิตฝึกอบรม", value: `${d.creditsEarned}/${d.creditsTotal}`, color: "text-chart-3", bg: "bg-chart-3/10", border: true, borderDestructive: false },
          { icon: "how_to_reg", label: "สถานะการฝึกอบรม", value: d.trainingStatus, color: "text-secondary-foreground", bg: "bg-secondary/20", border: false, borderDestructive: false },
          // { icon: "warning", label: "ยอดค้างชำระ", value: `฿${d.balanceDue.toLocaleString()}`, color: "text-destructive", bg: "bg-destructive/10", border: false, borderDestructive: true },
        ].map((m) => (
          <Card key={m.label} className={`${m.border ? "border-l-4 border-l-chart-3" : ""} ${m.borderDestructive ? "border-l-4 border-l-destructive" : ""}`}>
            <CardContent className="p-4 flex items-center gap-3">
              <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${m.bg} flex-shrink-0`}>
                <span className={`${iconClass} ${m.color}`}>{m.icon}</span>
              </div>
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">{m.label}</p>
                <p className={`text-xl font-bold ${m.color}`}>{m.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Upcoming Event Banner */}
      <Card className="overflow-hidden mb-5 border-none relative h-[160px] md:h-[200px] hover:shadow-md transition-shadow cursor-pointer">
        <img src="/images/assets/meeting/meeting-banner.png" alt="Upcoming Event" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-scrim-strong via-scrim to-transparent flex flex-col justify-center p-5 md:p-8">
          <Badge variant="infoOverlay" className="mb-2 w-fit text-3xs">กิจกรรมกำลังจะมาถึง</Badge>
          <h2 className="text-lg md:text-xl font-bold text-content-on-image mb-1.5 drop-shadow-sm">งานประชุมวิชาการนานาชาติด้านเภสัชศาสตร์ 2569</h2>
          <p className="text-xs text-content-on-image/80 flex items-center gap-1.5 drop-shadow-sm">
            <span className="material-symbols-outlined text-sm">calendar_today</span>
            10 มิถุนายน 2569 | โรงแรมเซ็นทาราแกรนด์
          </p>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* CPD Progress */}
        <Card className="lg:col-span-2 hover:-translate-y-1 hover:shadow-md transition-all">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">ความคืบหน้าการสะสม CPD</CardTitle>
            <CardDescription className="text-xs">สะสมได้ {cpdData.currentCredits} จาก {cpdData.targetCredits} CPD · หมดอายุ {cpdData.expiryDate}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mt-4 space-y-5">
              {/* Overall Progress Bar */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-medium text-muted-foreground">ความคืบหน้าโดยรวม</span>
                  <span className="text-sm font-bold text-primary">{Math.round((cpdData.currentCredits / cpdData.targetCredits) * 100)}%</span>
                </div>
                <Progress
                  value={(cpdData.currentCredits / cpdData.targetCredits) * 100}
                  tone="brand"
                  className="h-3"
                />
                <p className="text-3xs text-muted-foreground mt-1.5">เหลืออีก {cpdData.targetCredits - cpdData.currentCredits} CPD · เวลาคงเหลือ {cpdData.timeLeft}</p>
              </div>

              {/* Breakdown by category */}
              <div className="space-y-3">
                {cpdData.breakdown.map((item, index) => (
                  <div key={index}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-medium text-muted-foreground">{item.category}</span>
                      <span className="font-bold">{item.value} <span className="font-normal text-muted-foreground">CPD</span></span>
                    </div>
                    <Progress
                      value={(item.value / cpdData.currentCredits) * 100}
                      tone={chartTones[index % chartTones.length].progress}
                      className="h-2"
                    />
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Credits Donut */}
        <Card className="hover:-translate-y-1 hover:shadow-md transition-all">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">ความก้าวหน้าหน่วยกิต</CardTitle>
            <CardDescription className="text-xs">เก็บได้แล้ว {d.creditsEarned} จาก {d.creditsTotal} หน่วยกิต</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col pt-2 pb-6">
            <div className="flex items-center justify-between text-sm mb-4">
              <span className="font-medium text-foreground">ภาพรวม (สำเร็จแล้ว)</span>
              <span className="text-primary font-bold text-xl">{Math.round((d.creditsEarned/d.creditsTotal)*100)}%</span>
            </div>
            
            <div className="grid grid-cols-2 gap-3 mt-1">
              {d.creditsBreakdown.map((item, i) => (
                <div key={i} className="flex flex-col bg-muted/40 p-3.5 rounded-xl border border-border/50 hover:bg-muted/80 transition-colors">
                  <div className="flex items-center gap-1.5 mb-2 text-muted-foreground">
                    <div className={`h-2.5 w-2.5 rounded-full shadow-sm ${chartTones[i % chartTones.length].marker}`} />
                    <span className="text-2xs font-medium">{item.name}</span>
                  </div>
                  <div className="flex items-end justify-between">
                    <span className="text-2xl font-bold tracking-tight text-foreground">{item.value} <span className="text-xs text-muted-foreground font-normal tracking-normal">หน่วยกิต</span></span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4"> */}
        {/* Schedule */}
        {/* <Card className="hover:-translate-y-1 hover:shadow-md transition-all">
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm">ตารางเรียนวันนี้</CardTitle>
            <Link href="/member/schedule" className="text-xs text-primary hover:underline flex items-center gap-0.5">
              ดูทั้งหมด <span className="material-symbols-outlined text-sm">chevron_right</span>
            </Link>
          </CardHeader>
          <CardContent className="space-y-2">
            {d.schedule.map((item, i) => (
              <div
                key={i}
                className="flex items-start gap-3 rounded-lg border bg-card p-3 cursor-pointer hover:border-primary/50 transition-colors"
                onClick={() => toast.info(`วิชา: ${item.course}\nเวลา: ${item.time}\nห้อง: ${item.room}\nรหัสวิชา: ${item.code}`)}
              >
                <div className="bg-primary/10 p-2 rounded-md flex-shrink-0 mt-0.5">
                  <span className={`${iconSm} text-primary`}>schedule</span>
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-foreground/90 leading-tight mb-1">{item.course}</p>
                  <div className="flex items-center gap-2">
                    <p className="text-xs text-muted-foreground">{item.time}</p>
                    <Badge variant="secondary" className="text-2xs px-1.5 py-0 h-auto font-normal">{item.room}</Badge>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card> */}

        {/* Announcements */}
        {/* <Card className="hover:-translate-y-1 hover:shadow-md transition-all">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">ประกาศและข่าวสาร</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {d.announcements.map((a, i) => {
              const isImportant = a.category === "ประกาศสำคัญ";
              const isNews = a.category === "ข่าวสาร";
              return (
                <div
                  key={i}
                  className="flex items-start gap-3 rounded-lg border p-3 hover:bg-muted/50 transition-colors cursor-pointer"
                  onClick={() => toast.info(`เปิดอ่าน: ${a.title}\n\nวันที่: ${a.date}\nหมวดหมู่: ${a.category}`)}
                >
                  <div className={`p-2 rounded-md flex-shrink-0 mt-0.5 ${isImportant ? "bg-destructive/10" : isNews ? "bg-primary/10" : "bg-secondary"}`}>
                    <span className={`${iconSm} ${isImportant ? "text-destructive" : isNews ? "text-primary" : "text-muted-foreground"}`}>
                      {isImportant ? "campaign" : isNews ? "newspaper" : "event"}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold leading-tight mb-1 line-clamp-2">{a.title}</p>
                    <p className="text-xs text-muted-foreground">{a.date}</p>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card> */}
      {/* </div> */}
      <Footer />
    </PageShell>
  );
}
