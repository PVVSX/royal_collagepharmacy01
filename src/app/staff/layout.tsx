import { RoleWorkspaceShell } from "@/roles/shared/components/workspace/RoleWorkspaceShell";
import { StaffCentralAccessBoundary } from "@/roles/staff/components/StaffCentralAccessBoundary";
import {
  STAFF_CENTRAL_ORGANISATION_ID,
  STAFF_CENTRAL_RESOURCE_ID,
} from "@/roles/staff/staff-access";
import { STAFF_NAV_ITEMS } from "@/roles/staff/staff-workspace";

export default function StaffLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleWorkspaceShell
      area="staff"
      role="royal_college_staff"
      navItems={STAFF_NAV_ITEMS}
      exactOrganisationId={STAFF_CENTRAL_ORGANISATION_ID}
      resourceId={STAFF_CENTRAL_RESOURCE_ID}
    >
      <StaffCentralAccessBoundary>{children}</StaffCentralAccessBoundary>
    </RoleWorkspaceShell>
  );
}
