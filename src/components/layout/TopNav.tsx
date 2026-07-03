"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { notificationsData } from "@/data";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

const breadcrumbMap: Record<string, { trail: { label: string; href: string }[]; current: string }> = {
  "/dashboard": { trail: [{ label: "หน้าหลัก", href: "/dashboard" }], current: "ภาพรวม" },
  "/students": { trail: [{ label: "หน้าหลัก", href: "/dashboard" }], current: "ข้อมูลของฉัน" },
  "/schedule": { trail: [{ label: "หน้าหลัก", href: "/dashboard" }], current: "ตารางเรียน" },
  "/registration": { trail: [{ label: "หน้าหลัก", href: "/dashboard" }], current: "การลงทะเบียนเรียน" },
  "/finance": { trail: [{ label: "หน้าหลัก", href: "/dashboard" }], current: "การเงิน" },
  "/finance/channels": { trail: [{ label: "หน้าหลัก", href: "/dashboard" }, { label: "การเงิน", href: "/finance" }], current: "ช่องทางการชำระเงิน" },
  "/requests": { trail: [{ label: "หน้าหลัก", href: "/dashboard" }], current: "คำร้องของฉัน" },
  "/admission": { trail: [{ label: "หน้าหลัก", href: "/dashboard" }], current: "สมัครเรียนออนไลน์" },
  "/news": { trail: [{ label: "หน้าหลัก", href: "/dashboard" }], current: "ข่าวสารและประกาศ" },
  "/programs": { trail: [{ label: "หน้าหลัก", href: "/dashboard" }], current: "หลักสูตรและรายวิชา" },
  "/programs/by-college": { trail: [{ label: "หน้าหลัก", href: "/dashboard" }, { label: "หลักสูตร", href: "/programs" }], current: "แยกตามวิทยาลัย" },
  "/programs/all": { trail: [{ label: "หน้าหลัก", href: "/dashboard" }, { label: "หลักสูตร", href: "/programs" }], current: "รายวิชาทั้งหมด" },
};

export default function TopNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [searchText, setSearchText] = useState("");
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  let bc = breadcrumbMap[pathname];
  if (!bc) {
    const keys = Object.keys(breadcrumbMap).sort((a, b) => b.length - a.length);
    for (const key of keys) {
      if (pathname.startsWith(key)) { bc = breadcrumbMap[key]; break; }
    }
  }
  if (!bc) bc = { trail: [{ label: "หน้าหลัก", href: "/dashboard" }], current: "" };

  const handleSearch = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && searchText.trim()) {
      toast.info(`ค้นหา: "${searchText}"`, { description: "ฟีเจอร์ค้นหาทั้งระบบอยู่ระหว่างการพัฒนา" });
      setSearchText("");
    }
  };

  return (
    <header className="fixed top-4 right-2 left-2 z-50 flex h-14 items-center justify-between rounded-2xl glass-panel px-4 md:left-[280px] md:right-4 border-none shadow-sm">
      {/* Breadcrumbs */}
      <Breadcrumb>
        <BreadcrumbList className="text-sm">
          {bc.trail.map((item, i) => (
            <span key={i} className="flex items-center gap-1.5">
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href={item.href} className="text-muted-foreground hover:text-foreground transition-colors">
                    {item.label}
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator>
                <span className="material-symbols-outlined text-[14px] text-muted-foreground/50">chevron_right</span>
              </BreadcrumbSeparator>
            </span>
          ))}
          <BreadcrumbItem>
            <BreadcrumbPage className="font-semibold text-primary text-sm">{bc.current}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Right actions */}
      <div className="flex items-center gap-1">
        {/* Search */}
        <div className="hidden sm:flex items-center gap-2 rounded-md border border-border bg-muted/40 px-2.5 h-7 mr-1">
          <span className="material-symbols-outlined text-[16px] text-muted-foreground">search</span>
          <input
            type="text"
            placeholder="ค้นหา..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            onKeyDown={handleSearch}
            className="w-32 lg:w-44 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
          />
        </div>

        {/* Notification */}
        <DropdownMenu open={isNotifOpen} onOpenChange={setIsNotifOpen}>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="relative h-8 w-8 rounded-lg"
            >
              <span className="material-symbols-outlined text-[20px] text-muted-foreground">notifications</span>
              {notificationsData.some(n => !n.isRead) && (
                <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-destructive ring-1 ring-card" />
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80 rounded-xl">
            <div className="flex items-center justify-between px-4 py-3 border-b">
              <span className="font-semibold text-sm">การแจ้งเตือน</span>
              {notificationsData.filter(n => !n.isRead).length > 0 && (
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0">{notificationsData.filter(n => !n.isRead).length} ใหม่</Badge>
              )}
            </div>
            <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
              {notificationsData.map(notif => (
                <div 
                  key={notif.id}
                  className={`flex items-start gap-3 p-4 hover:bg-muted/50 cursor-pointer transition-colors ${!notif.isRead ? 'bg-primary/5' : ''}`}
                  onClick={() => {
                    setIsNotifOpen(false);
                    if (notif.title === 'การเงิน') router.push("/finance");
                    else if (notif.title === 'คำร้อง') router.push("/requests");
                    else router.push("/news");
                  }}
                >
                  <div className={`${notif.type === 'warning' ? 'bg-destructive/10' : notif.type === 'success' ? 'bg-green-500/10' : 'bg-primary/10'} p-2 rounded-full mt-0.5 flex-shrink-0`}>
                    <span className={`material-symbols-outlined ${notif.type === 'warning' ? 'text-destructive' : notif.type === 'success' ? 'text-green-600' : 'text-primary'} text-[16px]`}>
                      {notif.type === 'warning' ? 'warning' : notif.type === 'success' ? 'check_circle' : 'info'}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">{notif.title}</p>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{notif.message}</p>
                    <p className="text-[10px] text-muted-foreground mt-2">{notif.time}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-2 border-t text-center">
              <Button variant="ghost" size="sm" className="w-full text-xs text-primary h-8" onClick={() => { setIsNotifOpen(false); toast.success('อ่านทั้งหมดแล้ว'); }}>ทำเครื่องหมายว่าอ่านแล้ว</Button>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Help */}
        <Button
          variant="ghost"
          size="icon"
          className="hidden sm:inline-flex h-8 w-8 rounded-lg"
          onClick={() => toast.info("ศูนย์ช่วยเหลือ", { description: "ติดต่อ: info@cpat.ac.th | โทร: 0-2591-9992" })}
        >
          <span className="material-symbols-outlined text-[20px] text-muted-foreground">help</span>
        </Button>

        {/* Settings dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="hidden sm:inline-flex h-8 w-8 rounded-lg">
              <span className="material-symbols-outlined text-[20px] text-muted-foreground">settings</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44 text-sm">
            <DropdownMenuLabel>ตั้งค่า</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => toast.info("โปรไฟล์ผู้ใช้", { description: "Yoo Ji-min (yoojimin@student.rpc.ac.th)" })}>
              <span className="material-symbols-outlined text-[16px] mr-2">person</span> โปรไฟล์
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => toast.info("การตั้งค่า", { description: "เมนูตั้งค่าระบบกำลังพัฒนา" })}>
              <span className="material-symbols-outlined text-[16px] mr-2">tune</span> การตั้งค่า
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => toast.info("ช่วยเหลือ", { description: "ติดต่อศูนย์ช่วยเหลือ โทร 0-2591-9992" })}>
              <span className="material-symbols-outlined text-[16px] mr-2">help</span> ช่วยเหลือ
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive" onClick={() => router.push("/")}>
              <span className="material-symbols-outlined text-[16px] mr-2">logout</span> ออกจากระบบ
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Mobile sidebar toggle */}
        <Button variant="ghost" size="icon" className="md:hidden h-8 w-8 rounded-lg">
          <span className="material-symbols-outlined text-[20px] text-muted-foreground">menu</span>
        </Button>
      </div>
    </header>
  );
}
