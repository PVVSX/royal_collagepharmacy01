"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useMockDb } from "@/providers/mock-db-provider";
import {
  EmptyState,
  WorkspaceHeader,
} from "@/roles/shared/components/workspace/WorkspacePrimitives";
import {
  isAcademicAffiliationActive,
  isAcademicAssignmentActive,
} from "@/roles/shared/features/academic";
import { usePortalSession } from "@/roles/shared/features/roles/use-portal-session";

import {
  dateInputValue,
  formatInstitutionDate,
  friendlyInstitutionError,
  institutionActor,
} from "./institution-workspace-utils";

type TeacherDialog =
  | { mode: "add" }
  | { mode: "edit" | "end"; teacherId: string; teacherName: string }
  | null;

function isoDate(value: string) {
  return new Date(`${value}T00:00:00.000Z`).toISOString();
}

export default function InstitutionTeachersSection() {
  const db = useMockDb();
  const { session } = usePortalSession();
  const actor = institutionActor(session);
  const institutionId = actor?.organisationId ?? "";
  const [dialog, setDialog] = useState<TeacherDialog>(null);
  const [name, setName] = useState("");
  const [startsAt, setStartsAt] = useState(dateInputValue(new Date().toISOString()));
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");

  const offeringIds = useMemo(() => new Set(
    db.courseOfferings
      .filter((offering) => offering.institutionId === institutionId)
      .map((offering) => offering.id),
  ), [db.courseOfferings, institutionId]);
  const teacherRecords = useMemo(() => (
    db.teacherAffiliations
      .filter((affiliation) => affiliation.institutionId === institutionId)
      .map((affiliation) => ({
        affiliation,
        teacher: db.academicTeachers.find((teacher) => teacher.id === affiliation.teacherId),
        activeAssignmentCount: db.teachingAssignments.filter((assignment) => (
          assignment.institutionId === institutionId &&
          assignment.teacherId === affiliation.teacherId &&
          offeringIds.has(assignment.courseOfferingId) &&
          assignment.status === "accepted" &&
          isAcademicAssignmentActive(assignment)
        )).length,
        pendingAssignmentCount: db.teachingAssignments.filter((assignment) => (
          assignment.institutionId === institutionId &&
          offeringIds.has(assignment.courseOfferingId) &&
          (assignment.teacherId === affiliation.teacherId || assignment.pendingChanges?.teacherId === affiliation.teacherId) &&
          (assignment.status === "pending_teacher_response" || Boolean(assignment.pendingChanges))
        )).length,
      }))
      .filter((record) => Boolean(record.teacher))
      .sort((a, b) => Number(isAcademicAffiliationActive(b.affiliation)) - Number(isAcademicAffiliationActive(a.affiliation)))
  ), [db.academicTeachers, db.teacherAffiliations, db.teachingAssignments, institutionId, offeringIds]);

  const resetDialog = () => {
    setDialog(null);
    setName("");
    setStartsAt(dateInputValue(new Date().toISOString()));
    setReason("");
    setError("");
  };

  const openAdd = () => {
    resetDialog();
    setDialog({ mode: "add" });
  };

  const openEdit = (teacherId: string, teacherName: string) => {
    resetDialog();
    setName(teacherName);
    setDialog({ mode: "edit", teacherId, teacherName });
  };

  const openEnd = (teacherId: string, teacherName: string) => {
    resetDialog();
    setDialog({ mode: "end", teacherId, teacherName });
  };

  const submit = () => {
    if (!dialog || !actor) return;
    const normalizedName = name.trim();
    const normalizedReason = reason.trim();
    if (dialog.mode !== "end" && !normalizedName) {
      setError("กรุณาระบุชื่ออาจารย์");
      return;
    }
    if (dialog.mode === "add" && !startsAt) {
      setError("กรุณาระบุวันที่เริ่มสังกัด");
      return;
    }
    if (!normalizedReason) {
      setError("กรุณาระบุเหตุผลเพื่อใช้ตรวจสอบย้อนหลัง");
      return;
    }

    try {
      if (dialog.mode === "add") {
        db.addInstitutionTeacher({
          actor,
          name: normalizedName,
          startsAt: isoDate(startsAt),
          reason: normalizedReason,
        });
        toast.success("เพิ่มอาจารย์ในสถาบันแล้ว");
      } else if (dialog.mode === "edit") {
        db.updateInstitutionTeacher({
          actor,
          teacherId: dialog.teacherId,
          name: normalizedName,
          reason: normalizedReason,
        });
        toast.success("แก้ไขข้อมูลอาจารย์แล้ว");
      } else {
        db.endInstitutionTeacherAffiliation({
          actor,
          teacherId: dialog.teacherId,
          reason: normalizedReason,
        });
        toast.success("สิ้นสุดการสังกัดของอาจารย์แล้ว");
      }
      resetDialog();
    } catch (cause) {
      setError(friendlyInstitutionError(cause, "ไม่สามารถบันทึกข้อมูลอาจารย์ได้ กรุณาลองอีกครั้ง"));
    }
  };

  const title = dialog?.mode === "add"
    ? "เพิ่มอาจารย์ในสถาบัน"
    : dialog?.mode === "edit"
      ? "แก้ไขข้อมูลอาจารย์"
      : "สิ้นสุดการสังกัด";

  return (
    <>
      <WorkspaceHeader
        eyebrow="บุคลากรของสถาบัน"
        title="อาจารย์"
        description="เพิ่ม แก้ไข และสิ้นสุดการสังกัดของอาจารย์ โดยทุกการเปลี่ยนแปลงมีเหตุผลสำหรับตรวจสอบย้อนหลัง"
      />

      <div id="add-institution-teacher" className="flex justify-end">
        <Button type="button" onClick={openAdd}>
          <span aria-hidden="true" className="material-symbols-outlined text-lg">person_add</span>
          เพิ่มอาจารย์
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {teacherRecords.map(({ affiliation, teacher, activeAssignmentCount, pendingAssignmentCount }) => {
          if (!teacher) return null;
          const active = isAcademicAffiliationActive(affiliation);
          return (
            <Card key={affiliation.id} className="border-border">
              <CardContent className="space-y-4 p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="truncate font-semibold text-foreground">{teacher.name}</h2>
                    <p className="mt-1 text-xs text-muted-foreground">{teacher.id}</p>
                  </div>
                  <Badge variant={active ? "success" : "secondary"}>
                    {active ? "กำลังสังกัด" : "สิ้นสุดการสังกัด"}
                  </Badge>
                </div>
                <div className="space-y-1 text-sm text-muted-foreground">
                  <p>เริ่มสังกัด {formatInstitutionDate(affiliation.startsAt)}</p>
                  <p>กำลังสอน {activeAssignmentCount} รายวิชา</p>
                  <p>รอตอบรับการมอบหมายหรือข้อมูลใหม่ {pendingAssignmentCount} รายการ</p>
                </div>
                <div className="flex flex-wrap gap-2 border-t border-border pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => openEdit(teacher.id, teacher.name)}
                  >
                    <span aria-hidden="true" className="material-symbols-outlined text-base">edit</span>
                    แก้ไข
                  </Button>
                  {active ? (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => openEnd(teacher.id, teacher.name)}
                    >
                      <span aria-hidden="true" className="material-symbols-outlined text-base">person_remove</span>
                      สิ้นสุดการสังกัด
                    </Button>
                  ) : null}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {teacherRecords.length === 0 ? (
        <EmptyState
          icon="person_add"
          title="ยังไม่มีอาจารย์ในสถาบัน"
          description="เพิ่มอาจารย์ก่อนเริ่มมอบหมายการสอน"
        />
      ) : null}

      <Dialog open={Boolean(dialog)} onOpenChange={(open) => { if (!open) resetDialog(); }}>
        <DialogContent aria-describedby="institution-teacher-dialog-description">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription id="institution-teacher-dialog-description">
              {dialog?.mode === "end"
                ? `${dialog.teacherName} จะไม่สามารถรับการมอบหมายใหม่ในสถาบันนี้`
                : dialog?.mode === "add"
                  ? "เพิ่มข้อมูลและการสังกัดในหน้าปฏิบัติงานนี้ ส่วนบัญชีเข้าใช้ระบบจัดการโดยผู้ดูแลระบบ"
                  : "กรอกข้อมูลที่จำเป็นและระบุเหตุผลของการเปลี่ยนแปลง"}
            </DialogDescription>
          </DialogHeader>

          {error ? (
            <div id="institution-teacher-error" role="alert" className="flex gap-2 rounded-xl border border-danger-border bg-danger-soft p-3 text-sm text-danger-on-soft">
              <span aria-hidden="true" className="material-symbols-outlined shrink-0 text-lg">cancel</span>
              <span>{error}</span>
            </div>
          ) : null}

          {dialog?.mode !== "end" ? (
            <div className="space-y-1.5">
              <label htmlFor="institution-teacher-name" className="text-sm font-medium">
                ชื่ออาจารย์ <span aria-hidden="true" className="text-danger">*</span>
              </label>
              <Input
                id="institution-teacher-name"
                value={name}
                onChange={(event) => { setName(event.target.value); setError(""); }}
                aria-invalid={Boolean(error && !name.trim())}
                aria-describedby={error ? "institution-teacher-error" : undefined}
                autoComplete="name"
              />
            </div>
          ) : null}

          {dialog?.mode === "add" ? (
            <div className="space-y-1.5">
              <label htmlFor="institution-teacher-start" className="text-sm font-medium">
                วันที่เริ่มสังกัด <span aria-hidden="true" className="text-danger">*</span>
              </label>
              <Input
                id="institution-teacher-start"
                type="date"
                value={startsAt}
                onChange={(event) => { setStartsAt(event.target.value); setError(""); }}
                aria-invalid={Boolean(error && !startsAt)}
                aria-describedby={error ? "institution-teacher-error" : undefined}
              />
            </div>
          ) : null}

          <div className="space-y-1.5">
            <label htmlFor="institution-teacher-reason" className="text-sm font-medium">
              เหตุผล <span aria-hidden="true" className="text-danger">*</span>
            </label>
            <Textarea
              id="institution-teacher-reason"
              value={reason}
              onChange={(event) => { setReason(event.target.value); setError(""); }}
              aria-invalid={Boolean(error && !reason.trim())}
              aria-describedby={error ? "institution-teacher-error" : undefined}
              placeholder="ระบุเหตุผลเพื่อใช้ตรวจสอบย้อนหลัง"
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={resetDialog}>ยกเลิก</Button>
            <Button type="button" variant={dialog?.mode === "end" ? "destructive" : "default"} onClick={submit}>
              {dialog?.mode === "end" ? "ยืนยันการสิ้นสุด" : "บันทึก"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
