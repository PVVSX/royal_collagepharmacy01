"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PageShell } from "@/roles/shared/components/layout/PageShell";
import { useMemberNotifications } from "@/roles/member/features/notifications/member-notifications";

const dateFormatter = new Intl.DateTimeFormat("th-TH", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Bangkok" });

export default function MemberNotificationsPage() {
  const router = useRouter();
  const { notifications, markRead, markAllRead } = useMemberNotifications();
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const visible = filter === "unread" ? notifications.filter((item) => !item.isRead) : notifications;
  const unread = notifications.filter((item) => !item.isRead).length;

  return (
    <PageShell className="space-y-5">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div><h1 className="text-2xl font-bold">การแจ้งเตือน</h1><p className="mt-1 text-sm text-muted-foreground">ติดตามกำหนดการ สถานะ และรายการที่ต้องดำเนินการ</p></div>
        <Button variant="outline" size="sm" disabled={unread === 0} onClick={markAllRead}>ทำเครื่องหมายว่าอ่านทั้งหมด</Button>
      </header>
      <div className="flex gap-2">
        <Button size="sm" variant={filter === "all" ? "default" : "outline"} onClick={() => setFilter("all")}>ทั้งหมด</Button>
        <Button size="sm" variant={filter === "unread" ? "default" : "outline"} onClick={() => setFilter("unread")}>ยังไม่ได้อ่าน {unread > 0 ? `(${unread})` : ""}</Button>
      </div>
      <Card><CardContent className="divide-y p-0">
        {visible.map((item) => (
          <button key={item.id} className={`flex w-full items-start gap-4 p-4 text-left transition-colors hover:bg-muted/50 ${item.isRead ? "" : "bg-primary/[0.04]"}`} onClick={() => { markRead(item.id); router.push(item.destination); }}>
            <span className={`material-symbols-outlined mt-0.5 ${item.kind === "warning" ? "text-warning-on-soft" : item.kind === "success" ? "text-success-on-soft" : "text-primary"}`}>{item.kind === "warning" ? "warning" : item.kind === "success" ? "check_circle" : "info"}</span>
            <span className="min-w-0 flex-1"><span className="flex flex-wrap items-center gap-2"><span className="font-semibold">{item.title}</span>{!item.isRead && <Badge variant="secondary">ใหม่</Badge>}</span><span className="mt-1 block text-sm text-muted-foreground">{item.message}</span><time className="mt-2 block text-xs text-muted-foreground">{dateFormatter.format(new Date(item.createdAt))}</time></span>
            <span className="material-symbols-outlined text-muted-foreground">chevron_right</span>
          </button>
        ))}
        {visible.length === 0 && <div className="px-5 py-14 text-center"><span className="material-symbols-outlined text-4xl text-muted-foreground">notifications_none</span><p className="mt-2 font-medium">ไม่มีรายการในขณะนี้</p></div>}
      </CardContent></Card>
    </PageShell>
  );
}
