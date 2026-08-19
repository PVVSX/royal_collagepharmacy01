"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  canPortalSessionAccessArea,
  type PortalAreaInput,
} from "@/roles/shared/features/roles/access-control";
import { usePortalSession } from "@/roles/shared/features/roles/use-portal-session";

export function PortalAccessGate({
  area,
  organisationId,
  exactOrganisationId,
  resourceId,
  children,
}: {
  area: PortalAreaInput;
  organisationId?: string;
  exactOrganisationId?: string;
  resourceId?: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { session, isReady } = usePortalSession();

  if (!isReady) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4" role="status">
        <span className="material-symbols-outlined mr-2 animate-spin">progress_activity</span>
        กำลังตรวจสอบสิทธิ์เข้าใช้งาน
      </div>
    );
  }

  if (canPortalSessionAccessArea(session, area, pathname, {
    organisationId,
    exactOrganisationId,
    resourceId,
  })) {
    return children;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-md border-warning-border">
        <CardContent className="flex flex-col items-center px-6 py-10 text-center">
          <span className="material-symbols-outlined text-5xl text-warning">shield_lock</span>
          <h1 className="mt-4 text-xl font-semibold">ไม่มีสิทธิ์เข้าพื้นที่นี้</h1>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            กรุณาเข้าสู่ระบบด้วยบัญชีที่ได้รับอนุญาตให้ใช้งานพื้นที่นี้
          </p>
          <Button asChild className="mt-6">
            <Link href="/">กลับไปหน้าเข้าสู่ระบบ</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
