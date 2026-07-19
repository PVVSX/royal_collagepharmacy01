// ════════════════════════════════════════════════════════════════════════════
// PassportRepository — the DB seam (จุดต่อฐานข้อมูลในอนาคต)
// ────────────────────────────────────────────────────────────────────────────
// วันนี้เป็น mock (in-memory) — วันหน้าสลับ implementation เป็น Prisma/Supabase/REST
// โดย "ไม่ต้องแก้ UI": หน้าเว็บเรียกผ่าน interface นี้เท่านั้น
// ════════════════════════════════════════════════════════════════════════════

import type { ProfessionalPassport } from "./passport";
import { currentMemberPassport } from "./member";

export interface PassportRepository {
  /** passport ของผู้ใช้ที่ล็อกอินอยู่ */
  getCurrentPassport(): Promise<ProfessionalPassport>;
  /** ตรวจสอบสาธารณะด้วย verifyToken (หน้า QR verify) */
  getByVerifyToken(token: string): Promise<ProfessionalPassport | null>;
}

// ─── Mock implementation ────────────────────────────────────────────────────

const members: ProfessionalPassport[] = [currentMemberPassport];

export const mockPassportRepository: PassportRepository = {
  async getCurrentPassport() {
    return currentMemberPassport;
  },
  async getByVerifyToken(token: string) {
    return members.find((m) => m.verifyToken === token) ?? null;
  },
};

/** ตัวที่ระบบใช้จริงตอนนี้ — เปลี่ยนบรรทัดเดียวเมื่อย้ายไป DB */
export const passportRepository: PassportRepository = mockPassportRepository;

// ─── Synchronous accessor (ใช้กับ mock/CSR ระหว่างยังไม่มี DB) ──────────────
// หมายเหตุ: เมื่อย้ายไป DB จริง ให้เปลี่ยนหน้าเว็บมาใช้ async getCurrentPassport()
export function getCurrentPassportSync(): ProfessionalPassport {
  return currentMemberPassport;
}

export function findByVerifyTokenSync(token: string): ProfessionalPassport | null {
  return members.find((m) => m.verifyToken === token) ?? null;
}
