"use client";

import { useMemo, useSyncExternalStore } from "react";

import {
  getPortalSessionStorageSnapshot,
  readPortalSession,
  subscribeToPortalSession,
  type PortalSession,
} from "./mock-login";

const SERVER_SNAPSHOT = "portal-session:server";

function getServerSnapshot() {
  return SERVER_SNAPSHOT;
}

export interface PortalSessionState {
  session: PortalSession | null;
  isReady: boolean;
}

export function usePortalSession(): PortalSessionState {
  const serializedSession = useSyncExternalStore(
    subscribeToPortalSession,
    getPortalSessionStorageSnapshot,
    getServerSnapshot,
  );
  const isReady = serializedSession !== SERVER_SNAPSHOT;
  const session = useMemo(
    () => serializedSession === SERVER_SNAPSHOT
      ? null
      : readPortalSession({ persistMigration: false }),
    [serializedSession],
  );

  return { session, isReady };
}
