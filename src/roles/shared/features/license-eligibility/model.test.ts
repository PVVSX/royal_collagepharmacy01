import { describe, expect, it } from "vitest";
import { getLicenseEligibility, isLicenseStatus } from "./model";
import { findLicenseRegistryRecord } from "./mock-registry";

describe("getLicenseEligibility", () => {
  it("allows an active license", () => {
    expect(getLicenseEligibility("active")).toMatchObject({
      decision: "eligible",
      canApplyForExam: true,
      canRegisterCourses: true,
      studentStanding: "active",
    });
  });

  it("allows a suspended license without terminating the student", () => {
    expect(getLicenseEligibility("suspended")).toMatchObject({
      decision: "eligible_with_warning",
      canApplyForExam: true,
      canRegisterCourses: true,
      studentStanding: "active",
    });
  });

  it("blocks a revoked license and terminates student standing", () => {
    expect(getLicenseEligibility("revoked")).toMatchObject({
      decision: "ineligible",
      canApplyForExam: false,
      canRegisterCourses: false,
      studentStanding: "terminated",
    });
  });

  it.each(["expired", "lapsed"] as const)(
    "routes %s licenses to manual review without termination",
    (status) => {
      expect(getLicenseEligibility(status)).toMatchObject({
        decision: "manual_review",
        canApplyForExam: false,
        canRegisterCourses: false,
        studentStanding: "under_review",
      });
    },
  );

  it("blocks an unverified license until staff review", () => {
    expect(getLicenseEligibility("unverified")).toMatchObject({
      decision: "manual_review",
      canApplyForExam: false,
      canRegisterCourses: false,
      studentStanding: "under_review",
    });
  });

  it("recognizes supported statuses and exposes contrasting registry scenarios", () => {
    expect(isLicenseStatus("suspended")).toBe(true);
    expect(isLicenseStatus("unknown")).toBe(false);
    expect(findLicenseRegistryRecord("ภ.23456")?.status).toBe("suspended");
    expect(findLicenseRegistryRecord("ภ.45678")?.status).toBe("revoked");
    expect(findLicenseRegistryRecord("ภ.99999")).toBeNull();
  });
});
