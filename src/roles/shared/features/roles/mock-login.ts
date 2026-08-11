import {
  isRoleAssignmentActive,
  type RoleAssignment,
  type SystemRole,
} from "./role-assignment";

export interface PortalSession {
  role: SystemRole;
  displayName: string;
  signedInAt: string;
  userId?: string;
  collegeCode?: string;
}

const roleAccounts = [
  { identifier: "admin", password: "2323", role: "super_admin", displayName: "System Admin", userId: "super-admin", home: "/admin/dashboard" },
  { identifier: "officer", password: "2323", role: "staff", displayName: "เจ้าหน้าที่วิทยาลัย", userId: "staff-vpt", collegeCode: "วภท.", home: "/admin/dashboard" },
  { identifier: "finance", password: "2323", role: "finance_officer", displayName: "เจ้าหน้าที่การเงิน", userId: "finance-vpt", collegeCode: "วภท.", home: "/admin/finance" },
  { identifier: "president", password: "2323", role: "college_president", displayName: "ภก. รศ. ดร. ธนกฤต ศรีวิชัย", userId: "president-vpt-current", collegeCode: "วภท.", home: "/president/dashboard" },
] as const;

export const PORTAL_SESSION_KEY = "royal-college.portal-session.v1";

function memberDestination(requestedPath?: string | null) {
  if (requestedPath?.startsWith("/member/")) return requestedPath;
  return "/member/dashboard";
}

export function resolvePortalLogin(
  identifier: string,
  password: string,
  requestedPath?: string | null,
  roleAssignments: readonly RoleAssignment[] = [],
) {
  const normalizedIdentifier = identifier.trim().toLowerCase();
  const assignedPresident = password === "2323"
    ? roleAssignments.find((assignment) => (
        assignment.role === "college_president" &&
        isRoleAssignmentActive(assignment) &&
        (assignment.email.trim().toLowerCase() === normalizedIdentifier ||
          assignment.userId.trim().toLowerCase() === normalizedIdentifier)
      ))
    : undefined;
  if (assignedPresident) {
    return {
      destination: "/president/dashboard",
      session: {
        role: "college_president",
        displayName: assignedPresident.userName,
        userId: assignedPresident.userId,
        collegeCode: assignedPresident.collegeCode,
        signedInAt: new Date().toISOString(),
      } satisfies PortalSession,
    };
  }
  const account = roleAccounts.find((candidate) => (
    candidate.identifier === normalizedIdentifier && candidate.password === password
  ));

  if (account) {
    return {
      destination: account.home,
      session: {
        role: account.role,
        displayName: account.displayName,
        userId: account.userId,
        ...("collegeCode" in account ? { collegeCode: account.collegeCode } : {}),
        signedInAt: new Date().toISOString(),
      } satisfies PortalSession,
    };
  }

  return {
    destination: memberDestination(requestedPath),
    session: {
      role: "member",
      displayName: identifier.trim() || "สมาชิก",
      signedInAt: new Date().toISOString(),
    } satisfies PortalSession,
  };
}

export function savePortalSession(session: PortalSession) {
  window.localStorage.setItem(PORTAL_SESSION_KEY, JSON.stringify(session));
}

export function readPortalSession(): PortalSession | null {
  const serialized = window.localStorage.getItem(PORTAL_SESSION_KEY);
  if (!serialized) return null;

  try {
    const value: unknown = JSON.parse(serialized);
    if (!value || typeof value !== "object") return null;
    const session = value as Partial<PortalSession>;
    if (
      (session.role !== "member" &&
        session.role !== "staff" &&
        session.role !== "finance_officer" &&
        session.role !== "college_president" &&
        session.role !== "super_admin") ||
      typeof session.displayName !== "string" ||
      typeof session.signedInAt !== "string" ||
      (session.userId !== undefined && typeof session.userId !== "string") ||
      (session.collegeCode !== undefined && typeof session.collegeCode !== "string")
    ) {
      return null;
    }
    return session as PortalSession;
  } catch {
    return null;
  }
}

export function clearPortalSession() {
  window.localStorage.removeItem(PORTAL_SESSION_KEY);
}
