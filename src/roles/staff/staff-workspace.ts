import type { WorkspaceNavItem } from "@/roles/shared/components/workspace/RoleWorkspaceShell";

export const STAFF_NAV_ITEMS: readonly WorkspaceNavItem[] = [
  { href: "/staff/dashboard", icon: "dashboard", label: "ภาพรวมงาน" },
  { href: "/staff/courses", icon: "menu_book", label: "หลักสูตรและรายวิชา" },
  { href: "/staff/course-proposals", icon: "fact_check", label: "ตรวจคำขอรายวิชา" },
  { href: "/staff/exams", icon: "quiz", label: "งานสอบ" },
  { href: "/staff/requests", icon: "description", label: "คำร้อง" },
  { href: "/staff/research", icon: "science", label: "งานวิจัย" },
  { href: "/staff/certificates", icon: "workspace_premium", label: "ใบรับรองและเอกสาร" },
  { href: "/staff/news-help", icon: "campaign", label: "ข่าวสารและ Help Center" },
  { href: "/staff/registrations", icon: "fact_check", label: "ติดตามการลงทะเบียน" },
  { href: "/staff/finance", icon: "payments", label: "การเงินและกระทบยอด" },
  { href: "/staff/signatures", icon: "draw", label: "เตรียมเอกสารลงนาม" },
  { href: "/staff/audit", icon: "history", label: "ประวัติงานธุรกิจ" },
] as const;
