import { beforeEach, describe, expect, it, vi } from "vitest";

import { SYSTEM_ROLES, type SystemRole } from "@/roles/shared/features/roles/access-model";
import {
  DEFAULT_GOVERNANCE_CONFIGURATION,
  GOVERNANCE_CONFIGURATION_KEY,
  commitAuditedGovernanceChange,
  normalizeGovernanceConfiguration,
  persistGovernanceConfiguration,
  readGovernanceConfiguration,
  updateIntegrationConfiguration,
  updateUserAccessAssignment,
} from "./governance-configuration";

describe("Super Admin governance configuration", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("contains exactly the six canonical roles", () => {
    expect(new Set(DEFAULT_GOVERNANCE_CONFIGURATION.userAssignments.map((item) => item.role)))
      .toEqual(new Set(SYSTEM_ROLES));
    expect(SYSTEM_ROLES).toEqual([
      "student",
      "teacher",
      "institution_admin",
      "royal_college_staff",
      "president",
      "super_admin",
    ]);
  });

  it("rejects a non-canonical role and does not mutate the current state", () => {
    const current = structuredClone(DEFAULT_GOVERNANCE_CONFIGURATION);
    const before = structuredClone(current);
    expect(() => updateUserAccessAssignment(current, {
      ...current.userAssignments[0],
      role: "seventh_role" as unknown as SystemRole,
    })).toThrow("Role ไม่อยู่ในรายการที่ระบบรองรับ");
    expect(current).toEqual(before);
  });

  it.each([
    ["super_admin", "org-inst-siriraj", ["*"]],
    ["student", "org-inst-siriraj", ["course:offering-bcp-101"]],
    ["teacher", "org-inst-siriraj", ["*"]],
    ["institution_admin", "org-inst-siriraj", ["institution:org-inst-chula"]],
    ["president", "org-college-vpt", ["signature:royal_college"]],
  ] as const)("rejects incompatible scope matrix: %s (%s)", (role, organisationId, resourceScopes) => {
    const current = structuredClone(DEFAULT_GOVERNANCE_CONFIGURATION);
    expect(() => updateUserAccessAssignment(current, {
      ...current.userAssignments[0],
      role,
      organisationId,
      resourceScopes: [...resourceScopes],
    })).toThrow("Role, Organisation Scope และ Resource Scope ไม่สอดคล้องกัน");
  });

  it("normalizes stored assignments to known users, roles, organisations and integrations", () => {
    const normalized = normalizeGovernanceConfiguration({
      schemaVersion: 1,
      userAssignments: [{
        userId: "วภท-2568-001",
        role: "seventh_role",
        organisationId: "org-system",
        resourceScopes: ["*"],
      }],
      integrations: [{ integrationId: "unknown", enabled: true }],
    });
    expect(normalized).toEqual(DEFAULT_GOVERNANCE_CONFIGURATION);
  });

  it("falls back from a structurally valid but incompatible stored assignment", () => {
    const normalized = normalizeGovernanceConfiguration({
      schemaVersion: 1,
      userAssignments: [{
        userId: "super-admin",
        role: "super_admin",
        organisationId: "org-inst-siriraj",
        resourceScopes: ["*"],
      }],
      integrations: [],
    });
    expect(normalized.userAssignments.find((item) => item.userId === "super-admin"))
      .toEqual(DEFAULT_GOVERNANCE_CONFIGURATION.userAssignments.find((item) => item.userId === "super-admin"));
  });

  it("persists a valid assignment and integration setting", () => {
    const withAssignment = updateUserAccessAssignment(DEFAULT_GOVERNANCE_CONFIGURATION, {
      userId: "teacher-001",
      role: "teacher",
      organisationId: "org-inst-siriraj",
      resourceScopes: [" course:offering-bcp-101 ", "course:offering-bcp-101", "course:offering-vpt-301"],
    });
    const next = updateIntegrationConfiguration(withAssignment, "document", true);
    persistGovernanceConfiguration(next);
    expect(window.localStorage.getItem(GOVERNANCE_CONFIGURATION_KEY)).toBeTruthy();
    expect(readGovernanceConfiguration()).toEqual(next);
  });

  it("appends audit before persistence and in-memory commit", () => {
    const order: string[] = [];
    const result = commitAuditedGovernanceChange({
      next: DEFAULT_GOVERNANCE_CONFIGURATION,
      appendAudit: () => { order.push("audit"); return { id: "audit-1" }; },
      persist: () => { order.push("persist"); },
      commit: () => { order.push("commit"); },
    });
    expect(result).toBe("committed");
    expect(order).toEqual(["audit", "persist", "commit"]);
  });

  it("does not persist or mutate UI state when audit fails", () => {
    const persist = vi.fn();
    const commit = vi.fn();
    const result = commitAuditedGovernanceChange({
      next: DEFAULT_GOVERNANCE_CONFIGURATION,
      appendAudit: () => null,
      persist,
      commit,
    });
    expect(result).toBe("audit_failed");
    expect(persist).not.toHaveBeenCalled();
    expect(commit).not.toHaveBeenCalled();
  });

  it("does not mutate UI state when browser persistence fails", () => {
    const commit = vi.fn();
    const result = commitAuditedGovernanceChange({
      next: DEFAULT_GOVERNANCE_CONFIGURATION,
      appendAudit: () => ({ id: "audit-1" }),
      persist: () => { throw new Error("quota"); },
      commit,
    });
    expect(result).toBe("storage_failed");
    expect(commit).not.toHaveBeenCalled();
  });
});
