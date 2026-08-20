import { describe, expect, it } from "vitest";

import { getRegistrationWindowStatus } from "./registration-window";

const windowInput = {
  enabled: true,
  opensAt: "2026-08-01T09:00:00+07:00",
  closesAt: "2026-09-30T16:30:00+07:00",
};

describe("getRegistrationWindowStatus", () => {
  it("returns unavailable for disabled or invalid windows", () => {
    expect(getRegistrationWindowStatus({ ...windowInput, enabled: false }).phase).toBe("unavailable");
    expect(getRegistrationWindowStatus({
      ...windowInput,
      opensAt: "2026-10-01T09:00:00+07:00",
    }).phase).toBe("unavailable");
  });

  it("describes the upcoming window without allowing registration", () => {
    const status = getRegistrationWindowStatus({
      ...windowInput,
      now: new Date("2026-07-29T09:00:00+07:00").getTime(),
    });

    expect(status.phase).toBe("upcoming");
    expect(status.canRegister).toBe(false);
    expect(status.detail).toContain("เปิดใน 3 วัน 0 ชั่วโมง");
  });

  it("counts down an open window and changes tone inside 72 hours", () => {
    const open = getRegistrationWindowStatus({
      ...windowInput,
      now: new Date("2026-09-20T16:30:00+07:00").getTime(),
    });
    const closingSoon = getRegistrationWindowStatus({
      ...windowInput,
      now: new Date("2026-09-28T16:30:00+07:00").getTime(),
    });

    expect(open).toMatchObject({ phase: "open", tone: "success", canRegister: true });
    expect(open.detail).toContain("เหลือ 10 วัน 0 ชั่วโมง");
    expect(closingSoon).toMatchObject({ phase: "closing_soon", tone: "warning", canRegister: true });
  });

  it("closes at the exact persisted deadline without a negative countdown", () => {
    const closed = getRegistrationWindowStatus({
      ...windowInput,
      now: new Date(windowInput.closesAt).getTime(),
    });

    expect(closed).toMatchObject({ phase: "closed", canRegister: false });
    expect(closed.detail).not.toContain("-");
  });
});
