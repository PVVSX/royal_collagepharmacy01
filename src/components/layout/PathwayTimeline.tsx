"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { pathwayData, type PathwayStep } from "@/data";

// ── status config ──
const statusConfig = {
  completed: {
    dotClass: "bg-green-500 border-green-400",
    lineClass: "bg-green-500/40",
    textClass: "text-sidebar-foreground/80",
    badgeClass: "bg-green-500/15 text-green-400 border-green-500/30",
    badgeLabel: "สำเร็จ",
    glowClass: "",
  },
  current: {
    dotClass: "bg-blue-500 border-blue-400 shadow-[0_0_10px_rgba(59,130,246,0.5)]",
    lineClass: "bg-blue-500/40",
    textClass: "text-sidebar-foreground",
    badgeClass: "bg-blue-500/15 text-blue-400 border-blue-500/30",
    badgeLabel: "กำลังศึกษา",
    glowClass: "ring-2 ring-blue-500/20",
  },
  recommended: {
    dotClass: "bg-sidebar-foreground/20 border-sidebar-foreground/30",
    lineClass: "bg-sidebar-foreground/10 border-dashed",
    textClass: "text-sidebar-foreground/50",
    badgeClass: "bg-sidebar-foreground/10 text-sidebar-foreground/50 border-sidebar-foreground/20",
    badgeLabel: "แนะนำ",
    glowClass: "",
  },
};

// ── icon type → small label ──
const typeLabels: Record<string, string> = {
  education: "การศึกษา",
  certification: "วุฒิบัตร",
  experience: "ประสบการณ์",
  milestone: "เป้าหมาย",
};

// ── single node ──
function PathwayNode({ step, isLast }: { step: PathwayStep; isLast: boolean }) {
  const cfg = statusConfig[step.status];
  const [showReason, setShowReason] = useState(false);

  return (
    <div className="relative flex gap-3 group/node">
      {/* Timeline line + dot */}
      <div className="flex flex-col items-center shrink-0 w-5">
        {/* dot */}
        <div
          className={cn(
            "w-3.5 h-3.5 rounded-full border-2 shrink-0 mt-0.5 transition-all duration-300 flex items-center justify-center",
            cfg.dotClass
          )}
        >
          {step.status === "completed" && (
            <span className="material-symbols-outlined text-[8px] text-white font-bold">check</span>
          )}
          {step.status === "current" && (
            <span className="block w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
          )}
        </div>
        {/* line */}
        {!isLast && (
          <div
            className={cn(
              "w-0.5 flex-1 min-h-[16px] mt-1 rounded-full transition-all",
              step.status === "recommended"
                ? "border-l border-dashed border-sidebar-foreground/15"
                : cfg.lineClass
            )}
          />
        )}
      </div>

      {/* Content */}
      <div className={cn("pb-4 min-w-0 flex-1", isLast && "pb-0")}>
        {/* type label */}
        <span className={cn("text-[9px] uppercase tracking-wider font-semibold", cfg.textClass, "opacity-60")}>
          {typeLabels[step.type] || step.type}
        </span>

        {/* title */}
        <p className={cn("text-[11px] font-semibold leading-tight mt-0.5", cfg.textClass)}>
          {step.title}
        </p>

        {/* subtitle */}
        <p className={cn("text-[9px] leading-tight mt-0.5 opacity-70", cfg.textClass)}>
          {step.subtitle}
        </p>

        {/* period (completed/current) */}
        {step.period && (
          <span className={cn("text-[9px] opacity-50 mt-0.5 inline-block", cfg.textClass)}>
            {step.period}
          </span>
        )}

        {/* details */}
        {step.details && step.status === "completed" && (
          <span className={cn("text-[9px] opacity-50 ml-1", cfg.textClass)}>
            • {step.details}
          </span>
        )}

        {/* ── Current: progress bar + substeps ── */}
        {step.status === "current" && step.progress !== undefined && (
          <div className="mt-2 space-y-1.5">
            {/* progress bar */}
            <div className="flex items-center gap-2">
              <div className="flex-1 h-1.5 bg-sidebar-foreground/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full transition-all duration-700"
                  style={{ width: `${step.progress}%` }}
                />
              </div>
              <span className="text-[10px] font-bold text-blue-400 tabular-nums">
                {step.progress}%
              </span>
            </div>

            {/* credits */}
            {step.creditsEarned !== undefined && step.creditsTotal !== undefined && (
              <p className="text-[9px] text-sidebar-foreground/50">
                หน่วยกิต {step.creditsEarned}/{step.creditsTotal}
              </p>
            )}

            {/* substeps */}
            {step.substeps && step.substeps.length > 0 && (
              <div className="space-y-1 mt-1">
                {step.substeps.map((sub, i) => (
                  <div key={i} className="flex items-center gap-1.5">
                    <span
                      className={cn(
                        "material-symbols-outlined text-[10px]",
                        sub.status === "done"
                          ? "text-green-400"
                          : sub.status === "in_progress"
                          ? "text-blue-400"
                          : "text-sidebar-foreground/30"
                      )}
                    >
                      {sub.status === "done"
                        ? "check_circle"
                        : sub.status === "in_progress"
                        ? "pending"
                        : "radio_button_unchecked"}
                    </span>
                    <span className="text-[9px] text-sidebar-foreground/60 truncate leading-tight">
                      {sub.name}
                    </span>
                    <span className="text-[8px] text-sidebar-foreground/40 ml-auto tabular-nums shrink-0">
                      {sub.progress}%
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Recommended: reason tooltip ── */}
        {step.status === "recommended" && step.reason && (
          <div className="mt-1">
            <button
              onClick={() => setShowReason(!showReason)}
              className="flex items-center gap-0.5 text-[9px] text-sidebar-foreground/40 hover:text-sidebar-foreground/60 transition-colors"
            >
              <span className="material-symbols-outlined text-[11px]">
                {showReason ? "expand_less" : "info"}
              </span>
              {showReason ? "ซ่อน" : "ทำไมถึงแนะนำ?"}
            </button>
            {showReason && (
              <p className="text-[9px] text-sidebar-foreground/40 mt-1 pl-3 border-l border-sidebar-foreground/10 leading-relaxed">
                {step.reason}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ── main component ──
export default function PathwayTimeline() {
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({
    completed: true,  // default: collapsed
    recommended: false,
  });

  const completedSteps = pathwayData.filter((s) => s.status === "completed");
  const currentStep = pathwayData.find((s) => s.status === "current");
  const recommendedSteps = pathwayData.filter((s) => s.status === "recommended");

  const toggle = (key: string) =>
    setCollapsed((prev) => ({ ...prev, [key]: !prev[key] }));

  return (
    <div className="px-3 py-2">
      {/* Header */}
      <div className="flex items-center gap-1.5 px-1 mb-2">
        <span className="material-symbols-outlined text-[14px] text-sidebar-foreground/40">
          route
        </span>
        <span className="text-[10px] font-semibold uppercase tracking-widest text-sidebar-foreground/40 select-none">
          เส้นทางการศึกษา
        </span>
      </div>

      <div className="space-y-0">
        {/* ─── COMPLETED ─── */}
        {completedSteps.length > 0 && (
          <div>
            <button
              onClick={() => toggle("completed")}
              className="flex items-center gap-1 w-full text-left px-1 py-1 rounded hover:bg-sidebar-accent/50 transition-colors"
            >
              <span className="material-symbols-outlined text-[12px] text-green-400/70 transition-transform duration-200"
                style={{ transform: collapsed.completed ? "rotate(-90deg)" : "rotate(0deg)" }}
              >
                expand_more
              </span>
              <span className="text-[9px] font-semibold uppercase tracking-wider text-green-400/70">
                สำเร็จแล้ว
              </span>
              <span className="text-[9px] text-sidebar-foreground/30 ml-auto">
                {completedSteps.length}
              </span>
            </button>

            {!collapsed.completed && (
              <div className="pl-1 mt-1">
                {completedSteps.map((step, i) => (
                  <PathwayNode
                    key={step.id}
                    step={step}
                    isLast={i === completedSteps.length - 1 && !currentStep}
                  />
                ))}
              </div>
            )}

            {/* Collapsed summary: single line connector */}
            {collapsed.completed && (
              <div className="flex items-center gap-2 pl-3 py-1">
                <div className="flex -space-x-1">
                  {completedSteps.slice(0, 3).map((s) => (
                    <div
                      key={s.id}
                      className="w-4 h-4 rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center"
                    >
                      <span className="material-symbols-outlined text-[8px] text-green-400">{s.icon}</span>
                    </div>
                  ))}
                  {completedSteps.length > 3 && (
                    <div className="w-4 h-4 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center">
                      <span className="text-[7px] text-green-400/70">+{completedSteps.length - 3}</span>
                    </div>
                  )}
                </div>
                <span className="text-[9px] text-sidebar-foreground/40">
                  {completedSteps.length} ขั้นตอน
                </span>
              </div>
            )}
          </div>
        )}

        {/* connector */}
        {completedSteps.length > 0 && currentStep && (
          <div className="flex justify-center pl-[10px] -my-0.5">
            <div className="w-0.5 h-3 bg-gradient-to-b from-green-500/30 to-blue-500/30 rounded-full" />
          </div>
        )}

        {/* ─── CURRENT ─── */}
        {currentStep && (
          <div className="pl-1">
            <div className="flex items-center gap-1 px-1 py-1 mb-1">
              <span className="block w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
              <span className="text-[9px] font-semibold uppercase tracking-wider text-blue-400/80">
                กำลังศึกษา
              </span>
            </div>
            <PathwayNode step={currentStep} isLast={recommendedSteps.length === 0} />
          </div>
        )}

        {/* connector */}
        {recommendedSteps.length > 0 && (
          <div className="flex justify-center pl-[10px] -my-0.5">
            <div className="w-0.5 h-3 border-l border-dashed border-sidebar-foreground/15 rounded-full" />
          </div>
        )}

        {/* ─── RECOMMENDED ─── */}
        {recommendedSteps.length > 0 && (
          <div>
            <button
              onClick={() => toggle("recommended")}
              className="flex items-center gap-1 w-full text-left px-1 py-1 rounded hover:bg-sidebar-accent/50 transition-colors"
            >
              <span
                className="material-symbols-outlined text-[12px] text-sidebar-foreground/40 transition-transform duration-200"
                style={{ transform: collapsed.recommended ? "rotate(-90deg)" : "rotate(0deg)" }}
              >
                expand_more
              </span>
              <span className="text-[9px] font-semibold uppercase tracking-wider text-sidebar-foreground/40">
                แนะนำถัดไป
              </span>
              <span className="text-[9px] text-sidebar-foreground/30 ml-auto">
                {recommendedSteps.length}
              </span>
            </button>

            {!collapsed.recommended && (
              <div className="pl-1 mt-1">
                {recommendedSteps.map((step, i) => (
                  <PathwayNode
                    key={step.id}
                    step={step}
                    isLast={i === recommendedSteps.length - 1}
                  />
                ))}
              </div>
            )}

            {collapsed.recommended && (
              <div className="flex items-center gap-2 pl-3 py-1">
                <div className="flex -space-x-1">
                  {recommendedSteps.slice(0, 3).map((s) => (
                    <div
                      key={s.id}
                      className="w-4 h-4 rounded-full bg-sidebar-foreground/10 border border-sidebar-foreground/15 flex items-center justify-center"
                    >
                      <span className="material-symbols-outlined text-[8px] text-sidebar-foreground/40">{s.icon}</span>
                    </div>
                  ))}
                  {recommendedSteps.length > 3 && (
                    <div className="w-4 h-4 rounded-full bg-sidebar-foreground/5 border border-sidebar-foreground/10 flex items-center justify-center">
                      <span className="text-[7px] text-sidebar-foreground/30">+{recommendedSteps.length - 3}</span>
                    </div>
                  )}
                </div>
                <span className="text-[9px] text-sidebar-foreground/40">
                  {recommendedSteps.length} เป้าหมาย
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
