"use client";

import { useEffect } from "react";
import { profileData, studentDetailData } from "@/data";

export default function PrintProfilePage() {
  const p = profileData;
  const s = studentDetailData;

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
          <h1 className="text-2xl font-bold mb-2 tracking-wide">ประวัติส่วนบุคคล</h1>
          <h2 className="text-lg font-semibold text-gray-700">Curriculum Vitae</h2>
        </div>

        {/* 1. Personal Information */}
        <div className="mb-6">
          <h3 className="text-sm font-bold uppercase tracking-wider border-b border-gray-300 pb-1 mb-3">1. ข้อมูลส่วนบุคคล (Personal Information)</h3>
          <div className="grid grid-cols-12 gap-y-2 text-sm">
            <div className="col-span-4 font-semibold text-gray-700">ชื่อ - นามสกุล:</div>
            <div className="col-span-8">{p.personalInfo.title}{p.personalInfo.firstName} {p.personalInfo.lastName}</div>
            
            <div className="col-span-4 font-semibold text-gray-700">Name (English):</div>
            <div className="col-span-8">{p.personalInfo.title} {p.personalInfo.firstNameEn} {p.personalInfo.lastNameEn}</div>
            
            <div className="col-span-4 font-semibold text-gray-700">เลขที่ใบประกอบวิชาชีพ:</div>
            <div className="col-span-8">{p.personalInfo.licenseNumber} (ออกเมื่อ {p.personalInfo.licenseIssueDate})</div>
            
            <div className="col-span-4 font-semibold text-gray-700">วัน/เดือน/ปีเกิด:</div>
            <div className="col-span-8">{p.personalInfo.birthDate} (อายุ {p.personalInfo.age} ปี)</div>
            
            <div className="col-span-4 font-semibold text-gray-700">สัญชาติ / ศาสนา:</div>
            <div className="col-span-8">{p.personalInfo.nationality} / {s.religion}</div>
            
            <div className="col-span-4 font-semibold text-gray-700">อีเมล (E-mail):</div>
            <div className="col-span-8">{p.personalInfo.email}</div>
            
            <div className="col-span-4 font-semibold text-gray-700">เบอร์โทรศัพท์:</div>
            <div className="col-span-8">{p.personalInfo.phone}</div>
            
            <div className="col-span-4 font-semibold text-gray-700">ที่อยู่ที่ติดต่อได้:</div>
            <div className="col-span-8">{p.personalInfo.address}</div>
          </div>
        </div>

        {/* 2. Education */}
        <div className="mb-6">
          <h3 className="text-sm font-bold uppercase tracking-wider border-b border-gray-300 pb-1 mb-3">2. ประวัติการศึกษา (Education Background)</h3>
          <div className="space-y-3 text-sm">
            <div className="grid grid-cols-12">
              <div className="col-span-3 font-medium text-gray-600">ปี {p.education.bachelors.graduationYear}</div>
              <div className="col-span-9">
                <div className="font-bold">{p.education.bachelors.degree}</div>
                <div>{p.education.bachelors.institution}</div>
                <div className="text-gray-600 text-xs mt-0.5">เกรดเฉลี่ยสะสมระดับปริญญาตรี: {p.education.bachelors.gpa}</div>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Work Experience */}
        <div className="mb-6">
          <h3 className="text-sm font-bold uppercase tracking-wider border-b border-gray-300 pb-1 mb-3">3. ประวัติการทำงาน (Work Experience)</h3>
          
          <div className="mb-4 text-sm">
            <div className="font-bold mb-1">สถานที่ทำงานปัจจุบัน:</div>
            <div className="grid grid-cols-12 gap-y-1 ml-4">
              <div className="col-span-4 font-medium text-gray-700">หน่วยงาน:</div>
              <div className="col-span-8">{p.workHistory.currentWorkplace}</div>
              
              <div className="col-span-4 font-medium text-gray-700">ตำแหน่ง/ระดับ:</div>
              <div className="col-span-8">{p.workHistory.position} ({p.workHistory.level})</div>
              
              <div className="col-span-4 font-medium text-gray-700">เบอร์โทรศัพท์ที่ทำงาน:</div>
              <div className="col-span-8">{p.workHistory.workplacePhone}</div>
              
              <div className="col-span-4 font-medium text-gray-700">หน้าที่รับผิดชอบ:</div>
              <div className="col-span-8">{p.workHistory.responsibilities}</div>
            </div>
          </div>

          <div className="text-sm">
            <div className="font-bold mb-2">ประวัติการทำงานย้อนหลัง:</div>
            <div className="space-y-2 ml-4">
              {p.workHistory.previousJobs.map((job, i) => (
                <div key={i} className="grid grid-cols-12">
                  <div className="col-span-4 font-medium text-gray-600">{job.year}</div>
                  <div className="col-span-8">
                    <div className="font-semibold">{job.position}</div>
                    <div>{job.workplace}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Certification Clause */}
        <div className="mt-16 text-sm text-center">
          <p className="mb-8">ขอรับรองว่าข้อความข้างต้นเป็นความจริงทุกประการ</p>
          <div className="inline-block border-b border-black w-48 mb-2"></div>
          <div>({p.personalInfo.title}{p.personalInfo.firstName} {p.personalInfo.lastName})</div>
          <div className="text-gray-600 mt-1">ผู้ให้ข้อมูล</div>
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
