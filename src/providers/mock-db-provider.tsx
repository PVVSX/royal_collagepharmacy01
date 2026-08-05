"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

// Types
export type Status = "pending" | "approved" | "rejected";

export interface Admission {
  id: string;
  name: string;
  license: string;
  program: string;
  date: string;
  status: Status;
}

export interface Payment {
  id: string;
  studentId: string;
  name: string;
  program: string;
  amount: number;
  date: string;
  status: Status;
  type: string;
}

export interface Program {
  id: string;
  name: string;
  studentsCount: number;
  status: "active" | "draft";
  lastUpdated: string;
}

export interface CourseRequest {
  id: string;
  collegeName: string;
  courseCode: string;
  courseTitle: string;
  type: string;
  duration: string;
  capacity: number;
  status: Status;
  submittedAt: string;
}

export interface Registration {
  id: string;
  studentId: string;
  studentName: string;
  courseId: string;
  courseCode: string;
  courseTitle: string;
  term: string;
  status: Status;
  submittedAt: string;
}

export interface ExamRequest {
  id: string;
  studentId: string;
  studentName: string;
  program: string;
  examType: string;
  logbookUrl: string;
  status: "pending" | "approved" | "rejected" | "passed" | "failed";
  submittedAt: string;
  examDate?: string;
}

export interface Certificate {
  id: string;
  studentId: string;
  studentName: string;
  program: string;
  issuedAt: string;
  status: "pending_approval" | "issued";
}

export interface Settings {
  admissionOpen: boolean;
  registrationOpen: boolean;
}

interface MockDbContextType {
  admissions: Admission[];
  setAdmissions: React.Dispatch<React.SetStateAction<Admission[]>>;
  updateAdmissionStatus: (id: string, status: Status) => void;
  
  payments: Payment[];
  setPayments: React.Dispatch<React.SetStateAction<Payment[]>>;
  updatePaymentStatus: (id: string, status: Status) => void;
  addPayment: (payment: Payment) => void;

  programs: Program[];
  setPrograms: React.Dispatch<React.SetStateAction<Program[]>>;

  courseRequests: CourseRequest[];
  setCourseRequests: React.Dispatch<React.SetStateAction<CourseRequest[]>>;
  updateCourseRequestStatus: (id: string, status: Status) => void;

  registrations: Registration[];
  setRegistrations: React.Dispatch<React.SetStateAction<Registration[]>>;
  updateRegistrationStatus: (id: string, status: Status) => void;

  examRequests: ExamRequest[];
  setExamRequests: React.Dispatch<React.SetStateAction<ExamRequest[]>>;
  updateExamRequestStatus: (id: string, status: ExamRequest["status"]) => void;

  certificates: Certificate[];
  setCertificates: React.Dispatch<React.SetStateAction<Certificate[]>>;
  updateCertificateStatus: (id: string, status: Certificate["status"]) => void;

  settings: Settings;
  updateSettings: (settings: Partial<Settings>) => void;
}

const defaultAdmissions: Admission[] = [
  { id: "APP-2026-001", name: "ภก. สมชาย ใจดี", license: "ภ.12345", program: "เภสัชบำบัด", date: "24 มิ.ย. 2569", status: "pending" },
  { id: "APP-2026-002", name: "ภญ. สมหญิง รักชาติ", license: "ภ.23456", program: "เภสัชกรรมชุมชน", date: "23 มิ.ย. 2569", status: "pending" },
  { id: "APP-2026-003", name: "ภก. มานะ อดทน", license: "ภ.34567", program: "การคุ้มครองผู้บริโภค", date: "22 มิ.ย. 2569", status: "approved" },
];

const defaultPayments: Payment[] = [
  { id: "PAY-2569-001", studentId: "RPC-2569-001", name: "ภญ. คาริน่า ยู", program: "เภสัชบำบัด", amount: 25000, date: "24 มิ.ย. 2569", status: "pending", type: "ค่าลงทะเบียนเรียน" },
  { id: "PAY-2569-002", studentId: "RPC-2569-002", name: "ภก. สมชาย ใจดี", program: "เภสัชบำบัด", amount: 25000, date: "23 มิ.ย. 2569", status: "pending", type: "ค่าลงทะเบียนเรียน" },
];

const defaultPrograms: Program[] = [
  { id: "PRG-01", name: "วิทยาลัยเภสัชกรรมบำบัด", studentsCount: 450, status: "active", lastUpdated: "12 มิ.ย. 2569" },
  { id: "PRG-02", name: "วิทยาลัยเภสัชกรรมชุมชน", studentsCount: 320, status: "active", lastUpdated: "10 มิ.ย. 2569" },
];

const defaultCourseRequests: CourseRequest[] = [
  { id: "CRQ-001", collegeName: "วิทยาลัยเภสัชกรรมบำบัด", courseCode: "BCP-501", courseTitle: "การบริบาลทางเภสัชกรรมผู้ป่วยวิกฤต", type: "วุฒิบัตรเฉพาะทาง", duration: "16 สัปดาห์", capacity: 30, status: "pending", submittedAt: "24 มิ.ย. 2569" },
  { id: "CRQ-002", collegeName: "วิทยาลัยการคุ้มครองผู้บริโภค", courseCode: "CPA-102", courseTitle: "กฎหมายและจริยธรรมวิชาชีพขั้นสูง", type: "ประกาศนียบัตรระยะสั้น", duration: "8 สัปดาห์", capacity: 50, status: "approved", submittedAt: "20 มิ.ย. 2569" },
];

const defaultRegistrations: Registration[] = [
  { id: "REG-001", studentId: "RPC-2569-001", studentName: "ภญ. คาริน่า ยู", courseId: "C1", courseCode: "BCP-101", courseTitle: "เภสัชบำบัดพื้นฐาน", term: "1/2569", status: "pending", submittedAt: "24 มิ.ย. 2569" },
  { id: "REG-002", studentId: "RPC-2569-002", studentName: "ภก. สมชาย ใจดี", courseId: "C2", courseCode: "BCP-102", courseTitle: "เภสัชจลนศาสตร์คลินิก", term: "1/2569", status: "pending", submittedAt: "24 มิ.ย. 2569" },
];

const defaultExamRequests: ExamRequest[] = [
  { id: "EXM-001", studentId: "RPC-2566-045", studentName: "ภก. วิทยา ตั้งใจ", program: "เภสัชบำบัด", examType: "สอบประเมินความรู้ขั้นสุดท้าย (Board Exam)", logbookUrl: "logbook_vithaya.pdf", status: "pending", submittedAt: "24 มิ.ย. 2569", examDate: "15 ก.ค. 2569" },
  { id: "EXM-002", studentId: "RPC-2566-089", studentName: "ภญ. มาลี สวยดี", program: "เภสัชกรรมชุมชน", examType: "สอบประเมินความรู้ขั้นสุดท้าย (Board Exam)", logbookUrl: "logbook_malee.pdf", status: "approved", submittedAt: "20 มิ.ย. 2569", examDate: "15 ก.ค. 2569" },
];

const defaultCertificates: Certificate[] = [
  { id: "CERT-001", studentId: "RPC-2566-045", studentName: "ภก. วิทยา ตั้งใจ", program: "เภสัชบำบัด", issuedAt: "รอดำเนินการ", status: "pending_approval" },
];

const defaultSettings: Settings = {
  admissionOpen: true,
  registrationOpen: true, // Set to true by default so user can test Registration
};

const MockDbContext = createContext<MockDbContextType | undefined>(undefined);

export function MockDbProvider({ children }: { children: ReactNode }) {
  const [admissions, setAdmissions] = useState<Admission[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [courseRequests, setCourseRequests] = useState<CourseRequest[]>([]);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [examRequests, setExamRequests] = useState<ExamRequest[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [settings, setSettings] = useState<Settings>({ admissionOpen: true, registrationOpen: true });
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const s = (k: string) => localStorage.getItem(k);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const p = (v: string | null, d: any) => v ? JSON.parse(v) : d;

    /* eslint-disable react-hooks/set-state-in-effect */
    setAdmissions(p(s("mock_admissions"), defaultAdmissions));
    setPayments(p(s("mock_payments"), defaultPayments));
    setPrograms(p(s("mock_programs"), defaultPrograms));
    setCourseRequests(p(s("mock_courseRequests"), defaultCourseRequests));
    setRegistrations(p(s("mock_registrations"), defaultRegistrations));
    setExamRequests(p(s("mock_examRequests"), defaultExamRequests));
    setCertificates(p(s("mock_certificates"), defaultCertificates));
    setSettings(p(s("mock_settings"), defaultSettings));

    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (!isLoaded) return;
    localStorage.setItem("mock_admissions", JSON.stringify(admissions));
    localStorage.setItem("mock_payments", JSON.stringify(payments));
    localStorage.setItem("mock_programs", JSON.stringify(programs));
    localStorage.setItem("mock_courseRequests", JSON.stringify(courseRequests));
    localStorage.setItem("mock_registrations", JSON.stringify(registrations));
    localStorage.setItem("mock_examRequests", JSON.stringify(examRequests));
    localStorage.setItem("mock_certificates", JSON.stringify(certificates));
    localStorage.setItem("mock_settings", JSON.stringify(settings));
  }, [admissions, payments, programs, courseRequests, registrations, examRequests, certificates, settings, isLoaded]);

  const updateAdmissionStatus = (id: string, status: Status) => setAdmissions(prev => prev.map(a => a.id === id ? { ...a, status } : a));
  const updatePaymentStatus = (id: string, status: Status) => setPayments(prev => prev.map(p => p.id === id ? { ...p, status } : p));
  const addPayment = (payment: Payment) => setPayments(prev => [payment, ...prev]);
  const updateCourseRequestStatus = (id: string, status: Status) => setCourseRequests(prev => prev.map(r => r.id === id ? { ...r, status } : r));
  const updateRegistrationStatus = (id: string, status: Status) => setRegistrations(prev => prev.map(r => r.id === id ? { ...r, status } : r));
  const updateExamRequestStatus = (id: string, status: ExamRequest["status"]) => setExamRequests(prev => prev.map(r => r.id === id ? { ...r, status } : r));
  const updateCertificateStatus = (id: string, status: Certificate["status"]) => setCertificates(prev => prev.map(r => r.id === id ? { ...r, status } : r));
  const updateSettings = (newSettings: Partial<Settings>) => setSettings(prev => ({ ...prev, ...newSettings }));

  return (
    <MockDbContext.Provider
      value={{
        admissions, setAdmissions, updateAdmissionStatus,
        payments, setPayments, updatePaymentStatus, addPayment,
        programs, setPrograms,
        courseRequests, setCourseRequests, updateCourseRequestStatus,
        registrations, setRegistrations, updateRegistrationStatus,
        examRequests, setExamRequests, updateExamRequestStatus,
        certificates, setCertificates, updateCertificateStatus,
        settings, updateSettings,
      }}
    >
      {children}
    </MockDbContext.Provider>
  );
}

export function useMockDb() {
  const context = useContext(MockDbContext);
  if (context === undefined) throw new Error("useMockDb must be used within a MockDbProvider");
  return context;
}
