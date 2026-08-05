export const RESPONSIBLE_INSTITUTION_LABEL = "สถาบันผู้รับผิดชอบหลัก";

export const responsibleInstitutionByCollege = {
  "วคบท.": "วิทยาลัยการคุ้มครองผู้บริโภคด้านยาและสุขภาพแห่งประเทศไทย",
  CPAT: "วิทยาลัยการบริหารเภสัชกิจแห่งประเทศไทย",
  "วภช.": "วิทยาลัยเภสัชกรรมชุมชนแห่งประเทศไทย",
  สมุนไพร: "วิทยาลัยเภสัชกรรมสมุนไพรแห่งประเทศไทย",
  "วภท.": "วิทยาลัยเภสัชบำบัดแห่งประเทศไทย",
} as const;

type CollegeCode = keyof typeof responsibleInstitutionByCollege;

export function getResponsibleInstitution(collegeCode: string): string {
  const normalizedCode = collegeCode.trim();
  const institution =
    responsibleInstitutionByCollege[normalizedCode as CollegeCode] ??
    normalizedCode;

  return institution || "ไม่ระบุสถาบัน";
}
