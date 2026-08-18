import { describe, expect, it } from "vitest";

import {
  DEFAULT_ROLE_ASSIGNMENTS,
  resolveActivePresidentAssignment,
  resolvePresidentSessionAssignment,
  roleAssignmentsOverlap,
  validateRoleAssignment,
  type RoleAssignment,
} from "./role-assignment";
import { ORGANISATIONS } from "./access-model";
import { normalizeStoredRoleAssignment } from "./role-assignment-store";

describe("role assignment effective dates", () => {
  it("uses an inclusive start and exclusive end", () => {
    expect(resolveActivePresidentAssignment(
      DEFAULT_ROLE_ASSIGNMENTS,
      "วภท.",
      new Date("2026-08-01T00:00:00.000Z"),
    )?.id).toBe("term-vpt-2569");

    expect(resolveActivePresidentAssignment(
      DEFAULT_ROLE_ASSIGNMENTS,
      "วภท.",
      new Date("2027-08-01T00:00:00.000Z"),
    )?.id).toBe("term-vpt-2570");
  });

  it("returns no president outside every effective term", () => {
    expect(resolveActivePresidentAssignment(
      DEFAULT_ROLE_ASSIGNMENTS,
      "วภท.",
      new Date("2032-01-01T00:00:00.000Z"),
    )).toBeNull();
  });

  it("does not let an expired president inherit the successor assignment", () => {
    expect(resolvePresidentSessionAssignment(
      DEFAULT_ROLE_ASSIGNMENTS,
      { userId: "president-vpt-current", collegeCode: "วภท.", resourceScopes: ["signature:college"] },
      new Date("2027-08-01T00:00:00.000Z"),
    )).toBeNull();
    expect(resolvePresidentSessionAssignment(
      DEFAULT_ROLE_ASSIGNMENTS,
      { userId: "president-vpt-successor", collegeCode: "วภท.", resourceScopes: ["signature:college"] },
      new Date("2027-08-01T00:00:00.000Z"),
    )?.id).toBe("term-vpt-2570");
  });

  it("denies a current President when the session resource scope does not match the active term", () => {
    const now = new Date("2026-08-11T00:00:00.000Z");
    expect(resolvePresidentSessionAssignment(
      DEFAULT_ROLE_ASSIGNMENTS,
      {
        userId: "president-vpt-current",
        organisation: ORGANISATIONS.therapeuticCollege,
        resourceScopes: ["signature:royal_college"],
      },
      now,
    )).toBeNull();
    expect(resolvePresidentSessionAssignment(
      DEFAULT_ROLE_ASSIGNMENTS,
      {
        userId: "president-vpt-current",
        organisation: ORGANISATIONS.royalCollege,
        resourceScopes: ["signature:college"],
      },
      now,
    )).toBeNull();
  });

  it("scopes active presidents by college", () => {
    expect(resolveActivePresidentAssignment(
      DEFAULT_ROLE_ASSIGNMENTS,
      "วภช.",
      new Date("2026-08-11T00:00:00.000Z"),
    )?.userId).toBe("president-vpc-current");
  });

  it("rejects overlapping terms in the same role and college", () => {
    const candidate: RoleAssignment = {
      ...DEFAULT_ROLE_ASSIGNMENTS[1],
      id: "overlap",
      startsAt: "2027-01-01T00:00:00.000Z",
      endsAt: "2027-12-01T00:00:00.000Z",
    };

    expect(roleAssignmentsOverlap(DEFAULT_ROLE_ASSIGNMENTS[1], candidate)).toBe(true);
    expect(validateRoleAssignment(candidate, DEFAULT_ROLE_ASSIGNMENTS)).toBe(
      "วาระซ้อนกับผู้ดำรงตำแหน่ง Role เดียวกันใน Organisation เดียวกัน",
    );
  });

  it.each([
    ["member", "student", ORGANISATIONS.siriraj.id],
    ["staff", "royal_college_staff", ORGANISATIONS.royalCollege.id],
    ["finance_officer", "royal_college_staff", ORGANISATIONS.royalCollege.id],
    ["college_president", "president", ORGANISATIONS.therapeuticCollege.id],
  ] as const)("normalizes legacy %s assignments", (legacyRole, role, organisationId) => {
    const normalized = normalizeStoredRoleAssignment({
      id: `legacy-${legacyRole}`,
      userId: `user-${legacyRole}`,
      userName: "Legacy User",
      email: "legacy@example.org",
      role: legacyRole,
      collegeCode: "วภท.",
      collegeName: "วิทยาลัยเภสัชบำบัดแห่งประเทศไทย",
      startsAt: "2026-01-01T00:00:00.000Z",
      endsAt: "2027-01-01T00:00:00.000Z",
      appointedBy: "System Admin",
    });
    expect(normalized).toMatchObject({
      role,
      organisationScope: { id: organisationId },
    });
  });
});
