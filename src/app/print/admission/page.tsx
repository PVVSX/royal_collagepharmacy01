"use client";

import { useEffect } from "react";
import { profileData } from "@/data";

export default function PrintAdmissionPage() {
  const p = profileData;

  useEffect(() => {
    // Automatically open print dialog when component mounts
    setTimeout(() => {
      window.print();
    }, 500);
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center py-10 print:py-0 print:bg-white">
      {/* A4 Canvas */}
      <div className="bg-white w-[210mm] min-h-[297mm] shadow-lg print:shadow-none p-[20mm] text-black font-sans relative">
        
        {/* Header */}
        <div className="text-center mb-8 border-b-2 border-black pb-6 relative">
          <img src="/somchai_profile.png" alt="Profile" className="absolute right-0 top-0 w-[30mm] h-[40mm] object-cover border border-gray-300" />
          <h1 className="text-xl font-bold mb-2">ราชวิทยาลัยเภสัชกรรมแห่งประเทศไทย</h1>
          <h2 className="text-lg font-semibold text-gray-700">ใบสมัครเข้ารับการฝึกอบรมและสอบความรู้ความชำนาญ</h2>
        </div>

        {/* 1. Personal Information */}
        <div className="mb-6">
          <h3 className="text-sm font-bold uppercase tracking-wider border-b border-gray-300 pb-1 mb-3">1. ข้อมูลส่วนบุคคล (Personal Information)</h3>
          <div className="grid grid-cols-12 gap-y-2 text-sm">
            <div className="col-span-4 font-semibold text-gray-700">ชื่อ - นามสกุล (TH):</div>
            <div className="col-span-8">{p.personalInfo.title}{p.personalInfo.firstName} {p.personalInfo.lastName}</div>
            
            <div className="col-span-4 font-semibold text-gray-700">ชื่อ - นามสกุล (EN):</div>
            <div className="col-span-8">{p.personalInfo.title} {p.personalInfo.firstNameEn} {p.personalInfo.lastNameEn}</div>
            
            <div className="col-span-4 font-semibold text-gray-700">เลขที่ใบประกอบวิชาชีพ:</div>
            <div className="col-span-8">{p.personalInfo.licenseNumber} (ออกเมื่อ {p.personalInfo.licenseIssueDate})</div>
            
            <div className="col-span-4 font-semibold text-gray-700">วัน/เดือน/ปีเกิด:</div>
            <div className="col-span-8">{p.personalInfo.birthDate} (อายุ {p.personalInfo.age} ปี)</div>
            
            <div className="col-span-4 font-semibold text-gray-700">ที่อยู่ตามบัตรประชาชน:</div>
            <div className="col-span-8">439/18 บ้านธนารักษ์ ถ.รัตนาธิเบศร์ ต.บางกระสอ อ.เมืองนนทบุรี จ.นนทบุรี 11000</div>

            <div className="col-span-4 font-semibold text-gray-700">ที่อยู่ปัจจุบัน/ที่ติดต่อได้:</div>
            <div className="col-span-8">{p.personalInfo.address}</div>

            <div className="col-span-4 font-semibold text-gray-700">อีเมล (E-mail):</div>
            <div className="col-span-8">{p.personalInfo.email}</div>
            
            <div className="col-span-4 font-semibold text-gray-700">เบอร์มือถือ:</div>
            <div className="col-span-8">{p.personalInfo.phone}</div>
          </div>
        </div>

        {/* 2. Education */}
        <div className="mb-6">
          <h3 className="text-sm font-bold uppercase tracking-wider border-b border-gray-300 pb-1 mb-3">2. ประวัติการศึกษา (Education Background)</h3>
          <div className="grid grid-cols-12 gap-y-2 text-sm">
            <div className="col-span-4 font-semibold text-gray-700">สำเร็จการศึกษาจาก:</div>
            <div className="col-span-8">{p.education.bachelors.institution}</div>
            <div className="col-span-4 font-semibold text-gray-700">ปีที่สำเร็จการศึกษา:</div>
            <div className="col-span-8">{p.education.bachelors.graduationYear}</div>
            <div className="col-span-4 font-semibold text-gray-700">วุฒิการศึกษา:</div>
            <div className="col-span-8">{p.education.bachelors.degree}</div>
          </div>
        </div>

        {/* 3. Work Experience */}
        <div className="mb-6">
          <h3 className="text-sm font-bold uppercase tracking-wider border-b border-gray-300 pb-1 mb-3">3. สถานที่ปฏิบัติงานปัจจุบัน (Current Workplace)</h3>
          <div className="grid grid-cols-12 gap-y-2 text-sm">
            <div className="col-span-4 font-semibold text-gray-700">ชื่อหน่วยงาน:</div>
            <div className="col-span-8">{p.workHistory.currentWorkplace}</div>
            <div className="col-span-4 font-semibold text-gray-700">ที่ตั้งหน่วยงาน:</div>
            <div className="col-span-8">99 อาคารศูนย์การแพทย์ ถ.พหลโยธิน แขวงจตุจักร เขตจตุจักร กรุงเทพมหานคร 10900</div>
            <div className="col-span-4 font-semibold text-gray-700">ตำแหน่ง/ระดับ:</div>
            <div className="col-span-8">{p.workHistory.position} ({p.workHistory.level})</div>
            <div className="col-span-4 font-semibold text-gray-700">เบอร์โทรศัพท์ที่ทำงาน:</div>
            <div className="col-span-8">{p.workHistory.workplacePhone}</div>
          </div>
        </div>

        {/* 4. Admission Details */}
        <div className="mb-6">
          <h3 className="text-sm font-bold uppercase tracking-wider border-b border-gray-300 pb-1 mb-3">4. ความประสงค์ในการสมัคร (Application Intent)</h3>
          <div className="grid grid-cols-12 gap-y-2 text-sm">
            <div className="col-span-4 font-semibold text-gray-700">สมัครหลักสูตร:</div>
            <div className="col-span-8 font-bold">วุฒิบัตรแสดงความรู้ความชำนาญในการประกอบวิชาชีพเภสัชกรรม สาขาเภสัชบำบัด</div>
            <div className="col-span-4 font-semibold text-gray-700">วิทยาลัยที่สังกัด:</div>
            <div className="col-span-8">วิทยาลัยเภสัชบำบัดแห่งประเทศไทย (วภท.)</div>
          </div>
        </div>

        {/* Certification Clause */}
        <div className="mt-12 text-sm text-center">
          <p className="mb-8">ข้าพเจ้าขอรับรองว่าข้อความข้างต้นเป็นความจริงทุกประการ และมีคุณสมบัติครบถ้วนตามที่กำหนด</p>
          <div className="inline-block border-b border-black w-48 mb-2"></div>
          <div>({p.personalInfo.title}{p.personalInfo.firstName} {p.personalInfo.lastName})</div>
          <div className="text-gray-600 mt-1">ผู้สมัคร</div>
          <div className="text-gray-600 mt-1">วันที่ ........ / .................... / ............</div>
        </div>
        
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
