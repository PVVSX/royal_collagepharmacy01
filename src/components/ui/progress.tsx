"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Progress as ProgressPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"

const progressIndicatorVariants = cva(
  "size-full flex-1 transition-transform",
  {
    variants: {
      tone: {
        brand: "bg-brand",
        success: "bg-success",
        warning: "bg-warning",
        info: "bg-info",
        danger: "bg-danger",
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
  tone = "brand",
  indicatorClassName,
  ...props
}: React.ComponentProps<typeof ProgressPrimitive.Root> &
  VariantProps<typeof progressIndicatorVariants> & {
    indicatorClassName?: string
  }) {
  const clampedValue =
    typeof value === "number" && Number.isFinite(value)
      ? Math.min(100, Math.max(0, value))
      : 0

  return (
    <ProgressPrimitive.Root
      data-slot="progress"
      data-tone={tone}
      value={clampedValue}
      className={cn(
        "relative flex h-2 w-full items-center overflow-x-hidden rounded-2xl bg-muted",
        className
      )}
      {...props}
    >
      <ProgressPrimitive.Indicator
        data-slot="progress-indicator"
        className={cn(
          progressIndicatorVariants({ tone }),
          indicatorClassName
        )}
        style={{ transform: `translateX(-${100 - clampedValue}%)` }}
      />
    </ProgressPrimitive.Root>
  )
}

export { Progress, progressIndicatorVariants }
