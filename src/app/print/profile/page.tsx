"use client";

import { useEffect } from "react";
import { profileData, studentDetailData } from "@/roles/shared/data";
import { PrintProvenance } from "@/roles/shared/components/print/PrintProvenance";
import { OrganizationLogo } from "@/roles/shared/components/brand/OrganizationLogo";

export default function PrintProfilePage() {
  const p = profileData;
  const s = studentDetailData;

  useEffect(() => {
    // Automatically open print dialog when component mounts
    const timer = window.setTimeout(() => {
      window.print();
    }, 500);

    return () => window.clearTimeout(timer);
  }, []);

  return (
    <div className="portal-print-root flex min-h-screen justify-center bg-print-canvas py-10 print:bg-print-paper print:py-0">
      {/* A4 Canvas */}
      <div className="relative min-h-[297mm] w-[210mm] bg-print-paper px-[20mm] pt-[20mm] pb-[34mm] font-sans text-print-ink shadow-lg print:shadow-none">
        
        {/* Header */}
        <div className="relative mb-8 border-b-2 border-print-ink pb-6 text-center">
          <OrganizationLogo variant="full" className="absolute left-0 top-0 h-[32mm] w-[24mm] object-contain" />
          <img src="/somchai_profile.png" alt="Profile" className="absolute right-0 top-0 h-[40mm] w-[30mm] border border-print-border object-cover" />
          <h1 className="text-2xl font-bold mb-2 tracking-wide">ประวัติส่วนบุคคล</h1>
          <h2 className="text-lg font-semibold text-print-label">Curriculum Vitae</h2>
        </div>

        {/* 1. Personal Information */}
        <div className="mb-6">
          <h3 className="mb-3 border-b border-print-border pb-1 text-sm font-bold uppercase tracking-wider">1. ข้อมูลส่วนบุคคล (Personal Information)</h3>
          <div className="grid grid-cols-12 gap-y-2 text-sm">
            <div className="col-span-4 font-semibold text-print-label">ชื่อ - นามสกุล:</div>
            <div className="col-span-8">{p.personalInfo.title}{p.personalInfo.firstName} {p.personalInfo.lastName}</div>
            
            <div className="col-span-4 font-semibold text-print-label">Name (English):</div>
            <div className="col-span-8">{p.personalInfo.title} {p.personalInfo.firstNameEn} {p.personalInfo.lastNameEn}</div>
            
            <div className="col-span-4 font-semibold text-print-label">เลขที่ใบประกอบวิชาชีพ:</div>
            <div className="col-span-8">{p.personalInfo.licenseNumber} (ออกเมื่อ {p.personalInfo.licenseIssueDate})</div>
            
            <div className="col-span-4 font-semibold text-print-label">วัน/เดือน/ปีเกิด:</div>
            <div className="col-span-8">{p.personalInfo.birthDate} (อายุ {p.personalInfo.age} ปี)</div>
            
            <div className="col-span-4 font-semibold text-print-label">สัญชาติ / ศาสนา:</div>
            <div className="col-span-8">{p.personalInfo.nationality} / {s.religion}</div>
            
            <div className="col-span-4 font-semibold text-print-label">อีเมล (E-mail):</div>
            <div className="col-span-8">{p.personalInfo.email}</div>
            
            <div className="col-span-4 font-semibold text-print-label">เบอร์โทรศัพท์:</div>
            <div className="col-span-8">{p.personalInfo.phone}</div>
            
            <div className="col-span-4 font-semibold text-print-label">ที่อยู่ที่ติดต่อได้:</div>
            <div className="col-span-8">{p.personalInfo.address}</div>
          </div>
        </div>

        {/* 2. Education */}
        <div className="mb-6">
          <h3 className="mb-3 border-b border-print-border pb-1 text-sm font-bold uppercase tracking-wider">2. ประวัติการศึกษา (Education Background)</h3>
          <div className="space-y-3 text-sm">
            <div className="grid grid-cols-12">
              <div className="col-span-3 font-medium text-print-muted">ปี {p.education.bachelors.graduationYear}</div>
              <div className="col-span-9">
                <div className="font-bold">{p.education.bachelors.degree}</div>
                <div>{p.education.bachelors.institution}</div>
                <div className="mt-0.5 text-xs text-print-muted">เกรดเฉลี่ยสะสมระดับปริญญาตรี: {p.education.bachelors.gpa}</div>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Work Experience */}
        <div className="mb-6">
          <h3 className="mb-3 border-b border-print-border pb-1 text-sm font-bold uppercase tracking-wider">3. ประวัติการทำงาน (Work Experience)</h3>
          
          <div className="mb-4 text-sm">
            <div className="font-bold mb-1">สถานที่ทำงานปัจจุบัน:</div>
            <div className="grid grid-cols-12 gap-y-1 ml-4">
              <div className="col-span-4 font-medium text-print-label">หน่วยงาน:</div>
              <div className="col-span-8">{p.workHistory.currentWorkplace}</div>
              
              <div className="col-span-4 font-medium text-print-label">ตำแหน่ง/ระดับ:</div>
              <div className="col-span-8">{p.workHistory.position} ({p.workHistory.level})</div>
              
              <div className="col-span-4 font-medium text-print-label">เบอร์โทรศัพท์ที่ทำงาน:</div>
              <div className="col-span-8">{p.workHistory.workplacePhone}</div>
              
              <div className="col-span-4 font-medium text-print-label">หน้าที่รับผิดชอบ:</div>
              <div className="col-span-8">{p.workHistory.responsibilities}</div>
            </div>
          </div>

          <div className="text-sm">
            <div className="font-bold mb-2">ประวัติการทำงานย้อนหลัง:</div>
            <div className="space-y-2 ml-4">
              {p.workHistory.previousJobs.map((job, i) => (
                <div key={i} className="grid grid-cols-12">
                  <div className="col-span-4 font-medium text-print-muted">{job.year}</div>
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
          <div className="mb-2 inline-block w-48 border-b border-print-ink"></div>
          <div>({p.personalInfo.title}{p.personalInfo.firstName} {p.personalInfo.lastName})</div>
          <div className="mt-1 text-print-muted">ผู้ให้ข้อมูล</div>
        </div>

        <PrintProvenance documentTitle="ประวัติส่วนบุคคล (Curriculum Vitae)" />
      </div>
    </div>
  );
}
