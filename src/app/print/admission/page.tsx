"use client";

import { use, useEffect } from "react";
import { profileData } from "@/roles/shared/data";
import { PrintProvenance } from "@/roles/shared/components/print/PrintProvenance";
import { OrganizationLogo } from "@/roles/shared/components/brand/OrganizationLogo";
import { useMockDb } from "@/providers/mock-db-provider";

interface PrintAdmissionPageProps {
  searchParams: Promise<{ id?: string | string[] }>;
}

function getCollegeLabel(program: string) {
  if (program.includes("เภสัชบำบัด")) return "วิทยาลัยเภสัชบำบัดแห่งประเทศไทย (วภท.)";
  if (program.includes("เภสัชกรรมชุมชน")) return "วิทยาลัยเภสัชกรรมชุมชนแห่งประเทศไทย (วภช.)";
  if (program.includes("คุ้มครองผู้บริโภค")) return "วิทยาลัยการคุ้มครองผู้บริโภคด้านยาและสุขภาพแห่งประเทศไทย";
  if (program.includes("บริหารเภสัชกิจ")) return "วิทยาลัยการบริหารเภสัชกิจแห่งประเทศไทย";
  return program.startsWith("วิทยาลัย") ? program : "—";
}

export default function PrintAdmissionPage({ searchParams }: PrintAdmissionPageProps) {
  const p = profileData;
  const params = use(searchParams);
  const admissionId = Array.isArray(params.id) ? params.id[0] : params.id;
  const { admissions } = useMockDb();
  const selectedAdmission = admissions.find((admission) => admission.id === admissionId);
  const hasProfileDetails = !selectedAdmission || selectedAdmission.license === p.personalInfo.licenseNumber;
  const applicantName = selectedAdmission?.name ?? `${p.personalInfo.title}${p.personalInfo.firstName} ${p.personalInfo.lastName}`;
  const applicantLicense = selectedAdmission?.license ?? p.personalInfo.licenseNumber;
  const applicantProgram = selectedAdmission?.program ?? "วุฒิบัตรแสดงความรู้ความชำนาญในการประกอบวิชาชีพเภสัชกรรม สาขาเภสัชบำบัด";
  const unavailableProfileValue = "—";

  useEffect(() => {
    // Automatically open print dialog when component mounts
    const timer = window.setTimeout(() => {
      window.print();
    }, 500);

    return () => window.clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center py-10 print:py-0 print:bg-white">
      {/* A4 Canvas */}
      <div className="relative min-h-[297mm] w-[210mm] bg-white px-[20mm] pt-[20mm] pb-[34mm] font-sans text-black shadow-lg print:shadow-none">
        
        {/* Header */}
        <div className="text-center mb-8 border-b-2 border-black pb-6 relative">
          <OrganizationLogo variant="full" className="absolute left-0 top-0 h-[32mm] w-[24mm] object-contain" />
          {hasProfileDetails ? (
            <img src="/somchai_profile.png" alt={`รูปผู้สมัคร ${applicantName}`} className="absolute right-0 top-0 w-[30mm] h-[40mm] object-cover border border-gray-300" />
          ) : (
            <div className="absolute right-0 top-0 flex h-[40mm] w-[30mm] items-center justify-center border border-gray-300 text-[10px] text-gray-500">
              ไม่มีรูปผู้สมัคร
            </div>
          )}
          <h1 className="text-xl font-bold mb-2">ราชวิทยาลัยเภสัชกรรมแห่งประเทศไทย</h1>
          <h2 className="text-lg font-semibold text-gray-700">ใบสมัครเข้ารับการฝึกอบรมและสอบความรู้ความชำนาญ</h2>
        </div>

        {/* 1. Personal Information */}
        <div className="mb-6">
          <h3 className="text-sm font-bold uppercase tracking-wider border-b border-gray-300 pb-1 mb-3">1. ข้อมูลส่วนบุคคล (Personal Information)</h3>
          <div className="grid grid-cols-12 gap-y-2 text-sm">
            <div className="col-span-4 font-semibold text-gray-700">ชื่อ - นามสกุล (TH):</div>
            <div className="col-span-8">{applicantName}</div>
            
            <div className="col-span-4 font-semibold text-gray-700">ชื่อ - นามสกุล (EN):</div>
            <div className="col-span-8">{hasProfileDetails ? `${p.personalInfo.title} ${p.personalInfo.firstNameEn} ${p.personalInfo.lastNameEn}` : unavailableProfileValue}</div>
            
            <div className="col-span-4 font-semibold text-gray-700">เลขที่ใบประกอบวิชาชีพ:</div>
            <div className="col-span-8">
              {applicantLicense}{hasProfileDetails ? ` (ออกเมื่อ ${p.personalInfo.licenseIssueDate})` : ""}
            </div>
            
            <div className="col-span-4 font-semibold text-gray-700">วัน/เดือน/ปีเกิด:</div>
            <div className="col-span-8">{hasProfileDetails ? `${p.personalInfo.birthDate} (อายุ ${p.personalInfo.age} ปี)` : unavailableProfileValue}</div>
            
            <div className="col-span-4 font-semibold text-gray-700">ที่อยู่ตามบัตรประชาชน:</div>
            <div className="col-span-8">{hasProfileDetails ? "439/18 บ้านธนารักษ์ ถ.รัตนาธิเบศร์ ต.บางกระสอ อ.เมืองนนทบุรี จ.นนทบุรี 11000" : unavailableProfileValue}</div>

            <div className="col-span-4 font-semibold text-gray-700">ที่อยู่ปัจจุบัน/ที่ติดต่อได้:</div>
            <div className="col-span-8">{hasProfileDetails ? p.personalInfo.address : unavailableProfileValue}</div>

            <div className="col-span-4 font-semibold text-gray-700">อีเมล (E-mail):</div>
            <div className="col-span-8">{hasProfileDetails ? p.personalInfo.email : unavailableProfileValue}</div>
            
            <div className="col-span-4 font-semibold text-gray-700">เบอร์มือถือ:</div>
            <div className="col-span-8">{hasProfileDetails ? p.personalInfo.phone : unavailableProfileValue}</div>
          </div>
        </div>

        {/* 2. Education */}
        <div className="mb-6">
          <h3 className="text-sm font-bold uppercase tracking-wider border-b border-gray-300 pb-1 mb-3">2. ประวัติการศึกษา (Education Background)</h3>
          <div className="grid grid-cols-12 gap-y-2 text-sm">
            <div className="col-span-4 font-semibold text-gray-700">สำเร็จการศึกษาจาก:</div>
            <div className="col-span-8">{hasProfileDetails ? p.education.bachelors.institution : unavailableProfileValue}</div>
            <div className="col-span-4 font-semibold text-gray-700">ปีที่สำเร็จการศึกษา:</div>
            <div className="col-span-8">{hasProfileDetails ? p.education.bachelors.graduationYear : unavailableProfileValue}</div>
            <div className="col-span-4 font-semibold text-gray-700">วุฒิการศึกษา:</div>
            <div className="col-span-8">{hasProfileDetails ? p.education.bachelors.degree : unavailableProfileValue}</div>
          </div>
        </div>

        {/* 3. Work Experience */}
        <div className="mb-6">
          <h3 className="text-sm font-bold uppercase tracking-wider border-b border-gray-300 pb-1 mb-3">3. สถานที่ปฏิบัติงานปัจจุบัน (Current Workplace)</h3>
          <div className="grid grid-cols-12 gap-y-2 text-sm">
            <div className="col-span-4 font-semibold text-gray-700">ชื่อหน่วยงาน:</div>
            <div className="col-span-8">{hasProfileDetails ? p.workHistory.currentWorkplace : unavailableProfileValue}</div>
            <div className="col-span-4 font-semibold text-gray-700">ที่ตั้งหน่วยงาน:</div>
            <div className="col-span-8">{hasProfileDetails ? "99 อาคารศูนย์การแพทย์ ถ.พหลโยธิน แขวงจตุจักร เขตจตุจักร กรุงเทพมหานคร 10900" : unavailableProfileValue}</div>
            <div className="col-span-4 font-semibold text-gray-700">ตำแหน่ง/ระดับ:</div>
            <div className="col-span-8">{hasProfileDetails ? `${p.workHistory.position} (${p.workHistory.level})` : unavailableProfileValue}</div>
            <div className="col-span-4 font-semibold text-gray-700">เบอร์โทรศัพท์ที่ทำงาน:</div>
            <div className="col-span-8">{hasProfileDetails ? p.workHistory.workplacePhone : unavailableProfileValue}</div>
          </div>
        </div>

        {/* 4. Admission Details */}
        <div className="mb-6">
          <h3 className="text-sm font-bold uppercase tracking-wider border-b border-gray-300 pb-1 mb-3">4. ความประสงค์ในการสมัคร (Application Intent)</h3>
          <div className="grid grid-cols-12 gap-y-2 text-sm">
            <div className="col-span-4 font-semibold text-gray-700">สมัครหลักสูตร:</div>
            <div className="col-span-8 font-bold">{applicantProgram}</div>
            <div className="col-span-4 font-semibold text-gray-700">วิทยาลัยที่สังกัด:</div>
            <div className="col-span-8">{getCollegeLabel(applicantProgram)}</div>
          </div>
        </div>

        {/* Certification Clause */}
        <div className="mt-12 text-sm text-center">
          <p className="mb-8">ข้าพเจ้าขอรับรองว่าข้อความข้างต้นเป็นความจริงทุกประการ และมีคุณสมบัติครบถ้วนตามที่กำหนด</p>
          <div className="inline-block border-b border-black w-48 mb-2"></div>
          <div>({applicantName})</div>
          <div className="text-gray-600 mt-1">ผู้สมัคร</div>
          <div className="text-gray-600 mt-1">วันที่ {selectedAdmission?.date ?? "........ / .................... / ............"}</div>
        </div>

        <PrintProvenance documentTitle={`ใบสมัครเข้ารับการฝึกอบรมและสอบความรู้ความชำนาญ${selectedAdmission ? ` (${selectedAdmission.id})` : ""}`} />
        
        {/* Print styling helper */}
        <style dangerouslySetInnerHTML={{__html: `
          @media print {
            @page { margin: 0; size: A4; }
            body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          }
        `}} />
      </div>
    </div>
  );
}
