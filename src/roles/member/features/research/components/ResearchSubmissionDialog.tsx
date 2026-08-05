"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useMockDb } from "@/providers/mock-db-provider";
import { FileUploadField } from "@/roles/shared/components/forms/FileUploadField";
import type { FileMetadata } from "@/roles/shared/features/file-metadata";
import type { ResearchSubmission } from "@/roles/shared/features/research/types";

interface ResearchSubmissionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  submission?: ResearchSubmission;
}

const initialForm = {
  title: "",
  authors: "สมชาย ใจดี",
  type: "บทความวิจัย",
  field: "เภสัชกรรมคลินิก",
  journal: "",
  publisher: "",
  year: new Date().getFullYear(),
  language: "ไทย",
  doi: "",
  abstract: "",
};

const editableFieldClassName = "border-outline bg-surface-container-lowest";
const editableSelectClassName =
  "flex h-10 w-full rounded-md border border-outline bg-surface-container-lowest px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

function formFromSubmission(submission?: ResearchSubmission) {
  if (!submission) return initialForm;
  return {
    title: submission.title,
    authors: submission.authors,
    type: submission.type,
    field: submission.field,
    journal: submission.journal,
    publisher: submission.publisher,
    year: submission.year,
    language: submission.language,
    doi: submission.doi,
    abstract: submission.abstract,
  };
}

function createResearchSubmissionId(submissions: ResearchSubmission[]) {
  const buddhistYear = new Date().getFullYear() + 543;
  let candidate = "";

  do {
    candidate = `RES-${buddhistYear}-${globalThis.crypto.randomUUID().slice(0, 8).toUpperCase()}`;
  } while (submissions.some((submission) => submission.id === candidate));

  return candidate;
}

export function ResearchSubmissionDialog({ open, onOpenChange, submission }: ResearchSubmissionDialogProps) {
  const { addResearchSubmission, researchSubmissions, setResearchSubmissions } = useMockDb();
  const [form, setForm] = useState(() => formFromSubmission(submission));
  const [articleFile, setArticleFile] = useState<FileMetadata | undefined>(() => submission?.articleFile);
  const [acceptanceFile, setAcceptanceFile] = useState<FileMetadata | undefined>(() => submission?.acceptanceFile);
  const [consent, setConsent] = useState(() => submission?.consentToPublish ?? false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const updateField = (field: keyof typeof form, value: string | number) => {
    setForm((previous) => ({ ...previous, [field]: value }));
    setErrors((previous) => ({ ...previous, [field]: "" }));
  };

  const reset = () => {
    setForm(formFromSubmission(submission));
    setArticleFile(undefined);
    setAcceptanceFile(undefined);
    setConsent(false);
    setErrors({});
  };

  const handleOpenChange = (nextOpen: boolean) => {
    onOpenChange(nextOpen);
    if (!nextOpen) reset();
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const nextErrors: Record<string, string> = {};
    if (!form.title.trim()) nextErrors.title = "กรุณาระบุชื่อผลงาน";
    if (!form.authors.trim()) nextErrors.authors = "กรุณาระบุผู้แต่ง";
    if (!form.abstract.trim()) nextErrors.abstract = "กรุณาระบุบทคัดย่อโดยย่อ";
    if (!articleFile && !acceptanceFile) nextErrors.files = "กรุณาแนบหลักฐานอย่างน้อย 1 รายการ";
    if (!consent) nextErrors.consent = "กรุณายืนยันสิทธิ์และการยินยอมก่อนส่ง";

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    const nextSubmission: ResearchSubmission = {
      id: submission?.id ?? createResearchSubmissionId(researchSubmissions),
      ...form,
      articleFile,
      acceptanceFile,
      consentToPublish: consent,
      submittedAt: new Date().toLocaleDateString("th-TH", {
        year: "numeric",
        month: "short",
        day: "numeric",
      }),
      status: "pending",
    };

    if (submission) {
      setResearchSubmissions((previous) => previous.map((item) => (
        item.id === submission.id ? nextSubmission : item
      )));
    } else {
      addResearchSubmission(nextSubmission);
    }
    toast.success(submission ? "ส่งผลงานที่แก้ไขเพื่อตรวจสอบแล้ว" : "ส่งผลงานเพื่อรอตรวจสอบแล้ว", {
      description: "ติดตามผลได้จากส่วนผลงานที่ฉันส่ง",
    });
    handleOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{submission ? "แก้ไขผลงานวิจัยหรือบทความ" : "ส่งผลงานวิจัยหรือบทความ"}</DialogTitle>
          <DialogDescription>
            กรอกข้อมูลที่ใช้ค้นหาและแนบหลักฐาน เจ้าหน้าที่จะตรวจสอบก่อนเผยแพร่ในฐานข้อมูล
          </DialogDescription>
        </DialogHeader>

        <form id="research-submission-form" onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label htmlFor="research-title" className="text-sm font-medium">ชื่อผลงาน</label>
            <Input
              id="research-title"
              value={form.title}
              onChange={(event) => updateField("title", event.target.value)}
              aria-invalid={Boolean(errors.title)}
              className={editableFieldClassName}
            />
            {errors.title && <p role="alert" className="text-xs text-danger">{errors.title}</p>}
          </div>

          <div className="space-y-2">
            <label htmlFor="research-authors" className="text-sm font-medium">ผู้แต่ง</label>
            <Input
              id="research-authors"
              value={form.authors}
              onChange={(event) => updateField("authors", event.target.value)}
              aria-invalid={Boolean(errors.authors)}
              className={editableFieldClassName}
            />
            <p className="text-xs text-muted-foreground">คั่นชื่อผู้แต่งหลายคนด้วยเครื่องหมายจุลภาค</p>
            {errors.authors && <p role="alert" className="text-xs text-danger">{errors.authors}</p>}
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <label htmlFor="research-type" className="text-sm font-medium">ประเภทผลงาน</label>
              <select id="research-type" value={form.type} onChange={(event) => updateField("type", event.target.value)} className={editableSelectClassName}>
                <option>บทความวิจัย</option>
                <option>บทความวิชาการ</option>
                <option>รายงานการวิจัย</option>
                <option>วิทยานิพนธ์</option>
              </select>
            </div>
            <div className="space-y-2">
              <label htmlFor="research-field" className="text-sm font-medium">สาขา</label>
              <select id="research-field" value={form.field} onChange={(event) => updateField("field", event.target.value)} className={editableSelectClassName}>
                <option>เภสัชกรรมคลินิก</option>
                <option>เภสัชกรรมโรงพยาบาล</option>
                <option>เภสัชกรรมชุมชน</option>
                <option>เภสัชศาสตร์สังคมบริหาร</option>
                <option>เภสัชเวทและพิษวิทยา</option>
              </select>
            </div>
            <div className="space-y-2">
              <label htmlFor="research-language" className="text-sm font-medium">ภาษา</label>
              <select id="research-language" value={form.language} onChange={(event) => updateField("language", event.target.value)} className={editableSelectClassName}>
                <option>ไทย</option>
                <option>อังกฤษ</option>
              </select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="research-journal" className="text-sm font-medium">วารสารหรือแหล่งเผยแพร่</label>
              <Input id="research-journal" value={form.journal} onChange={(event) => updateField("journal", event.target.value)} className={editableFieldClassName} />
            </div>
            <div className="space-y-2">
              <label htmlFor="research-year" className="text-sm font-medium">ปีที่เผยแพร่</label>
              <Input id="research-year" type="number" min="2000" max="2100" value={form.year} onChange={(event) => updateField("year", Number(event.target.value))} className={editableFieldClassName} />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="research-publisher" className="text-sm font-medium">สำนักพิมพ์หรือหน่วยงาน</label>
              <Input id="research-publisher" value={form.publisher} onChange={(event) => updateField("publisher", event.target.value)} className={editableFieldClassName} />
            </div>
            <div className="space-y-2">
              <label htmlFor="research-doi" className="text-sm font-medium">DOI (ถ้ามี)</label>
              <Input id="research-doi" value={form.doi} onChange={(event) => updateField("doi", event.target.value)} className={editableFieldClassName} />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="research-abstract" className="text-sm font-medium">บทคัดย่อโดยย่อ</label>
            <Textarea id="research-abstract" rows={4} value={form.abstract} onChange={(event) => updateField("abstract", event.target.value)} aria-invalid={Boolean(errors.abstract)} className={editableFieldClassName} />
            {errors.abstract && <p role="alert" className="text-xs text-danger">{errors.abstract}</p>}
          </div>

          <div className="rounded-xl border border-border bg-muted/20 p-4">
            <h3 className="text-sm font-semibold">หลักฐานประกอบ</h3>
            <p className="mt-1 text-xs text-muted-foreground">แนบหลักฐานอย่างน้อย 1 รายการเพื่อประกอบการตรวจสอบ</p>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <FileUploadField label="ไฟล์บทความฉบับเผยแพร่" value={articleFile} onChange={(file) => { setArticleFile(file); setErrors((previous) => ({ ...previous, files: "" })); }} />
              <FileUploadField label="หนังสือตอบรับการตีพิมพ์" value={acceptanceFile} onChange={(file) => { setAcceptanceFile(file); setErrors((previous) => ({ ...previous, files: "" })); }} />
            </div>
            {errors.files && <p role="alert" className="mt-2 text-xs text-danger">{errors.files}</p>}
          </div>

          <div className="rounded-xl border border-border p-4">
            <div className="flex items-start gap-3">
              <Switch id="research-consent" checked={consent} onCheckedChange={(checked) => { setConsent(checked); setErrors((previous) => ({ ...previous, consent: "" })); }} />
              <div>
                <label htmlFor="research-consent" className="cursor-pointer text-sm font-medium">ยืนยันสิทธิ์ในผลงานและยินยอมให้เผยแพร่ข้อมูล</label>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">ข้าพเจ้ายืนยันว่าข้อมูลถูกต้องและมีสิทธิ์นำส่งผลงานนี้เข้าสู่ฐานข้อมูลของราชวิทยาลัย</p>
              </div>
            </div>
            {errors.consent && <p role="alert" className="mt-2 text-xs text-danger">{errors.consent}</p>}
          </div>
        </form>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>ยกเลิก</Button>
          <Button type="submit" form="research-submission-form">ส่งเพื่อตรวจสอบ</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
