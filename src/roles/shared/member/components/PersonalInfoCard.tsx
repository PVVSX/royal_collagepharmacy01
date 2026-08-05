import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export interface PersonalInfoCardProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any; // using any for rapid prototyping, replace with proper type later
  isReadOnly?: boolean;
}

export function PersonalInfoCard({ data, isReadOnly = true }: PersonalInfoCardProps) {
  const inputClassName = isReadOnly ? "bg-muted/50 h-9 text-sm font-medium" : "h-9 text-sm";
  const labelClassName = "text-xs text-muted-foreground";

  return (
    <Card className="card-shadow">
      <CardHeader className="pb-3 border-b border-border/50 bg-muted/20">
        <CardTitle className="text-base flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-xl">person</span>
          ข้อมูลผู้ประกอบวิชาชีพเภสัชกรรม
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-5 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-1">
          <label className={labelClassName}>คำนำหน้า (TH)</label>
          <Input readOnly={isReadOnly} defaultValue={data.title} className={inputClassName} />
        </div>
        <div className="space-y-1">
          <label className={labelClassName}>ชื่อ (TH)</label>
          <Input readOnly={isReadOnly} defaultValue={data.firstName} className={inputClassName} />
        </div>
        <div className="space-y-1">
          <label className={labelClassName}>นามสกุล (TH)</label>
          <Input readOnly={isReadOnly} defaultValue={data.lastName} className={inputClassName} />
        </div>

        <div className="space-y-1">
          <label className={labelClassName}>คำนำหน้า (EN)</label>
          <Input readOnly={isReadOnly} defaultValue="Miss" className={inputClassName} />
        </div>
        <div className="space-y-1">
          <label className={labelClassName}>ชื่อ (EN)</label>
          <Input readOnly={isReadOnly} defaultValue={data.firstNameEn} className={inputClassName} />
        </div>
        <div className="space-y-1">
          <label className={labelClassName}>นามสกุล (EN)</label>
          <Input readOnly={isReadOnly} defaultValue={data.lastNameEn} className={inputClassName} />
        </div>

        <div className="space-y-1">
          <label className={labelClassName}>วันเดือนปีเกิด</label>
          <Input readOnly={isReadOnly} defaultValue={data.birthDate} className={inputClassName} />
        </div>
        <div className="space-y-1">
          <label className={labelClassName}>อายุ (ปี)</label>
          <Input readOnly={isReadOnly} defaultValue={data.age?.toString()} className={inputClassName} />
        </div>
        <div className="space-y-1 hidden md:block"></div>

        <div className="space-y-1">
          <label className={labelClassName}>สัญชาติ</label>
          <Input readOnly={isReadOnly} defaultValue={data.nationality} className={inputClassName} />
        </div>
        <div className="space-y-1">
          <label className={labelClassName}>เชื้อชาติ</label>
          <Input readOnly={isReadOnly} defaultValue="ไทย" className={inputClassName} />
        </div>
        <div className="space-y-1 hidden md:block"></div>

        <div className="space-y-1 md:col-span-2">
          <label className={labelClassName}>สำเร็จการศึกษาจาก (ปริญญาตรี)</label>
          <Input readOnly={isReadOnly} defaultValue={data.education?.bachelors?.institution || "จุฬาลงกรณ์มหาวิทยาลัย"} className={inputClassName} />
        </div>
        <div className="space-y-1">
          <label className={labelClassName}>ปีที่จบ</label>
          <Input readOnly={isReadOnly} defaultValue={data.education?.bachelors?.graduationYear || "2565"} className={inputClassName} />
        </div>

        <div className="space-y-1">
          <label className={labelClassName}>สาขาปฏิบัติงานหลัก</label>
          <Input readOnly={isReadOnly} defaultValue="เภสัชกรโรงพยาบาล" className={inputClassName} />
        </div>
        <div className="space-y-1">
          <label className={labelClassName}>สาขาปฏิบัติงานรอง</label>
          <Input readOnly={isReadOnly} defaultValue="-" className={inputClassName} />
        </div>
        <div className="space-y-1">
          <label className={labelClassName}>วิธีการรับข่าวสาร</label>
          <Input readOnly={isReadOnly} defaultValue="E-mail" className={inputClassName} />
        </div>
      </CardContent>
    </Card>
  );
}
