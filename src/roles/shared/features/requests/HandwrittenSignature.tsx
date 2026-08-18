import type {
  HandwrittenSignature,
  HandwrittenSignaturePoint,
} from "@/roles/shared/features/requests/request-schema";

import { cn } from "@/lib/utils";

const SIGNATURE_WIDTH = 1_000;
const SIGNATURE_HEIGHT = 300;

interface HandwrittenSignaturePreviewProps {
  signature: HandwrittenSignature;
  className?: string;
  ariaLabel?: string;
}

function clampCoordinate(value: number) {
  if (!Number.isFinite(value)) return 0;
  return Math.min(1, Math.max(0, value));
}

function scalePoint(point: HandwrittenSignaturePoint) {
  return {
    x: clampCoordinate(point.x) * SIGNATURE_WIDTH,
    y: clampCoordinate(point.y) * SIGNATURE_HEIGHT,
  };
}

function makeStrokePath(points: readonly HandwrittenSignaturePoint[]) {
  if (points.length < 2) return "";

  const scaledPoints = points.map(scalePoint);
  const first = scaledPoints[0];
  let path = `M ${first.x} ${first.y}`;

  for (let index = 1; index < scaledPoints.length - 1; index += 1) {
    const point = scaledPoints[index];
    const nextPoint = scaledPoints[index + 1];
    const midpointX = (point.x + nextPoint.x) / 2;
    const midpointY = (point.y + nextPoint.y) / 2;
    path += ` Q ${point.x} ${point.y} ${midpointX} ${midpointY}`;
  }

  const last = scaledPoints[scaledPoints.length - 1];
  return `${path} L ${last.x} ${last.y}`;
}

export function HandwrittenSignaturePreview({
  signature,
  className,
  ariaLabel = "ลายมือชื่อที่เขียนด้วยมือ",
}: HandwrittenSignaturePreviewProps) {
  return (
    <svg
      viewBox={`0 0 ${SIGNATURE_WIDTH} ${SIGNATURE_HEIGHT}`}
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label={ariaLabel}
      focusable="false"
      className={cn("aspect-[10/3] w-full text-signature-ink", className)}
    >
      {signature.strokes.map((stroke, strokeIndex) => {
        if (stroke.length === 0) return null;

        if (stroke.length === 1) {
          const point = scalePoint(stroke[0]);
          return (
            <circle
              key={`stroke-${strokeIndex}`}
              cx={point.x}
              cy={point.y}
              r="3"
              fill="currentColor"
            />
          );
        }

        return (
          <path
            key={`stroke-${strokeIndex}`}
            d={makeStrokePath(stroke)}
            fill="none"
            stroke="currentColor"
            strokeWidth="6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        );
      })}
    </svg>
  );
}
