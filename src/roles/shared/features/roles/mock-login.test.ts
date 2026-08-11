import { describe, expect, it } from "vitest";
import {
  PORTAL_SESSION_KEY,
  readPortalSession,
  resolvePortalLogin,
  savePortalSession,
} from "./mock-login";

describe("resolvePortalLogin", () => {
  it.each([
    ["admin", "super_admin", "/admin/dashboard"],
    ["officer", "staff", "/admin/dashboard"],
    ["finance", "finance_officer", "/admin/finance"],
    ["president", "college_president", "/president/dashboard"],
  ] as const)("routes %s to its role home", (identifier, role, destination) => {
    const result = resolvePortalLogin(identifier, "2323");
    expect(result.session.role).toBe(role);
    expect(result.destination).toBe(destination);
  });

  it("returns a member to the requested member page", () => {
    expect(resolvePortalLogin("member@example.com", "anything", "/member/admission")).toMatchObject({
      destination: "/member/admission",
      session: { role: "member" },
    });
  });

  it("lets the active assigned president sign in with the assigned email", () => {
    const now = Date.now();
    const result = resolvePortalLogin(
      "new.president@example.org",
      "2323",
      null,
      [{
        id: "term-current",
        userId: "president-current",
        userName: "ประธานคนปัจจุบัน",
        email: "new.president@example.org",
        role: "college_president",
        collegeCode: "วภท.",
        collegeName: "วิทยาลัยเภสัชบำบัดแห่งประเทศไทย",
        startsAt: new Date(now - 60_000).toISOString(),
        endsAt: new Date(now + 60_000).toISOString(),
        appointedBy: "System Admin",
      }],
    );

    expect(result).toMatchObject({
      destination: "/president/dashboard",
      session: {
        role: "college_president",
        userId: "president-current",
        collegeCode: "วภท.",
      },
    });
  });

  it("does not honor a non-member return path for a member", () => {
    expect(resolvePortalLogin("member@example.com", "anything", "/admin/settings").destination)
      .toBe("/member/dashboard");
  });

  it("reads a valid saved role and ignores malformed storage", () => {
    const session = resolvePortalLogin("finance", "2323").session;
    savePortalSession(session);
    expect(readPortalSession()).toEqual(session);

    window.localStorage.setItem(PORTAL_SESSION_KEY, "not-json");
    expect(readPortalSession()).toBeNull();
    window.localStorage.removeItem(PORTAL_SESSION_KEY);
  });
});
