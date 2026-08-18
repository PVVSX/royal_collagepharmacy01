import type { AuditEventInput } from "@/roles/shared/features/audit";
import { createAuditActorSnapshot } from "@/roles/shared/features/audit";
import type { PortalSession } from "@/roles/shared/features/roles/mock-login";

export type AuditedSystemSetting = "admissionOpen" | "registrationOpen";

const SETTING_LABELS: Record<AuditedSystemSetting, string> = {
  admissionOpen: "ระบบรับสมัครผู้เข้าศึกษาใหม่",
  registrationOpen: "ระบบลงทะเบียนรายวิชา",
};

export function createSystemSettingAuditInput({
  session,
  setting,
  before,
  after,
  reason,
}: {
  session: PortalSession;
  setting: AuditedSystemSetting;
  before: boolean;
  after: boolean;
  reason: string;
}): AuditEventInput {
  const normalizedReason = reason.trim();
  if (session.role !== "super_admin") {
    throw new Error("เฉพาะผู้ดูแลระบบสูงสุดเท่านั้นที่เปลี่ยน System Settings ได้");
  }
  if (!normalizedReason) {
    throw new Error("กรุณาระบุเหตุผลการเปลี่ยน System Settings");
  }
  return {
    actor: createAuditActorSnapshot(session),
    action: "business_record.update",
    resource: {
      type: "system_setting",
      id: setting,
      label: SETTING_LABELS[setting],
      organisationId: session.organisation.id,
    },
    before: { enabled: before },
    after: { enabled: after },
    reason: normalizedReason,
    evidenceReference: "workspace:/admin/settings",
  };
}

export function commitAuditedSystemSettingChange({
  appendAudit,
  commit,
}: {
  appendAudit: () => unknown;
  commit: () => void;
}) {
  if (!appendAudit()) return "audit_failed" as const;
  commit();
  return "committed" as const;
}
