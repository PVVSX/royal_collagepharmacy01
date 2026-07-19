import type { ReactNode } from "react";

// ════════════════════════════════════════════════════════════════════════════
// PageHeader — หัวกระดาษราชการมาตรฐาน ใช้ร่วมกันทุกหน้า (design system เดียว)
// ────────────────────────────────────────────────────────────────────────────
// โครงเดียวกับหน้า Professional Passport / Dashboard: กรอบ rounded-lg + border
// + แถบเส้นบนสีหลัก + ไอคอนในกล่องเขียวอ่อน — โทนทางการ ไม่ฉูดฉาด
// ════════════════════════════════════════════════════════════════════════════

export function PageHeader({
  icon,
  title,
  eyebrow,
  subtitle,
  actions,
}: {
  icon: string;
  title: string;
  eyebrow?: string;
  subtitle?: string;
  actions?: ReactNode;
}) {
  return (
    <header className="mb-5 overflow-hidden rounded-lg border border-border bg-card shadow-sm">
      <div className="border-b-2 border-primary bg-gradient-to-r from-primary/[0.07] to-transparent px-5 py-4 md:px-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <span className="material-symbols-outlined text-[22px]">{icon}</span>
            </div>
            <div className="min-w-0">
              {eyebrow && (
                <p className="text-[11px] font-semibold uppercase tracking-wider text-primary">{eyebrow}</p>
              )}
              <h1 className="text-lg font-bold tracking-tight md:text-xl">{title}</h1>
              {subtitle && <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>}
            </div>
          </div>
          {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
        </div>
      </div>
    </header>
  );
}
