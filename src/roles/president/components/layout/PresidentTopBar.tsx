"use client";

import { usePathname } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { usePresidentAccess } from "@/roles/president/president-access";
import { WorkspaceAccountMenu } from "@/roles/shared/components/workspace/RoleWorkspaceShell";

const pageTitles: Record<string, string> = {
  "/president/dashboard": "ภาพรวมประธาน / ผู้ลงนาม",
  "/president/signatures": "เอกสารรอลงนาม",
  "/president/history": "ประวัติการพิจารณา",
  "/president/profile": "ตำแหน่งและ Organisation Scope",
};

export default function PresidentTopBar() {
  const pathname = usePathname();
  const { assignment } = usePresidentAccess();
  const title = pathname.startsWith("/president/signatures/")
    ? "ตรวจสอบและลงนามคำร้อง"
    : pageTitles[pathname] ?? "President Portal";

  return (
    <header className="fixed left-14 right-2 top-4 z-40 flex h-14 items-center justify-between rounded-2xl border border-border bg-card px-4 shadow-sm md:left-sidebar md:right-4">
      <div className="min-w-0"><h1 className="truncate text-sm font-semibold text-foreground">{title}</h1><p className="truncate text-xs text-muted-foreground">{assignment?.organisationScope.name}</p></div>
      <div className="flex shrink-0 items-center gap-2">
        <Badge variant="success" className="hidden h-auto py-1 sm:inline-flex">วาระปัจจุบัน</Badge>
        <WorkspaceAccountMenu
          displayName={assignment?.userName ?? "กำลังโหลดข้อมูลบัญชี"}
          roleLabel="ประธาน / ผู้ลงนาม"
          organisationName={assignment?.organisationScope.name ?? "กำลังโหลดข้อมูลองค์กร"}
        />
      </div>
    </header>
  );
}
