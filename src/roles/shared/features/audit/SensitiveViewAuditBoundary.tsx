"use client";

import {
  ErrorState,
  LoadingState,
} from "@/roles/shared/components/workspace/WorkspacePrimitives";

import type { SensitiveViewAuditStatus } from "./use-sensitive-view-audit";

export function SensitiveViewAuditBoundary({
  status,
  onRetry,
  children,
}: {
  status: SensitiveViewAuditStatus;
  onRetry: () => void;
  children: React.ReactNode;
}) {
  if (status === "allowed") return children;
  if (status === "error") {
    return (
      <ErrorState
        message="ไม่สามารถบันทึกการเปิดดูลง User Audit Log จึงยังไม่แสดงข้อมูลสำคัญ"
        onRetry={onRetry}
      />
    );
  }
  return <LoadingState label="กำลังบันทึกสิทธิ์การเปิดดูข้อมูลสำคัญ" />;
}
