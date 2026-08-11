"use client";

import { usePathname } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { usePresidentAccess } from "@/roles/president/president-access";

const pageTitles: Record<string, string> = {
  "/president/dashboard": "ภาพรวมประธานวิทยาลัย",
  "/president/signatures": "คำร้องรอลงนาม",
  "/president/history": "ประวัติการพิจารณา",
  "/president/profile": "ข้อมูลวาระและโปรไฟล์",
};

export default function PresidentTopBar() {
  const pathname = usePathname();
  const { assignment } = usePresidentAccess();
  const title = pathname.startsWith("/president/signatures/")
    ? "ตรวจสอบและลงนามคำร้อง"
    : pageTitles[pathname] ?? "President Portal";

  return (
    <header className="glass-panel fixed left-2 right-2 top-4 z-30 flex h-14 items-center justify-between rounded-2xl border-none px-4 shadow-sm md:left-sidebar md:right-4">
      <div className="min-w-0 pl-11 md:pl-0"><p className="truncate text-sm font-semibold text-foreground">{title}</p><p className="truncate text-xs text-muted-foreground">{assignment?.collegeCode}</p></div>
      <Badge variant="success" className="hidden h-auto py-1 sm:inline-flex">วาระปัจจุบัน</Badge>
    </header>
  );
}
