"use client";

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  type PointerEvent as ReactPointerEvent,
} from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type {
  HandwrittenSignature,
  HandwrittenSignaturePoint,
} from "@/roles/shared/features/requests/request-schema";

interface SignaturePadProps {
  value: HandwrittenSignature | null;
  onChange: (signature: HandwrittenSignature | null) => void;
  className?: string;
  disabled?: boolean;
  invalid?: boolean;
  ariaDescribedBy?: string;
}

type SignatureStroke = HandwrittenSignaturePoint[];

const MAX_SIGNATURE_STROKES = 64;
const MAX_SIGNATURE_POINTS = 4_096;
const MIN_POINT_DISTANCE_SQUARED = 0.000004;

function clampCoordinate(value: number) {
  if (!Number.isFinite(value)) return 0;
  return Math.min(1, Math.max(0, value));
}

function cloneStrokes(strokes: readonly (readonly HandwrittenSignaturePoint[])[]) {
  return strokes
    .map((stroke) => stroke.map((point) => ({ ...point })))
    .filter((stroke) => stroke.length > 0);
}

function countPoints(strokes: readonly (readonly HandwrittenSignaturePoint[])[]) {
  return strokes.reduce((total, stroke) => total + stroke.length, 0);
}

function isMeaningfulStroke(stroke: readonly HandwrittenSignaturePoint[]) {
  return stroke.some((point, index) => {
    const previous = stroke[index - 1];
    if (!previous) return false;
    const deltaX = point.x - previous.x;
    const deltaY = point.y - previous.y;
    return (deltaX * deltaX) + (deltaY * deltaY) >= MIN_POINT_DISTANCE_SQUARED;
  });
}

function hasSignatureInk(signature: HandwrittenSignature | null) {
  return signature?.strokes.some(isMeaningfulStroke) ?? false;
}

function appendDistinctPoint(
  stroke: SignatureStroke,
  point: HandwrittenSignaturePoint,
) {
  const previous = stroke.at(-1);
  if (previous) {
    const deltaX = point.x - previous.x;
    const deltaY = point.y - previous.y;
    if ((deltaX * deltaX) + (deltaY * deltaY) < MIN_POINT_DISTANCE_SQUARED) {
      return false;
    }
  }

  stroke.push(point);
  return true;
}

function pointFromPointerEvent(
  event: PointerEvent,
  bounds: DOMRect,
): HandwrittenSignaturePoint {
  const pressure = Number.isFinite(event.pressure)
    ? Math.min(1, Math.max(0, event.pressure))
    : undefined;

  return {
    x: clampCoordinate((event.clientX - bounds.left) / bounds.width),
    y: clampCoordinate((event.clientY - bounds.top) / bounds.height),
    ...(pressure === undefined ? {} : { pressure }),
  };
}

function drawStroke(
  context: CanvasRenderingContext2D,
  stroke: readonly HandwrittenSignaturePoint[],
  width: number,
  height: number,
) {
  if (stroke.length === 0) return;

  const first = stroke[0];
  context.beginPath();
  context.moveTo(first.x * width, first.y * height);

  if (stroke.length === 1) {
    context.lineTo(first.x * width + 0.01, first.y * height + 0.01);
  } else {
    for (const point of stroke.slice(1)) {
      context.lineTo(point.x * width, point.y * height);
    }
  }

  context.stroke();
}

export function SignaturePad({
  value,
  onChange,
  className,
  disabled = false,
  invalid = false,
  ariaDescribedBy,
}: SignaturePadProps) {
  const generatedId = useId();
  const labelId = `${generatedId}-label`;
  const hintId = `${generatedId}-hint`;
  const statusId = `${generatedId}-status`;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const strokesRef = useRef<SignatureStroke[]>(cloneStrokes(value?.strokes ?? []));
  const pointCountRef = useRef(countPoints(value?.strokes ?? []));
  const activePointerRef = useRef<number | null>(null);
  const hasSignature = hasSignatureInk(value);

  const redraw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const bounds = canvas.getBoundingClientRect();
    if (bounds.width <= 0 || bounds.height <= 0) return;

    const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    const backingWidth = Math.max(1, Math.round(bounds.width * pixelRatio));
    const backingHeight = Math.max(1, Math.round(bounds.height * pixelRatio));

    if (canvas.width !== backingWidth || canvas.height !== backingHeight) {
      canvas.width = backingWidth;
      canvas.height = backingHeight;
    }

    const context = canvas.getContext("2d");
    if (!context) return;

    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    context.clearRect(0, 0, bounds.width, bounds.height);
    context.strokeStyle = getComputedStyle(canvas).color;
    context.lineWidth = Math.max(2, bounds.height * 0.02);
    context.lineCap = "round";
    context.lineJoin = "round";

    for (const stroke of strokesRef.current) {
      drawStroke(context, stroke, bounds.width, bounds.height);
    }
  }, []);

  useEffect(() => {
    if (activePointerRef.current !== null) return;
    strokesRef.current = cloneStrokes(value?.strokes ?? []);
    pointCountRef.current = countPoints(strokesRef.current);
    redraw();
  }, [redraw, value]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    redraw();

    if (typeof ResizeObserver === "undefined") {
      window.addEventListener("resize", redraw);
      return () => window.removeEventListener("resize", redraw);
    }

    const resizeObserver = new ResizeObserver(redraw);
    resizeObserver.observe(canvas);

    return () => resizeObserver.disconnect();
  }, [redraw]);

  const beginStroke = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    if (
      disabled ||
      !event.isPrimary ||
      activePointerRef.current !== null ||
      strokesRef.current.length >= MAX_SIGNATURE_STROKES ||
      pointCountRef.current >= MAX_SIGNATURE_POINTS ||
      (event.pointerType === "mouse" && event.button !== 0)
    ) {
      return;
    }

    event.preventDefault();
    const canvas = event.currentTarget;
    const bounds = canvas.getBoundingClientRect();
    if (bounds.width <= 0 || bounds.height <= 0) return;

    canvas.setPointerCapture(event.pointerId);
    activePointerRef.current = event.pointerId;
    strokesRef.current.push([pointFromPointerEvent(event.nativeEvent, bounds)]);
    pointCountRef.current += 1;
    redraw();
  };

  const continueStroke = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    if (disabled || activePointerRef.current !== event.pointerId) return;

    event.preventDefault();
    const bounds = event.currentTarget.getBoundingClientRect();
    if (bounds.width <= 0 || bounds.height <= 0) return;

    const nativeEvents = event.nativeEvent.getCoalescedEvents?.() ?? [];
    const pointerEvents = nativeEvents.length > 0 ? nativeEvents : [event.nativeEvent];
    const activeStroke = strokesRef.current.at(-1);
    if (!activeStroke) return;

    for (const pointerEvent of pointerEvents) {
      if (pointCountRef.current >= MAX_SIGNATURE_POINTS) break;
      if (appendDistinctPoint(activeStroke, pointFromPointerEvent(pointerEvent, bounds))) {
        pointCountRef.current += 1;
      }
    }
    redraw();
  };

  const finishStroke = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    if (activePointerRef.current !== event.pointerId) return;

    event.preventDefault();
    if (event.type === "pointerup" && pointCountRef.current < MAX_SIGNATURE_POINTS) {
      const bounds = event.currentTarget.getBoundingClientRect();
      const activeStroke = strokesRef.current.at(-1);
      if (
        activeStroke &&
        bounds.width > 0 &&
        bounds.height > 0 &&
        appendDistinctPoint(activeStroke, pointFromPointerEvent(event.nativeEvent, bounds))
      ) {
        pointCountRef.current += 1;
      }
    }

    activePointerRef.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    const activeStroke = strokesRef.current.at(-1);
    if (activeStroke && !isMeaningfulStroke(activeStroke)) {
      pointCountRef.current -= activeStroke.length;
      strokesRef.current.pop();
      redraw();
    }

    const strokes = cloneStrokes(strokesRef.current)
      .slice(0, MAX_SIGNATURE_STROKES);
    onChange(strokes.length > 0 ? { version: 1, strokes } : null);
  };

  const clearSignature = () => {
    activePointerRef.current = null;
    strokesRef.current = [];
    pointCountRef.current = 0;
    redraw();
    onChange(null);
  };

  const describedBy = [hintId, statusId, ariaDescribedBy]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p id={labelId} className="text-sm font-medium text-foreground">
          ลายมือชื่อประธานวิทยาลัย
        </p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={clearSignature}
          disabled={disabled || !hasSignature}
        >
          <span className="material-symbols-outlined text-base" aria-hidden="true">
            ink_eraser
          </span>
          ล้างลายเซ็น
        </Button>
      </div>
      <p id={hintId} className="text-xs text-muted-foreground">
        ใช้เมาส์ นิ้ว หรือปากกาดิจิทัลวาดลายเซ็นภายในกรอบ
      </p>
      <canvas
        ref={canvasRef}
        className={cn(
          "aspect-[10/3] w-full touch-none rounded-2xl border border-border bg-logo-surface text-admin-content outline-none transition-[border-color,box-shadow] focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30 aria-invalid:border-danger aria-invalid:ring-3 aria-invalid:ring-danger/20",
          disabled ? "cursor-not-allowed opacity-50" : "cursor-crosshair",
        )}
        aria-labelledby={labelId}
        aria-describedby={describedBy}
        aria-invalid={invalid || undefined}
        aria-disabled={disabled || undefined}
        tabIndex={disabled ? -1 : 0}
        onPointerDown={beginStroke}
        onPointerMove={continueStroke}
        onPointerUp={finishStroke}
        onPointerCancel={finishStroke}
        onLostPointerCapture={finishStroke}
      />
      <p id={statusId} className="sr-only" aria-live="polite">
        {hasSignature ? "มีลายเซ็นแล้ว" : "ยังไม่มีลายเซ็น"}
      </p>
    </div>
  );
}
