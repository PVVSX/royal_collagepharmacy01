"use client";

import { useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  EmptyState,
  WorkspaceHeader,
} from "@/roles/shared/components/workspace/WorkspacePrimitives";
import {
  isAcademicAffiliationActive,
  type AcademicStudent,
  type StudentAffiliation,
} from "@/roles/shared/features/academic";

import InstitutionResourceManagement from "./InstitutionResourceManagement";
import { formatInstitutionDate } from "./institution-workspace-utils";

interface InstitutionStudentsSectionProps {
  students: readonly AcademicStudent[];
  affiliations: readonly StudentAffiliation[];
}

export default function InstitutionStudentsSection({
  students,
  affiliations,
}: InstitutionStudentsSectionProps) {
  const [query, setQuery] = useState("");
  const visibleStudents = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase("th-TH");
    if (!normalized) return students;
    return students.filter((student) => (
      `${student.name} ${student.id} ${student.licenseNumber}`
        .toLocaleLowerCase("th-TH")
        .includes(normalized)
    ));
  }, [query, students]);

  return (
    <>
      <WorkspaceHeader
        eyebrow="ข้อมูลภายในสถาบัน"
        title="ผู้เข้ารับการฝึกอบรมในสถาบัน"
        description="แสดงเฉพาะผู้เรียนที่ยังมีสถานะสังกัดสถาบันปัจจุบัน"
      />
      <Card className="border-border">
        <CardHeader className="gap-3 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="text-lg">รายชื่อผู้เรียน</CardTitle>
          <div className="w-full space-y-1.5 sm:max-w-xs">
            <label htmlFor="institution-student-search" className="text-sm font-medium text-foreground">
              ค้นหาผู้เรียน
            </label>
            <Input
              id="institution-student-search"
              type="search"
              placeholder="ค้นหาชื่อ รหัส หรือเลขใบอนุญาต"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="h-11 rounded-xl text-sm"
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>รหัส</TableHead>
                <TableHead>ชื่อ</TableHead>
                <TableHead>เลขใบอนุญาต</TableHead>
                <TableHead>ช่วงเวลาที่สังกัด</TableHead>
                <TableHead>สถานะ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visibleStudents.map((student) => {
                const affiliation = affiliations.find((item) => (
                  item.studentId === student.id && isAcademicAffiliationActive(item)
                ));
                return (
                  <TableRow key={student.id}>
                    <TableCell>{student.id}</TableCell>
                    <TableCell className="font-medium">{student.name}</TableCell>
                    <TableCell>{student.licenseNumber}</TableCell>
                    <TableCell className="text-sm">
                      {formatInstitutionDate(affiliation?.startsAt)} – {formatInstitutionDate(affiliation?.endsAt)}
                    </TableCell>
                    <TableCell><Badge variant="success">กำลังสังกัด</Badge></TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          {visibleStudents.length === 0 ? (
            <div className="p-5">
              <EmptyState
                title="ไม่พบผู้เรียน"
                description="ลองตรวจคำค้นหา หรือยังไม่มีผู้เรียนในสถาบันนี้"
              />
            </div>
          ) : null}
        </CardContent>
      </Card>
      <InstitutionResourceManagement section="students" />
    </>
  );
}
