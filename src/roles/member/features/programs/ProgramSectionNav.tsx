import Link from "next/link";

import { cn } from "@/lib/utils";

export type ProgramSection = "overview" | "all" | "by-college";

const programSections = [
  { id: "overview", href: "/member/programs", label: "ภาพรวมหลักสูตร" },
  { id: "all", href: "/member/programs/all", label: "รายวิชาทั้งหมด" },
  { id: "by-college", href: "/member/programs/by-college", label: "แยกตามวิทยาลัย" },
] as const satisfies readonly {
  id: ProgramSection;
  href: string;
  label: string;
}[];

export function ProgramSectionNav({ active }: { active: ProgramSection }) {
  return (
    <nav
      aria-label="เมนูหลักสูตรและรายวิชา"
      className="max-w-full rounded-2xl bg-muted p-1"
    >
      <div className="grid grid-cols-3 items-stretch gap-1 lg:flex lg:min-w-max lg:items-center">
        {programSections.map((section) => {
          const isActive = section.id === active;

          return (
            <Link
              key={section.id}
              href={section.href}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "inline-flex min-h-11 min-w-0 items-center justify-center rounded-xl px-2 text-center text-sm font-medium leading-tight transition-colors focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/30 lg:shrink-0 lg:whitespace-nowrap lg:px-4",
                isActive
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-background/70 hover:text-foreground",
              )}
            >
              {section.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
