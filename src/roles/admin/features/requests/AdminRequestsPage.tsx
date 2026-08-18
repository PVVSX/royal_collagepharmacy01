import { Card, CardContent } from "@/components/ui/card";
import { PageShell } from "@/roles/shared/components/layout/PageShell";

export default function AdminRequestsPage() {
  return (
    <PageShell size="content" className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">คำร้องงานธุรกิจ</h1>
        <p className="mt-1 text-sm text-muted-foreground">Super Admin ดูแลบัญชี สิทธิ์ และระบบ ไม่ดำเนินคำร้องตาม Workflow ปกติ</p>
      </header>
      <Card><CardContent className="flex flex-col items-center px-6 py-12 text-center"><span aria-hidden="true" className="material-symbols-outlined text-5xl text-muted-foreground">move_down</span><h2 className="mt-3 text-lg font-semibold">งานนี้อยู่ใน Royal College Staff Workspace</h2><p className="mt-2 max-w-lg text-sm text-muted-foreground">เข้าสู่ระบบด้วย Role เจ้าหน้าที่ราชวิทยาลัยเพื่อขอข้อมูลเพิ่ม ตรวจเอกสาร และเตรียมคิวลงนาม</p></CardContent></Card>
    </PageShell>
  );
}
