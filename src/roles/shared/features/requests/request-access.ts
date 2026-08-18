import type { PortalSession } from "@/roles/shared/features/roles/mock-login";
import { ORGANISATION_LIST, organisationContains } from "@/roles/shared/features/roles/access-model";

import type { MockRequest } from "./request-schema";

export function selectRequestsForStudentSession(
  requests: readonly MockRequest[],
  session: PortalSession | null,
) {
  if (session?.role !== "student") return [];
  const ownsStudentResource = session.resourceScopes.some((scope) => (
    scope === "*" || scope === "student:self" || scope === `student:${session.userId}`
  ));
  if (!ownsStudentResource) return [];
  return requests.filter((request) => request.requester.memberId === session.userId);
}

export function selectRequestsForAdminSession(
  requests: readonly MockRequest[],
  session: PortalSession | null,
) {
  if (session?.role === "super_admin") return [];
  if (session?.role !== "royal_college_staff") return [];
  return requests.filter((request) => {
    const college = ORGANISATION_LIST.find((organisation) => (
      organisation.kind === "college" && organisation.code === request.collegeCode
    ));
    return Boolean(college && organisationContains(session.organisation, college.id));
  });
}
