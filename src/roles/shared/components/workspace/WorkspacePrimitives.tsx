import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export function WorkspaceHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string;
  title: string;
  description: string;
  action?: { href: string; label: string; icon?: string };
}) {
  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        {eyebrow ? <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-primary">{eyebrow}</p> : null}
        <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">{title}</h1>
        <p className="mt-1 max-w-3xl text-sm text-muted-foreground">{description}</p>
      </div>
      {action ? <Button asChild className="shrink-0"><Link href={action.href}>{action.icon ? <span aria-hidden="true" className="material-symbols-outlined text-lg">{action.icon}</span> : null}{action.label}</Link></Button> : null}
    </header>
  );
}

export function MetricCard({
  label,
  value,
  note,
  icon,
  emphasis = "default",
}: {
  label: string;
  value: string | number;
  note: string;
  icon: string;
  emphasis?: "default" | "warning" | "success" | "danger";
}) {
  const tone = emphasis === "warning"
    ? "bg-warning-soft text-warning-on-soft"
    : emphasis === "success"
      ? "bg-success-soft text-success-on-soft"
      : emphasis === "danger"
        ? "bg-danger-soft text-danger"
        : "bg-primary/10 text-primary";
  return (
    <Card className="border-border">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{label}</p>
            <p className="mt-2 text-3xl font-bold tabular-nums text-foreground">{value}</p>
          </div>
          <span
            aria-hidden="true"
            className={`flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full ${tone}`}
          >
            <span className="material-symbols-outlined text-2xl leading-none">{icon}</span>
          </span>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">{note}</p>
      </CardContent>
    </Card>
  );
}

export function EmptyState({
  icon = "inbox",
  title,
  description,
}: {
  icon?: string;
  title: string;
  description: string;
}) {
  return (
    <div className="flex min-h-52 flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card p-8 text-center">
      <span aria-hidden="true" className="material-symbols-outlined text-4xl text-muted-foreground">{icon}</span>
      <h2 className="mt-3 font-semibold text-foreground">{title}</h2>
      <p className="mt-1 max-w-md text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

export function LoadingState({ label = "กำลังโหลดข้อมูล" }: { label?: string }) {
  return <div role="status" className="flex min-h-52 items-center justify-center gap-2 text-sm text-muted-foreground"><span aria-hidden="true" className="material-symbols-outlined animate-spin">progress_activity</span>{label}</div>;
}

export function ForbiddenState({
  title = "ไม่มีสิทธิ์เข้าถึงข้อมูลนี้",
  description,
}: {
  title?: string;
  description: string;
}) {
  return <div role="alert" className="flex min-h-64 flex-col items-center justify-center rounded-2xl border border-warning-border bg-warning-soft p-8 text-center"><span aria-hidden="true" className="material-symbols-outlined text-5xl text-warning">shield_lock</span><h2 className="mt-3 text-lg font-semibold text-warning-on-soft">{title}</h2><p className="mt-2 max-w-lg text-sm text-warning-on-soft">{description}</p></div>;
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return <div role="alert" className="rounded-2xl border border-danger-border bg-danger-soft p-6 text-center"><span aria-hidden="true" className="material-symbols-outlined text-3xl text-danger">error</span><h2 className="mt-2 font-semibold text-danger">ไม่สามารถแสดงข้อมูลได้</h2><p className="mt-1 text-sm text-danger">{message}</p>{onRetry ? <Button type="button" variant="outline" className="mt-4" onClick={onRetry}>ลองอีกครั้ง</Button> : null}</div>;
}

export function ScopeBadge({ children }: { children: React.ReactNode }) {
  return <Badge variant="outline" className="max-w-full truncate border-primary/30 bg-primary/5 text-primary">{children}</Badge>;
}
