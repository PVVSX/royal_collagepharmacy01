"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import type { PortalSession } from "@/roles/shared/features/roles/mock-login";

import {
  createAuditActorSnapshot,
  type AuditResourceSnapshot,
} from "./audit-model";
import { useAuditLog } from "./use-audit-log";

interface SensitiveViewAuditOptions {
  enabled: boolean;
  session: PortalSession | null;
  resource: AuditResourceSnapshot;
}

export type SensitiveViewAuditStatus = "idle" | "pending" | "allowed" | "error";

/** Records one authorized sensitive-data view per actor and resource per mount. */
export function useSensitiveViewAudit({
  enabled,
  session,
  resource,
}: SensitiveViewAuditOptions) {
  const { appendEvent } = useAuditLog();
  const recordedViewsRef = useRef(new Set<string>());
  const [attempt, setAttempt] = useState(0);
  const [result, setResult] = useState<{
    key: string;
    status: "allowed" | "error";
  } | null>(null);
  const resourceOrganisationId = resource.organisationId ?? session?.organisation.id;
  const viewKey = useMemo(() => session ? [
    session.userId,
    session.role,
    session.organisation.id,
    session.resourceScopes.join(","),
    resource.type,
    resource.id,
  ].join(":") : "", [
    resource.id,
    resource.type,
    session,
  ]);

  useEffect(() => {
    if (!enabled || !session) return;

    if (recordedViewsRef.current.has(viewKey)) {
      setResult({ key: viewKey, status: "allowed" });
      return;
    }

    const event = appendEvent({
      actor: createAuditActorSnapshot(session),
      action: "sensitive_data.view",
      resource: {
        type: resource.type,
        id: resource.id,
        ...(resource.label ? { label: resource.label } : {}),
        ...(resourceOrganisationId ? { organisationId: resourceOrganisationId } : {}),
      },
      before: null,
      after: { access: "allowed" },
      reason: "เปิดดูข้อมูลตามขอบเขตงานที่ได้รับมอบหมาย",
    });

    if (event) recordedViewsRef.current.add(viewKey);
    setResult({ key: viewKey, status: event ? "allowed" : "error" });
  }, [
    appendEvent,
    attempt,
    enabled,
    resource.id,
    resource.label,
    resource.type,
    resourceOrganisationId,
    session,
    viewKey,
  ]);

  const retry = useCallback(() => {
    if (!enabled || !session || !viewKey) return;
    setResult((current) => current?.key === viewKey ? null : current);
    setAttempt((current) => current + 1);
  }, [enabled, session, viewKey]);

  const status: SensitiveViewAuditStatus = !enabled || !session
    ? "idle"
    : result?.key === viewKey
      ? result.status
      : "pending";

  return { status, retry };
}
