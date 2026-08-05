"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { pathwayData, type PathwayStep, profileData } from "@/roles/shared/data";
import { Badge } from "@/components/ui/badge";
import Footer from "@/roles/shared/components/layout/Footer";
import { PageShell } from "@/roles/shared/components/layout/PageShell";
import { motion, AnimatePresence } from "framer-motion";

const icon18 = "material-symbols-outlined text-lg";

// ── Type config: icon + colors ──
const typeConfig: Record<string, { icon: string; nodeColor: string; label: string }> = {
  education: { icon: "school", nodeColor: "bg-brand", label: "การศึกษา" },
  certification: { icon: "workspace_premium", nodeColor: "bg-brand-deep", label: "วุฒิบัตร" },
  experience: { icon: "work", nodeColor: "bg-brand-muted", label: "ประสบการณ์" },
  milestone: { icon: "flag", nodeColor: "bg-brand-highlight", label: "เป้าหมาย" },
};

const statusBadge: Record<string, { className: string; label: string }> = {
  completed: { className: "bg-success-container text-success border-success/30", label: "สำเร็จ" },
  current: { className: "bg-info-container text-info border-info/30", label: "กำลังศึกษา" },
  recommended: { className: "bg-warning-container text-warning border-warning/30", label: "แนะนำ" },
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
            "w-11 h-11 md:w-14 md:h-14 rounded-full flex items-center justify-center shadow-app-float transition-all duration-300",
            step.status === "current"
              ? "bg-brand-deep ring-4 ring-brand-deep/20 scale-110"
              : step.status === "recommended"
              ? "bg-brand-muted/70"
              : cfg.nodeColor
          )}
        >
          <span className="material-symbols-outlined text-content-on-image text-lg md:text-xl">
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
        "relative bg-card rounded-2xl border shadow-app-card hover:shadow-app-float transition-all duration-300 cursor-pointer group",
        step.status === "current" && "border-info/30 shadow-app-float",
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
          step.status === "current" && (side === "left" ? "border-r-info/30 border-t-info/30" : "border-l-info/30 border-b-info/30"),
        )}
      />

      <div className="p-4 md:p-5">
        {/* Top row: type badge + period/status */}
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <Badge variant="outline" className="text-3xs md:text-2xs font-semibold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
            {cfg.label}
          </Badge>
          {step.period ? (
            <span className="text-3xs md:text-2xs text-muted-foreground whitespace-nowrap">{step.period}</span>
          ) : (
            <Badge variant="outline" className={cn("text-3xs px-2 py-0.5 rounded-full", badge.className)}>
              {badge.label}
            </Badge>
          )}
        </div>

        {/* Title */}
        <h3 className={cn(
          "text-sm md:text-sm font-bold leading-snug mb-1",
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
              <span className="material-symbols-outlined text-base text-success">check_circle</span>
              <span className="text-xs font-semibold text-success">สำเร็จ</span>
            </div>
          )}
          {step.status === "current" && step.progress !== undefined && (
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-base text-info">trending_up</span>
              <span className="text-xs font-bold text-info">{step.progress}%</span>
            </div>
          )}
          {step.status === "recommended" && (
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-base text-warning">lightbulb</span>
              <span className="text-xs text-warning">แนะนำ</span>
            </div>
          )}

          {/* Right: details badge */}
          {step.details && step.status === "completed" && (
            <Badge variant="outline" className="text-3xs gap-1 rounded-full px-2.5 py-0.5">
              <span className="material-symbols-outlined text-xs text-warning">star</span>
              {step.details}
            </Badge>
          )}
          {step.status === "current" && step.creditsEarned !== undefined && (
            <Badge variant="outline" className="text-3xs gap-1 rounded-full px-2.5 py-0.5">
              <span className="material-symbols-outlined text-xs text-info">school</span>
              {step.creditsEarned}/{step.creditsTotal} หน่วยกิต
            </Badge>
          )}
          {step.status === "recommended" && (
            <button className="flex items-center gap-1 text-3xs text-muted-foreground hover:text-foreground transition-colors">
              <span className="material-symbols-outlined text-sm">info</span>
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
                            "material-symbols-outlined text-sm",
                            sub.status === "done" ? "text-success"
                              : sub.status === "in_progress" ? "text-info"
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
                              sub.status === "done" ? "bg-success" : sub.status === "in_progress" ? "bg-info" : "bg-muted-foreground/20"
                            )}
                            style={{ width: `${sub.progress}%` }}
                          />
                        </div>
                        <span className="text-2xs text-muted-foreground tabular-nums w-6 text-right">{sub.progress}%</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Recommended reason & details */}
                {step.status === "recommended" && (step.reason || step.richDetails) && (
                  <div className="mt-3 space-y-2">
                    {step.reason && (
                      <div className="p-3 rounded-xl bg-warning-container/50 border border-warning/20">
                        <div className="flex items-start gap-2">
                          <span className="material-symbols-outlined text-sm text-warning mt-0.5 shrink-0">lightbulb</span>
                          <p className="text-xs text-warning leading-relaxed">{step.reason}</p>
                        </div>
                      </div>
                    )}
                    
                    {step.richDetails && (
                      <div className="p-3 rounded-xl bg-info-container/50 border border-info/20 relative overflow-hidden group/detail">
                        {/* Decoration */}
                        <div className="absolute -right-4 -top-4 w-16 h-16 bg-info/5 rounded-full blur-xl group-hover/detail:bg-info/10 transition-colors" />
                        
                        <div className="relative">
                          <div className="flex items-start gap-2 mb-1.5">
                            <span className="material-symbols-outlined text-sm text-info mt-0.5 shrink-0">info</span>
                            <p className="text-xs font-bold text-info leading-relaxed">{step.richDetails.source}</p>
                          </div>
                          <p className="text-2xs md:text-xs text-muted-foreground leading-relaxed pl-[22px]">{step.richDetails.info}</p>
                          {step.richDetails.url && (
                            <a 
                              href={step.richDetails.url} 
                              target="_blank" 
                              rel="noreferrer" 
                              onClick={(e) => e.stopPropagation()}
                              className="inline-flex items-center gap-1 mt-2.5 ml-[22px] px-2 py-1 rounded-md bg-info-container text-3xs text-info hover:bg-info-container/70 font-semibold transition-colors"
                            >
                              <span className="material-symbols-outlined text-xs">open_in_new</span> ดูรายละเอียด
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
              "material-symbols-outlined text-sm text-muted-foreground/30 transition-transform duration-200",
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
      <PageShell size="wide" className="space-y-6 duration-500 animate-in fade-in slide-in-from-bottom-4">

        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <a href="/member/dashboard" className="hover:text-primary transition-colors">หน้าหลัก</a>
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
            <span className="material-symbols-outlined text-base text-success">check_circle</span>
            <span className="text-xs text-muted-foreground">สำเร็จ <span className="font-bold text-foreground">{completedSteps.length}</span></span>
          </div>
          <div className="w-px h-4 bg-border" />
          <div className="flex items-center gap-1.5">
            <span className="block w-2 h-2 rounded-full bg-info animate-pulse" />
            <span className="text-xs text-muted-foreground">กำลังศึกษา <span className="font-bold text-foreground">{currentSteps.length}</span></span>
          </div>
          <div className="w-px h-4 bg-border" />
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-base text-warning">lightbulb</span>
            <span className="text-xs text-muted-foreground">แนะนำ <span className="font-bold text-foreground">{recommendedSteps.length}</span></span>
          </div>
        </div>

        {/* ═══════ Zigzag Timeline ═══════ */}
        <div className="relative">
          {/* Central vertical line */}
          <div className="absolute left-1/2 top-0 bottom-0 -translate-x-1/2 w-0.5 bg-gradient-to-b from-success/40 via-info/40 to-warning/30" />

          {!showAll ? (
            /* ══════ Preview Mode: 3 cards ══════ */
            <>
              <div className="space-y-6 md:space-y-8">
                {previewSteps.map((step, i) => {
                  const sectionLabel = step.status === "completed"
                    ? { bg: "bg-success-container", border: "border-success/30", text: "text-success", icon: "verified", label: "สำเร็จล่าสุด" }
                    : step.status === "current"
                    ? { bg: "bg-info-container", border: "border-info/30", text: "text-info", icon: null, label: "กำลังศึกษา" }
                    : { bg: "bg-warning-container", border: "border-warning/30", text: "text-warning", icon: "auto_awesome", label: "แนะนำถัดไป" };

                  return (
                    <div key={step.id}>
                      {/* Section label */}
                      <div className="relative flex justify-center mb-4">
                        <div className={cn(sectionLabel.bg, sectionLabel.border, "px-4 py-1.5 rounded-full border z-10")}>
                          <span className={cn("text-2xs font-semibold flex items-center gap-1", sectionLabel.text)}>
                            {sectionLabel.icon ? (
                              <span className="material-symbols-outlined text-sm">{sectionLabel.icon}</span>
                            ) : (
                              <span className="block w-2 h-2 rounded-full bg-info animate-pulse" />
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
                    "group flex items-center gap-2.5 px-6 py-3 rounded-2xl",
                    "bg-gradient-to-r from-brand-deep/90 to-brand-muted/90 hover:from-brand-deep hover:to-brand-muted",
                    "text-primary-foreground font-semibold text-sm shadow-app-card",
                    "hover:shadow-app-float hover:scale-[1.02]",
                    "active:scale-[0.98] transition-all duration-300",
                    "border border-primary-foreground/10"
                  )}
                >
                  <span className="material-symbols-outlined text-xl">route</span>
                  ดูเส้นทางทั้งหมด ({completedSteps.length + currentSteps.length + recommendedSteps.length} รายการ)
                  <span className="material-symbols-outlined text-lg group-hover:translate-y-0.5 transition-transform duration-300">expand_more</span>
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
                    "bg-card border shadow-app-card hover:shadow-app-float",
                    "text-muted-foreground hover:text-foreground text-xs font-medium",
                    "transition-all duration-300"
                  )}
                >
                  <span className="material-symbols-outlined text-base group-hover:-translate-y-0.5 transition-transform duration-300">expand_less</span>
                  ย่อเส้นทาง
                </button>
              </div>

              {/* Completed section label */}
              {completedSteps.length > 0 && (
                <div className="relative flex justify-center mb-6">
                  <div className="bg-success-container px-4 py-1.5 rounded-full border border-success/30 z-10">
                    <span className="text-2xs font-semibold text-success flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">verified</span>
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
                  <div className="bg-info-container px-4 py-1.5 rounded-full border border-info/30 z-10">
                    <span className="text-2xs font-semibold text-info flex items-center gap-1">
                      <span className="block w-2 h-2 rounded-full bg-info animate-pulse" />
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
                  <div className="bg-warning-container px-4 py-1.5 rounded-full border border-warning/30 z-10">
                    <span className="text-2xs font-semibold text-warning flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">auto_awesome</span>
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
                    "bg-card border shadow-app-card hover:shadow-app-float",
                    "text-muted-foreground hover:text-foreground text-xs font-medium",
                    "transition-all duration-300"
                  )}
                >
                  <span className="material-symbols-outlined text-base group-hover:-translate-y-0.5 transition-transform duration-300">expand_less</span>
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

      </PageShell>
      <Footer />
    </>
  );
}
