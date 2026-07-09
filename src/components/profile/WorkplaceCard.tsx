import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export interface WorkplaceCardProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any; // Rapid prototyping
  isReadOnly?: boolean;
}

export function WorkplaceCard({ data, isReadOnly = true }: WorkplaceCardProps) {
  const inputClassName = isReadOnly ? "bg-muted/50 h-9 text-sm" : "h-9 text-sm";
  const labelClassName = "text-xs text-muted-foreground";

  // Mock fields for the legacy workplace address format
  const no = "99";
  const building = "อาคารศูนย์การแพทย์";
  const moo = "-";
  const alley = "-";
  const street = "พหลโยธิน";
  const subDistrict = "จตุจักร";
  const district = "จตุจักร";
  const province = "กรุงเทพมหานคร";
  const zip = "10900";
  const phone = "02-999-9999";

  return (
    <Card className="card-shadow">
      <CardHeader className="pb-3 border-b border-border/50 bg-muted/20">
        <CardTitle className="text-base flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-xl">work</span>
            สถานที่ปฏิบัติงานปัจจุบัน
          </div>
          <label className="flex items-center gap-2 text-sm font-normal text-muted-foreground cursor-pointer">
            <input 
              type="checkbox" 
              className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary" 
              disabled={isReadOnly} 
              defaultChecked={false}
            />
            ไม่ได้ปฏิบัติงาน
          </label>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-5 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-1 md:col-span-3">
          <label className={labelClassName}>ชื่อหน่วยงาน</label>
          <Input readOnly={isReadOnly} defaultValue={data?.currentWorkplace || "โรงพยาบาลศูนย์การแพทย์ควังยา"} className={inputClassName} />
        </div>

        <div className="space-y-1">
          <label className={labelClassName}>เลขที่</label>
          <Input readOnly={isReadOnly} defaultValue={no} className={inputClassName} />
        </div>
        <div className="space-y-1">
          <label className={labelClassName}>หมู่บ้าน/อาคาร</label>
          <Input readOnly={isReadOnly} defaultValue={building} className={inputClassName} />
        </div>
        <div className="space-y-1">
          <label className={labelClassName}>หมู่ที่</label>
          <Input readOnly={isReadOnly} defaultValue={moo} className={inputClassName} />
        </div>
        
        <div className="space-y-1">
          <label className={labelClassName}>ตรอก/ซอย</label>
          <Input readOnly={isReadOnly} defaultValue={alley} className={inputClassName} />
        </div>
        <div className="space-y-1">
          <label className={labelClassName}>ถนน</label>
          <Input readOnly={isReadOnly} defaultValue={street} className={inputClassName} />
        </div>
        <div className="space-y-1">
          <label className={labelClassName}>ตำบล/แขวง</label>
          <Input readOnly={isReadOnly} defaultValue={subDistrict} className={inputClassName} />
        </div>

        <div className="space-y-1">
          <label className={labelClassName}>อำเภอ/เขต</label>
          <Input readOnly={isReadOnly} defaultValue={district} className={inputClassName} />
        </div>
        <div className="space-y-1">
          <label className={labelClassName}>จังหวัด</label>
          <Input readOnly={isReadOnly} defaultValue={province} className={inputClassName} />
        </div>
        <div className="space-y-1">
          <label className={labelClassName}>รหัสไปรษณีย์</label>
          <Input readOnly={isReadOnly} defaultValue={zip} className={inputClassName} />
        </div>

        <div className="space-y-1">
          <label className={labelClassName}>โทรศัพท์ (ที่ทำงาน)</label>
          <Input readOnly={isReadOnly} defaultValue={phone} className={inputClassName} />
        </div>
      </CardContent>
    </Card>
  );
}
