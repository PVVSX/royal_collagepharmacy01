import type { PortalSession } from "@/roles/shared/features/roles/mock-login";
import type { ScopedAcademicActor } from "@/roles/shared/features/academic";

export const selectClassName =
  "h-10 w-full rounded-xl border border-input bg-background px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50";

export function formatInstitutionDate(value?: string) {
  if (!value) return "ปัจจุบัน";
  return new Intl.DateTimeFormat("th-TH", {
    dateStyle: "medium",
    timeZone: "Asia/Bangkok",
  }).format(new Date(value));
}

export function formatInstitutionDateTime(value?: string) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("th-TH", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Bangkok",
  }).format(new Date(value));
}

export function dateInputValue(value?: string) {
  if (!value) return "";
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
}

export function institutionActor(session: PortalSession | null): ScopedAcademicActor | null {
  if (session?.role !== "institution_admin") return null;
  return {
    userId: session.userId,
    userName: session.displayName,
    role: session.role,
    organisationId: session.organisation.id,
    resourceScopes: session.resourceScopes,
  };
}

const knownInstitutionErrors: ReadonlyArray<readonly [string, string]> = [
  ["Unknown academic organisation", "ไม่พบขอบเขตสถาบันของบัญชีนี้"],
  ["outside the Institution Admin scope", "ข้อมูลอยู่นอกขอบเขตสถาบันของคุณ"],
  ["บัญชีนี้ไม่มีสิทธิ์จัดการข้อมูลของสถาบันดังกล่าว", "บัญชีนี้ไม่มีสิทธิ์จัดการข้อมูลของสถาบันดังกล่าว"],
  ["อาจารย์ชื่อนี้อยู่ในสถาบันแล้ว", "อาจารย์ชื่อนี้อยู่ในสถาบันแล้ว"],
  ["ไม่พบอาจารย์ในขอบเขตสถาบันนี้", "ไม่พบอาจารย์ในขอบเขตสถาบันนี้"],
  ["ไม่สามารถแก้ชื่อกลางของอาจารย์ที่สังกัดมากกว่าหนึ่งสถาบัน", "ไม่สามารถแก้ชื่อกลางของอาจารย์ที่สังกัดมากกว่าหนึ่งสถาบัน"],
  ["ไม่พบสังกัดอาจารย์ที่ยังใช้งานในสถาบันนี้", "ไม่พบสังกัดอาจารย์ที่ยังใช้งานในสถาบันนี้"],
  ["กรุณายกเลิกการมอบหมายการสอนที่ยังมีผลก่อนสิ้นสุดสังกัดอาจารย์", "กรุณายกเลิกการมอบหมายการสอนที่ยังมีผลก่อนสิ้นสุดสังกัดอาจารย์"],
  ["อาจารย์อยู่นอกขอบเขตสถาบันหรือสังกัดยังไม่มีผล", "อาจารย์อยู่นอกขอบเขตสถาบันหรือสังกัดยังไม่มีผล"],
  ["อาจารย์ท่านนี้ได้รับมอบหมายรายวิชานี้อยู่แล้ว", "อาจารย์ท่านนี้ได้รับมอบหมายรายวิชานี้อยู่แล้ว"],
  ["ไม่พบการมอบหมายที่ต้องการแก้ไข", "ไม่พบการมอบหมายที่ต้องการแก้ไข"],
  ["ไม่พบการมอบหมายที่ต้องการยกเลิก", "ไม่พบการมอบหมายที่ต้องการยกเลิก"],
  ["ไม่สามารถแก้ไขการมอบหมายที่ยกเลิกแล้ว", "ไม่สามารถแก้ไขการมอบหมายที่ยกเลิกแล้ว"],
  ["วันสิ้นสุดการมอบหมายต้องอยู่หลังวันเริ่มต้น", "วันสิ้นสุดการมอบหมายต้องอยู่หลังวันเริ่มต้น"],
  ["ไม่พบข้อมูลสังกัดที่ต้องการเปลี่ยน", "ไม่พบข้อมูลสังกัดที่ต้องการเปลี่ยน"],
  ["ไม่พบรายวิชาที่ต้องการเปลี่ยนสถานะ", "ไม่พบรายวิชาที่ต้องการเปลี่ยนสถานะ"],
  ["ไม่พบรายวิชาที่ต้องการปรับข้อมูล", "ไม่พบรายวิชาที่ต้องการปรับข้อมูล"],
  ["อาจารย์ผู้ตรวจสอบยังไม่ได้ตอบรับการมอบหมายรายวิชานี้", "อาจารย์ผู้ตรวจสอบยังไม่ได้ตอบรับการมอบหมายรายวิชานี้"],
  ["รายวิชานี้มีคำขอปรับข้อมูลที่ยังดำเนินการไม่เสร็จ", "รายวิชานี้มีคำขอปรับข้อมูลที่ยังดำเนินการไม่เสร็จ"],
  ["ไม่พบคำขอปรับข้อมูลรายวิชา", "ไม่พบคำขอปรับข้อมูลรายวิชา"],
  ["ส่งคำขอปรับแก้ซ้ำได้เฉพาะรายการที่อาจารย์ขอข้อมูลเพิ่มเติม", "ส่งคำขอปรับแก้ซ้ำได้เฉพาะรายการที่อาจารย์ขอข้อมูลเพิ่มเติม"],
  ["จำนวนหน่วยกิตต้องมากกว่า 0", "จำนวนหน่วยกิตต้องมากกว่า 0"],
  ["กรุณาระบุข้อมูลรายวิชาที่ต้องการปรับแก้", "กรุณาระบุข้อมูลรายวิชาที่ต้องการปรับแก้"],
  ["วันเริ่มสังกัดไม่ถูกต้อง", "วันเริ่มสังกัดไม่ถูกต้อง"],
  ["วันสิ้นสุดสังกัดต้องอยู่หลังวันเริ่มต้น", "วันสิ้นสุดสังกัดต้องอยู่หลังวันเริ่มต้น"],
];

export function friendlyInstitutionError(cause: unknown, fallback: string) {
  const message = cause instanceof Error ? cause.message : "";
  const mapped = knownInstitutionErrors.find(([known]) => message.includes(known));
  if (mapped) return mapped[1];
  if (message.startsWith("กรุณาระบุ")) return message;
  return fallback;
}

export function friendlyAssignmentError(cause: unknown) {
  const message = cause instanceof Error ? cause.message : "";
  if (message.includes("already has an active assignment") || message.includes("already has a pending assignment")) {
    return "อาจารย์ท่านนี้ได้รับมอบหมายรายวิชานี้อยู่แล้ว";
  }
  if (message.includes("outside the Institution Admin scope")) {
    return "อาจารย์หรือรายวิชาอยู่นอกขอบเขตสถาบันของคุณ";
  }
  return friendlyInstitutionError(cause, "ไม่สามารถบันทึกการมอบหมายได้ กรุณาลองอีกครั้ง");
}
