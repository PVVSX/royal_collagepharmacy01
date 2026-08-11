"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSyncExternalStore } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { canPortalSessionAccessArea, type PortalArea } from "@/roles/shared/features/roles/access-control";
import {
  PORTAL_SESSION_KEY,
  readPortalSession,
} from "@/roles/shared/features/roles/mock-login";

const SERVER_SNAPSHOT = "portal-session:server";

function subscribe(onStoreChange: () => void) {
  window.addEventListener("storage", onStoreChange);
  return () => window.removeEventListener("storage", onStoreChange);
}

function getSnapshot() {
  return window.localStorage.getItem(PORTAL_SESSION_KEY);
}

function getServerSnapshot() {
  return SERVER_SNAPSHOT;
}

export function PortalAccessGate({
  area,
  children,
}: {
  area: PortalArea;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const serializedSession = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  if (serializedSession === SERVER_SNAPSHOT) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4" role="status">
        <span className="material-symbols-outlined mr-2 animate-spin">progress_activity</span>
        กำลังตรวจสอบสิทธิ์เข้าใช้งาน
      </div>
    );
  }

  const session = serializedSession ? readPortalSession() : null;
  if (canPortalSessionAccessArea(session, area, pathname)) return children;

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-md border-warning-border">
        <CardContent className="flex flex-col items-center px-6 py-10 text-center">
          <span className="material-symbols-outlined text-5xl text-warning">shield_lock</span>
          <h1 className="mt-4 text-xl font-semibold">ไม่มีสิทธิ์เข้าพื้นที่นี้</h1>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            กรุณาเข้าสู่ระบบด้วยบัญชีที่ตรงกับบทบาทของพื้นที่ที่ต้องการใช้งาน
          </p>
          <Button asChild className="mt-6">
            <Link href="/">กลับไปหน้าเข้าสู่ระบบ</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
