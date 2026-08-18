import { Badge } from "@/components/ui/badge";

interface StaffPageHeaderProps {
  title: string;
  description: string;
  eyebrow?: string;
  actions?: React.ReactNode;
}

export function StaffPageHeader({ title, description, eyebrow, actions }: StaffPageHeaderProps) {
  return (
    <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <Badge variant="secondary">Royal College Staff</Badge>
          {eyebrow ? <span className="text-xs text-muted-foreground">{eyebrow}</span> : null}
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">{title}</h1>
        <p className="mt-1 max-w-3xl text-sm text-muted-foreground">{description}</p>
      </div>
      {actions ? <div className="flex shrink-0 flex-wrap gap-2">{actions}</div> : null}
    </header>
  );
}
