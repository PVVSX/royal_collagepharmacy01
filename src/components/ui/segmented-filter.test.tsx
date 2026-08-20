import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import {
  SegmentedFilterButton,
  SegmentedFilterGroup,
} from "@/components/ui/segmented-filter";

afterEach(cleanup);

describe("SegmentedFilter", () => {
  it("exposes a named group and pressed state with consistent targets", () => {
    const onClick = vi.fn();

    render(
      <SegmentedFilterGroup aria-label="กรองสถานะ">
        <SegmentedFilterButton active onClick={onClick}>ทั้งหมด</SegmentedFilterButton>
        <SegmentedFilterButton>ยังไม่ได้อ่าน</SegmentedFilterButton>
      </SegmentedFilterGroup>,
    );

    expect(screen.getByRole("group", { name: "กรองสถานะ" })).toBeTruthy();
    const active = screen.getByRole("button", { name: "ทั้งหมด", pressed: true });
    expect(active.className).toContain("min-h-11");
    expect(active.className).toContain("text-sm");

    fireEvent.click(active);
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
