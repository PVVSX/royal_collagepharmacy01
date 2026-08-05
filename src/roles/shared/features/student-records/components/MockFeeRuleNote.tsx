import { mockPaymentFeeRule } from "@/roles/shared/features/student-records/model";

export function MockFeeRuleNote() {
  return (
    <div
      role="note"
      className="flex items-start gap-3 rounded-xl border border-warning-border bg-warning-soft px-4 py-3 text-warning-on-soft"
    >
      <span
        aria-hidden="true"
        className="material-symbols-outlined mt-0.5 text-lg"
      >
        info
      </span>
      <div>
        <p className="text-xs font-semibold">เงื่อนไขค่าธรรมเนียม</p>
        <p className="mt-0.5 text-xs leading-relaxed opacity-90">
          {mockPaymentFeeRule.note}
        </p>
      </div>
    </div>
  );
}
