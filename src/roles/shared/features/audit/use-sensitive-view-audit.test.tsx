import { StrictMode, type ReactNode } from "react";
import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";

import { ORGANISATIONS } from "@/roles/shared/features/roles/access-model";
import type { PortalSession } from "@/roles/shared/features/roles/mock-login";

import { AUDIT_STORAGE_KEY, readAuditEvents } from "./audit-store";
import { useSensitiveViewAudit } from "./use-sensitive-view-audit";

const teacherSession: PortalSession = {
  userId: "teacher-001",
  displayName: "อ. ภก. กิตติพงศ์ วัฒนเภสัช",
  role: "teacher",
  organisation: ORGANISATIONS.siriraj,
  resourceScopes: ["course:offering-bcp-101"],
  signedInAt: "2026-08-18T03:00:00.000Z",
};

describe("useSensitiveViewAudit", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("records an authorized view once per actor and resource", async () => {
    const wrapper = ({ children }: { children: ReactNode }) => (
      <StrictMode>{children}</StrictMode>
    );
    const { result, rerender } = renderHook(
      ({ enabled, resourceId }) => useSensitiveViewAudit({
        enabled,
        session: teacherSession,
        resource: {
          type: "course_roster",
          id: resourceId,
          organisationId: teacherSession.organisation.id,
        },
      }),
      {
        initialProps: { enabled: false, resourceId: "offering-bcp-101" },
        wrapper,
      },
    );

    expect(readAuditEvents().filter((event) => event.action === "sensitive_data.view"))
      .toHaveLength(0);

    rerender({ enabled: true, resourceId: "offering-bcp-101" });
    await waitFor(() => expect(result.current.status).toBe("allowed"));
    await waitFor(() => expect(
      readAuditEvents().filter((event) => event.action === "sensitive_data.view"),
    ).toHaveLength(1));

    rerender({ enabled: true, resourceId: "offering-bcp-101" });
    expect(readAuditEvents().filter((event) => event.action === "sensitive_data.view"))
      .toHaveLength(1);

    rerender({ enabled: true, resourceId: "offering-vpt-301" });
    await waitFor(() => expect(
      readAuditEvents().filter((event) => event.action === "sensitive_data.view"),
    ).toHaveLength(2));

    const latest = readAuditEvents().at(-1);
    expect(latest).toMatchObject({
      actor: {
        userId: teacherSession.userId,
        role: teacherSession.role,
        organisation: teacherSession.organisation,
        resourceScopes: teacherSession.resourceScopes,
      },
      action: "sensitive_data.view",
      resource: {
        type: "course_roster",
        id: "offering-vpt-301",
        organisationId: teacherSession.organisation.id,
      },
      after: { access: "allowed" },
    });
  });

  it("fails closed after an audit write error and allows an explicit retry", async () => {
    window.localStorage.setItem(AUDIT_STORAGE_KEY, "{invalid-json");
    const { result } = renderHook(() => useSensitiveViewAudit({
      enabled: true,
      session: teacherSession,
      resource: {
        type: "course_roster",
        id: "offering-bcp-101",
        organisationId: teacherSession.organisation.id,
      },
    }));

    await waitFor(() => expect(result.current.status).toBe("error"));

    window.localStorage.removeItem(AUDIT_STORAGE_KEY);
    act(() => result.current.retry());

    await waitFor(() => expect(result.current.status).toBe("allowed"));
    expect(readAuditEvents().filter((event) => event.action === "sensitive_data.view"))
      .toHaveLength(1);
  });
});
