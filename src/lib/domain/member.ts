// ════════════════════════════════════════════════════════════════════════════
// Seeded Member — Single Source of Truth (SSOT)
// ────────────────────────────────────────────────────────────────────────────
// ข้อมูลผู้ประกอบวิชาชีพหนึ่งคน (mock) ที่ reconcile ความขัดแย้งจากของเดิมทั้งหมด:
//  • QR เดิมฝัง "RPC-2569-KARINA" ทั้งที่เจ้าของคือ สมชาย ใจดี → แก้เป็น verifyToken ที่ตรง
//  • ข้อมูลคนเดียวถูกเก็บซ้ำใน dashboardData / studentsData / studentDetailData / profileData
//    → รวมมาที่นี่ที่เดียว, หน้าอื่นค่อย derive
//  • แท็ก ATMPs/Leukemia/CGT เดิมชนกับหลักสูตร BCP → จัดเป็น "focusAreas" (สาขาที่สนใจ)
//    แยกจาก specializations (ที่รับรองจริง/กำลังฝึกอบรม)
// ════════════════════════════════════════════════════════════════════════════

import type { ProfessionalPassport, IssuingAuthority, Verification } from "./passport";

/** helper สร้าง verification สั้นๆ */
const verified = (by: string, at: string): Verification => ({ status: "verified", verifiedBy: by, verifiedAt: at });
const selfDeclared = (): Verification => ({ status: "self_declared" });
const pending = (by: string): Verification => ({ status: "pending", verifiedBy: by });

export const pharmacyAuthority: IssuingAuthority = {
  domain: "pharmacy",
  nameTh: "ราชวิทยาลัยเภสัชกรรมแห่งประเทศไทย",
  nameEn: "Royal College of Pharmacists of Thailand",
  regulatorTh: "สภาเภสัชกรรม",
  regulatorEn: "The Pharmacy Council of Thailand",
  logoUrl: "/logo_pharmacy.jpg",
  website: "https://www.pharmacycouncil.org",
};

export const currentMemberPassport: ProfessionalPassport = {
  memberId: "วภท-2568-001",
  verifyToken: "RPC-P-VTH2568001",
  issuingAuthority: pharmacyAuthority,

  // ── A. Identity ──────────────────────────────────────────────────────────
  identity: {
    titleTh: "ภก.",
    firstNameTh: "สมชาย",
    lastNameTh: "ใจดี",
    firstNameEn: "Somchai",
    lastNameEn: "Jaidee",
    gender: "male",
    citizenId: "1-1002-01234-56-7",
    dateOfBirth: "2000-04-11",
    nationality: "ไทย",
    photoUrl: "/somchai_profile.png",
    email: "somchai.j@example.com",
    phone: "081-234-5678",
  },

  // ── A. License lifecycle ─────────────────────────────────────────────────
  license: {
    licenseNumber: "ภ.12345",
    status: "active",
    issuedAt: "2022-04-15",
    expiresAt: "2027-04-14",
    renewalCycle: "2565–2570",
  },

  // ── B. Qualifications ────────────────────────────────────────────────────
  qualifications: [
    {
      id: "qual-bpharm",
      degreeTh: "เภสัชศาสตรบัณฑิต (ภ.บ.)",
      field: "เภสัชศาสตร์",
      institution: "คณะเภสัชศาสตร์ จุฬาลงกรณ์มหาวิทยาลัย",
      graduationYear: "2564",
      gpa: "3.85",
      verification: verified("คณะเภสัชศาสตร์ จุฬาฯ", "2564-06-01"),
    },
  ],

  // ── C. Specializations (วุฒิบัตร/หนังสืออนุมัติ) ─────────────────────────
  specializations: [
    {
      id: "spec-bcp",
      type: "in_training",
      titleTh: "วุฒิบัตรแสดงความรู้ความชำนาญในการประกอบวิชาชีพเภสัชกรรม สาขาเภสัชบำบัด (BCP)",
      specialtyTh: "เภสัชบำบัด",
      collegeShort: "วภท.",
      progress: 50, // 18/36 หน่วยกิต
      verification: pending("วิทยาลัยเภสัชบำบัดแห่งประเทศไทย"),
    },
  ],

  // ── D. Competencies (FIP areas) ──────────────────────────────────────────
  competencies: [
    { areaId: "pc_pharmacotherapy", selfLevel: 4, verifiedLevel: 3, verification: verified("วภท.", "2569-01-15") },
    { areaId: "pc_patient_assessment", selfLevel: 3, verifiedLevel: 3, verification: verified("วภท.", "2569-01-15") },
    { areaId: "pc_monitoring", selfLevel: 3, verifiedLevel: 2, verification: verified("วภท.", "2569-01-15") },
    { areaId: "pc_counselling", selfLevel: 4, verification: selfDeclared() },
    { areaId: "pro_research", selfLevel: 3, verifiedLevel: 2, verification: verified("วภท.", "2569-01-15") },
    { areaId: "pro_ethics", selfLevel: 3, verification: selfDeclared() },
    { areaId: "pro_cpd", selfLevel: 4, verifiedLevel: 4, verification: verified("สภาเภสัชกรรม", "2569-05-15") },
    { areaId: "ph_medicines_safety", selfLevel: 3, verifiedLevel: 2, verification: verified("วภท.", "2569-01-15") },
    { areaId: "ph_health_promotion", selfLevel: 2, verification: selfDeclared() },
    { areaId: "org_quality", selfLevel: 2, verification: selfDeclared() },
  ],

  // ── E. CPD ───────────────────────────────────────────────────────────────
  cpd: {
    currentCredits: 65,
    targetCredits: 100,
    perYearMinimum: 10,
    cycleExpiresAt: "2027-04-14",
    activities: [
      { id: "cpd-1", title: "ประชุมวิชาการประจำปี สภาเภสัชกรรม", category: "ประชุมวิชาการ", date: "2026-05-15", credits: 15 },
      { id: "cpd-2", title: "e-Learning แนวทางการรักษาโรคไข้เลือดออก", category: "e-Learning", date: "2026-04-02", credits: 2 },
      { id: "cpd-3", title: "ตีพิมพ์บทความวิชาการ เรื่อง ระบาดวิทยาในชุมชน", category: "เขียนบทความ", date: "2026-03-10", credits: 10 },
      { id: "cpd-4", title: "ประชุมวิชาการนานาชาติ FAPA 2025", category: "ประชุมวิชาการ", date: "2025-11-20", credits: 20 },
    ],
  },

  // ── F. Experience ────────────────────────────────────────────────────────
  experience: [
    {
      id: "exp-siriraj",
      organization: "โรงพยาบาลศิริราช",
      position: "เภสัชกรคลินิก",
      startYear: "2565",
      isCurrent: true,
      employmentType: "พนักงานเอกชน",
      responsibilities: "ดูแลการจ่ายยาผู้ป่วยใน (IPD) และให้คำปรึกษาด้านการใช้ยาแก่ผู้ป่วยโรคเรื้อรัง",
      verification: verified("โรงพยาบาลศิริราช", "2565-05-01"),
    },
    {
      id: "exp-healthplus",
      organization: "ร้านยา Health Plus",
      position: "เภสัชกรร้านยา",
      startYear: "2564",
      endYear: "2565",
      isCurrent: false,
      employmentType: "พนักงานเอกชน",
      verification: selfDeclared(),
    },
  ],

  // ── G. Academic Work ─────────────────────────────────────────────────────
  academicWork: [
    {
      id: "aw-pub-1",
      kind: "publication",
      title: "ผลของการให้คำปรึกษาด้านยาในผู้ป่วยเบาหวานชนิดที่ 2",
      year: "2566",
      venue: "วารสารเภสัชกรรมคลินิก",
      verification: verified("วภท.", "2566-12-01"),
    },
    {
      id: "aw-proj-1",
      kind: "research_project",
      title: "การติดตามความร่วมมือในการใช้ยาของผู้ป่วยความดันโลหิตสูง",
      year: "2566",
      role: "ผู้ร่วมวิจัย",
      verification: selfDeclared(),
    },
  ],

  // ── สาขาที่สนใจ/มุ่งพัฒนา (ไม่ใช่ certified — ใช้เสริมการจับคู่) ───────────
  focusAreas: ["เภสัชบำบัด (Pharmacotherapy)", "ATMPs", "Cell & Gene Therapy"],

  updatedAt: "2026-07-19",
};
