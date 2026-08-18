"use client";

import { useCallback, useMemo, useState, useSyncExternalStore } from "react";

import type { AuditEventInput, UserAuditEvent } from "./audit-model";
import {
  DEFAULT_AUDIT_EVENTS,
  appendAuditEvent,
  getAuditStorageSnapshot,
  readAuditEvents,
  subscribeToAuditStore,
} from "./audit-store";

const SERVER_SNAPSHOT = "audit:server";

function getServerSnapshot() {
  return SERVER_SNAPSHOT;
}

function fallbackEvents() {
  return DEFAULT_AUDIT_EVENTS.map((event) => (
    JSON.parse(JSON.stringify(event)) as UserAuditEvent
  ));
}

export function useAuditLog() {
  const serialized = useSyncExternalStore(
    subscribeToAuditStore,
    getAuditStorageSnapshot,
    getServerSnapshot,
  );
  const [writeError, setWriteError] = useState("");
  const isReady = serialized !== SERVER_SNAPSHOT;
  const result = useMemo(() => {
    if (serialized === SERVER_SNAPSHOT) {
      return { events: [] as UserAuditEvent[], storageError: "" };
    }
    try {
      return { events: readAuditEvents(), storageError: "" };
    } catch {
      return {
        events: fallbackEvents(),
        storageError: "อ่านข้อมูล User Audit Log ไม่สำเร็จ ระบบกำลังใช้ข้อมูลเริ่มต้น",
      };
    }
  }, [serialized]);

  const appendEvent = useCallback((input: AuditEventInput | UserAuditEvent) => {
    try {
      const event = appendAuditEvent(input);
      setWriteError("");
      return event;
    } catch {
      setWriteError("บันทึก User Audit Log ไม่สำเร็จ");
      return null;
    }
  }, []);

  return {
    events: result.events,
    isReady,
    storageError: writeError || result.storageError,
    appendEvent,
  };
}
