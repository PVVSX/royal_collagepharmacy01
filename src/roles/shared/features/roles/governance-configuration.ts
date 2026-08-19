import {
  ORGANISATION_LIST,
  ORGANISATIONS,
  isRoleScopeCompatible,
  isSystemRole,
  type SystemRole,
} from "./access-model";

export const GOVERNANCE_CONFIGURATION_KEY = "royal-college.governance-configuration.v1";

export interface UserAccessAssignment {
  userId: string;
  role: SystemRole;
  organisationId: string;
  resourceScopes: string[];
}

export interface IntegrationConfiguration {
  integrationId: string;
  enabled: boolean;
}

export interface GovernanceConfiguration {
  schemaVersion: 1;
  userAssignments: UserAccessAssignment[];
  integrations: IntegrationConfiguration[];
}

export const DEFAULT_GOVERNANCE_CONFIGURATION: GovernanceConfiguration = {
  schemaVersion: 1,
  userAssignments: [
    { userId: "วภท-2568-001", role: "student", organisationId: ORGANISATIONS.siriraj.id, resourceScopes: ["student:self"] },
    { userId: "teacher-001", role: "teacher", organisationId: ORGANISATIONS.siriraj.id, resourceScopes: ["course:proposal", "course:assigned", "course:offering-bcp-101", "course:offering-vpt-301"] },
    { userId: "institution-admin-001", role: "institution_admin", organisationId: ORGANISATIONS.siriraj.id, resourceScopes: ["institution:org-inst-siriraj"] },
    { userId: "staff-001", role: "royal_college_staff", organisationId: ORGANISATIONS.royalCollege.id, resourceScopes: ["staff:central"] },
    { userId: "president-vpt-current", role: "president", organisationId: ORGANISATIONS.therapeuticCollege.id, resourceScopes: ["signature:college"] },
    { userId: "super-admin", role: "super_admin", organisationId: ORGANISATIONS.system.id, resourceScopes: ["*"] },
  ],
  integrations: [
    { integrationId: "license", enabled: true },
    { integrationId: "payment", enabled: true },
    { integrationId: "email", enabled: true },
    { integrationId: "document", enabled: false },
  ],
};

const USER_IDS = new Set(DEFAULT_GOVERNANCE_CONFIGURATION.userAssignments.map((item) => item.userId));
const INTEGRATION_IDS = new Set(DEFAULT_GOVERNANCE_CONFIGURATION.integrations.map((item) => item.integrationId));
const ORGANISATION_IDS = new Set(ORGANISATION_LIST.map((item) => item.id));
const DEFAULT_TEACHER_ACCESS = DEFAULT_GOVERNANCE_CONFIGURATION.userAssignments.find((item) => (
  item.userId === "teacher-001"
))!;
const LEGACY_DEFAULT_TEACHER_SCOPES = [
  "course:proposal",
  "course:offering-bcp-101",
  "course:offering-vpt-301",
] as const;

function cloneConfiguration(configuration: GovernanceConfiguration): GovernanceConfiguration {
  return {
    schemaVersion: 1,
    userAssignments: configuration.userAssignments.map((item) => ({
      ...item,
      resourceScopes: [...item.resourceScopes],
    })),
    integrations: configuration.integrations.map((item) => ({ ...item })),
  };
}

function normalizeResourceScopes(scopes: readonly string[]) {
  return [...new Set(scopes.map((scope) => scope.trim()).filter(Boolean))];
}

function hasExactlyScopes(scopes: readonly string[], expected: readonly string[]) {
  return scopes.length === expected.length && expected.every((scope) => scopes.includes(scope));
}

export function migrateKnownLegacyTeacherResourceScopes(
  assignment: Pick<UserAccessAssignment, "userId" | "role" | "organisationId" | "resourceScopes">,
) {
  const resourceScopes = normalizeResourceScopes(assignment.resourceScopes);
  const isKnownLegacyTeacherDefault = assignment.userId === DEFAULT_TEACHER_ACCESS.userId &&
    assignment.role === DEFAULT_TEACHER_ACCESS.role &&
    assignment.organisationId === DEFAULT_TEACHER_ACCESS.organisationId &&
    hasExactlyScopes(resourceScopes, LEGACY_DEFAULT_TEACHER_SCOPES);
  return isKnownLegacyTeacherDefault
    ? [...DEFAULT_TEACHER_ACCESS.resourceScopes]
    : resourceScopes;
}

function isStoredAssignment(value: unknown): value is UserAccessAssignment {
  if (!value || typeof value !== "object") return false;
  const item = value as Partial<UserAccessAssignment>;
  const organisation = ORGANISATION_LIST.find((candidate) => candidate.id === item.organisationId);
  return typeof item.userId === "string" &&
    USER_IDS.has(item.userId) &&
    isSystemRole(item.role) &&
    Boolean(organisation) &&
    Array.isArray(item.resourceScopes) &&
    item.resourceScopes.every((scope) => typeof scope === "string") &&
    isRoleScopeCompatible(
      item.role,
      organisation!,
      normalizeResourceScopes(item.resourceScopes),
    );
}

function isStoredIntegration(value: unknown): value is IntegrationConfiguration {
  if (!value || typeof value !== "object") return false;
  const item = value as Partial<IntegrationConfiguration>;
  return typeof item.integrationId === "string" &&
    INTEGRATION_IDS.has(item.integrationId) &&
    typeof item.enabled === "boolean";
}

export function normalizeGovernanceConfiguration(value: unknown): GovernanceConfiguration {
  if (!value || typeof value !== "object") {
    return cloneConfiguration(DEFAULT_GOVERNANCE_CONFIGURATION);
  }
  const stored = value as Partial<GovernanceConfiguration>;
  if (stored.schemaVersion !== 1) {
    return cloneConfiguration(DEFAULT_GOVERNANCE_CONFIGURATION);
  }

  const storedAssignments = Array.isArray(stored.userAssignments)
    ? stored.userAssignments.filter(isStoredAssignment)
    : [];
  const storedIntegrations = Array.isArray(stored.integrations)
    ? stored.integrations.filter(isStoredIntegration)
    : [];

  return {
    schemaVersion: 1,
    userAssignments: DEFAULT_GOVERNANCE_CONFIGURATION.userAssignments.map((fallback) => {
      const storedAssignment = storedAssignments.find((item) => item.userId === fallback.userId);
      if (!storedAssignment) {
        return { ...fallback, resourceScopes: [...fallback.resourceScopes] };
      }
      return {
        ...storedAssignment,
        resourceScopes: migrateKnownLegacyTeacherResourceScopes(storedAssignment),
      };
    }),
    integrations: DEFAULT_GOVERNANCE_CONFIGURATION.integrations.map((fallback) => ({
      ...(storedIntegrations.find((item) => item.integrationId === fallback.integrationId) ?? fallback),
    })),
  };
}

export function readGovernanceConfiguration(): GovernanceConfiguration {
  const serialized = window.localStorage.getItem(GOVERNANCE_CONFIGURATION_KEY);
  if (!serialized) return cloneConfiguration(DEFAULT_GOVERNANCE_CONFIGURATION);
  try {
    return normalizeGovernanceConfiguration(JSON.parse(serialized) as unknown);
  } catch {
    return cloneConfiguration(DEFAULT_GOVERNANCE_CONFIGURATION);
  }
}

export function persistGovernanceConfiguration(configuration: GovernanceConfiguration) {
  window.localStorage.setItem(GOVERNANCE_CONFIGURATION_KEY, JSON.stringify(configuration));
}

export function updateUserAccessAssignment(
  configuration: GovernanceConfiguration,
  assignment: UserAccessAssignment,
) {
  if (!USER_IDS.has(assignment.userId)) throw new Error("ไม่พบบัญชีผู้ใช้");
  if (!isSystemRole(assignment.role)) throw new Error("Role ไม่อยู่ในรายการที่ระบบรองรับ");
  if (!ORGANISATION_IDS.has(assignment.organisationId)) throw new Error("ไม่พบ Organisation Scope");
  const resourceScopes = normalizeResourceScopes(assignment.resourceScopes);
  if (resourceScopes.length === 0) throw new Error("กรุณาระบุ Resource Scope อย่างน้อยหนึ่งรายการ");
  const organisation = ORGANISATION_LIST.find((item) => item.id === assignment.organisationId)!;
  if (!isRoleScopeCompatible(assignment.role, organisation, resourceScopes)) {
    throw new Error("Role, Organisation Scope และ Resource Scope ไม่สอดคล้องกัน");
  }
  return {
    ...cloneConfiguration(configuration),
    userAssignments: configuration.userAssignments.map((item) => item.userId === assignment.userId
      ? { ...assignment, resourceScopes }
      : { ...item, resourceScopes: [...item.resourceScopes] }),
  } satisfies GovernanceConfiguration;
}

export function updateIntegrationConfiguration(
  configuration: GovernanceConfiguration,
  integrationId: string,
  enabled: boolean,
) {
  if (!INTEGRATION_IDS.has(integrationId)) throw new Error("ไม่พบ Integration");
  return {
    ...cloneConfiguration(configuration),
    integrations: configuration.integrations.map((item) => item.integrationId === integrationId
      ? { integrationId, enabled }
      : { ...item }),
  } satisfies GovernanceConfiguration;
}

export type GovernanceCommitResult = "committed" | "audit_failed" | "storage_failed";

export function commitAuditedGovernanceChange({
  next,
  appendAudit,
  persist,
  commit,
}: {
  next: GovernanceConfiguration;
  appendAudit: () => unknown;
  persist: (configuration: GovernanceConfiguration) => void;
  commit: (configuration: GovernanceConfiguration) => void;
}): GovernanceCommitResult {
  if (!appendAudit()) return "audit_failed";
  try {
    persist(next);
  } catch {
    return "storage_failed";
  }
  commit(next);
  return "committed";
}
