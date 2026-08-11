import { describe, expect, it } from "vitest";

import {
  DEFAULT_ROLE_ASSIGNMENTS,
  resolveActivePresidentAssignment,
  resolvePresidentSessionAssignment,
  roleAssignmentsOverlap,
  validateRoleAssignment,
  type RoleAssignment,
} from "./role-assignment";

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
      { userId: "president-vpt-current", collegeCode: "วภท." },
      new Date("2027-08-01T00:00:00.000Z"),
    )).toBeNull();
    expect(resolvePresidentSessionAssignment(
      DEFAULT_ROLE_ASSIGNMENTS,
      { userId: "president-vpt-successor", collegeCode: "วภท." },
      new Date("2027-08-01T00:00:00.000Z"),
    )?.id).toBe("term-vpt-2570");
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
      "วาระซ้อนกับผู้ดำรงตำแหน่งในวิทยาลัยเดียวกัน",
    );
  });
});
