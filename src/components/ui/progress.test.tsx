import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { Progress } from "@/components/ui/progress";

afterEach(cleanup);

describe("Progress", () => {
  it("uses the native value attribute without inline styles", () => {
    render(<Progress aria-label="ความคืบหน้า" value={48} tone="chart2" />);

    const progress = screen.getByRole("progressbar", { name: "ความคืบหน้า" });
    expect(progress.getAttribute("value")).toBe("48");
    expect(progress.getAttribute("max")).toBe("100");
    expect(progress.getAttribute("style")).toBeNull();
    expect(progress.className).toContain("bg-chart-2");
  });

  it("clamps the value to a valid custom maximum", () => {
    render(<Progress aria-label="หน่วยกิต" value={120} max={80} />);

    const progress = screen.getByRole("progressbar", { name: "หน่วยกิต" });
    expect(progress.getAttribute("value")).toBe("80");
    expect(progress.getAttribute("max")).toBe("80");
  });
});
