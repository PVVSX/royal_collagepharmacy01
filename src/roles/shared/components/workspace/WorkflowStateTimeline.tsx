import { cn } from "@/lib/utils";

export type WorkflowStepState = "completed" | "problem" | "action_required" | "waiting";

export interface WorkflowStateStep {
  id: string;
  label: string;
  description?: string;
  state: WorkflowStepState;
  current?: boolean;
}

const stateMeta: Record<WorkflowStepState, {
  icon: string;
  label: string;
  markerClassName: string;
  connectorClassName: string;
}> = {
  completed: {
    icon: "check",
    label: "ผ่านแล้ว",
    markerClassName: "border-success-border bg-success-soft text-success-on-soft",
    connectorClassName: "bg-success",
  },
  problem: {
    icon: "priority_high",
    label: "ติดปัญหา",
    markerClassName: "border-danger-border bg-danger-soft text-danger-on-soft",
    connectorClassName: "bg-danger-border",
  },
  action_required: {
    icon: "edit_document",
    label: "ต้องแก้ไขหรือส่งข้อมูลเพิ่ม",
    markerClassName: "border-warning-border bg-warning-soft text-warning-on-soft",
    connectorClassName: "bg-warning-border",
  },
  waiting: {
    icon: "schedule",
    label: "รอตรวจสอบ",
    markerClassName: "border-neutral-border bg-neutral-soft text-neutral-on-soft",
    connectorClassName: "bg-border",
  },
};

export function WorkflowStateTimeline({
  steps,
  label = "สถานะการดำเนินงาน",
  className,
}: {
  steps: readonly WorkflowStateStep[];
  label?: string;
  className?: string;
}) {
  if (steps.length === 0) return null;

  return (
    <div
      role="region"
      aria-label={`${label}แบบแนวนอน`}
      tabIndex={0}
      className={cn(
        "overflow-x-auto pb-2 outline-none focus-visible:rounded-lg focus-visible:ring-2 focus-visible:ring-ring",
        className,
      )}
    >
      <ol aria-label={label} className="flex min-w-max items-start md:min-w-0">
        {steps.map((step, index) => {
          const meta = stateMeta[step.state];
          const isLast = index === steps.length - 1;

          return (
            <li
              key={step.id}
              aria-current={step.current ? "step" : undefined}
              className={cn("flex items-start", isLast ? "min-w-32" : "min-w-40 flex-1")}
            >
              <div className="w-28 shrink-0 text-center sm:w-32 md:w-auto md:min-w-0 md:flex-1">
                <span
                  aria-hidden="true"
                  className={cn(
                    "mx-auto flex h-8 w-8 items-center justify-center rounded-full border",
                    "ring-4 ring-card",
                    meta.markerClassName,
                  )}
                >
                  <span className="material-symbols-outlined text-base">{meta.icon}</span>
                </span>
                <p className="mt-2 text-xs font-semibold text-foreground">{step.label}</p>
                <p className="mt-0.5 text-2xs font-medium text-muted-foreground">{meta.label}</p>
                {step.description ? (
                  <p className="mt-0.5 text-2xs text-muted-foreground">{step.description}</p>
                ) : null}
              </div>
              {!isLast ? (
                <span
                  aria-hidden="true"
                  className={cn("mt-4 h-0.5 min-w-8 flex-1", meta.connectorClassName)}
                />
              ) : null}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
