"use client";

import {
  ForbiddenState,
  LoadingState,
} from "@/roles/shared/components/workspace/WorkspacePrimitives";
import { usePortalSession } from "@/roles/shared/features/roles/use-portal-session";
import { canAccessStaffCentralWorkspace } from "@/roles/staff/staff-access";

/** Defense-in-depth boundary: scoped Staff data/actions never mount without central access. */
export function StaffCentralAccessBoundary({ children }: { children: React.ReactNode }) {
  const { session, isReady } = usePortalSession();

  if (!isReady) {
    return <LoadingState label="กำลังตรวจสอบขอบเขตงานส่วนกลาง" />;
  }

  if (!canAccessStaffCentralWorkspace(session)) {
    return (
      <ForbiddenState
        title="ไม่มีสิทธิ์เข้าถึงงานส่วนกลาง"
        description="ต้องใช้ Role เจ้าหน้าที่ราชวิทยาลัย พร้อม Organisation Scope ราชวิทยาลัยและ Resource Scope staff:central"
      />
    );
  }

  return children;
}
