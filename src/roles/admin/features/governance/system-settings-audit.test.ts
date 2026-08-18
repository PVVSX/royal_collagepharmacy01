import { describe, expect, it, vi } from "vitest";

import { ORGANISATIONS } from "@/roles/shared/features/roles/access-model";
import type { PortalSession } from "@/roles/shared/features/roles/mock-login";
import {
  commitAuditedSystemSettingChange,
  createSystemSettingAuditInput,
} from "./system-settings-audit";

const superAdminSession: PortalSession = {
  role: "super_admin",
  displayName: "System Admin",
  signedInAt: "2026-08-11T07:30:00.000Z",
  userId: "super-admin",
  organisation: ORGANISATIONS.system,
  resourceScopes: ["*"],
};

describe("audited System Settings", () => {
  it("captures actor, scope, before, after and reason", () => {
    expect(createSystemSettingAuditInput({
      session: superAdminSession,
      setting: "registrationOpen",
      before: true,
      after: false,
      reason: " ปิดรับลงทะเบียนเมื่อสิ้นสุดช่วงเวลา ",
    })).toMatchObject({
      actor: {
        userId: "super-admin",
        role: "super_admin",
        organisation: { id: ORGANISATIONS.system.id },
        resourceScopes: ["*"],
      },
      action: "business_record.update",
      resource: {
        type: "system_setting",
        id: "registrationOpen",
        organisationId: ORGANISATIONS.system.id,
      },
      before: { enabled: true },
      after: { enabled: false },
      reason: "ปิดรับลงทะเบียนเมื่อสิ้นสุดช่วงเวลา",
      evidenceReference: "workspace:/admin/settings",
    });
  });

  it("appends the audit event before committing the setting", () => {
    const order: string[] = [];
    expect(commitAuditedSystemSettingChange({
      appendAudit: () => { order.push("audit"); return { id: "audit-1" }; },
      commit: () => { order.push("commit"); },
    })).toBe("committed");
    expect(order).toEqual(["audit", "commit"]);
  });

  it("fails closed when Audit Log persistence fails", () => {
    const commit = vi.fn();
    expect(commitAuditedSystemSettingChange({
      appendAudit: () => null,
      commit,
    })).toBe("audit_failed");
    expect(commit).not.toHaveBeenCalled();
  });

  it("requires a Super Admin actor and a reason", () => {
    expect(() => createSystemSettingAuditInput({
      session: { ...superAdminSession, role: "student" },
      setting: "admissionOpen",
      before: true,
      after: false,
      reason: "ปิดรับสมัคร",
    })).toThrow("เฉพาะผู้ดูแลระบบสูงสุด");
    expect(() => createSystemSettingAuditInput({
      session: superAdminSession,
      setting: "admissionOpen",
      before: true,
      after: false,
      reason: " ",
    })).toThrow("กรุณาระบุเหตุผล");
  });
});
