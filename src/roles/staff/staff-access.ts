import {
  ORGANISATIONS,
  hasResourceScope,
} from "@/roles/shared/features/roles/access-model";
import type { PortalSession } from "@/roles/shared/features/roles/mock-login";

export const STAFF_CENTRAL_ORGANISATION_ID = ORGANISATIONS.royalCollege.id;
export const STAFF_CENTRAL_RESOURCE_ID = "staff:central";

/** Central Staff data and actions require the canonical Royal College scope. */
export function canAccessStaffCentralWorkspace(session: PortalSession | null) {
  return session?.role === "royal_college_staff" &&
    session.organisation.id === STAFF_CENTRAL_ORGANISATION_ID &&
    hasResourceScope(session.resourceScopes, STAFF_CENTRAL_RESOURCE_ID);
}
