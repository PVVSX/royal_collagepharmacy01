"use client";

import { Fragment, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { notificationsData } from "@/roles/shared/data";
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

const adminNotificationsData: typeof notificationsData = [
  {
    id: 1,
    title: "การสมัครสอบ",
    message: "มีใบสมัครสอบใหม่ 2 รายการรอการตรวจสอบ",
    time: "15 นาทีที่แล้ว",
    isRead: false,
    type: "warning",
  },
  {
    id: 2,
    title: "คำร้อง",
    message: "มีคำร้องใหม่ 5 รายการรอการพิจารณา",
    time: "1 ชั่วโมงที่แล้ว",
    isRead: false,
    type: "info",
  },
  {
    id: 3,
    title: "งานวิจัย",
    message: "มีผลงานวิจัย 1 รายการส่งเข้ามาเพื่อตรวจสอบ",
    time: "เมื่อวานนี้",
    isRead: true,
    type: "success",
  },
];

const breadcrumbMap: Record<string, { trail: { label: string; href: string }[]; current: string }> = {
  "/member/dashboard": { trail: [{ label: "หน้าหลัก", href: "/member/dashboard" }], current: "ภาพรวม" },
  "/member/students": { trail: [{ label: "หน้าหลัก", href: "/member/dashboard" }], current: "ข้อมูลของฉัน" },
  "/member/schedule": { trail: [{ label: "หน้าหลัก", href: "/member/dashboard" }], current: "ตารางเรียน" },
  "/member/registration": { trail: [{ label: "หน้าหลัก", href: "/member/dashboard" }], current: "การลงทะเบียนเรียน" },
  "/member/finance": { trail: [{ label: "หน้าหลัก", href: "/member/dashboard" }], current: "การเงิน" },
  "/member/finance/channels": { trail: [{ label: "หน้าหลัก", href: "/member/dashboard" }, { label: "การเงิน", href: "/member/finance" }], current: "ช่องทางการชำระเงิน" },
  "/member/requests": { trail: [{ label: "หน้าหลัก", href: "/member/dashboard" }], current: "คำร้องของฉัน" },
  "/member/research": { trail: [{ label: "หน้าหลัก", href: "/member/dashboard" }], current: "ฐานข้อมูลงานวิจัย" },
  "/member/admission": { trail: [{ label: "หน้าหลัก", href: "/member/dashboard" }], current: "สมัครสอบออนไลน์" },
  "/member/passport": { trail: [{ label: "หน้าหลัก", href: "/member/dashboard" }], current: "หนังสือเดินทางวิชาชีพ" },
  "/member/cpd": { trail: [{ label: "หน้าหลัก", href: "/member/dashboard" }], current: "หน่วยกิตการศึกษาต่อเนื่อง" },
  "/member/pathway": { trail: [{ label: "หน้าหลัก", href: "/member/dashboard" }], current: "เส้นทางการศึกษา" },
  "/member/news": { trail: [{ label: "หน้าหลัก", href: "/member/dashboard" }], current: "ข่าวสารและประกาศ" },
  "/member/help": { trail: [{ label: "หน้าหลัก", href: "/member/dashboard" }], current: "ศูนย์ช่วยเหลือ" },
  "/member/settings": { trail: [{ label: "หน้าหลัก", href: "/member/dashboard" }], current: "ตั้งค่าบัญชีและความปลอดภัย" },
  "/member/programs": { trail: [{ label: "หน้าหลัก", href: "/member/dashboard" }], current: "หลักสูตรและรายวิชา" },
  "/member/programs/by-college": { trail: [{ label: "หน้าหลัก", href: "/member/dashboard" }, { label: "หลักสูตร", href: "/member/programs" }], current: "แยกตามวิทยาลัย" },
  "/member/programs/all": { trail: [{ label: "หน้าหลัก", href: "/member/dashboard" }, { label: "หลักสูตร", href: "/member/programs" }], current: "รายวิชาทั้งหมด" },
  "/admin/dashboard": { trail: [{ label: "แอดมิน", href: "/admin/dashboard" }], current: "ภาพรวม" },
  "/admin/admissions": { trail: [{ label: "แอดมิน", href: "/admin/dashboard" }], current: "อนุมัติการสมัครสอบ" },
  "/admin/requests": { trail: [{ label: "แอดมิน", href: "/admin/dashboard" }], current: "ตรวจสอบคำร้อง" },
  "/admin/research": { trail: [{ label: "แอดมิน", href: "/admin/dashboard" }], current: "ตรวจสอบงานวิจัย" },
  "/admin/registrations": { trail: [{ label: "แอดมิน", href: "/admin/dashboard" }], current: "อนุมัติการลงทะเบียน" },
  "/admin/finance": { trail: [{ label: "แอดมิน", href: "/admin/dashboard" }], current: "ตรวจสอบการเงิน" },
  "/admin/courses": { trail: [{ label: "แอดมิน", href: "/admin/dashboard" }], current: "จัดการรายวิชา" },
  "/admin/courses/create": { trail: [{ label: "แอดมิน", href: "/admin/dashboard" }, { label: "จัดการรายวิชา", href: "/admin/courses" }], current: "ยื่นขอเปิดรายวิชาใหม่" },
  "/admin/programs": { trail: [{ label: "แอดมิน", href: "/admin/dashboard" }], current: "จัดการหลักสูตร" },
  "/admin/students": { trail: [{ label: "แอดมิน", href: "/admin/dashboard" }], current: "รายชื่อผู้เข้าศึกษา" },
  "/admin/exams": { trail: [{ label: "แอดมิน", href: "/admin/dashboard" }], current: "บันทึกผลสอบ" },
  "/admin/certificates": { trail: [{ label: "แอดมิน", href: "/admin/dashboard" }], current: "ออกวุฒิบัตร" },
  "/admin/settings": { trail: [{ label: "แอดมิน", href: "/admin/dashboard" }], current: "ตั้งค่าระบบ" },
};

export default function TopNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [searchText, setSearchText] = useState("");
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const isAdminRoute = pathname.startsWith("/admin");
  const activeNotifications = isAdminRoute ? adminNotificationsData : notificationsData;
  const unreadNotificationCount = activeNotifications.filter((notification) => !notification.isRead).length;
  const activeProfile = isAdminRoute
    ? {
        title: "โปรไฟล์ผู้ดูแลระบบ",
        description: "System Admin • Super Admin • admin@pharmacy.or.th",
      }
    : {
        title: "โปรไฟล์ผู้ใช้",
        description: "ภก. สมชาย ใจดี (somchai.j@student.rpc.ac.th)",
      };
  const adminStudentDetailMatch = pathname.match(/^\/admin\/students\/([^/]+)\/?$/);

  let bc = adminStudentDetailMatch
    ? {
        trail: [
          { label: "แอดมิน", href: "/admin/dashboard" },
          { label: "รายชื่อผู้เข้าศึกษา", href: "/admin/students" },
        ],
        current: decodeURIComponent(adminStudentDetailMatch[1]),
      }
    : breadcrumbMap[pathname];
  if (!bc) {
    const keys = Object.keys(breadcrumbMap).sort((a, b) => b.length - a.length);
    for (const key of keys) {
      if (pathname.startsWith(key)) { bc = breadcrumbMap[key]; break; }
    }
  }
  if (!bc) {
    bc = {
      trail: [{
        label: "หน้าหลัก",
        href: "/member/dashboard",
      }],
      current: "",
    };
  }

  const handleSearch = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && searchText.trim()) {
      toast.info(`ค้นหา: "${searchText}"`, { description: "ฟีเจอร์ค้นหาทั้งระบบอยู่ระหว่างการพัฒนา" });
      setSearchText("");
    }
  };

  const getNotificationDestination = (title: string) => {
    if (title === "การเงิน") {
      return isAdminRoute ? "/admin/finance" : "/member/finance";
    }
    if (title === "คำร้อง") {
      return isAdminRoute ? "/admin/requests" : "/member/requests";
    }
    if (title === "การสมัครสอบ") {
      return "/admin/admissions";
    }
    if (title === "งานวิจัย") {
      return "/admin/research";
    }

    return isAdminRoute ? "/admin/dashboard" : "/member/news";
  };

  return (
    <header className="fixed top-4 right-2 left-2 z-50 flex h-14 items-center justify-between rounded-2xl glass-panel px-4 md:left-sidebar md:right-4 border-none shadow-sm">
      {/* Breadcrumbs */}
      <Breadcrumb>
        <BreadcrumbList className="text-sm">
          {bc.trail.map((item, i) => (
            <Fragment key={`${item.href}-${i}`}>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href={item.href} className="text-muted-foreground hover:text-foreground transition-colors">
                    {item.label}
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator>
                <span className="material-symbols-outlined text-sm text-muted-foreground/50">chevron_right</span>
              </BreadcrumbSeparator>
            </Fragment>
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
          <span className="material-symbols-outlined text-base text-muted-foreground">search</span>
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
              aria-label={`การแจ้งเตือน${unreadNotificationCount > 0 ? ` (${unreadNotificationCount} รายการใหม่)` : ""}`}
            >
              <span aria-hidden="true" className="material-symbols-outlined text-xl text-muted-foreground">notifications</span>
              {unreadNotificationCount > 0 && (
                <span aria-hidden="true" className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-destructive ring-1 ring-card" />
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80 rounded-xl">
            <div className="flex items-center justify-between px-4 py-3 border-b">
              <span className="font-semibold text-sm">การแจ้งเตือน</span>
              {unreadNotificationCount > 0 && (
                <Badge variant="secondary" className="text-2xs px-1.5 py-0">{unreadNotificationCount} ใหม่</Badge>
              )}
            </div>
            <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
              {activeNotifications.map(notif => (
                <DropdownMenuItem
                  key={notif.id}
                  className={`flex cursor-pointer items-start gap-3 rounded-none p-4 transition-colors hover:bg-muted/50 focus:bg-muted/50 ${!notif.isRead ? 'bg-primary/5' : ''}`}
                  onSelect={() => {
                    setIsNotifOpen(false);
                    router.push(getNotificationDestination(notif.title));
                  }}
                >
                  <div className={`${notif.type === 'warning' ? 'bg-destructive/10' : notif.type === 'success' ? 'bg-success-soft' : 'bg-primary/10'} p-2 rounded-full mt-0.5 flex-shrink-0`}>
                    <span className={`material-symbols-outlined ${notif.type === 'warning' ? 'text-destructive' : notif.type === 'success' ? 'text-success-on-soft' : 'text-primary'} text-base`}>
                      {notif.type === 'warning' ? 'warning' : notif.type === 'success' ? 'check_circle' : 'info'}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">{notif.title}</p>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{notif.message}</p>
                    <p className="text-2xs text-muted-foreground mt-2">{notif.time}</p>
                  </div>
                </DropdownMenuItem>
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
          <span className="material-symbols-outlined text-xl text-muted-foreground">help</span>
        </Button>

        {/* Settings dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="hidden sm:inline-flex h-8 w-8 rounded-lg">
              <span className="material-symbols-outlined text-xl text-muted-foreground">settings</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44 text-sm">
            <DropdownMenuLabel>ตั้งค่า</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => toast.info(activeProfile.title, { description: activeProfile.description })}>
              <span className="material-symbols-outlined text-base mr-2">person</span> โปรไฟล์
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push(isAdminRoute ? "/admin/settings" : "/member/settings")}>
              <span className="material-symbols-outlined text-base mr-2">tune</span> การตั้งค่า
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => toast.info("ช่วยเหลือ", { description: "ติดต่อศูนย์ช่วยเหลือ โทร 0-2591-9992" })}>
              <span className="material-symbols-outlined text-base mr-2">help</span> ช่วยเหลือ
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive" onClick={() => router.push("/")}>
              <span className="material-symbols-outlined text-base mr-2">logout</span> ออกจากระบบ
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Mobile sidebar toggle */}
        <Button variant="ghost" size="icon" className="md:hidden h-8 w-8 rounded-lg">
          <span className="material-symbols-outlined text-xl text-muted-foreground">menu</span>
        </Button>
      </div>
    </header>
  );
}
