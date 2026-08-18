"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { usePresidentAccess } from "@/roles/president/president-access";

export default function PresidentAccessGate({ children }: { children: React.ReactNode }) {
  const { canAccess, hasPresidentRole, isReady, storageError } = usePresidentAccess();

  if (!isReady) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground" role="status">
          <span className="material-symbols-outlined animate-spin">progress_activity</span>
          กำลังตรวจสอบสิทธิ์และวาระ
        </div>
      </div>
    );
  }

  if (!canAccess) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
        <Card className="w-full max-w-lg border-danger-border">
          <CardContent className="flex flex-col items-center px-6 py-10 text-center">
            <span className="material-symbols-outlined text-5xl text-danger">lock_clock</span>
            <h1 className="mt-4 text-xl font-semibold text-foreground">
              {hasPresidentRole ? "วาระไม่อยู่ในช่วงที่มีผล" : "ไม่มีสิทธิ์เข้าถึงส่วนของประธาน / ผู้ลงนาม"}
            </h1>
            <p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
              {hasPresidentRole
                ? "ระบบไม่พบวาระประธานที่กำลังมีผลสำหรับวิทยาลัยนี้ กรุณาติดต่อผู้ดูแลระบบเพื่อตรวจสอบวันเริ่มต้นและวันสิ้นสุดวาระ"
                : "กรุณาเข้าสู่ระบบด้วยบัญชีประธานที่ได้รับมอบหมาย Organisation Scope และมีวาระปัจจุบัน"}
            </p>
            {storageError && <p role="alert" className="mt-3 text-xs text-warning-on-soft">{storageError}</p>}
            <Button asChild className="mt-6"><Link href="/">กลับไปหน้าเข้าสู่ระบบ</Link></Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return children;
}
