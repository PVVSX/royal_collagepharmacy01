import type { PortalSession } from "@/roles/shared/features/roles/mock-login";

import type { MockRequest } from "./request-schema";

export function selectRequestsForAdminSession(
  requests: readonly MockRequest[],
  session: PortalSession | null,
) {
  if (session?.role === "super_admin") return requests;
  if (session?.role !== "staff" || !session.collegeCode) return [];
  return requests.filter((request) => request.collegeCode === session.collegeCode);
}
