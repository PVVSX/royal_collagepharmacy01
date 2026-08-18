"use client";

import { useMemo, useSyncExternalStore } from "react";

import {
  getPortalSessionStorageSnapshot,
  readPortalSession,
  subscribeToPortalSession,
} from "@/roles/shared/features/roles/mock-login";
import { resolvePresidentSessionAssignment } from "@/roles/shared/features/roles/role-assignment";
import { useRoleAssignmentStore } from "@/roles/shared/features/roles/role-assignment-store";

function subscribeToSession(onStoreChange: () => void) {
  return subscribeToPortalSession(onStoreChange);
}

function getSessionSnapshot() {
  return getPortalSessionStorageSnapshot();
}

function getSessionServerSnapshot() {
  return "";
}

function subscribeToClock(onStoreChange: () => void) {
  const intervalId = window.setInterval(onStoreChange, 30_000);
  return () => window.clearInterval(intervalId);
}

function getClockSnapshot() {
  return Math.floor(Date.now() / 30_000);
}

function getClockServerSnapshot() {
  return 0;
}

export function usePresidentAccess() {
  const serializedSession = useSyncExternalStore(
    subscribeToSession,
    getSessionSnapshot,
    getSessionServerSnapshot,
  );
  const clockBucket = useSyncExternalStore(
    subscribeToClock,
    getClockSnapshot,
    getClockServerSnapshot,
  );
  const { assignments, isReady, storageError } = useRoleAssignmentStore();
  const session = useMemo(
    () => serializedSession
      ? readPortalSession({ persistMigration: false })
      : null,
    [serializedSession],
  );
  const assignment = useMemo(() => {
    if (
      session?.role !== "president" ||
      !session.userId ||
      !session.organisation
    ) {
      return null;
    }
    return resolvePresidentSessionAssignment(
      assignments,
      session,
      new Date(clockBucket * 30_000),
    );
  }, [assignments, clockBucket, session]);

  return {
    assignment,
    isReady,
    storageError,
    hasPresidentRole: session?.role === "president",
    canAccess: session?.role === "president" && Boolean(assignment),
  };
}
