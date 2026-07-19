"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";


// กลุ่ม nav แบบมี section label
// - ข่าวสาร → TopNav Notification Bell
// - ศูนย์ช่วยเหลือ → TopNav Help Button
// - ตั้งค่าบัญชี → TopNav Avatar/Settings Dropdown
const navGroups: {
  groupLabel?: string;
  items: { href: string; icon: string; label: string }[];
}[] = [
  {
    groupLabel: "เมนูหลัก",
    items: [
      { href: "/dashboard", icon: "dashboard", label: "ภาพรวม" },
      { href: "/passport", icon: "badge", label: "หนังสือเดินทางวิชาชีพ" },
      { href: "/students", icon: "person", label: "ข้อมูลของฉัน" },
      { href: "/cpd", icon: "workspace_premium", label: "หน่วยกิต CPD" },
      { href: "/pathway", icon: "route", label: "เส้นทางการศึกษา" },
      { href: "/admission", icon: "quiz", label: "สมัครสอบ" },
      { href: "/research", icon: "science", label: "ฐานข้อมูลงานวิจัย" },
    ],
  },
  {
    groupLabel: "การเรียน",
    items: [
      { href: "/programs", icon: "menu_book", label: "หลักสูตรและรายวิชา" },
      { href: "/registration", icon: "how_to_reg", label: "การลงทะเบียน" },
      { href: "/schedule", icon: "calendar_today", label: "ตารางเรียน" },
    ],
  },
  {
    groupLabel: "บริการผู้เข้าศึกษา",
    items: [
      { href: "/finance", icon: "payments", label: "การเงิน" },
      { href: "/requests", icon: "description", label: "คำร้อง" },
    ],
  },
];

function SidebarNav({ pathname }: { pathname: string }) {
  const router = useRouter();
  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  };

  return (
    <div className="flex h-full flex-col bg-transparent">
      {/* Logo */}
      <Link href="/dashboard" className="block px-5 pt-5 pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white p-1 overflow-hidden flex-shrink-0">
            <img src="/logo_pharmacy.jpg" alt="รภวท" className="h-full w-full object-contain" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold leading-tight text-sidebar-foreground">
              ฐานข้อมูลเภสัชกร
            </p>
            <p className="text-xs opacity-90 text-sidebar-foreground/70 mt-0.5">
              Pharmacist Database
            </p>
          </div>
        </div>
      </Link>

      <div className="mx-4 h-px bg-sidebar-border" />

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-3 custom-scrollbar space-y-4">
        {navGroups.map((group, gi) => (
          <div key={gi}>
            {group.groupLabel && (
              <p className="mb-1 px-3 text-[10px] font-semibold uppercase tracking-widest text-sidebar-foreground/40 select-none">
                {group.groupLabel}
              </p>
            )}
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-medium transition-all duration-150",
                      active
                        ? "bg-sidebar-primary/10 text-sidebar-primary"
                        : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                    )}
                  >
                    <span
                      className={cn(
                        "material-symbols-outlined text-[20px] transition-all",
                        active
                          ? "fill text-sidebar-primary"
                          : "text-sidebar-foreground/70 group-hover:text-sidebar-foreground"
                      )}
                    >
                      {item.icon}
                    </span>
                    <span className="truncate">{item.label}</span>
                    {active && (
                      <span className="ml-auto h-1.5 w-1.5 rounded-full bg-sidebar-primary" />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
    </nav>

      <div className="mx-4 h-px bg-sidebar-border" />

      {/* User */}
      <div className="p-4">
        <div className="flex items-center gap-3 rounded-lg p-2 hover:bg-sidebar-accent transition-colors">
          <Avatar className="h-8 w-8">
            <img src="/somchai_profile.png" alt="สมชาย ใจดี" className="h-full w-full object-cover rounded-full" />
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate text-sidebar-foreground">ภก. สมชาย ใจดี</p>
            <p className="text-xs opacity-90 text-sidebar-foreground/70">Student (Tester)</p>
          </div>
          <button
            onClick={() => router.push("/")}
            className="flex h-7 w-7 items-center justify-center rounded-md text-sidebar-foreground/70 hover:bg-white/10 hover:text-white transition-colors"
            title="ออกจากระบบ"
          >
            <span className="material-symbols-outlined text-lg">logout</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <>
      {/* Desktop */}
      <aside className="fixed left-4 top-4 bottom-4 z-40 hidden w-60 flex-col overflow-hidden rounded-2xl glass-panel-primary md:flex">
        <SidebarNav pathname={pathname} />
      </aside>

      {/* Mobile trigger */}
      <div className="fixed left-3 top-3 z-50 md:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="h-9 w-9 rounded-lg shadow-sm">
              <span className="material-symbols-outlined text-xl">menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-56 p-0 [&>button]:hidden">
            <SidebarNav pathname={pathname} />
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}
