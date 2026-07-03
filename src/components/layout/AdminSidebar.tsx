"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";

const navItems = [
  { href: "/admin/dashboard", icon: "dashboard", label: "ภาพรวมแอดมิน" },
  { href: "/admin/admissions", icon: "how_to_reg", label: "อนุมัติการสมัครเรียน" },
  { href: "/admin/registrations", icon: "rule", label: "อนุมัติการลงทะเบียน" },
  { href: "/admin/finance", icon: "payments", label: "ตรวจสอบการเงิน" },
  { href: "/admin/courses", icon: "library_books", label: "จัดการรายวิชา" },
  { href: "/admin/programs", icon: "menu_book", label: "จัดการหลักสูตร" },
  { href: "/admin/students", icon: "group", label: "รายชื่อผู้เข้าศึกษา" },
  { href: "/admin/exams", icon: "assignment_turned_in", label: "บันทึกผลสอบ" },
  { href: "/admin/certificates", icon: "workspace_premium", label: "ออกวุฒิบัตร" },
  { href: "/admin/settings", icon: "settings", label: "ตั้งค่าระบบ" },
] as const;

function SidebarNav({ pathname }: { pathname: string }) {
  const router = useRouter();
  const isActive = (href: string) => {
    if (href === "/admin/dashboard") return pathname === "/admin/dashboard";
    return pathname.startsWith(href);
  };

  return (
    <div className="flex h-full flex-col bg-transparent">
      {/* Logo */}
      <Link href="/admin/dashboard" className="block px-5 pt-5 pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white p-1 overflow-hidden flex-shrink-0">
            <img src="/logo.png" alt="รภวท" className="h-full w-full object-contain" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold leading-tight text-sidebar-foreground">
              Admin Portal
            </p>
            <p className="text-xs opacity-90 text-sidebar-foreground/70 mt-0.5">
              Royal Pharmacy College
            </p>
          </div>
        </div>
      </Link>

      <div className="mx-4 h-px bg-sidebar-border" />

      {/* Navigation */}
      <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-3 custom-scrollbar">
        {navItems.map((item) => {
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
      </nav>

      <div className="mx-4 h-px bg-sidebar-border" />

      {/* User */}
      <div className="p-4">
        <div className="flex items-center gap-3 rounded-lg p-2 hover:bg-sidebar-accent transition-colors">
          <Avatar className="h-8 w-8">
            <span className="material-symbols-outlined text-sidebar-foreground text-sm">admin_panel_settings</span>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate text-sidebar-foreground">System Admin</p>
            <p className="text-xs opacity-90 text-sidebar-foreground/70">Administrator</p>
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

export default function AdminSidebar() {
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
