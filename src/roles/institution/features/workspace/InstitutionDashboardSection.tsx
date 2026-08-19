import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  MetricCard,
  WorkspaceHeader,
} from "@/roles/shared/components/workspace/WorkspacePrimitives";
import {
  subjectResultStatusMeta,
  type SubjectResult,
} from "@/roles/shared/features/academic";
import {
  registrationStatusMeta,
  type RegistrationRecord,
  type RegistrationStatus,
} from "@/roles/shared/features/registration";

const registrationOverviewStatuses = [
  "pending",
  "needs_info",
  "awaiting_payment",
  "enrolled",
] as const satisfies readonly RegistrationStatus[];

const resultOverviewStatuses = [
  "pending",
  "draft",
  "published",
  "revised",
] as const satisfies readonly SubjectResult["status"][];

interface InstitutionDashboardSectionProps {
  institutionName: string;
  studentCount: number;
  teacherCount: number;
  offeringCount: number;
  registrations: readonly RegistrationRecord[];
  results: readonly SubjectResult[];
}

export default function InstitutionDashboardSection({
  institutionName,
  studentCount,
  teacherCount,
  offeringCount,
  registrations,
  results,
}: InstitutionDashboardSectionProps) {
  return (
    <>
      <WorkspaceHeader
        eyebrow="ภาพรวมการดำเนินงาน"
        title="ภาพรวมสถาบัน"
        description={`ติดตามข้อมูลภายใน ${institutionName} โดยการพิจารณาคำขอลงทะเบียนและผลการเรียนยังเป็นหน้าที่ของอาจารย์ผู้รับผิดชอบ`}
        action={{
          href: "/institution/assignments",
          label: "จัดการมอบหมายการสอน",
          icon: "assignment_ind",
        }}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="ผู้เข้ารับการฝึกอบรม"
          value={studentCount}
          note="ผู้เรียนที่ยังสังกัดสถาบัน"
          icon="school"
        />
        <MetricCard
          label="อาจารย์ในสถาบัน"
          value={teacherCount}
          note="อาจารย์ที่ยังสังกัดสถาบัน"
          icon="co_present"
        />
        <MetricCard
          label="รายวิชาที่เปิดสอน"
          value={offeringCount}
          note="เฉพาะรายวิชาของสถาบัน"
          icon="menu_book"
        />
        <MetricCard
          label="คำขอรออาจารย์ตรวจ"
          value={registrations.filter((item) => item.status === "pending").length}
          note="อาจารย์ผู้รับผิดชอบเป็นผู้พิจารณา"
          icon="pending_actions"
          emphasis="warning"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-lg">สถานะการสมัครลงทะเบียน</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {registrationOverviewStatuses.map((status) => {
              const meta = registrationStatusMeta[status];
              return (
                <div
                  key={status}
                  className="flex items-center justify-between gap-3 rounded-xl bg-muted/40 px-4 py-3"
                >
                  <Badge variant={meta.variant}>{meta.label}</Badge>
                  <span className="font-semibold tabular-nums">
                    {registrations.filter((item) => item.status === status).length}
                  </span>
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-lg">สถานะผลการเรียน</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {resultOverviewStatuses.map((status) => {
              const meta = subjectResultStatusMeta[status];
              return (
                <div
                  key={status}
                  className="flex items-center justify-between gap-3 rounded-xl bg-muted/40 px-4 py-3"
                >
                  <Badge variant={meta.variant}>{meta.label}</Badge>
                  <span className="font-semibold tabular-nums">
                    {results.filter((item) => item.status === status).length}
                  </span>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
