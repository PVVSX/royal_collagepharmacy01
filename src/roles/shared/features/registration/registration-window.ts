const BANGKOK_TIME_ZONE = "Asia/Bangkok";
const DAY_MS = 86_400_000;
const HOUR_MS = 3_600_000;
const MINUTE_MS = 60_000;

export type RegistrationWindowPhase =
  | "unavailable"
  | "upcoming"
  | "open"
  | "closing_soon"
  | "closed";

export interface RegistrationWindowStatus {
  phase: RegistrationWindowPhase;
  label: string;
  detail: string;
  tone: "neutral" | "info" | "success" | "warning" | "danger";
  canRegister: boolean;
  opensAt?: string;
  closesAt?: string;
}

function formatDateTime(timestamp: number) {
  return new Intl.DateTimeFormat("th-TH", {
    dateStyle: "long",
    timeStyle: "short",
    timeZone: BANGKOK_TIME_ZONE,
  }).format(timestamp);
}

function formatRemaining(milliseconds: number) {
  const remaining = Math.max(0, milliseconds);
  const days = Math.floor(remaining / DAY_MS);
  const hours = Math.floor((remaining % DAY_MS) / HOUR_MS);
  const minutes = Math.floor((remaining % HOUR_MS) / MINUTE_MS);

  if (days > 0) return `${days} วัน ${hours} ชั่วโมง`;
  return `${hours} ชั่วโมง ${minutes} นาที`;
}

export function getRegistrationWindowStatus(input: {
  enabled: boolean;
  opensAt: string;
  closesAt: string;
  now?: number;
}): RegistrationWindowStatus {
  const opens = new Date(input.opensAt).getTime();
  const closes = new Date(input.closesAt).getTime();
  const now = input.now ?? Date.now();

  if (!input.enabled) {
    return {
      phase: "unavailable",
      label: "ยังไม่เปิดรับลงทะเบียน",
      detail: "กำหนดการจะแสดงเมื่อมีประกาศ",
      tone: "neutral",
      canRegister: false,
    };
  }

  if (!Number.isFinite(opens) || !Number.isFinite(closes) || closes <= opens) {
    return {
      phase: "unavailable",
      label: "ไม่สามารถแสดงกำหนดการได้",
      detail: "กรุณาติดต่อหน่วยงานเพื่อสอบถามช่วงเวลาลงทะเบียน",
      tone: "danger",
      canRegister: false,
    };
  }

  if (now < opens) {
    return {
      phase: "upcoming",
      label: "ยังไม่เปิดลงทะเบียน",
      detail: `เปิดใน ${formatRemaining(opens - now)} · ${formatDateTime(opens)}`,
      tone: "info",
      canRegister: false,
      opensAt: input.opensAt,
      closesAt: input.closesAt,
    };
  }

  if (now >= closes) {
    return {
      phase: "closed",
      label: "ปิดรับลงทะเบียนแล้ว",
      detail: `ปิดรับเมื่อ ${formatDateTime(closes)}`,
      tone: "neutral",
      canRegister: false,
      opensAt: input.opensAt,
      closesAt: input.closesAt,
    };
  }

  const remaining = closes - now;
  const closingSoon = remaining <= 72 * HOUR_MS;
  return {
    phase: closingSoon ? "closing_soon" : "open",
    label: closingSoon ? "ใกล้หมดเวลาลงทะเบียน" : "เปิดรับลงทะเบียน",
    detail: `เหลือ ${formatRemaining(remaining)} · ปิดรับ ${formatDateTime(closes)}`,
    tone: closingSoon ? "warning" : "success",
    canRegister: true,
    opensAt: input.opensAt,
    closesAt: input.closesAt,
  };
}
