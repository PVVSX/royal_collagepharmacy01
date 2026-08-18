import { describe, expect, it } from "vitest";

import { ORGANISATIONS } from "@/roles/shared/features/roles/access-model";
import type { PortalSession } from "@/roles/shared/features/roles/mock-login";

import {
  STAFF_CENTRAL_ORGANISATION_ID,
  STAFF_CENTRAL_RESOURCE_ID,
  canAccessStaffCentralWorkspace,
} from "./staff-access";

function session(overrides: Partial<PortalSession> = {}): PortalSession {
  return {
    role: "royal_college_staff",
    displayName: "เจ้าหน้าที่ราชวิทยาลัย",
    userId: "staff-test",
    organisation: ORGANISATIONS.royalCollege,
    resourceScopes: [STAFF_CENTRAL_RESOURCE_ID],
    signedInAt: "2026-08-18T05:00:00.000Z",
    ...overrides,
  };
}

describe("Royal College Staff central access", () => {
  it("requires the exact Royal College organisation and central resource", () => {
    expect(STAFF_CENTRAL_ORGANISATION_ID).toBe(ORGANISATIONS.royalCollege.id);
    expect(canAccessStaffCentralWorkspace(session())).toBe(true);
    expect(canAccessStaffCentralWorkspace(session({ resourceScopes: ["*"] }))).toBe(true);
  });

  it("denies another organisation even when it has a wildcard resource", () => {
    expect(canAccessStaffCentralWorkspace(session({
      organisation: ORGANISATIONS.therapeuticCollege,
      resourceScopes: ["*"],
    }))).toBe(false);
    expect(canAccessStaffCentralWorkspace(session({
      organisation: ORGANISATIONS.system,
      resourceScopes: ["*"],
    }))).toBe(false);
  });

  it("denies missing or unrelated resource scope and the wrong role", () => {
    expect(canAccessStaffCentralWorkspace(session({ resourceScopes: [] }))).toBe(false);
    expect(canAccessStaffCentralWorkspace(session({ resourceScopes: ["staff:finance"] }))).toBe(false);
    expect(canAccessStaffCentralWorkspace(session({ role: "super_admin" }))).toBe(false);
  });
});
