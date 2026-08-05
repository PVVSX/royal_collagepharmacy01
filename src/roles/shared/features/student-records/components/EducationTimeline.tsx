import { StudentRecordBadge } from "@/roles/shared/features/student-records/components/StudentRecordBadge";
import type { EducationTimelineEntry } from "@/roles/shared/features/student-records/model";

interface EducationTimelineProps {
  entries: readonly EducationTimelineEntry[];
}

export function EducationTimeline({ entries }: EducationTimelineProps) {
  return (
    <ol className="relative ml-4 mt-6 space-y-8 border-l-2 border-primary/30">
      {entries.map((education) => (
        <li
          key={`${education.degree}-${education.period}`}
          className="relative pl-8"
        >
          <span
            aria-hidden="true"
            className={`absolute -left-[9px] top-1.5 h-4 w-4 rounded-full ring-4 ring-card ${
              education.isCurrent
                ? "bg-primary shadow-sm"
                : "bg-muted-foreground/30"
            }`}
          />

          <div className="mb-2 flex flex-wrap items-center gap-2">
            <StudentRecordBadge
              kind="qualification"
              status={education.qualificationType}
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <h4 className="text-sm font-bold text-foreground md:text-base">
              {education.degree}
            </h4>
            <StudentRecordBadge
              kind="training"
              status={education.trainingStatus}
              className="shrink-0"
            />
          </div>
          <p className="mt-1 text-sm font-medium text-primary">
            {education.field}
          </p>

          <dl className="mt-3 grid grid-cols-1 gap-3 rounded-xl border border-border bg-muted/30 p-3 text-xs sm:grid-cols-2">
            <div>
              <dt className="text-muted-foreground">สถาบันที่ศึกษา</dt>
              <dd className="mt-0.5 font-medium text-foreground">
                {education.institution}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">สถาบันต้นสังกัด</dt>
              <dd className="mt-0.5 font-medium text-foreground">
                {education.parentInstitution}
              </dd>
            </div>
          </dl>

          <p className="mt-2 inline-flex rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground">
            {education.period}
          </p>
        </li>
      ))}
    </ol>
  );
}
