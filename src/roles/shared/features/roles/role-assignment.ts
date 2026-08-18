import {
  ORGANISATIONS,
  hasResourceScope,
  isOrganisationScope,
  isSystemRole,
  type OrganisationScope,
  type SystemRole,
} from "./access-model";

export type { SystemRole } from "./access-model";

export interface RoleAssignment {
  id: string;
  userId: string;
  userName: string;
  email: string;
  role: SystemRole;
  organisationScope: OrganisationScope;
  resourceScopes: readonly string[];
  collegeCode: string;
  collegeName: string;
  startsAt: string;
  endsAt: string;
  appointedBy: string;
}

export const CURRENT_COLLEGE_CODE = "วภท.";
export const CURRENT_COLLEGE_NAME = "วิทยาลัยเภสัชบำบัดแห่งประเทศไทย";

export const DEFAULT_ROLE_ASSIGNMENTS: readonly RoleAssignment[] = [
  {
    id: "term-vpt-2568",
    userId: "president-vpt-former",
    userName: "ภญ. ดร. พิมพ์ชนก วัฒนกิจ",
    email: "former-president@rpc.ac.th",
    role: "president",
    organisationScope: ORGANISATIONS.therapeuticCollege,
    resourceScopes: ["signature:college"],
    collegeCode: CURRENT_COLLEGE_CODE,
    collegeName: CURRENT_COLLEGE_NAME,
    startsAt: "2025-08-01T00:00:00.000Z",
    endsAt: "2026-08-01T00:00:00.000Z",
    appointedBy: "Super Admin",
  },
  {
    id: "term-vpt-2569",
    userId: "president-vpt-current",
    userName: "ภก. รศ. ดร. ธนกฤต ศรีวิชัย",
    email: "president.vpt@rpc.ac.th",
    role: "president",
    organisationScope: ORGANISATIONS.therapeuticCollege,
    resourceScopes: ["signature:college"],
    collegeCode: CURRENT_COLLEGE_CODE,
    collegeName: CURRENT_COLLEGE_NAME,
    startsAt: "2026-08-01T00:00:00.000Z",
    endsAt: "2027-08-01T00:00:00.000Z",
    appointedBy: "Super Admin",
  },
  {
    id: "term-vpt-2570",
    userId: "president-vpt-successor",
    userName: "ภญ. รศ. ดร. กัญญารัตน์ ธรรมรักษ์",
    email: "president.next.vpt@rpc.ac.th",
    role: "president",
    organisationScope: ORGANISATIONS.therapeuticCollege,
    resourceScopes: ["signature:college"],
    collegeCode: CURRENT_COLLEGE_CODE,
    collegeName: CURRENT_COLLEGE_NAME,
    startsAt: "2027-08-01T00:00:00.000Z",
    endsAt: "2028-08-01T00:00:00.000Z",
    appointedBy: "Super Admin",
  },
  {
    id: "term-vpc-2569",
    userId: "president-vpc-current",
    userName: "ภญ. ดร. สายรุ้ง ชุมชนดี",
    email: "president.vpc@rpc.ac.th",
    role: "president",
    organisationScope: ORGANISATIONS.communityCollege,
    resourceScopes: ["signature:college"],
    collegeCode: "วภช.",
    collegeName: "วิทยาลัยเภสัชกรรมชุมชนแห่งประเทศไทย",
    startsAt: "2026-01-01T00:00:00.000Z",
    endsAt: "2027-01-01T00:00:00.000Z",
    appointedBy: "Super Admin",
  },
  {
    id: "term-rpc-2569",
    userId: "president-rpc-current",
    userName: "ภญ. รศ. ดร. อรทัย พิทักษ์วิชาชีพ",
    email: "president.royal@rpc.ac.th",
    role: "president",
    organisationScope: ORGANISATIONS.royalCollege,
    resourceScopes: ["signature:royal_college"],
    collegeCode: ORGANISATIONS.royalCollege.code,
    collegeName: ORGANISATIONS.royalCollege.name,
    startsAt: "2026-01-01T00:00:00.000Z",
    endsAt: "2027-01-01T00:00:00.000Z",
    appointedBy: "Super Admin",
  },
] as const;

function timestamp(value: string) {
  return new Date(value).getTime();
}

export function isRoleAssignmentActive(
  assignment: RoleAssignment,
  now: Date = new Date(),
) {
  const current = now.getTime();
  return current >= timestamp(assignment.startsAt) && current < timestamp(assignment.endsAt);
}

export function resolveActiveRoleAssignment(
  assignments: readonly RoleAssignment[],
  criteria: { role: SystemRole; collegeCode?: string; organisationId?: string },
  now: Date = new Date(),
) {
  return assignments
    .filter((assignment) => (
      assignment.role === criteria.role &&
      (criteria.organisationId
        ? assignment.organisationScope.id === criteria.organisationId
        : assignment.collegeCode === criteria.collegeCode) &&
      isRoleAssignmentActive(assignment, now)
    ))
    .sort((left, right) => right.startsAt.localeCompare(left.startsAt))[0] ?? null;
}

export function resolveActivePresidentAssignment(
  assignments: readonly RoleAssignment[],
  collegeCode: string,
  now: Date = new Date(),
) {
  return resolveActiveRoleAssignment(
    assignments,
    { role: "president", collegeCode },
    now,
  );
}

export function resolvePresidentSessionAssignment(
  assignments: readonly RoleAssignment[],
  session: {
    userId?: string;
    collegeCode?: string;
    organisation?: OrganisationScope;
    resourceScopes?: readonly string[];
  },
  now: Date = new Date(),
) {
  if (!session.userId || (!session.organisation && !session.collegeCode)) return null;
  const active = resolveActiveRoleAssignment(assignments, {
    role: "president",
    organisationId: session.organisation?.id,
    collegeCode: session.collegeCode,
  }, now);
  if (!active || active.userId !== session.userId || !session.resourceScopes) return null;
  const requiredScope = active.organisationScope.kind === "royal_college"
    ? "signature:royal_college"
    : "signature:college";
  return hasResourceScope(session.resourceScopes, requiredScope) &&
    hasResourceScope(active.resourceScopes, requiredScope)
    ? active
    : null;
}

export function roleAssignmentsOverlap(
  left: RoleAssignment,
  right: RoleAssignment,
) {
  if (left.id === right.id) return false;
  if (left.role !== right.role || left.organisationScope.id !== right.organisationScope.id) return false;
  return timestamp(left.startsAt) < timestamp(right.endsAt) &&
    timestamp(right.startsAt) < timestamp(left.endsAt);
}

export function validateRoleAssignment(
  assignment: RoleAssignment,
  assignments: readonly RoleAssignment[],
) {
  if (
    !isSystemRole(assignment.role) ||
    !isOrganisationScope(assignment.organisationScope) ||
    !Array.isArray(assignment.resourceScopes) ||
    !assignment.resourceScopes.every((scope) => typeof scope === "string")
  ) {
    return "Role, Organisation Scope หรือ Resource Scope ไม่ถูกต้อง";
  }
  if (!assignment.userName.trim() || !assignment.email.trim()) {
    return "กรุณาระบุชื่อและอีเมลผู้ดำรงตำแหน่ง";
  }
  if (!Number.isFinite(timestamp(assignment.startsAt)) || !Number.isFinite(timestamp(assignment.endsAt))) {
    return "รูปแบบวันเริ่มต้นหรือวันสิ้นสุดไม่ถูกต้อง";
  }
  if (timestamp(assignment.startsAt) >= timestamp(assignment.endsAt)) {
    return "วันสิ้นสุดวาระต้องอยู่หลังวันเริ่มต้น";
  }
  if (assignments.some((current) => roleAssignmentsOverlap(current, assignment))) {
    return "วาระซ้อนกับผู้ดำรงตำแหน่ง Role เดียวกันใน Organisation เดียวกัน";
  }
  return null;
}

export function formatAssignmentPeriod(assignment: RoleAssignment) {
  const formatter = new Intl.DateTimeFormat("th-TH", {
    dateStyle: "medium",
    timeZone: "Asia/Bangkok",
  });
  return `${formatter.format(new Date(assignment.startsAt))} - ${formatter.format(new Date(assignment.endsAt))}`;
}
