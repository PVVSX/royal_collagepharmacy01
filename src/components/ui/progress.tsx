"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const progressIndicatorVariants = cva(
  [
    "block h-2 w-full appearance-none overflow-hidden rounded-2xl bg-muted",
    "[&::-webkit-progress-bar]:rounded-2xl [&::-webkit-progress-bar]:bg-muted",
    "[&::-webkit-progress-value]:rounded-2xl [&::-webkit-progress-value]:transition-[width]",
    "[&::-moz-progress-bar]:rounded-2xl [&::-moz-progress-bar]:transition-[width]",
  ],
  {
    variants: {
      tone: {
        brand: "[&::-webkit-progress-value]:bg-brand [&::-moz-progress-bar]:bg-brand",
        success: "[&::-webkit-progress-value]:bg-success [&::-moz-progress-bar]:bg-success",
        warning: "[&::-webkit-progress-value]:bg-warning [&::-moz-progress-bar]:bg-warning",
        info: "[&::-webkit-progress-value]:bg-info [&::-moz-progress-bar]:bg-info",
        danger: "[&::-webkit-progress-value]:bg-danger [&::-moz-progress-bar]:bg-danger",
        neutral: "[&::-webkit-progress-value]:bg-muted-foreground/20 [&::-moz-progress-bar]:bg-muted-foreground/20",
        chart1: "[&::-webkit-progress-value]:bg-chart-1 [&::-moz-progress-bar]:bg-chart-1",
        chart2: "[&::-webkit-progress-value]:bg-chart-2 [&::-moz-progress-bar]:bg-chart-2",
        chart3: "[&::-webkit-progress-value]:bg-chart-3 [&::-moz-progress-bar]:bg-chart-3",
        chart4: "[&::-webkit-progress-value]:bg-chart-4 [&::-moz-progress-bar]:bg-chart-4",
        chart5: "[&::-webkit-progress-value]:bg-chart-5 [&::-moz-progress-bar]:bg-chart-5",
      },
    },
    defaultVariants: {
      tone: "brand",
    },
  }
)

function Progress({
  className,
  value,
  max = 100,
  tone = "brand",
  indicatorClassName,
  ...props
}: React.ComponentProps<"progress"> &
  VariantProps<typeof progressIndicatorVariants> & {
    indicatorClassName?: string
  }) {
  const normalizedMax =
    typeof max === "number" && Number.isFinite(max) && max > 0 ? max : 100
  const clampedValue =
    typeof value === "number" && Number.isFinite(value)
      ? Math.min(normalizedMax, Math.max(0, value))
      : 0

  return (
    <progress
      data-slot="progress"
      data-tone={tone}
      value={clampedValue}
      max={normalizedMax}
      className={cn(
        progressIndicatorVariants({ tone }),
        indicatorClassName,
        className
      )}
      {...props}
    />
  )
}

export { Progress, progressIndicatorVariants }
