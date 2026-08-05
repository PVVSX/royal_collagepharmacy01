"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useMockDb, type Admission } from "@/providers/mock-db-provider";
import { formatFileSize } from "@/roles/shared/features/file-metadata";

export default function AdminAdmissionsPage() {
  const { admissions, updateAdmissionStatus, updateAdmissionDocuments } = useMockDb();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAdmission, setSelectedAdmission] = useState<Admission | null>(null);
  const [missingDocumentIds, setMissingDocumentIds] = useState<string[]>([]);
  const [reviewNote, setReviewNote] = useState("");
  const [reviewError, setReviewError] = useState("");

  const openDocumentReview = (admission: Admission) => {
    setSelectedAdmission(admission);
    setMissingDocumentIds(admission.documents.filter((document) => document.reviewStatus === "missing").map((document) => document.id));
    setReviewNote(admission.documentNote ?? "");
    setReviewError("");
  };

  const markDocumentsComplete = () => {
    if (!selectedAdmission) return;
    if (selectedAdmission.status !== "pending") return;
    const selectedMissingDocuments = selectedAdmission.documents.filter((document) => (
      missingDocumentIds.includes(document.id)
    ));
    if (selectedMissingDocuments.length > 0) {
      setReviewError(`ยังเลือกเอกสารที่ต้องแก้ไข ${selectedMissingDocuments.length} รายการ กรุณาส่งกลับให้สมาชิกหรือยกเลิกการเลือกก่อน`);
      return;
    }
    updateAdmissionDocuments(
      selectedAdmission.id,
      selectedAdmission.documents.map((document) => ({
        ...document,
        reviewStatus: document.file ? "accepted" : "not_applicable",
        reviewerNote: undefined,
      })),
      "complete",
    );
    toast.success("บันทึกผลการตรวจเอกสารแล้ว");
    setSelectedAdmission(null);
  };

  const requestDocuments = () => {
    if (!selectedAdmission) return;
    if (selectedAdmission.status !== "pending") return;
    const selectedMissingIds = new Set(
      selectedAdmission.documents
        .filter((document) => missingDocumentIds.includes(document.id))
        .map((document) => document.id),
    );
    if (selectedMissingIds.size === 0) {
      setReviewError("กรุณาเลือกรายการเอกสารที่ต้องการให้สมาชิกแก้ไขหรือแนบเพิ่ม");
      return;
    }
    if (!reviewNote.trim()) {
      setReviewError("กรุณาระบุคำแนะนำสำหรับสมาชิก");
      return;
    }
    updateAdmissionDocuments(
      selectedAdmission.id,
      selectedAdmission.documents.map((document) => {
        if (selectedMissingIds.has(document.id)) {
          return {
            ...document,
            reviewStatus: "missing" as const,
            reviewerNote: reviewNote.trim(),
          };
        }

        if (document.reviewStatus === "missing") {
          return {
            ...document,
            reviewStatus: document.file
              ? "accepted" as const
              : document.required
                ? "pending" as const
                : "not_applicable" as const,
            reviewerNote: undefined,
          };
        }

        return document;
      }),
      "pending",
      reviewNote.trim(),
    );
    toast.success("ส่งคำแนะนำเรื่องเอกสารแล้ว");
    setSelectedAdmission(null);
  };

  const handleApprove = (id: string) => {
    toast.success(`อนุมัติคำร้อง ${id} เรียบร้อยแล้ว`);
    updateAdmissionStatus(id, "approved");
  };

  const handleReject = (id: string) => {
    toast.error(`ปฏิเสธคำร้อง ${id} แล้ว`);
    updateAdmissionStatus(id, "rejected");
  };

  const openAdmissionPrint = () => {
    if (!selectedAdmission) return;
    window.open(`/print/admission?id=${encodeURIComponent(selectedAdmission.id)}`, "_blank");
  };

  const filteredAdmissions = admissions.filter(a => 
    a.name.includes(searchTerm) || a.id.includes(searchTerm) || a.program.includes(searchTerm)
  );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-content">อนุมัติการสมัครสอบ</h1>
          <p className="text-muted-foreground mt-1">ตรวจสอบและพิจารณาคำร้องขอเข้ารับการฝึกอบรม</p>
        </div>
      </div>

      <Card className="shadow-sm border-border">
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div className="relative w-full max-w-sm">
              <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-muted-foreground">
                <span className="material-symbols-outlined text-xl">search</span>
              </span>
              <Input 
                placeholder="ค้นหาชื่อ, รหัสคำร้อง หรือหลักสูตร..." 
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="gap-2 text-content">
                <span className="material-symbols-outlined text-lg">filter_list</span> ตัวกรอง
              </Button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-content-muted uppercase bg-surface-sunken border-y">
                <tr>
                  <th className="px-4 py-3 font-medium">รหัสคำร้อง</th>
                  <th className="px-4 py-3 font-medium">ชื่อผู้สมัคร</th>
                  <th className="px-4 py-3 font-medium">เลขที่ใบประกอบ</th>
                  <th className="px-4 py-3 font-medium">หลักสูตรที่สมัคร</th>
                  <th className="px-4 py-3 font-medium">วันที่ส่งคำร้อง</th>
                  <th className="px-4 py-3 font-medium">เอกสาร</th>
                  <th className="px-4 py-3 font-medium">สถานะ</th>
                  <th className="px-4 py-3 font-medium text-right">การจัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredAdmissions.map((item) => (
                  <tr key={item.id} className="hover:bg-surface-sunken transition-colors">
                    <td className="px-4 py-3 font-medium text-content">{item.id}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                          {item.name.charAt(4)}
                        </div>
                        <span className="font-medium text-content">{item.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-content-muted">{item.license}</td>
                    <td className="px-4 py-3 text-content-muted">{item.program}</td>
                    <td className="px-4 py-3 text-content-muted">{item.date}</td>
                    <td className="px-4 py-3">
                      {item.documentStatus === "pending" && <Badge variant="info">มีเอกสารรอตรวจ</Badge>}
                      {item.documentStatus === "complete" && <Badge variant="success">ตรวจแล้ว</Badge>}
                      {item.documentStatus === "incomplete" && <Badge variant="warning">มีข้อเสนอแนะ</Badge>}
                    </td>
                    <td className="px-4 py-3">
                      {item.status === 'pending' && <Badge variant="warning">รอตรวจสอบ</Badge>}
                      {item.status === 'approved' && <Badge variant="success">อนุมัติแล้ว</Badge>}
                      {item.status === 'rejected' && <Badge variant="danger">ปฏิเสธ</Badge>}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {item.status === 'pending' ? (
                        <div className="flex items-center justify-end gap-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="h-8 border-success-border text-success hover:bg-success-soft"
                            onClick={() => handleApprove(item.id)}
                            title="อนุมัติคำร้อง"
                          >
                            <span className="material-symbols-outlined text-base mr-1">check_circle</span> อนุมัติ
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="h-8 border-danger-border text-danger hover:bg-danger-soft"
                            onClick={() => handleReject(item.id)}
                          >
                            <span className="material-symbols-outlined text-base mr-1">cancel</span> ปฏิเสธ
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-content-muted hover:text-primary" onClick={() => openDocumentReview(item)} title="ตรวจเอกสาร">
                            <span className="material-symbols-outlined text-lg">visibility</span>
                          </Button>
                        </div>
                      ) : (
                        <Button variant="ghost" size="sm" className="h-8 text-content-muted hover:text-primary" onClick={() => openDocumentReview(item)}>
                          <span className="material-symbols-outlined text-lg mr-1">visibility</span> ดูรายละเอียด
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
                {filteredAdmissions.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-content-muted">
                      ไม่พบข้อมูลคำร้องที่ค้นหา
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-border">
            <span className="text-sm text-content-muted">แสดง {filteredAdmissions.length} จาก {admissions.length} รายการ</span>
            <div className="flex gap-1">
              <Button variant="outline" size="sm" disabled>ก่อนหน้า</Button>
              <Button variant="outline" size="sm" className="bg-primary/5 border-primary/20 text-primary">1</Button>
              <Button variant="outline" size="sm">2</Button>
              <Button variant="outline" size="sm">ถัดไป</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={Boolean(selectedAdmission)} onOpenChange={(open) => { if (!open) setSelectedAdmission(null); }}>
        <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>ตรวจเอกสารประกอบการสมัคร</DialogTitle>
            <DialogDescription>
              {selectedAdmission?.id} | {selectedAdmission?.name} | {selectedAdmission?.program}
            </DialogDescription>
          </DialogHeader>

          {selectedAdmission && (
            <div className="space-y-4">
              <div className="rounded-lg border border-info-border bg-info-soft px-4 py-3 text-sm text-info-on-soft">
                เอกสารแนบเป็นทางเลือก ใช้ส่วนนี้เพื่อตรวจไฟล์ที่สมาชิกส่งมาและให้คำแนะนำเพิ่มเติม
              </div>

              <div className="space-y-2">
                {selectedAdmission.documents.map((document) => {
                  const selectedMissing = missingDocumentIds.includes(document.id);
                  const reviewStatusMeta = {
                    pending: { label: "รอตรวจ", variant: "info" as const },
                    accepted: { label: "ผ่านแล้ว", variant: "success" as const },
                    missing: { label: "ต้องแก้ไข", variant: "danger" as const },
                    not_applicable: { label: "ไม่บังคับ", variant: "outline" as const },
                  }[document.reviewStatus];
                  return (
                    <div key={document.id} className={`rounded-lg border p-3 ${selectedMissing ? "border-danger-border bg-danger-soft" : "border-border"}`}>
                      <div className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          checked={selectedMissing}
                          onChange={() => {
                            setReviewError("");
                            setMissingDocumentIds((previous) => previous.includes(document.id)
                              ? previous.filter((id) => id !== document.id)
                              : [...previous, document.id]);
                          }}
                          className="mt-1 size-4 rounded border-border accent-brand"
                          aria-label={`เลือก ${document.label} เป็นเอกสารที่ต้องแก้ไข`}
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="text-sm font-medium text-content">{document.label}</p>
                            {!document.required && <Badge variant="outline">ทางเลือก</Badge>}
                          </div>
                          {document.file ? (
                            <button type="button" onClick={() => toast.info(`เปิดไฟล์: ${document.file?.name}`)} className="mt-2 flex items-center gap-2 text-left text-xs text-primary hover:underline">
                              <span className="material-symbols-outlined text-base">description</span>
                              <span className="truncate">{document.file.name}</span>
                              <span className="shrink-0 text-content-muted">({formatFileSize(document.file.size)})</span>
                            </button>
                          ) : (
                            <p className="mt-2 text-xs text-content-muted">ยังไม่ได้แนบไฟล์</p>
                          )}
                        </div>
                        <Badge variant={document.file ? reviewStatusMeta.variant : document.required ? "warning" : "outline"}>
                          {document.file ? reviewStatusMeta.label : document.required ? "ยังไม่แนบ" : "ไม่บังคับ"}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="space-y-2">
                <label htmlFor="admission-review-note" className="text-sm font-medium">คำแนะนำถึงสมาชิก</label>
                <Textarea id="admission-review-note" rows={3} value={reviewNote} onChange={(event) => { setReviewNote(event.target.value); setReviewError(""); }} placeholder="เช่น กรุณาแนบสำเนาที่เห็นวันหมดอายุชัดเจน" />
                {reviewError && <p role="alert" className="text-xs text-danger">{reviewError}</p>}
              </div>
            </div>
          )}

          <DialogFooter className="gap-2 sm:justify-between">
            <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
              <Button variant="outline" onClick={() => setSelectedAdmission(null)}>ปิด</Button>
              <Button variant="outline" onClick={openAdmissionPrint}>
                <span className="material-symbols-outlined mr-1 text-lg">print</span>
                ดูใบสมัคร
              </Button>
            </div>
            {selectedAdmission?.status === "pending" && (
              <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
                <Button variant="outline" className="border-danger-border text-danger hover:bg-danger-soft" onClick={requestDocuments}>ส่งคำแนะนำ</Button>
                <Button className="bg-success text-success-foreground hover:bg-success/90" onClick={markDocumentsComplete}>บันทึกผลตรวจ</Button>
              </div>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
