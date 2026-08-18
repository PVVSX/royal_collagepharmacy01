"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { PortalAccessGate } from "@/roles/shared/components/auth/PortalAccessGate";
import { OrganizationLogo } from "@/roles/shared/components/brand/OrganizationLogo";
import PageTransition from "@/roles/shared/components/layout/PageTransition";
import { ROLE_PRESENTATION, type SystemRole } from "@/roles/shared/features/roles/access-model";
import {
  clearPortalSession,
} from "@/roles/shared/features/roles/mock-login";
import type { PortalArea } from "@/roles/shared/features/roles/access-control";
import { usePortalSession } from "@/roles/shared/features/roles/use-portal-session";

export interface WorkspaceNavItem {
  href: string;
  icon: string;
  label: string;
  badge?: string;
}

interface RoleWorkspaceShellProps {
  area: PortalArea;
  role: SystemRole;
  navItems: readonly WorkspaceNavItem[];
  exactOrganisationId?: string;
  resourceId?: string;
  children: React.ReactNode;
}

function WorkspaceNavigation({
  role,
  navItems,
}: Pick<RoleWorkspaceShellProps, "role" | "navItems">) {
  const pathname = usePathname();
  const router = useRouter();
  const { session } = usePortalSession();
  const presentation = ROLE_PRESENTATION[role];

  return (
    <div className="flex h-full flex-col">
      <Link href={presentation.home} className="block px-5 pb-4 pt-5">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-logo-surface p-1">
            <OrganizationLogo className="h-full w-full object-contain" />
          </span>
          <span className="min-w-0">
            <span className="block text-sm font-semibold leading-tight text-sidebar-foreground">
              {presentation.portal}
            </span>
            <span className="mt-0.5 block truncate text-xs text-sidebar-foreground/70">
              {session?.organisation.code ?? "—"}
            </span>
          </span>
        </div>
      </Link>

      <div className="mx-4 h-px bg-sidebar-border" />
      <nav aria-label={`เมนู ${presentation.label}`} className="custom-scrollbar flex-1 space-y-0.5 overflow-y-auto px-3 py-3">
        {navItems.map((item) => {
          const active = item.href === presentation.home
            ? pathname === item.href
            : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "group flex min-h-10 items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-sidebar-primary/10 text-sidebar-primary"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground",
              )}
            >
              <span aria-hidden="true" className={cn("material-symbols-outlined text-xl", active && "fill")}>{item.icon}</span>
              <span className="truncate">{item.label}</span>
              {item.badge ? (
                <span className="ml-auto rounded-full bg-sidebar-primary/10 px-2 py-0.5 text-xs tabular-nums text-sidebar-primary">
                  {item.badge}
                </span>
              ) : active ? <span aria-hidden="true" className="ml-auto h-1.5 w-1.5 rounded-full bg-sidebar-primary" /> : null}
            </Link>
          );
        })}
      </nav>

      <div className="mx-4 h-px bg-sidebar-border" />
      <div className="p-4">
        <div className="flex items-center gap-3 rounded-lg p-2">
          <Avatar className="h-8 w-8">
            <span aria-hidden="true" className="material-symbols-outlined text-sm text-sidebar-foreground">account_circle</span>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-sidebar-foreground">{session?.displayName ?? "กำลังโหลด"}</p>
            <p className="truncate text-xs text-sidebar-foreground/70">{presentation.label}</p>
            <p className="truncate text-xs text-sidebar-foreground/60">{session?.organisation.name ?? "—"}</p>
          </div>
          <button
            type="button"
            onClick={() => {
              clearPortalSession();
              router.push("/");
            }}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-sidebar-foreground/70 hover:bg-sidebar-foreground/10 hover:text-sidebar-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-primary"
            title="ออกจากระบบ"
            aria-label="ออกจากระบบ"
          >
            <span aria-hidden="true" className="material-symbols-outlined text-lg">logout</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export function RoleWorkspaceShell({
  area,
  role,
  navItems,
  exactOrganisationId,
  resourceId,
  children,
}: RoleWorkspaceShellProps) {
  const { session } = usePortalSession();
  return (
    <PortalAccessGate
      area={area}
      exactOrganisationId={exactOrganisationId}
      resourceId={resourceId}
    >
      <div className="flex min-h-screen bg-surface-container-low">
        <aside className="glass-panel-primary fixed bottom-4 left-4 top-4 z-40 hidden w-60 flex-col overflow-hidden rounded-2xl md:flex">
          <WorkspaceNavigation role={role} navItems={navItems} />
        </aside>
        <div className="fixed left-3 top-3 z-50 md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="h-9 w-9 rounded-lg shadow-sm" aria-label="เปิดเมนู">
                <span aria-hidden="true" className="material-symbols-outlined text-xl">menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 p-0 [&>button]:hidden">
              <WorkspaceNavigation role={role} navItems={navItems} />
            </SheetContent>
          </Sheet>
        </div>

        <div className="flex min-w-0 flex-1 flex-col md:pl-sidebar">
          <header className="glass-panel fixed left-14 right-2 top-4 z-40 flex min-h-14 items-center justify-between rounded-2xl px-4 shadow-sm md:left-sidebar md:right-4">
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-foreground">{ROLE_PRESENTATION[role].label}</p>
              <p className="truncate text-xs text-muted-foreground">{session?.organisation.name ?? "กำลังตรวจสอบขอบเขตข้อมูล"}</p>
            </div>
            <span className="hidden rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground sm:inline-flex">
              สิทธิ์ตาม Role + Organisation + Resource
            </span>
          </header>
          <main className="min-w-0 flex-1 px-4 pb-10 pt-20 md:pr-6">
            <PageTransition>{children}</PageTransition>
          </main>
        </div>
      </div>
    </PortalAccessGate>
  );
}
