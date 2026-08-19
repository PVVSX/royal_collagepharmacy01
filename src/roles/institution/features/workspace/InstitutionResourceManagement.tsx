"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useMockDb } from "@/providers/mock-db-provider";
import { usePortalSession } from "@/roles/shared/features/roles/use-portal-session";

import {
  friendlyInstitutionError,
  institutionActor,
} from "./institution-workspace-utils";

interface ManagedStudent {
  id: string;
  label: string;
  studentId: string;
  active: boolean;
}

export default function InstitutionResourceManagement({
  section,
}: {
  section: "students";
}) {
  const db = useMockDb();
  const { session } = usePortalSession();
  const actor = institutionActor(session);
  const [selected, setSelected] = useState<ManagedStudent | null>(null);
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");
  const institutionId = actor?.organisationId ?? "";

  const records = useMemo<ManagedStudent[]>(() => (
    db.studentAffiliations
      .filter((item) => item.institutionId === institutionId)
      .map((item) => ({
        id: item.id,
        label: db.academicStudents.find((student) => student.id === item.studentId)?.name ?? item.studentId,
        studentId: item.studentId,
        active: item.status === "active",
      }))
  ), [db.academicStudents, db.studentAffiliations, institutionId]);

  const close = () => {
    setSelected(null);
    setReason("");
    setError("");
  };

  const submit = () => {
    if (!selected || !actor) return;
    const normalizedReason = reason.trim();
    if (!normalizedReason) {
      setError("กรุณาระบุเหตุผลของการเปลี่ยนสถานะ");
      return;
    }
    try {
      db.updateAffiliationStatus({
        affiliationType: "student",
        affiliationId: selected.id,
        status: selected.active ? "inactive" : "active",
        actor,
        reason: normalizedReason,
      });
      toast.success("บันทึกสถานะผู้เรียนแล้ว");
      close();
    } catch (cause) {
      setError(friendlyInstitutionError(cause, "ไม่สามารถเปลี่ยนสถานะได้ กรุณาลองอีกครั้ง"));
    }
  };

  return (
    <Card data-section={section} className="border-border">
      <CardHeader>
        <CardTitle className="text-lg">จัดการสถานะผู้เรียนในสถาบัน</CardTitle>
        <p className="text-sm text-muted-foreground">
          เปลี่ยนสถานะความสัมพันธ์ของผู้เรียนภายในสถาบัน พร้อมบันทึกเหตุผลทุกครั้ง
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        {records.map((record) => (
          <div
            key={record.id}
            className="flex flex-col gap-3 rounded-xl border border-border p-3 sm:flex-row sm:items-center"
          >
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-foreground">{record.label}</p>
              <p className="mt-1 text-xs text-muted-foreground">{record.studentId}</p>
            </div>
            <Badge variant={record.active ? "success" : "secondary"}>
              {record.active ? "กำลังสังกัด" : "สิ้นสุดการสังกัด"}
            </Badge>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setSelected(record)}
            >
              {record.active ? "สิ้นสุดการสังกัด" : "เปิดสถานะอีกครั้ง"}
            </Button>
          </div>
        ))}
      </CardContent>

      <Dialog open={Boolean(selected)} onOpenChange={(open) => { if (!open) close(); }}>
        <DialogContent aria-describedby="institution-student-change-description">
          <DialogHeader>
            <DialogTitle>ยืนยันการเปลี่ยนสถานะผู้เรียน</DialogTitle>
            <DialogDescription id="institution-student-change-description">
              {selected?.label} · ระบบจะบันทึกผู้ดำเนินการ ข้อมูลก่อนและหลัง เหตุผล และเวลา
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-1.5">
            <label htmlFor="institution-student-change-reason" className="text-sm font-medium">
              เหตุผล <span aria-hidden="true" className="text-danger">*</span>
            </label>
            <Textarea
              id="institution-student-change-reason"
              value={reason}
              onChange={(event) => {
                setReason(event.target.value);
                setError("");
              }}
              aria-invalid={Boolean(error)}
              aria-describedby={error ? "institution-student-change-error" : undefined}
            />
            {error ? (
              <p id="institution-student-change-error" role="alert" className="text-sm text-danger">
                {error}
              </p>
            ) : null}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={close}>ยกเลิก</Button>
            <Button type="button" onClick={submit}>ยืนยัน</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
