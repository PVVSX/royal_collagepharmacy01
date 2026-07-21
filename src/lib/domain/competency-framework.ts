// ════════════════════════════════════════════════════════════════════════════
// Competency Framework — อ้างอิง FIP Global Competency Framework (GbCFv2)
// ────────────────────────────────────────────────────────────────────────────
// กรอบสมรรถนะกลางที่ passport ใช้ "แม็ป" ความสามารถของผู้ประกอบวิชาชีพ
// ออกแบบให้ swap ได้: วิชาชีพอื่นเปลี่ยนชุด framework นี้ แต่โครง CompetencyRating เดิม
//
// FIP จัด 4 คลัสเตอร์: ประชากร (public health), ผู้ป่วย (patient care),
// ระบบ (organisation & management), การปฏิบัติ/วิชาชีพ (professional/personal)
// ════════════════════════════════════════════════════════════════════════════

export interface CompetencyArea {
  id: string;
  labelTh: string;
  labelEn: string;
}

export interface CompetencyCluster {
  id: string;
  /** ชื่อคลัสเตอร์ */
  labelTh: string;
  labelEn: string;
  icon: string; // material symbol
  /** สีธีมของคลัสเตอร์ (ใช้ chart var เพื่อความสม่ำเสมอ) */
  colorVar: string;
  description: string;
  areas: CompetencyArea[];
}

export const fipFramework: CompetencyCluster[] = [
  {
    id: "public_health",
    labelTh: "สาธารณสุขเชิงเภสัชกรรม",
    labelEn: "Pharmaceutical Public Health",
    icon: "public",
    colorVar: "var(--color-chart-1)",
    description: "การส่งเสริมสุขภาพ การคุ้มครองผู้บริโภค และการดูแลระดับประชากร",
    areas: [
      { id: "ph_health_promotion", labelTh: "การส่งเสริมสุขภาพและป้องกันโรค", labelEn: "Health promotion" },
      { id: "ph_medicines_safety", labelTh: "ความปลอดภัยด้านยาระดับประชากร", labelEn: "Medicines safety" },
      { id: "ph_consumer_protection", labelTh: "การคุ้มครองผู้บริโภคด้านยา", labelEn: "Consumer protection" },
    ],
  },
  {
    id: "patient_care",
    labelTh: "การบริบาลทางเภสัชกรรม",
    labelEn: "Pharmaceutical Care",
    icon: "clinical_notes",
    colorVar: "var(--color-chart-2)",
    description: "การดูแลผู้ป่วยรายบุคคล การประเมินและติดตามการใช้ยา",
    areas: [
      { id: "pc_patient_assessment", labelTh: "การประเมินผู้ป่วยและการใช้ยา", labelEn: "Patient assessment" },
      { id: "pc_pharmacotherapy", labelTh: "เภสัชบำบัดและการตัดสินใจทางคลินิก", labelEn: "Pharmacotherapy" },
      { id: "pc_monitoring", labelTh: "การติดตามผลและความปลอดภัยของผู้ป่วย", labelEn: "Monitoring & follow-up" },
      { id: "pc_counselling", labelTh: "การให้คำปรึกษาและสื่อสารกับผู้ป่วย", labelEn: "Counselling" },
    ],
  },
  {
    id: "organisation",
    labelTh: "การจัดการองค์กรและระบบยา",
    labelEn: "Organisation & Management",
    icon: "account_tree",
    colorVar: "var(--color-chart-3)",
    description: "การบริหารระบบยา คุณภาพ และทรัพยากรในองค์กร",
    areas: [
      { id: "org_medicines_supply", labelTh: "การบริหารเวชภัณฑ์และซัพพลายเชน", labelEn: "Medicines supply" },
      { id: "org_quality", labelTh: "การประกันคุณภาพและความเสี่ยง", labelEn: "Quality assurance" },
      { id: "org_leadership", labelTh: "ภาวะผู้นำและการจัดการ", labelEn: "Leadership & management" },
    ],
  },
  {
    id: "professional",
    labelTh: "วิชาชีพและการพัฒนาตนเอง",
    labelEn: "Professional / Personal",
    icon: "workspace_premium",
    colorVar: "var(--color-chart-4)",
    description: "จริยธรรมวิชาชีพ การพัฒนาต่อเนื่อง การวิจัยและการสอน",
    areas: [
      { id: "pro_ethics", labelTh: "จริยธรรมและกฎหมายวิชาชีพ", labelEn: "Ethics & law" },
      { id: "pro_cpd", labelTh: "การเรียนรู้และพัฒนาต่อเนื่อง (CPD)", labelEn: "Continuing development" },
      { id: "pro_research", labelTh: "การวิจัยและการใช้หลักฐานเชิงประจักษ์", labelEn: "Research & evidence" },
    ],
  },
];

/** flatten areas เพื่อ lookup เร็ว */
export const competencyAreaIndex: Record<string, { area: CompetencyArea; cluster: CompetencyCluster }> =
  Object.fromEntries(
    fipFramework.flatMap((cluster) =>
      cluster.areas.map((area) => [area.id, { area, cluster }]),
    ),
  );

export function getClusterOfArea(areaId: string): CompetencyCluster | undefined {
  return competencyAreaIndex[areaId]?.cluster;
}
