import { describe, expect, it } from "vitest";

import {
  findLicenseRegistryRecord,
  getLicenseEligibility,
} from "@/roles/shared/features/license-eligibility";
import { findAdminStudent } from "./student-directory";

describe("admin student directory", () => {
  it("resolves the selected student and reflects a revoked license as terminated", () => {
    const student = findAdminStudent("RPC-2568-201");
    const license = findLicenseRegistryRecord(student?.licenseNumber ?? "");

    expect(student?.firstName).toBe("กานดา");
    expect(getLicenseEligibility(license?.status ?? "unverified").studentStanding).toBe("terminated");
  });
});
