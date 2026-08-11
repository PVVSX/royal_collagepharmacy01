"use client";

import { useMemo, useSyncExternalStore } from "react";

import {
  PORTAL_SESSION_KEY,
  readPortalSession,
} from "@/roles/shared/features/roles/mock-login";
import { resolvePresidentSessionAssignment } from "@/roles/shared/features/roles/role-assignment";
import { useRoleAssignmentStore } from "@/roles/shared/features/roles/role-assignment-store";

function subscribeToSession(onStoreChange: () => void) {
  window.addEventListener("storage", onStoreChange);
  return () => window.removeEventListener("storage", onStoreChange);
}

function getSessionSnapshot() {
  return window.localStorage.getItem(PORTAL_SESSION_KEY);
}

function getSessionServerSnapshot() {
  return null;
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
    () => serializedSession ? readPortalSession() : null,
    [serializedSession],
  );
  const assignment = useMemo(() => {
    if (
      session?.role !== "college_president" ||
      !session.userId ||
      !session.collegeCode
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
    hasPresidentRole: session?.role === "college_president",
    canAccess: session?.role === "college_president" && Boolean(assignment),
  };
}
