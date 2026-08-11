import { describe, expect, it } from "vitest";

import type { PortalSession } from "./mock-login";
import { canPortalSessionAccessArea } from "./access-control";

function session(role: PortalSession["role"]): PortalSession {
  return { role, displayName: role, signedInAt: "2026-08-11T07:30:00.000Z" };
}

describe("canPortalSessionAccessArea", () => {
  it("keeps members inside member routes", () => {
    expect(canPortalSessionAccessArea(session("member"), "member", "/member/dashboard")).toBe(true);
    expect(canPortalSessionAccessArea(session("member"), "admin", "/admin/dashboard")).toBe(false);
  });

  it("limits finance officers to the finance workspace", () => {
    expect(canPortalSessionAccessArea(session("finance_officer"), "admin", "/admin/finance")).toBe(true);
    expect(canPortalSessionAccessArea(session("finance_officer"), "admin", "/admin/admissions")).toBe(false);
  });

  it("keeps settings restricted to the system administrator", () => {
    expect(canPortalSessionAccessArea(session("staff"), "admin", "/admin/registrations")).toBe(true);
    expect(canPortalSessionAccessArea(session("staff"), "admin", "/admin/settings")).toBe(false);
    expect(canPortalSessionAccessArea(session("staff"), "admin", "/admin/terms")).toBe(false);
    expect(canPortalSessionAccessArea(session("super_admin"), "admin", "/admin/settings")).toBe(true);
    expect(canPortalSessionAccessArea(session("super_admin"), "admin", "/admin/terms")).toBe(true);
  });
});
