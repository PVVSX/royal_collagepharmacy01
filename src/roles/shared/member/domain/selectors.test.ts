import { describe, expect, it } from "vitest";

import { getContinuingEducationStatus } from "./selectors";
import type { CpdSummary } from "./passport";

const cpd: CpdSummary = {
  currentCredits: 65,
  targetCredits: 100,
  perYearMinimum: 10,
  cycleExpiresAt: "2027-04-14",
  activities: [],
};

describe("getContinuingEducationStatus", () => {
  it("returns active when progress and time are healthy", () => {
    expect(getContinuingEducationStatus(cpd, "2026-01-01T00:00:00.000Z")).toBe("active");
  });

  it("warns during the final year", () => {
    expect(getContinuingEducationStatus(cpd, "2026-08-11T00:00:00.000Z")).toBe("warning");
  });

  it("returns completed before checking the cycle deadline", () => {
    expect(getContinuingEducationStatus({ ...cpd, currentCredits: 100 }, "2028-01-01T00:00:00.000Z"))
      .toBe("completed");
  });

  it("returns non-compliant after an incomplete cycle expires", () => {
    expect(getContinuingEducationStatus(cpd, "2027-04-15T00:00:00.000Z"))
      .toBe("non_compliant");
  });
});
