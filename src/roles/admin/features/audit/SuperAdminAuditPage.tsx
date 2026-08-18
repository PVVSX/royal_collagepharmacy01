"use client";

import { useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PageShell } from "@/roles/shared/components/layout/PageShell";
import {
  EmptyState,
  LoadingState,
  WorkspaceHeader,
} from "@/roles/shared/components/workspace/WorkspacePrimitives";
import { useAuditLog } from "@/roles/shared/features/audit";
import {
  ROLE_PRESENTATION,
  SYSTEM_ROLES,
  type SystemRole,
} from "@/roles/shared/features/roles/access-model";

function auditRoleLabel(role: SystemRole | "system_actor") {
  return role === "system_actor" ? "System Actor" : ROLE_PRESENTATION[role].label;
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("th-TH", {
    dateStyle: "medium",
    timeStyle: "medium",
    timeZone: "Asia/Bangkok",
  }).format(new Date(value));
}

export default function SuperAdminAuditPage() {
  const { events, isReady, storageError } = useAuditLog();
  const [query, setQuery] = useState("");
  const [role, setRole] = useState<SystemRole | "system_actor" | "all">("all");
  const [selectedId, setSelectedId] = useState("");

  const visible = useMemo(() => [...events]
    .reverse()
    .filter((event) => {
      const matchesRole = role === "all" || event.actor.role === role;
      const haystack = `${event.actor.userName} ${event.actor.userId} ${event.action} ${event.resource.id} ${event.resource.label ?? ""}`.toLowerCase();
      return matchesRole && haystack.includes(query.toLowerCase());
    }), [events, query, role]);
  const selected = events.find((event) => event.id === selectedId);

  if (!isReady) {
    return (
      <PageShell size="full">
        <LoadingState label="กำลังโหลด User Audit Log" />
      </PageShell>
    );
  }

  return (
    <PageShell size="full" className="space-y-6">
      <WorkspaceHeader
        eyebrow="Append-only history"
        title="User Audit Log"
        description="ตรวจผู้ดำเนินการ Role ขณะทำรายการ Organisation Resource ข้อมูลก่อน–หลัง เหตุผล หลักฐาน และเวลา"
      />

      {storageError ? (
        <div role="alert" className="rounded-xl border border-warning-border bg-warning-soft p-3 text-sm text-warning-on-soft">
          {storageError}
        </div>
      ) : null}

      <Card className="border-border">
        <CardHeader className="gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <CardTitle className="text-lg">เหตุการณ์ทั้งหมด</CardTitle>
            <p className="mt-1 text-xs text-muted-foreground">
              {visible.length} จาก {events.length} เหตุการณ์ · ไม่มี Action แก้ไขหรือลบ
            </p>
          </div>
          <div className="grid gap-2 sm:grid-cols-[minmax(15rem,1fr)_12rem]">
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              aria-label="ค้นหา Audit Log"
              placeholder="ค้นหาผู้ใช้ Action หรือ Resource"
            />
            <select
              value={role}
              onChange={(event) => setRole(event.target.value as typeof role)}
              aria-label="กรองตาม Role"
              className="h-10 rounded-xl border border-input bg-background px-3 text-sm"
            >
              <option value="all">ทุก Role</option>
              {SYSTEM_ROLES.map((item) => (
                <option key={item} value={item}>{ROLE_PRESENTATION[item].label}</option>
              ))}
            </select>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] text-left text-sm">
              <thead className="bg-muted/40 text-xs text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-medium">เวลา</th>
                  <th className="px-4 py-3 font-medium">ผู้ดำเนินการ</th>
                  <th className="px-4 py-3 font-medium">Action</th>
                  <th className="px-4 py-3 font-medium">Resource</th>
                  <th className="px-4 py-3 font-medium">Organisation</th>
                  <th className="px-4 py-3 font-medium">หลักฐาน</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {visible.map((event) => (
                  <tr
                    key={event.id}
                    tabIndex={0}
                    role="button"
                    aria-label={`ดูรายละเอียด ${event.action} ${event.resource.id}`}
                    onClick={() => setSelectedId(event.id)}
                    onKeyDown={(keyboardEvent) => {
                      if (keyboardEvent.key === "Enter" || keyboardEvent.key === " ") {
                        keyboardEvent.preventDefault();
                        setSelectedId(event.id);
                      }
                    }}
                    className="cursor-pointer hover:bg-muted/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
                  >
                    <td className="whitespace-nowrap px-4 py-3 text-xs text-muted-foreground">
                      {formatDateTime(event.occurredAt)}
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium">{event.actor.userName}</p>
                      <p className="text-xs text-muted-foreground">
                        {auditRoleLabel(event.actor.role)} · {event.actor.userId}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="secondary">{event.action}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <p>{event.resource.label ?? event.resource.id}</p>
                      <p className="text-xs text-muted-foreground">
                        {event.resource.type} · {event.resource.id}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {event.actor.organisation.name}
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {event.evidenceReference ?? "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {visible.length === 0 ? (
            <div className="p-5">
              <EmptyState
                title="ไม่พบเหตุการณ์"
                description="ลองเปลี่ยนคำค้นหรือ Role ที่ใช้กรอง"
              />
            </div>
          ) : null}
        </CardContent>
      </Card>

      {selected ? (
        <Card className="border-primary/30" aria-live="polite">
          <CardHeader>
            <div className="flex items-start justify-between gap-3">
              <div>
                <CardTitle className="text-lg">รายละเอียดเหตุการณ์</CardTitle>
                <p className="mt-1 break-all text-xs text-muted-foreground">{selected.id}</p>
              </div>
              <button
                type="button"
                className="rounded-lg p-2 text-muted-foreground hover:bg-muted"
                onClick={() => setSelectedId("")}
                aria-label="ปิดรายละเอียด"
              >
                <span aria-hidden="true" className="material-symbols-outlined">close</span>
              </button>
            </div>
          </CardHeader>
          <CardContent className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-xl bg-muted/40 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Before</p>
              <pre className="mt-2 overflow-x-auto whitespace-pre-wrap break-words text-xs text-foreground">
                {JSON.stringify(selected.before, null, 2)}
              </pre>
            </div>
            <div className="rounded-xl bg-muted/40 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">After</p>
              <pre className="mt-2 overflow-x-auto whitespace-pre-wrap break-words text-xs text-foreground">
                {JSON.stringify(selected.after, null, 2)}
              </pre>
            </div>
            <dl className="grid gap-3 text-sm sm:grid-cols-2 lg:col-span-2">
              <div>
                <dt className="text-xs text-muted-foreground">เหตุผล</dt>
                <dd className="mt-1 text-foreground">{selected.reason ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Evidence Reference</dt>
                <dd className="mt-1 text-foreground">{selected.evidenceReference ?? "—"}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>
      ) : null}
    </PageShell>
  );
}
