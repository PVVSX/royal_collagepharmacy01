import type { LicenseStatus } from "@/roles/shared/member/domain/passport";

export interface LicenseRegistryRecord {
  licenseNumber: string;
  status: LicenseStatus;
  checkedAt: string;
}

const checkedAt = "2026-08-11T07:30:00.000Z";

export const mockLicenseRegistry: Readonly<Record<string, LicenseRegistryRecord>> = {
  "ภ.12345": { licenseNumber: "ภ.12345", status: "active", checkedAt },
  "ภ.23456": { licenseNumber: "ภ.23456", status: "suspended", checkedAt },
  "ภ.34567": { licenseNumber: "ภ.34567", status: "active", checkedAt },
  "ภ.45678": { licenseNumber: "ภ.45678", status: "revoked", checkedAt },
};

export function findLicenseRegistryRecord(licenseNumber: string) {
  return mockLicenseRegistry[licenseNumber.trim()] ?? null;
}
