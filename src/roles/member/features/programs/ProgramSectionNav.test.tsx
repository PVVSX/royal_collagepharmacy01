import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { ProgramSectionNav, type ProgramSection } from "./ProgramSectionNav";

afterEach(cleanup);

describe("ProgramSectionNav", () => {
  it.each<[ProgramSection, string, string]>([
    ["overview", "ภาพรวมหลักสูตร", "/member/programs"],
    ["all", "รายวิชาทั้งหมด", "/member/programs/all"],
    ["by-college", "แยกตามวิทยาลัย", "/member/programs/by-college"],
  ])(
    "marks only the %s route as current",
    (active, expectedLabel, expectedHref) => {
      const { container } = render(<ProgramSectionNav active={active} />);
      const navigation = screen.getByRole("navigation", { name: "เมนูหลักสูตรและรายวิชา" });
      const links = within(navigation).getAllByRole("link");
      const currentLink = within(navigation).getByRole("link", { current: "page" });

      expect(links).toHaveLength(3);
      expect(links.filter((link) => link.getAttribute("aria-current") === "page")).toHaveLength(1);
      expect(currentLink.textContent).toBe(expectedLabel);
      expect(currentLink.getAttribute("href")).toBe(expectedHref);
      expect(container.querySelector('[role="tablist"]')).toBeNull();
    },
  );

  it("keeps labels, destinations, and target size consistent without a scrollbar", () => {
    render(<ProgramSectionNav active="all" />);

    const navigation = screen.getByRole("navigation", { name: "เมนูหลักสูตรและรายวิชา" });
    expect(navigation.className).toContain("max-w-full");
    expect(navigation.className).not.toContain("overflow-x-auto");
    expect(navigation.firstElementChild?.className).toContain("grid-cols-3");
    expect(navigation.firstElementChild?.className).not.toContain("sm:flex");
    expect(navigation.firstElementChild?.className).toContain("lg:flex");

    const expectedLinks = [
      ["ภาพรวมหลักสูตร", "/member/programs"],
      ["รายวิชาทั้งหมด", "/member/programs/all"],
      ["แยกตามวิทยาลัย", "/member/programs/by-college"],
    ] as const;

    for (const [label, href] of expectedLinks) {
      const link = screen.getByRole("link", { name: label });
      expect(link.getAttribute("href")).toBe(href);
      expect(link.className).toContain("min-h-11");
      expect(link.className).toContain("text-sm");
    }
  });
});
