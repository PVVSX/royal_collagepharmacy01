import Link from "next/link";

import { Button } from "@/components/ui/button";
import { OrganizationLogo } from "@/roles/shared/components/brand/OrganizationLogo";
import { institutionInfo } from "@/roles/shared/data";

interface PublicInformationPageProps {
  eyebrow: string;
  title: string;
  description: string;
  children: React.ReactNode;
}

export function PublicInformationPage({
  eyebrow,
  title,
  description,
  children,
}: PublicInformationPageProps) {
  return (
    <div className="min-h-screen bg-surface-container-low text-foreground">
      <header className="border-b border-border/70 bg-background/95">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <Link
            href="/"
            aria-label="กลับไปหน้าเข้าสู่ระบบ"
            className="flex min-w-0 items-center gap-3 rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <OrganizationLogo decorative className="h-12 w-auto shrink-0 object-contain sm:h-14" />
            <span className="min-w-0">
              <span className="block truncate text-sm font-semibold sm:text-base">
                {institutionInfo.nameTh}
              </span>
              <span className="block truncate text-xs text-muted-foreground">
                ระบบบริการสมาชิกวิชาชีพ
              </span>
            </span>
          </Link>

          <Button asChild variant="outline" size="lg" className="shrink-0">
            <Link href="/">
              <span aria-hidden="true" className="material-symbols-outlined text-lg">
                arrow_back
              </span>
              <span className="hidden sm:inline">กลับหน้าเข้าสู่ระบบ</span>
              <span className="sm:hidden">กลับ</span>
            </Link>
          </Button>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-wider text-primary">{eyebrow}</p>
          <h1 className="mt-2 font-heading text-3xl font-bold tracking-tight sm:text-4xl">{title}</h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">
            {description}
          </p>
        </div>

        <div className="mt-8 max-w-3xl rounded-3xl border border-border bg-card p-5 shadow-app-card sm:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
