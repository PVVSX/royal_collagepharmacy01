import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { WorkflowStateTimeline } from "./WorkflowStateTimeline";

describe("WorkflowStateTimeline", () => {
  it("renders every drafted state with a textual status", () => {
    render(<WorkflowStateTimeline steps={[
      { id: "done", label: "ผ่าน", state: "completed" },
      { id: "problem", label: "ติดปัญหา", state: "problem" },
      { id: "action", label: "แก้ไข", state: "action_required", current: true },
      { id: "waiting", label: "รอ", state: "waiting" },
    ]} />);

    expect(screen.getByRole("list", { name: "สถานะการดำเนินงาน" })).toBeTruthy();
    expect(screen.getByText("ผ่านแล้ว")).toBeTruthy();
    expect(screen.getAllByText("ติดปัญหา")).toHaveLength(2);
    expect(screen.getByText("ต้องแก้ไขหรือส่งข้อมูลเพิ่ม")).toBeTruthy();
    expect(screen.getByText("รอตรวจสอบ")).toBeTruthy();
    expect(screen.getByText("แก้ไข").closest("li")?.getAttribute("aria-current")).toBe("step");
  });

  it("does not render an empty workflow", () => {
    const { container } = render(<WorkflowStateTimeline steps={[]} />);
    expect(container.childElementCount).toBe(0);
  });
});
