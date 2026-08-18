"use client";

import { Button } from "@/components/ui/button";

export function WorkspaceRouteLoading({ label = "กำลังโหลด Workspace" }: { label?: string }) {
  return <div className="flex min-h-[60vh] items-center justify-center gap-2" role="status"><span aria-hidden="true" className="material-symbols-outlined animate-spin text-primary">progress_activity</span><span className="text-sm text-muted-foreground">{label}</span></div>;
}

export function WorkspaceRouteError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <div className="flex min-h-[60vh] items-center justify-center p-4"><div role="alert" className="w-full max-w-lg rounded-2xl border border-danger-border bg-danger-soft p-6 text-center"><span aria-hidden="true" className="material-symbols-outlined text-4xl text-danger">error</span><h1 className="mt-3 text-lg font-semibold text-danger">ไม่สามารถเปิดหน้านี้ได้</h1><p className="mt-2 text-sm text-danger">{error.message || "เกิดข้อผิดพลาดระหว่างโหลดข้อมูล"}</p>{error.digest ? <p className="mt-2 font-mono text-xs text-danger/80">Reference: {error.digest}</p> : null}<Button type="button" variant="outline" className="mt-5" onClick={reset}>ลองอีกครั้ง</Button></div></div>;
}
