"use client";

import { useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PageShell } from "@/roles/shared/components/layout/PageShell";
import { formatSubjectResultValue } from "@/roles/shared/features/academic";
import { useAuditLog } from "@/roles/shared/features/audit";
import { StaffPageHeader } from "@/roles/staff/components/StaffPageHeader";

const RESULT_VALUE_KEYS = new Set(["draftValue", "currentValue", "previousValue", "newValue"]);

function formatAuditSnapshot(value: unknown) {
  return JSON.stringify(value, (key, nestedValue) => (
    RESULT_VALUE_KEYS.has(key) && (nestedValue === "S" || nestedValue === "U")
      ? formatSubjectResultValue(nestedValue)
      : nestedValue
  ));
}

function formatDateTime(value: string) {
  return new Date(value).toLocaleString("th-TH", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Bangkok" });
}

export default function StaffAuditPage() {
  const { events, isReady, storageError } = useAuditLog();
  const [search, setSearch] = useState("");
  const filtered = useMemo(() => {
    const query = search.trim().toLocaleLowerCase("th-TH");
    return events
      .filter((event) => ["registration.", "request.", "result.", "course_proposal.", "payment.", "document.", "sensitive_data."].some((prefix) => event.action.startsWith(prefix)))
      .filter((event) => !query || [event.action, event.resource.id, event.resource.label ?? "", event.actor.userName, event.reason ?? "", event.evidenceReference ?? ""].some((value) => value.toLocaleLowerCase("th-TH").includes(query)))
      .sort((left, right) => right.occurredAt.localeCompare(left.occurredAt));
  }, [events, search]);

  return (
    <PageShell size="full" className="space-y-6">
      <StaffPageHeader title="Business Audit History" description="ประวัติแบบอ่านอย่างเดียวของ Action สำคัญ พร้อม Role, Organisation Scope, ค่าก่อนหลัง เหตุผล และหลักฐานอ้างอิง" eyebrow="Append-only User Audit Log" />
      {storageError ? <div role="alert" className="rounded-2xl border border-warning-border bg-warning-soft p-3 text-sm text-warning-on-soft">{storageError}</div> : null}
      <Card><CardContent className="space-y-4 px-4 md:px-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"><div><h2 className="font-semibold">เหตุการณ์ล่าสุด</h2><p className="mt-1 text-xs text-muted-foreground">ผู้ใช้ทั่วไปแก้ไขหรือลบประวัตินี้ไม่ได้</p></div><Input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="ค้นหา Action, Resource, ผู้ใช้ หรือหลักฐาน" aria-label="ค้นหา Business Audit" className="sm:w-80" /></div>
        <div className="space-y-3" aria-live="polite">
          {!isReady ? <div className="flex min-h-40 items-center justify-center gap-2 text-sm text-muted-foreground" role="status"><span aria-hidden="true" className="material-symbols-outlined animate-spin">progress_activity</span>กำลังโหลด Audit Log</div> : filtered.map((event) => <article key={event.id} className="rounded-2xl border border-border bg-card p-4"><div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between"><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><Badge variant="info">{event.action}</Badge><span className="break-all font-mono text-xs font-medium">{event.resource.id}</span>{event.resource.label ? <span className="text-xs text-muted-foreground">{event.resource.label}</span> : null}</div><p className="mt-2 text-sm font-medium">{event.actor.userName}</p><p className="text-xs text-muted-foreground">{event.actor.role} · {event.actor.organisation.name}</p></div><time className="shrink-0 text-xs text-muted-foreground" dateTime={event.occurredAt}>{formatDateTime(event.occurredAt)}</time></div><dl className="mt-4 grid gap-3 rounded-xl bg-muted/40 p-3 text-xs sm:grid-cols-2 lg:grid-cols-4"><div><dt className="text-muted-foreground">ก่อนดำเนินการ</dt><dd className="mt-1 break-words font-mono font-medium">{formatAuditSnapshot(event.before)}</dd></div><div><dt className="text-muted-foreground">หลังดำเนินการ</dt><dd className="mt-1 break-words font-mono font-medium">{formatAuditSnapshot(event.after)}</dd></div><div><dt className="text-muted-foreground">เหตุผล</dt><dd className="mt-1 font-medium">{event.reason ?? "—"}</dd></div><div><dt className="text-muted-foreground">หลักฐานอ้างอิง</dt><dd className="mt-1 break-all font-mono font-medium">{event.evidenceReference ?? "—"}</dd></div></dl></article>)}
          {isReady && filtered.length === 0 ? <div className="rounded-2xl border border-dashed border-border py-14 text-center"><span aria-hidden="true" className="material-symbols-outlined text-4xl text-muted-foreground">history_toggle_off</span><p className="mt-2 text-sm font-medium">ไม่พบเหตุการณ์ที่ตรงกับคำค้นหา</p></div> : null}
        </div>
      </CardContent></Card>
    </PageShell>
  );
}
