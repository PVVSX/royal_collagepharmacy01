"use client";

import { useSyncExternalStore } from "react";
import { defaultCertificateCases, type CertificateCase } from "@/roles/shared/features/certificates/certificate-workflow";

const STORAGE_KEY = "certificate_cases_v1";
let snapshot = defaultCertificateCases;
let hydrated = false;
const listeners = new Set<() => void>();

function hydrate() {
  if (hydrated || typeof window === "undefined") return;
  hydrated = true;
  try { const stored = localStorage.getItem(STORAGE_KEY); if (stored) snapshot = JSON.parse(stored) as CertificateCase[]; } catch { snapshot = defaultCertificateCases; }
}

function subscribe(listener: () => void) { hydrate(); listeners.add(listener); return () => listeners.delete(listener); }
function getSnapshot() { hydrate(); return snapshot; }

export function useCertificateCases() {
  const records = useSyncExternalStore(subscribe, getSnapshot, () => defaultCertificateCases);
  const save = (record: CertificateCase) => { snapshot = records.map((item) => item.id === record.id ? record : item); localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot)); listeners.forEach((listener) => listener()); };
  return { records, save };
}
