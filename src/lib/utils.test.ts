import { describe, expect, it } from "vitest";

import { cn } from "./utils";

describe("cn", () => {
  it("keeps custom font-size tokens alongside text-color tokens", () => {
    const classes = cn("text-caption", "text-sidebar-primary").split(" ");

    expect(classes).toContain("text-caption");
    expect(classes).toContain("text-sidebar-primary");
  });

  it("lets a custom font-size token replace a default font size", () => {
    const classes = cn("text-sm", "text-17", "text-content").split(" ");

    expect(classes).not.toContain("text-sm");
    expect(classes).toContain("text-17");
    expect(classes).toContain("text-content");
  });
});
