import { describe, expect, it } from "vitest";

import { ORGANISATIONS } from "@/roles/shared/features/roles/access-model";
import type { PortalSession } from "@/roles/shared/features/roles/mock-login";

import { HISTORICAL_REQUESTS } from "./request-schema";
import {
  selectRequestsForAdminSession,
  selectRequestsForStudentSession,
} from "./request-access";

const ownCollegeRequest = HISTORICAL_REQUESTS[0];
const otherCollegeRequest = {
  ...HISTORICAL_REQUESTS[1],
  id: "OTHER-COLLEGE",
  collegeCode: "วภช.",
  requester: {
    ...HISTORICAL_REQUESTS[1].requester,
    memberId: "วภช-2568-009",
    name: "ภญ. กานดา รักษ์ชุมชน",
    email: "kanda.r@example.org",
  },
};
const requests = [ownCollegeRequest, otherCollegeRequest];

function session(role: PortalSession["role"], collegeCode?: string): PortalSession {
  return {
    role,
    userId: `${role}-test`,
    collegeCode,
    organisation: role === "royal_college_staff"
      ? { ...ORGANISATIONS.royalCollege, ...(collegeCode ? { code: collegeCode } : {}) }
      : role === "super_admin"
        ? ORGANISATIONS.system
        : ORGANISATIONS.siriraj,
    resourceScopes: ["*"],
    displayName: role,
    signedInAt: "2026-08-11T07:30:00.000Z",
  };
}

describe("selectRequestsForAdminSession", () => {
  it("lets royal college staff see central requests", () => {
    expect(selectRequestsForAdminSession(requests, session("royal_college_staff")))
      .toEqual(requests);
  });

  it("does not use Super Admin for routine business requests", () => {
    expect(selectRequestsForAdminSession(requests, session("super_admin")))
      .toEqual([]);
  });

  it("does not expose requests to unsupported or unscoped sessions", () => {
    expect(selectRequestsForAdminSession(requests, session("student"))).toEqual([]);
    expect(selectRequestsForAdminSession(requests, session("teacher")))
      .toEqual([]);
  });
});

describe("selectRequestsForStudentSession", () => {
  const ownMemberId = ownCollegeRequest.requester.memberId;
  const studentSession: PortalSession = {
    role: "student",
    userId: ownMemberId,
    organisation: ORGANISATIONS.siriraj,
    resourceScopes: ["student:self"],
    displayName: ownCollegeRequest.requester.name,
    signedInAt: "2026-08-11T07:30:00.000Z",
  };

  it("returns only requests owned by the signed-in Student", () => {
    expect(selectRequestsForStudentSession(requests, studentSession))
      .toEqual([ownCollegeRequest]);
  });

  it("fails closed for the wrong role or missing Student resource scope", () => {
    expect(selectRequestsForStudentSession(requests, session("teacher"))).toEqual([]);
    expect(selectRequestsForStudentSession(requests, {
      ...studentSession,
      resourceScopes: [],
    })).toEqual([]);
  });
});
