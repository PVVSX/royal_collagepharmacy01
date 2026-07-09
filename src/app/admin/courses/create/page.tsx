"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { useMockDb } from "@/context/MockDbContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function CreateCoursePage() {
  const router = useRouter();
  const { setCourseRequests, programs } = useMockDb();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    collegeName: programs.length > 0 ? programs[0].name : "",
    courseCode: "",
    courseTitle: "",
    type: "วุฒิบัตรเฉพาะทาง",
    duration: "",
    capacity: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      const newRequest = {
        id: `CRQ-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
        collegeName: formData.collegeName,
        courseCode: formData.courseCode,
        courseTitle: formData.courseTitle,
        type: formData.type,
        duration: formData.duration,
        capacity: parseInt(formData.capacity) || 0,
        status: "pending" as const,
        submittedAt: new Date().toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' }),
      };

      setCourseRequests(prev => [newRequest, ...prev]);
      
      toast.success("ส่งคำขอเปิดรายวิชาสำเร็จ", {
        description: "ข้อมูลถูกส่งไปยังสภาเภสัชกรรมเพื่อรอการอนุมัติแล้ว",
      });
      
      router.push("/admin/courses");
    }, 1000);
  };

  return (
    <div className="p-4 md:p-6 pb-24 max-w-3xl mx-auto">
      <div className="mb-6 flex items-center gap-4">
        <Link href="/admin/courses">
          <Button variant="outline" size="icon" className="h-9 w-9 rounded-full">
            <span className="material-symbols-outlined text-lg">arrow_back</span>
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">ยื่นขอเปิดรายวิชาใหม่</h1>
          <p className="text-sm text-slate-500 mt-1">กรอกข้อมูลรายวิชาเพื่อให้สภาเภสัชกรรมตรวจสอบและรับรอง</p>
        </div>
      </div>

      <Card className="card-shadow">
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label htmlFor="collegeName" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">วิทยาลัย / สถาบันฝึกอบรม</label>
              <select
                id="collegeName"
                name="collegeName"
                required
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={formData.collegeName}
                onChange={handleChange}
              >
                <option value="">-- เลือกวิทยาลัย --</option>
                {programs.map(p => (
                  <option key={p.id} value={p.name}>{p.name}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label htmlFor="courseCode" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">รหัสรายวิชา</label>
                <Input id="courseCode" name="courseCode" placeholder="เช่น BCP-501" required value={formData.courseCode} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <label htmlFor="courseTitle" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">ชื่อรายวิชา / ชื่อหลักสูตร</label>
                <Input id="courseTitle" name="courseTitle" placeholder="เช่น การบริบาลทางเภสัชกรรมผู้ป่วยวิกฤต" required value={formData.courseTitle} onChange={handleChange} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label htmlFor="type" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">ประเภทหลักสูตร</label>
                <select
                  id="type"
                  name="type"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={formData.type}
                  onChange={handleChange}
                >
                  <option value="วุฒิบัตรเฉพาะทาง">วุฒิบัตรเฉพาะทาง (3 ปี)</option>
                  <option value="ประกาศนียบัตรระยะสั้น">ประกาศนียบัตรระยะสั้น (16 สัปดาห์)</option>
                </select>
              </div>
              <div className="space-y-2">
                <label htmlFor="duration" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">ระยะเวลาการฝึกอบรม</label>
                <Input id="duration" name="duration" placeholder="เช่น 16 สัปดาห์ หรือ 3 ปี" required value={formData.duration} onChange={handleChange} />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="capacity" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">จำนวนที่เปิดรับสมัคร (คน)</label>
              <Input id="capacity" name="capacity" type="number" min="1" placeholder="จำนวนที่นั่ง" required value={formData.capacity} onChange={handleChange} />
            </div>

            <div className="pt-4 flex justify-end gap-3 border-t">
              <Link href="/admin/courses">
                <Button type="button" variant="outline">ยกเลิก</Button>
              </Link>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <span className="material-symbols-outlined animate-spin mr-2 text-lg">sync</span>
                    กำลังบันทึก...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined mr-2 text-lg">send</span>
                    ส่งคำขออนุมัติ
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
