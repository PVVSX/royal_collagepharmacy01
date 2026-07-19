"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { pathwayData, type PathwayStep, profileData, cpdData } from "@/data";
import { Badge } from "@/components/ui/badge";
import Footer from "@/components/layout/Footer";
import { motion, AnimatePresence } from "framer-motion";

const icon18 = "material-symbols-outlined text-[18px]";

// ── Type config: icon + colors ──
const typeConfig: Record<string, { icon: string; nodeColor: string; label: string }> = {
  education: { icon: "school", nodeColor: "bg-[#6b6b2e]", label: "การศึกษา" },
  certification: { icon: "workspace_premium", nodeColor: "bg-[#5a5a28]", label: "วุฒิบัตร" },
  experience: { icon: "work", nodeColor: "bg-[#7a7a32]", label: "ประสบการณ์" },
  milestone: { icon: "flag", nodeColor: "bg-[#8a8a3c]", label: "เป้าหมาย" },
};

const statusBadge: Record<string, { className: string; label: string }> = {
  completed: { className: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800", label: "สำเร็จ" },
  current: { className: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-800", label: "กำลังศึกษา" },
  recommended: { className: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-800", label: "แนะนำ" },
};

// ── Zigzag Card ──
function ZigzagCard({ step, index }: { step: PathwayStep; index: number }) {
  const isRight = index % 2 === 0;
  const cfg = typeConfig[step.type] || typeConfig.education;
  const badge = statusBadge[step.status];
  const [expanded, setExpanded] = useState(step.status === "current");

  return (
    <div className="relative flex items-start">
      {/* ── Left side ── */}
      <div className="w-[calc(50%-28px)] md:w-[calc(50%-32px)]">
        {!isRight ? (
          <CardContent step={step} cfg={cfg} badge={badge} expanded={expanded} setExpanded={setExpanded} side="left" />
        ) : (
          <div />
        )}
      </div>

      {/* ── Center node ── */}
      <div className="flex flex-col items-center z-10 mx-2 md:mx-3 shrink-0">
        <div
          className={cn(
            "w-11 h-11 md:w-14 md:h-14 rounded-full flex items-center justify-center shadow-lg transition-all duration-300",
            step.status === "current"
              ? "bg-[#5a5a28] ring-4 ring-[#5a5a28]/20 scale-110"
              : step.status === "recommended"
              ? "bg-[#8a8a3c]/70"
              : cfg.nodeColor
          )}
        >
          <span className="material-symbols-outlined text-white text-lg md:text-xl">
            {cfg.icon}
          </span>
        </div>
      </div>

      {/* ── Right side ── */}
      <div className="w-[calc(50%-28px)] md:w-[calc(50%-32px)]">
        {isRight ? (
          <CardContent step={step} cfg={cfg} badge={badge} expanded={expanded} setExpanded={setExpanded} side="right" />
        ) : (
          <div />
        )}
      </div>
    </div>
  );
}

// ── Card Content ──
function CardContent({
  step,
  cfg,
  badge,
  expanded,
  setExpanded,
  side,
}: {
  step: PathwayStep;
  cfg: (typeof typeConfig)[string];
  badge: (typeof statusBadge)[string];
  expanded: boolean;
  setExpanded: (v: boolean) => void;
  side: "left" | "right";
}) {
  return (
    <div
      className={cn(
        "relative bg-card rounded-lg border shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer group",
        step.status === "current" && "border-blue-300/50 dark:border-blue-700/30 shadow-md shadow-blue-500/5",
        step.status === "recommended" && "border-dashed border-muted-foreground/20 opacity-80 hover:opacity-100",
      )}
      onClick={() => setExpanded(!expanded)}
    >
      {/* Arrow connector pointing toward center */}
      <div
        className={cn(
          "absolute top-4 w-3 h-3 bg-card border rotate-45",
          side === "left"
            ? "right-[-7px] border-l-0 border-b-0 border-r border-t"
            : "left-[-7px] border-r-0 border-t-0 border-l border-b",
          step.status === "current" && (side === "left" ? "border-r-blue-300/50 border-t-blue-300/50 dark:border-r-blue-700/30 dark:border-t-blue-700/30" : "border-l-blue-300/50 border-b-blue-300/50 dark:border-l-blue-700/30 dark:border-b-blue-700/30"),
        )}
      />

      <div className="p-4 md:p-5">
        {/* Top row: type badge + period/status */}
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <Badge variant="outline" className="text-[10px] md:text-[11px] font-semibold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
            {cfg.label}
          </Badge>
          {step.period ? (
            <span className="text-[10px] md:text-[11px] text-muted-foreground whitespace-nowrap">{step.period}</span>
          ) : (
            <Badge variant="outline" className={cn("text-[10px] px-2 py-0.5 rounded-full", badge.className)}>
              {badge.label}
            </Badge>
          )}
        </div>

        {/* Title */}
        <h3 className={cn(
          "text-sm md:text-[15px] font-bold leading-snug mb-1",
          step.status === "recommended" ? "text-muted-foreground" : "text-foreground"
        )}>
          {step.title}
        </h3>

        {/* Subtitle */}
        <p className="text-xs text-muted-foreground leading-relaxed">
          {step.subtitle}
        </p>

        {/* ── Bottom row: status info ── */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/50">
          {/* Left: status indicator */}
          {step.status === "completed" && (
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px] text-emerald-500">check_circle</span>
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">สำเร็จ</span>
            </div>
          )}
          {step.status === "current" && step.progress !== undefined && (
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px] text-blue-500">trending_up</span>
              <span className="text-xs font-bold text-blue-600 dark:text-blue-400">{step.progress}%</span>
            </div>
          )}
          {step.status === "recommended" && (
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px] text-amber-500">lightbulb</span>
              <span className="text-xs text-amber-600 dark:text-amber-400">แนะนำ</span>
            </div>
          )}

          {/* Right: details badge */}
          {step.details && step.status === "completed" && (
            <Badge variant="outline" className="text-[10px] gap-1 rounded-full px-2.5 py-0.5">
              <span className="material-symbols-outlined text-[12px] text-amber-500">star</span>
              {step.details}
            </Badge>
          )}
          {step.status === "current" && step.creditsEarned !== undefined && (
            <Badge variant="outline" className="text-[10px] gap-1 rounded-full px-2.5 py-0.5">
              <span className="material-symbols-outlined text-[12px] text-blue-500">school</span>
              {step.creditsEarned}/{step.creditsTotal} หน่วยกิต
            </Badge>
          )}
          {step.status === "recommended" && (
            <button className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground transition-colors">
              <span className="material-symbols-outlined text-[14px]">info</span>
              ดูเหตุผล
            </button>
          )}
        </div>

        {/* ── Expanded Content (Animated) ── */}
        <AnimatePresence initial={false}>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              <div className="pb-1">
                {/* Current substeps */}
                {step.status === "current" && step.substeps && (
                  <div className="mt-3 pt-3 border-t border-border/50 space-y-2">
                    {step.substeps.map((sub, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <span
                          className={cn(
                            "material-symbols-outlined text-[14px]",
                            sub.status === "done" ? "text-emerald-500"
                              : sub.status === "in_progress" ? "text-blue-500"
                              : "text-muted-foreground/30"
                          )}
                        >
                          {sub.status === "done" ? "check_circle" : sub.status === "in_progress" ? "pending" : "radio_button_unchecked"}
                        </span>
                        <span className="text-xs flex-1 text-foreground/80 truncate">{sub.name}</span>
                        <div className="w-10 h-1.5 bg-muted/50 rounded-full overflow-hidden">
                          <div
                            className={cn(
                              "h-full rounded-full",
                              sub.status === "done" ? "bg-emerald-500" : sub.status === "in_progress" ? "bg-blue-500" : "bg-muted-foreground/20"
                            )}
                            style={{ width: `${sub.progress}%` }}
                          />
                        </div>
                        <span className="text-[10px] text-muted-foreground tabular-nums w-6 text-right">{sub.progress}%</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Recommended reason & details */}
                {step.status === "recommended" && (step.reason || step.richDetails) && (
                  <div className="mt-3 space-y-2">
                    {step.reason && (
                      <div className="p-3 rounded-lg bg-amber-50/50 dark:bg-amber-950/10 border border-amber-200/30 dark:border-amber-800/20">
                        <div className="flex items-start gap-2">
                          <span className="material-symbols-outlined text-[14px] text-amber-500 mt-0.5 shrink-0">lightbulb</span>
                          <p className="text-xs text-amber-700 dark:text-amber-300 leading-relaxed">{step.reason}</p>
                        </div>
                      </div>
                    )}
                    
                    {step.richDetails && (
                      <div className="p-3 rounded-lg bg-blue-50/50 dark:bg-blue-950/10 border border-blue-200/30 dark:border-blue-800/20 relative overflow-hidden group/detail">
                        {/* Decoration */}
                        <div className="absolute -right-4 -top-4 w-16 h-16 bg-blue-500/5 rounded-full blur-xl group-hover/detail:bg-blue-500/10 transition-colors" />
                        
                        <div className="relative">
                          <div className="flex items-start gap-2 mb-1.5">
                            <span className="material-symbols-outlined text-[14px] text-blue-500 mt-0.5 shrink-0">info</span>
                            <p className="text-xs font-bold text-blue-700 dark:text-blue-400 leading-relaxed">{step.richDetails.source}</p>
                          </div>
                          <p className="text-[11px] md:text-xs text-muted-foreground leading-relaxed pl-[22px]">{step.richDetails.info}</p>
                          {step.richDetails.url && (
                            <a 
                              href={step.richDetails.url} 
                              target="_blank" 
                              rel="noreferrer" 
                              onClick={(e) => e.stopPropagation()}
                              className="inline-flex items-center gap-1 mt-2.5 ml-[22px] px-2 py-1 rounded-md bg-blue-100 dark:bg-blue-900/40 text-[10px] text-blue-700 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-800/60 font-semibold transition-colors"
                            >
                              <span className="material-symbols-outlined text-[12px]">open_in_new</span> ดูรายละเอียด
                            </a>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Expand chevron */}
        {(step.substeps || step.reason) && (
          <div className="flex justify-center mt-1">
            <span className={cn(
              "material-symbols-outlined text-[14px] text-muted-foreground/30 transition-transform duration-200",
              expanded && "rotate-180"
            )}>expand_more</span>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main Page ──
export default function PathwayPage() {
  const [showAll, setShowAll] = useState(false);

  const completedSteps = pathwayData.filter((s) => s.status === "completed");
  const currentSteps = pathwayData.filter((s) => s.status === "current");
  const recommendedSteps = pathwayData.filter((s) => s.status === "recommended");

  // Preview: latest completed, latest current, first recommended
  const previewSteps: PathwayStep[] = [
    completedSteps[completedSteps.length - 1],
    currentSteps[currentSteps.length - 1],
    recommendedSteps[0],
  ].filter(Boolean) as PathwayStep[];

  return (
    <>
      <div className="p-4 md:p-6 pb-16 max-w-[1100px] mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <a href="/dashboard" className="hover:text-primary transition-colors">หน้าหลัก</a>
          <span className={`${icon18} text-muted-foreground/50`}>chevron_right</span>
          <span className="text-primary font-medium flex items-center gap-1">
            <span className={icon18}>route</span> เส้นทางการศึกษา
          </span>
        </div>

        {/* Header */}
        <div className="text-center mb-2">
          <h1 className="text-xl md:text-2xl font-bold mb-1 tracking-tight text-primary">
            เส้นทางการศึกษา (Learning Pathway)
          </h1>
          <p className="text-sm text-muted-foreground">
            {profileData.personalInfo.firstName} {profileData.personalInfo.lastName} — {profileData.workHistory.position}, {profileData.workHistory.currentWorkplace}
          </p>
        </div>

        {/* Summary row */}
        <div className="flex items-center justify-center gap-4 md:gap-6 flex-wrap">
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[16px] text-emerald-500">check_circle</span>
            <span className="text-xs text-muted-foreground">สำเร็จ <span className="font-bold text-foreground">{completedSteps.length}</span></span>
          </div>
          <div className="w-px h-4 bg-border" />
          <div className="flex items-center gap-1.5">
            <span className="block w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            <span className="text-xs text-muted-foreground">กำลังศึกษา <span className="font-bold text-foreground">{currentSteps.length}</span></span>
          </div>
          <div className="w-px h-4 bg-border" />
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[16px] text-amber-500">lightbulb</span>
            <span className="text-xs text-muted-foreground">แนะนำ <span className="font-bold text-foreground">{recommendedSteps.length}</span></span>
          </div>
        </div>

        {/* ═══════ Zigzag Timeline ═══════ */}
        <div className="relative">
          {/* Central vertical line */}
          <div className="absolute left-1/2 top-0 bottom-0 -translate-x-1/2 w-0.5 bg-gradient-to-b from-emerald-300/40 via-blue-300/40 to-amber-300/30 dark:from-emerald-700/30 dark:via-blue-700/30 dark:to-amber-700/20" />

          {!showAll ? (
            /* ══════ Preview Mode: 3 cards ══════ */
            <>
              <div className="space-y-6 md:space-y-8">
                {previewSteps.map((step, i) => {
                  const badge = statusBadge[step.status];
                  const sectionLabel = step.status === "completed"
                    ? { bg: "bg-emerald-100 dark:bg-emerald-900/30", border: "border-emerald-200/50 dark:border-emerald-800/30", text: "text-emerald-700 dark:text-emerald-400", icon: "verified", label: "สำเร็จล่าสุด" }
                    : step.status === "current"
                    ? { bg: "bg-blue-100 dark:bg-blue-900/30", border: "border-blue-200/50 dark:border-blue-800/30", text: "text-blue-700 dark:text-blue-400", icon: null, label: "กำลังศึกษา" }
                    : { bg: "bg-amber-100 dark:bg-amber-900/30", border: "border-amber-200/50 dark:border-amber-800/30", text: "text-amber-700 dark:text-amber-400", icon: "auto_awesome", label: "แนะนำถัดไป" };

                  return (
                    <div key={step.id}>
                      {/* Section label */}
                      <div className="relative flex justify-center mb-4">
                        <div className={cn(sectionLabel.bg, sectionLabel.border, "px-4 py-1.5 rounded-full border z-10")}>
                          <span className={cn("text-[11px] font-semibold flex items-center gap-1", sectionLabel.text)}>
                            {sectionLabel.icon ? (
                              <span className="material-symbols-outlined text-[14px]">{sectionLabel.icon}</span>
                            ) : (
                              <span className="block w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                            )}
                            {sectionLabel.label}
                          </span>
                        </div>
                      </div>
                      <ZigzagCard step={step} index={i} />
                    </div>
                  );
                })}
              </div>

              {/* ── Expand Button ── */}
              <div className="relative flex justify-center mt-8 z-10">
                <button
                  onClick={() => setShowAll(true)}
                  className={cn(
                    "group flex items-center gap-2.5 px-6 py-3 rounded-lg",
                    "bg-gradient-to-r from-[#5a5a28]/90 to-[#7a7a32]/90 hover:from-[#5a5a28] hover:to-[#7a7a32]",
                    "text-white font-semibold text-sm shadow-lg shadow-[#5a5a28]/20",
                    "hover:shadow-xl hover:shadow-[#5a5a28]/30 hover:scale-[1.02]",
                    "active:scale-[0.98] transition-all duration-300",
                    "border border-white/10"
                  )}
                >
                  <span className="material-symbols-outlined text-[20px]">route</span>
                  ดูเส้นทางทั้งหมด ({completedSteps.length + currentSteps.length + recommendedSteps.length} รายการ)
                  <span className="material-symbols-outlined text-[18px] group-hover:translate-y-0.5 transition-transform duration-300">expand_more</span>
                </button>
              </div>

              {/* End dot */}
              <div className="relative flex justify-center mt-6">
                <div className="w-4 h-4 rounded-full bg-muted-foreground/20 border-2 border-muted-foreground/10 z-10" />
              </div>
            </>
          ) : (
            /* ══════ Full Mode: all steps ══════ */
            <div className="animate-in fade-in slide-in-from-top-6 duration-700">
              {/* Collapse button (top) */}
              <div className="relative flex justify-center mb-6 z-10">
                <button
                  onClick={() => setShowAll(false)}
                  className={cn(
                    "group flex items-center gap-2 px-5 py-2 rounded-full",
                    "bg-card border shadow-sm hover:shadow-md",
                    "text-muted-foreground hover:text-foreground text-xs font-medium",
                    "transition-all duration-300"
                  )}
                >
                  <span className="material-symbols-outlined text-[16px] group-hover:-translate-y-0.5 transition-transform duration-300">expand_less</span>
                  ย่อเส้นทาง
                </button>
              </div>

              {/* Completed section label */}
              {completedSteps.length > 0 && (
                <div className="relative flex justify-center mb-6">
                  <div className="bg-emerald-100 dark:bg-emerald-900/30 px-4 py-1.5 rounded-full border border-emerald-200/50 dark:border-emerald-800/30 z-10">
                    <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">verified</span>
                      สำเร็จแล้ว
                    </span>
                  </div>
                </div>
              )}

              {/* Completed steps */}
              <div className="space-y-6 md:space-y-8">
                {completedSteps.map((step, i) => (
                  <ZigzagCard key={step.id} step={step} index={i} />
                ))}
              </div>

              {/* Current section label */}
              {currentSteps.length > 0 && (
                <div className="relative flex justify-center my-6 md:my-8">
                  <div className="bg-blue-100 dark:bg-blue-900/30 px-4 py-1.5 rounded-full border border-blue-200/50 dark:border-blue-800/30 z-10">
                    <span className="text-[11px] font-semibold text-blue-700 dark:text-blue-400 flex items-center gap-1">
                      <span className="block w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                      กำลังศึกษา
                    </span>
                  </div>
                </div>
              )}

              {/* Current steps */}
              <div className="space-y-6 md:space-y-8">
                {currentSteps.map((step, i) => (
                  <ZigzagCard key={step.id} step={step} index={completedSteps.length + i} />
                ))}
              </div>

              {/* Recommended section label */}
              {recommendedSteps.length > 0 && (
                <div className="relative flex justify-center my-6 md:my-8">
                  <div className="bg-amber-100 dark:bg-amber-900/30 px-4 py-1.5 rounded-full border border-amber-200/50 dark:border-amber-800/30 z-10">
                    <span className="text-[11px] font-semibold text-amber-700 dark:text-amber-400 flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">auto_awesome</span>
                      แนะนำถัดไป
                    </span>
                  </div>
                </div>
              )}

              {/* Recommended steps */}
              <div className="space-y-6 md:space-y-8">
                {recommendedSteps.map((step, i) => (
                  <ZigzagCard key={step.id} step={step} index={completedSteps.length + currentSteps.length + i} />
                ))}
              </div>

              {/* Collapse button (bottom) */}
              <div className="relative flex justify-center mt-8 z-10">
                <button
                  onClick={() => setShowAll(false)}
                  className={cn(
                    "group flex items-center gap-2 px-5 py-2 rounded-full",
                    "bg-card border shadow-sm hover:shadow-md",
                    "text-muted-foreground hover:text-foreground text-xs font-medium",
                    "transition-all duration-300"
                  )}
                >
                  <span className="material-symbols-outlined text-[16px] group-hover:-translate-y-0.5 transition-transform duration-300">expand_less</span>
                  ย่อเส้นทาง
                </button>
              </div>

              {/* End dot */}
              <div className="relative flex justify-center mt-6">
                <div className="w-4 h-4 rounded-full bg-muted-foreground/20 border-2 border-muted-foreground/10 z-10" />
              </div>
            </div>
          )}
        </div>

      </div>
      <Footer />
    </>
  );
}
