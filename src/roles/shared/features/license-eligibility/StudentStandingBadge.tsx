import { Badge } from "@/components/ui/badge";
import type { StudentStanding } from "./model";
import { studentStandingMeta } from "./model";

export function StudentStandingBadge({ standing }: { standing: StudentStanding }) {
  const metadata = studentStandingMeta[standing];

  return (
    <Badge variant={metadata.tone} className="h-auto">
      {metadata.label}
    </Badge>
  );
}
