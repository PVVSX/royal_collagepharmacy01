"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Sheet, SheetClose, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { usePresidentAccess } from "@/roles/president/president-access";
import { OrganizationLogo } from "@/roles/shared/components/brand/OrganizationLogo";

const navItems = [
  { href: "/president/dashboard", icon: "dashboard", label: "ภาพรวม" },
  { href: "/president/signatures", icon: "draw", label: "เอกสารรอลงนาม" },
  { href: "/president/history", icon: "history", label: "ประวัติการพิจารณา" },
  { href: "/president/profile", icon: "badge", label: "ตำแหน่งและ Scope" },
] as const;

function SidebarContent({
  onNavigate,
  reserveCloseSpace = false,
}: {
  onNavigate?: () => void;
  reserveCloseSpace?: boolean;
}) {
  const pathname = usePathname();
  const { assignment } = usePresidentAccess();
  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <div className="flex h-full flex-col">
      <Link
        href="/president/dashboard"
        onClick={onNavigate}
        className={cn("block px-5 pb-4 pt-5", reserveCloseSpace && "pr-16")}
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-logo-surface p-1"><OrganizationLogo className="h-full w-full object-contain" /></div>
          <div className="min-w-0"><p className="text-sm font-semibold leading-tight text-sidebar-foreground">President Portal</p><p className="mt-0.5 truncate text-xs text-sidebar-foreground">{assignment?.organisationScope.code}</p></div>
        </div>
      </Link>
      <div className="mx-4 h-px bg-sidebar-border" />
      <nav aria-label="เมนูประธานและผู้ลงนาม" className="custom-scrollbar flex-1 space-y-0.5 overflow-y-auto px-3 py-3">
        {navItems.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              aria-current={active ? "page" : undefined}
              className={cn("group flex min-h-11 items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors", active ? "bg-sidebar-primary/10 text-sidebar-primary" : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground")}
            >
              <span aria-hidden="true" className={cn("material-symbols-outlined text-xl", active && "fill")}>{item.icon}</span>
              <span className="truncate">{item.label}</span>
              {active && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-sidebar-primary" />}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

export default function PresidentSidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <aside className="fixed bottom-4 left-4 top-4 z-40 hidden w-60 flex-col overflow-hidden rounded-2xl border border-sidebar-border bg-sidebar shadow-app-float md:flex"><SidebarContent /></aside>
      <div className="fixed left-2 top-5 z-50 md:hidden">
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild><Button variant="outline" size="icon" className="h-11 w-11 rounded-xl shadow-sm" aria-label="เปิดเมนู"><span aria-hidden="true" className="material-symbols-outlined text-xl">menu</span></Button></SheetTrigger>
          <SheetContent side="left" showCloseButton={false} className="w-72 border-sidebar-border bg-sidebar p-0 text-sidebar-foreground">
            <SheetTitle className="sr-only">เมนูประธานและผู้ลงนาม</SheetTitle>
            <SidebarContent onNavigate={() => setMobileOpen(false)} reserveCloseSpace />
            <SheetClose asChild>
              <Button type="button" variant="ghost" size="icon" className="absolute right-3 top-3 h-11 w-11 rounded-xl text-sidebar-foreground hover:bg-sidebar-foreground/10 hover:text-sidebar-foreground" aria-label="ปิดเมนู">
                <span aria-hidden="true" className="material-symbols-outlined text-xl">close</span>
              </Button>
            </SheetClose>
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}
