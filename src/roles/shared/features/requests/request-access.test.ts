import { describe, expect, it } from "vitest";

import type { PortalSession } from "@/roles/shared/features/roles/mock-login";

import { HISTORICAL_REQUESTS } from "./request-schema";
import { selectRequestsForAdminSession } from "./request-access";

const ownCollegeRequest = HISTORICAL_REQUESTS[0];
const otherCollegeRequest = {
  ...HISTORICAL_REQUESTS[1],
  id: "OTHER-COLLEGE",
  collegeCode: "วภช.",
};
const requests = [ownCollegeRequest, otherCollegeRequest];

function session(role: PortalSession["role"], collegeCode?: string): PortalSession {
  return {
    role,
    collegeCode,
    displayName: role,
    signedInAt: "2026-08-11T07:30:00.000Z",
  };
}

describe("selectRequestsForAdminSession", () => {
  it("limits college staff to requests from their assigned college", () => {
    expect(selectRequestsForAdminSession(requests, session("staff", "วภท.")))
      .toEqual([ownCollegeRequest]);
  });

  it("lets the system administrator see every college", () => {
    expect(selectRequestsForAdminSession(requests, session("super_admin")))
      .toEqual(requests);
  });

  it("does not expose requests to unsupported or unscoped sessions", () => {
    expect(selectRequestsForAdminSession(requests, session("staff"))).toEqual([]);
    expect(selectRequestsForAdminSession(requests, session("finance_officer", "วภท.")))
      .toEqual([]);
  });
});
