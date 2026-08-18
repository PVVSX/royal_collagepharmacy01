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
import type { AcademicActor } from "@/roles/shared/features/academic";
import { usePortalSession } from "@/roles/shared/features/roles/use-portal-session";

type ManagedSection = "students" | "teachers" | "courses";
type ManagedStatus = "active" | "inactive" | "open" | "closed";

interface ManagedRecord {
  id: string;
  label: string;
  detail: string;
  status: ManagedStatus;
}

const sectionCopy: Record<ManagedSection, { title: string; description: string }> = {
  students: {
    title: "จัดการ Student Affiliation",
    description: "เปลี่ยนสถานะความสัมพันธ์ของผู้เรียนภายในสถาบันปัจจุบัน",
  },
  teachers: {
    title: "จัดการ Teacher Affiliation",
    description: "เปลี่ยนสถานะอาจารย์ก่อนนำไปกำหนด Teaching Assignment",
  },
  courses: {
    title: "จัดการรายวิชาและรุ่นเรียน",
    description: "เปิดหรือปิด Course Offering ภายใน Institution Scope",
  },
};

export default function InstitutionResourceManagement({ section }: { section: ManagedSection }) {
  const db = useMockDb();
  const { session } = usePortalSession();
  const [selected, setSelected] = useState<ManagedRecord | null>(null);
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");
  const institutionId = session?.role === "institution_admin" ? session.organisation.id : "";
  const actor: AcademicActor | null = session?.role === "institution_admin" ? {
    userId: session.userId,
    userName: session.displayName,
    role: session.role,
    organisationId: session.organisation.id,
  } : null;

  const records = useMemo<ManagedRecord[]>(() => {
    if (section === "students") {
      return db.studentAffiliations
        .filter((item) => item.institutionId === institutionId)
        .map((item) => ({
          id: item.id,
          label: db.academicStudents.find((student) => student.id === item.studentId)?.name ?? item.studentId,
          detail: item.studentId,
          status: item.status,
        }));
    }
    if (section === "teachers") {
      return db.teacherAffiliations
        .filter((item) => item.institutionId === institutionId)
        .map((item) => ({
          id: item.id,
          label: db.academicTeachers.find((teacher) => teacher.id === item.teacherId)?.name ?? item.teacherId,
          detail: item.teacherId,
          status: item.status,
        }));
    }
    return db.courseOfferings
      .filter((item) => item.institutionId === institutionId)
      .map((item) => ({
        id: item.id,
        label: `${item.courseCode} · ${item.courseTitle}`,
        detail: `${item.term} · รุ่น ${item.section}`,
        status: item.status,
      }));
  }, [db.academicStudents, db.academicTeachers, db.courseOfferings, db.studentAffiliations, db.teacherAffiliations, institutionId, section]);

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
      if (section === "courses") {
        db.updateCourseOfferingStatus({
          courseOfferingId: selected.id,
          status: selected.status === "open" ? "closed" : "open",
          actor,
          reason: normalizedReason,
        });
      } else {
        db.updateAffiliationStatus({
          affiliationType: section === "students" ? "student" : "teacher",
          affiliationId: selected.id,
          status: selected.status === "active" ? "inactive" : "active",
          actor,
          reason: normalizedReason,
        });
      }
      toast.success("บันทึกสถานะและ User Audit Log แล้ว");
      close();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "ไม่สามารถเปลี่ยนสถานะได้");
    }
  };

  const copy = sectionCopy[section];
  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle className="text-lg">{copy.title}</CardTitle>
        <p className="text-sm text-muted-foreground">{copy.description} ขอบเขตฟิลด์อื่นอยู่ระหว่างการกำหนด</p>
      </CardHeader>
      <CardContent className="space-y-3">
        {records.map((record) => {
          const enabled = record.status === "active" || record.status === "open";
          return (
            <div key={record.id} className="flex flex-col gap-3 rounded-xl border border-border p-3 sm:flex-row sm:items-center">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-foreground">{record.label}</p>
                <p className="mt-1 text-xs text-muted-foreground">{record.detail}</p>
              </div>
              <Badge variant={enabled ? "success" : "secondary"}>{enabled ? "ใช้งาน" : "สิ้นสุด"}</Badge>
              <Button type="button" variant="outline" size="sm" onClick={() => setSelected(record)}>
                {enabled ? "สิ้นสุดสถานะ" : "เปิดใช้งาน"}
              </Button>
            </div>
          );
        })}
      </CardContent>

      <Dialog open={Boolean(selected)} onOpenChange={(open) => { if (!open) close(); }}>
        <DialogContent aria-describedby="institution-change-description">
          <DialogHeader>
            <DialogTitle>ยืนยันการเปลี่ยนสถานะ</DialogTitle>
            <DialogDescription id="institution-change-description">
              {selected?.label} · ระบบจะบันทึกผู้ดำเนินการ ข้อมูลก่อน–หลัง เหตุผล และเวลาใน User Audit Log
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-1.5">
            <label htmlFor="institution-change-reason" className="text-sm font-medium">เหตุผล</label>
            <Textarea
              id="institution-change-reason"
              value={reason}
              onChange={(event) => { setReason(event.target.value); setError(""); }}
              aria-invalid={Boolean(error)}
              aria-describedby={error ? "institution-change-error" : undefined}
            />
            {error ? <p id="institution-change-error" role="alert" className="text-sm text-danger">{error}</p> : null}
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
