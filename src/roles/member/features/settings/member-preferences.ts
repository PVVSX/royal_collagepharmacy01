"use client";

import { useSyncExternalStore } from "react";

export interface MemberPreferences {
  locale: "th" | "en";
  webNotifications: boolean;
  emailNotifications: boolean;
  academicNews: boolean;
}

const STORAGE_KEY = "member_preferences_v1";
const defaults: MemberPreferences = {
  locale: "th",
  webNotifications: true,
  emailNotifications: true,
  academicNews: false,
};

let snapshot = defaults;
let hydrated = false;
const listeners = new Set<() => void>();

function hydrate() {
  if (hydrated || typeof window === "undefined") return;
  hydrated = true;
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored) snapshot = { ...defaults, ...JSON.parse(stored) };
  } catch {
    snapshot = defaults;
  }
}

function subscribe(listener: () => void) {
  hydrate();
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  hydrate();
  return snapshot;
}

export function useMemberPreferences() {
  const preferences = useSyncExternalStore(subscribe, getSnapshot, () => defaults);
  const setPreferences = (patch: Partial<MemberPreferences>) => {
    snapshot = { ...preferences, ...patch };
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
      document.documentElement.lang = snapshot.locale;
    }
    listeners.forEach((listener) => listener());
  };
  return { preferences, setPreferences };
}
