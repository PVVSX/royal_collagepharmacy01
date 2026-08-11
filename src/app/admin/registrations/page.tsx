"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useMockDb, type Registration } from "@/providers/mock-db-provider";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PageShell } from "@/roles/shared/components/layout/PageShell";
import {
  registrationStatusMeta,
  type RegistrationStatus,
} from "@/roles/shared/features/registration";

type ReviewAction = {
  registration: Registration;
  target: RegistrationStatus;
  label: string;
  requiresReason: boolean;
};

const tabs: { id: RegistrationStatus | "all"; label: string }[] = [
  { id: "all", label: "ทั้งหมด" },
  { id: "pending", label: "รอตรวจสอบ" },
  { id: "needs_info", label: "รอข้อมูลเพิ่ม" },
  { id: "approved", label: "อนุมัติแล้ว" },
  { id: "drop_pending", label: "รออนุมัติถอน" },
  { id: "rejected", label: "ไม่อนุมัติ" },
  { id: "withdrawn", label: "ถอนแล้ว" },
];

function actionsFor(registration: Registration): Omit<ReviewAction, "registration">[] {
  if (registration.status === "pending") {
    return [
      { target: "approved", label: "อนุมัติการลงทะเบียน", requiresReason: false },
      { target: "needs_info", label: "ขอข้อมูลเพิ่มเติม", requiresReason: true },
      { target: "rejected", label: "ไม่อนุมัติ", requiresReason: true },
    ];
  }
  if (registration.status === "drop_pending") {
    return [
      { target: "withdrawn", label: "อนุมัติการถอน", requiresReason: false },
      { target: "approved", label: "ไม่อนุมัติการถอน", requiresReason: true },
    ];
  }
  return [];
}

export default function RegistrationsApprovalPage() {
  const { registrations, updateRegistrationStatus } = useMockDb();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<RegistrationStatus | "all">("all");
  const [reviewAction, setReviewAction] = useState<ReviewAction | null>(null);
  const [reason, setReason] = useState("");
  const [historyRegistration, setHistoryRegistration] = useState<Registration | null>(null);

  const filteredRegistrations = registrations.filter((registration) => {
    const query = searchQuery.toLowerCase();
    const matchesSearch = registration.studentName.toLowerCase().includes(query) ||
      registration.courseCode.toLowerCase().includes(query) ||
      registration.studentId.toLowerCase().includes(query);
    const matchesTab = activeTab === "all" || registration.status === activeTab;
    return matchesSearch && matchesTab;
  });

  const openReview = (registration: Registration, action: Omit<ReviewAction, "registration">) => {
    setReason("");
    setReviewAction({ registration, ...action });
  };

  const confirmReview = () => {
    if (!reviewAction) return;
    if (reviewAction.requiresReason && !reason.trim()) {
      toast.error("กรุณาระบุเหตุผล");
      return;
    }
    try {
      updateRegistrationStatus(reviewAction.registration.id, reviewAction.target, reason);
      toast.success(reviewAction.label, {
        description: reviewAction.target === "approved" && reviewAction.registration.status === "pending"
          ? "ระบบเปิดใบแจ้งชำระเงินแล้ว"
          : undefined,
      });
      setReviewAction(null);
      setReason("");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "ไม่สามารถเปลี่ยนสถานะได้");
    }
  };

  return (
    <PageShell bottom="roomy">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-content tracking-tight">ตรวจสอบการลงทะเบียนเรียน</h1>
        <p className="text-sm text-content-muted mt-1">อนุมัติ ขอข้อมูลเพิ่ม และตรวจประวัติการเปลี่ยนสถานะ</p>
      </div>

      <Card className="card-shadow">
        <CardHeader className="pb-4 border-b">
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap bg-surface-sunken p-1 rounded-lg w-fit">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                    activeTab === tab.id
                      ? "bg-surface-raised text-brand shadow-sm"
                      : "text-content-muted hover:text-content hover:bg-surface-container-high"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            <div className="relative w-full sm:w-80">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-content-muted text-lg">search</span>
              <Input
                placeholder="ค้นหารหัสประจำตัว ชื่อ หรือรหัสวิชา..."
                className="pl-9 bg-surface-container-low"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-surface-container-low">
                <TableRow>
                  <TableHead className="w-[140px]">รหัสคำขอ</TableHead>
                  <TableHead>ผู้เข้าศึกษา</TableHead>
                  <TableHead>รายวิชา</TableHead>
                  <TableHead>ภาคการศึกษา</TableHead>
                  <TableHead>สถานะ</TableHead>
                  <TableHead>หมายเหตุล่าสุด</TableHead>
                  <TableHead className="text-right">จัดการ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRegistrations.length > 0 ? filteredRegistrations.map((registration) => {
                  const statusInfo = registrationStatusMeta[registration.status];
                  const actions = actionsFor(registration);
                  return (
                    <TableRow key={registration.id}>
                      <TableCell className="font-medium text-content">{registration.id}</TableCell>
                      <TableCell>
                        <p className="font-medium text-content">{registration.studentName}</p>
                        <p className="text-xs text-content-muted">{registration.studentId}</p>
                      </TableCell>
                      <TableCell>
                        <p className="font-medium text-content">{registration.courseCode}</p>
                        <p className="text-xs text-content-muted">{registration.courseTitle}</p>
                      </TableCell>
                      <TableCell className="text-content-muted">{registration.term}</TableCell>
                      <TableCell><Badge variant={statusInfo.variant}>{statusInfo.label}</Badge></TableCell>
                      <TableCell className="max-w-56 text-xs text-content-muted">
                        {registration.reviewReason || "—"}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="sm" className="h-8" onClick={() => setHistoryRegistration(registration)}>
                            ประวัติ
                          </Button>
                          {actions.length > 0 && (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm" className="h-8 gap-1">
                                  อนุมัติลงทะเบียน
                                  <span className="material-symbols-outlined text-base">arrow_drop_down</span>
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                {actions.map((action) => (
                                  <DropdownMenuItem
                                    key={`${registration.id}-${action.target}`}
                                    variant={action.target === "rejected" ? "destructive" : "default"}
                                    onSelect={() => openReview(registration, action)}
                                  >
                                    {action.label}
                                  </DropdownMenuItem>
                                ))}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                }) : (
                  <TableRow>
                    <TableCell colSpan={7} className="h-32 text-center text-content-muted">ไม่พบข้อมูลการลงทะเบียนเรียน</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={Boolean(reviewAction)} onOpenChange={(open) => { if (!open) setReviewAction(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{reviewAction?.label}</DialogTitle>
            <DialogDescription>
              {reviewAction?.registration.courseCode} · {reviewAction?.registration.studentName}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <label htmlFor="registration-review-reason" className="text-sm font-medium">
              เหตุผล {reviewAction?.requiresReason ? "(จำเป็น)" : "(ถ้ามี)"}
            </label>
            <Textarea
              id="registration-review-reason"
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              placeholder="บันทึกเหตุผลเพื่อเก็บในประวัติคำขอ"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReviewAction(null)}>ยกเลิก</Button>
            <Button onClick={confirmReview}>ยืนยัน</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(historyRegistration)} onOpenChange={(open) => { if (!open) setHistoryRegistration(null); }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>ประวัติคำขอลงทะเบียน</DialogTitle>
            <DialogDescription>{historyRegistration?.id}</DialogDescription>
          </DialogHeader>
          <div className="max-h-80 space-y-3 overflow-y-auto">
            {historyRegistration?.history.slice().reverse().map((event) => {
              const statusInfo = registrationStatusMeta[event.to];
              return (
                <div key={event.id} className="rounded-xl border border-border bg-surface-container-low p-3">
                  <div className="flex items-center justify-between gap-3">
                    <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
                    <span className="text-xs text-content-muted">{new Date(event.at).toLocaleString("th-TH")}</span>
                  </div>
                  <p className="mt-2 text-xs text-content-muted">ผู้ดำเนินการ: {event.actor}</p>
                  {event.reason && <p className="mt-1 text-sm">{event.reason}</p>}
                </div>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>
    </PageShell>
  );
}
