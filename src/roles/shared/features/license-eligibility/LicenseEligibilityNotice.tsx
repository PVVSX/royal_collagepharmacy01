import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { getLicenseEligibility, type LicenseVerificationStatus } from "./model";

const toneClasses = {
  success: "border-success-border bg-success-soft text-success-on-soft",
  warning: "border-warning-border bg-warning-soft text-warning-on-soft",
  danger: "border-danger-border bg-danger-soft text-danger-on-soft",
} as const;

const toneIcons = {
  success: "verified_user",
  warning: "gpp_maybe",
  danger: "block",
} as const;

export function LicenseEligibilityNotice({
  status,
  licenseNumber,
  checkedAt,
  compact = false,
  className,
}: {
  status: LicenseVerificationStatus;
  licenseNumber: string;
  checkedAt?: string;
  compact?: boolean;
  className?: string;
}) {
  const eligibility = getLicenseEligibility(status);

  return (
    <div
      role={eligibility.tone === "danger" ? "alert" : "status"}
      className={cn(
        "rounded-xl border",
        compact ? "px-3 py-2" : "p-4",
        toneClasses[eligibility.tone],
        className,
      )}
    >
      <div className="flex items-start gap-3">
        <span className="material-symbols-outlined mt-0.5 text-xl" aria-hidden="true">
          {toneIcons[eligibility.tone]}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-semibold">{eligibility.label}</p>
            <Badge variant={eligibility.tone} className="h-auto">
              {licenseNumber}
            </Badge>
          </div>
          <p className={cn("mt-1 leading-relaxed", compact ? "text-xs" : "text-sm")}>
            {eligibility.description}
          </p>
          {checkedAt && (
            <p className="mt-1 text-xs opacity-80">
              ตรวจสอบล่าสุด {new Date(checkedAt).toLocaleString("th-TH", {
                dateStyle: "medium",
                timeStyle: "short",
                timeZone: "Asia/Bangkok",
              })}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
