import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export interface AddressCardProps {
  title: string;
  icon?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any; // Rapid prototyping
  isReadOnly?: boolean;
  showContactInfo?: boolean; // If true, show phone, mobile, email
}

export function AddressCard({ 
  title, 
  icon = "home", 
  data, 
  isReadOnly = true,
  showContactInfo = false
}: AddressCardProps) {
  const inputClassName = isReadOnly ? "bg-muted/50 h-9 text-sm" : "h-9 text-sm";
  const labelClassName = "text-xs text-muted-foreground";

  // Mock splitting the address into parts for the legacy form structure
  // In a real app, 'data' would have these fields explicitly
  const no = "123";
  const building = "คอนโดสุขุมวิท";
  const moo = "-";
  const alley = "สุขุมวิท 1";
  const street = "สุขุมวิท";
  const subDistrict = "คลองเตย";
  const district = "คลองเตย";
  const province = "กรุงเทพมหานคร";
  const zip = "10110";

  return (
    <Card className="card-shadow">
      <CardHeader className="pb-3 border-b border-border/50 bg-muted/20">
        <CardTitle className="text-base flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-xl">{icon}</span>
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-5 grid grid-cols-1 md:grid-cols-3 gap-4">
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

        {showContactInfo && (
          <>
            <div className="space-y-1">
              <label className={labelClassName}>โทรศัพท์</label>
              <Input readOnly={isReadOnly} defaultValue="-" className={inputClassName} />
            </div>
            <div className="space-y-1">
              <label className={labelClassName}>มือถือ</label>
              <Input readOnly={isReadOnly} defaultValue={data?.phone || "-"} className={`${inputClassName} font-medium`} />
            </div>
            <div className="space-y-1">
              <label className={labelClassName}>E-mail</label>
              <Input readOnly={isReadOnly} defaultValue={data?.email || "-"} className={`${inputClassName} font-medium`} />
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
