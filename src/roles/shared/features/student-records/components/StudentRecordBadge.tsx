import { Badge } from "@/components/ui/badge";
import {
  getStudentRecordStatusMeta,
  type StudentRecordStatusByKind,
  type StudentRecordStatusKind,
} from "@/roles/shared/features/student-records/model";

type StudentRecordBadgeProps = {
  [Kind in StudentRecordStatusKind]: {
    kind: Kind;
    status: StudentRecordStatusByKind[Kind];
    className?: string;
  };
}[StudentRecordStatusKind];

export function StudentRecordBadge({
  kind,
  status,
  className,
}: StudentRecordBadgeProps) {
  const metadata = getStudentRecordStatusMeta(kind, status);

  return (
    <Badge variant={metadata.variant} className={className}>
      {metadata.label}
    </Badge>
  );
}
