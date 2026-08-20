import * as React from "react";

import { cn } from "@/lib/utils";

function SegmentedFilterGroup({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      role="group"
      className={cn(
        "flex max-w-full gap-2 overflow-x-auto overflow-y-hidden py-1",
        className,
      )}
      {...props}
    />
  );
}

function SegmentedFilterButton({
  active = false,
  className,
  type = "button",
  ...props
}: Omit<React.ComponentProps<"button">, "aria-pressed"> & {
  active?: boolean;
}) {
  return (
    <button
      type={type}
      aria-pressed={active}
      className={cn(
        "inline-flex min-h-11 shrink-0 items-center justify-center rounded-full border px-4 py-2 text-sm font-medium transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30 disabled:pointer-events-none disabled:opacity-50",
        active
          ? "border-brand-border bg-brand-soft text-brand-on-soft"
          : "border-border bg-surface-raised text-muted-foreground hover:bg-surface-container-low hover:text-foreground",
        className,
      )}
      {...props}
    />
  );
}

export { SegmentedFilterButton, SegmentedFilterGroup };
