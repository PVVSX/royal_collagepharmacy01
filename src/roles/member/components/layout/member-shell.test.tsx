import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { PORTAL_SESSION_KEY, resolvePortalLogin, savePortalSession } from "@/roles/shared/features/roles/mock-login";
import TopNav from "@/roles/shared/components/layout/TopNav";
import Sidebar from "./Sidebar";

const push = vi.fn();

vi.mock("next/navigation", () => ({
  usePathname: () => "/member/dashboard",
  useRouter: () => ({ push }),
}));

describe("member shell", () => {
  beforeEach(() => {
    push.mockReset();
    window.localStorage.clear();
    savePortalSession(resolvePortalLogin("ภ.12345", "2323").session);
  });

  afterEach(cleanup);

  it("keeps internal roles and nonfunctional navigation out of the member top bar", async () => {
    render(<TopNav />);

    expect(screen.queryByPlaceholderText("ค้นหา...")).toBeNull();
    expect(screen.queryByText("ภาพรวม")).toBeNull();
    expect(screen.queryByText(/Student|ผู้เข้ารับการฝึกอบรม|บทบาท/)).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: "ศูนย์ช่วยเหลือ" }));
    expect(push).toHaveBeenCalledWith("/member/help");

    fireEvent.pointerDown(screen.getByRole("button", { name: "การตั้งค่า" }), { button: 0, ctrlKey: false });
    fireEvent.click(await screen.findByRole("menuitem", { name: /Pharmacist Profile/ }));
    expect(push).toHaveBeenCalledWith("/member/passport");

    fireEvent.pointerDown(screen.getByRole("button", { name: "การตั้งค่า" }), { button: 0, ctrlKey: false });
    fireEvent.click(await screen.findByRole("menuitem", { name: /ออกจากระบบ/ }));
    await waitFor(() => expect(window.localStorage.getItem(PORTAL_SESSION_KEY)).toBeNull());
    expect(push).toHaveBeenCalledWith("/");
  });

  it("orders learning navigation, hides removed entries, and clears the session on logout", async () => {
    render(<Sidebar />);

    expect(screen.queryByRole("link", { name: /ข้อมูลของฉัน/ })).toBeNull();
    expect(screen.queryByRole("link", { name: /สมัครสอบ/ })).toBeNull();
    const schedule = screen.getAllByRole("link", { name: /ตารางเรียน/ })[0];
    const programs = screen.getAllByRole("link", { name: /หลักสูตรและรายวิชา/ })[0];
    expect(schedule.compareDocumentPosition(programs) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(screen.queryByText(/ผู้เข้ารับการฝึกอบรม|Student|บทบาท/)).toBeNull();

    await act(async () => {
      fireEvent.click(screen.getAllByRole("button", { name: "ออกจากระบบ" })[0]);
    });
    await waitFor(() => expect(window.localStorage.getItem(PORTAL_SESSION_KEY)).toBeNull());
    expect(push).toHaveBeenCalledWith("/");
  });
});
