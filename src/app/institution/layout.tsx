import { RoleWorkspaceShell } from "@/roles/shared/components/workspace/RoleWorkspaceShell";

const institutionNavigation = [
  { href: "/institution/dashboard", icon: "dashboard", label: "ภาพรวมสถาบัน" },
  { href: "/institution/students", icon: "school", label: "ผู้เข้ารับการฝึกอบรม" },
  { href: "/institution/teachers", icon: "co_present", label: "อาจารย์" },
  { href: "/institution/assignments", icon: "assignment_ind", label: "มอบหมายการสอน" },
  { href: "/institution/courses", icon: "menu_book", label: "รายวิชาและรุ่นเรียน" },
  { href: "/institution/registrations", icon: "how_to_reg", label: "ติดตามการลงทะเบียน" },
  { href: "/institution/results", icon: "fact_check", label: "ติดตามผลผ่าน/ไม่ผ่าน" },
] as const;

export default function InstitutionLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleWorkspaceShell area="institution" role="institution_admin" navItems={institutionNavigation}>
      {children}
    </RoleWorkspaceShell>
  );
}
