"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { usePresidentAccess } from "@/roles/president/president-access";
import { OrganizationLogo } from "@/roles/shared/components/brand/OrganizationLogo";
import { clearPortalSession } from "@/roles/shared/features/roles/mock-login";

const navItems = [
  { href: "/president/dashboard", icon: "dashboard", label: "ภาพรวม" },
  { href: "/president/signatures", icon: "draw", label: "คำร้องรอลงนาม" },
  { href: "/president/history", icon: "history", label: "ประวัติการพิจารณา" },
  { href: "/president/profile", icon: "badge", label: "ข้อมูลวาระและโปรไฟล์" },
] as const;

function SidebarContent() {
  const pathname = usePathname();
  const router = useRouter();
  const { assignment } = usePresidentAccess();
  const isActive = (href: string) => href === "/president/dashboard"
    ? pathname === href
    : pathname.startsWith(href);

  return (
    <div className="flex h-full flex-col">
      <Link href="/president/dashboard" className="block px-5 pb-4 pt-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-logo-surface p-1"><OrganizationLogo className="h-full w-full object-contain" /></div>
          <div className="min-w-0"><p className="text-sm font-semibold leading-tight text-sidebar-foreground">President Portal</p><p className="mt-0.5 truncate text-xs text-sidebar-foreground/70">{assignment?.collegeCode}</p></div>
        </div>
      </Link>
      <div className="mx-4 h-px bg-sidebar-border" />
      <nav className="custom-scrollbar flex-1 space-y-0.5 overflow-y-auto px-3 py-3">
        {navItems.map((item) => {
          const active = isActive(item.href);
          return (
            <Link key={item.href} href={item.href} className={cn("group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors", active ? "bg-sidebar-primary/10 text-sidebar-primary" : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground")}>
              <span className={cn("material-symbols-outlined text-xl", active && "fill")}>{item.icon}</span>
              <span className="truncate">{item.label}</span>
              {active && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-sidebar-primary" />}
            </Link>
          );
        })}
      </nav>
      <div className="mx-4 h-px bg-sidebar-border" />
      <div className="p-4">
        <div className="flex items-center gap-3 rounded-lg p-2 hover:bg-sidebar-accent">
          <Avatar className="h-8 w-8"><span className="material-symbols-outlined text-sm text-sidebar-foreground">account_balance</span></Avatar>
          <div className="min-w-0 flex-1"><p className="truncate text-sm font-medium text-sidebar-foreground">{assignment?.userName}</p><p className="truncate text-xs text-sidebar-foreground/70">ประธานวิทยาลัย</p></div>
          <button type="button" onClick={() => { clearPortalSession(); router.push("/"); }} className="flex h-7 w-7 items-center justify-center rounded-md text-sidebar-foreground/70 hover:bg-sidebar-foreground/10 hover:text-sidebar-foreground" title="ออกจากระบบ" aria-label="ออกจากระบบ"><span className="material-symbols-outlined text-lg">logout</span></button>
        </div>
      </div>
    </div>
  );
}

export default function PresidentSidebar() {
  return (
    <>
      <aside className="glass-panel-primary fixed bottom-4 left-4 top-4 z-40 hidden w-60 flex-col overflow-hidden rounded-2xl md:flex"><SidebarContent /></aside>
      <div className="fixed left-3 top-3 z-50 md:hidden">
        <Sheet><SheetTrigger asChild><Button variant="outline" size="icon" className="h-9 w-9 rounded-lg shadow-sm" aria-label="เปิดเมนู"><span className="material-symbols-outlined text-xl">menu</span></Button></SheetTrigger><SheetContent side="left" className="w-64 p-0 [&>button]:hidden"><SidebarContent /></SheetContent></Sheet>
      </div>
    </>
  );
}
