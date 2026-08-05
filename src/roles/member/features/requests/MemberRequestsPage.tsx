"use client";

import { type ChangeEvent, useMemo, useState } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import Footer from "@/roles/shared/components/layout/Footer";
import { PageShell } from "@/roles/shared/components/layout/PageShell";
import {
  formatFileSize,
  toFileMetadata,
  type FileMetadata,
} from "@/roles/shared/features/file-metadata";
import {
  REQUEST_CATALOG,
  REQUEST_STATUS_META,
  formatThaiRequestDate,
  getRequestCategory,
  makeRequestId,
  progressForStatus,
  type MockRequest,
  type RequestCategoryDefinition,
  type RequestCategoryId,
  type RequestFieldDefinition,
  type RequestStatus,
} from "@/roles/shared/features/requests/request-schema";
import { useRequestStore } from "@/roles/shared/features/requests/request-store";
import { currentMemberPassport } from "@/roles/shared/member/domain";

type RequestFilter = RequestStatus | "all";
type FormValues = Record<string, string>;
type FormErrors = Record<string, string>;

const FILTERS: readonly { id: RequestFilter; label: string }[] = [
  { id: "all", label: "ทั้งหมด" },
  { id: "pending", label: "รอตรวจสอบ" },
  { id: "needs_information", label: "ขอข้อมูลเพิ่มเติม" },
  { id: "approved", label: "อนุมัติแล้ว" },
  { id: "rejected", label: "ไม่อนุมัติ" },
];

function RequestFieldControl({
  field,
  value,
  error,
  onChange,
}: {
  field: RequestFieldDefinition;
  value: string;
  error?: string;
  onChange: (value: string) => void;
}) {
  const inputId = `request-field-${field.id}`;
  const describedBy = error
    ? `${inputId}-error`
    : field.helpText
      ? `${inputId}-help`
      : undefined;
  const sharedProps = {
    id: inputId,
    name: field.id,
    value,
    required: field.required,
    "aria-required": field.required || undefined,
    "aria-invalid": Boolean(error),
    "aria-describedby": describedBy,
    onChange: (
      event: ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >,
    ) => onChange(event.target.value),
  };

  return (
    <div className={field.type === "textarea" ? "space-y-1.5 sm:col-span-2" : "space-y-1.5"}>
      <label htmlFor={inputId} className="text-xs font-medium text-foreground">
        {field.label}
        {field.required && <span className="ml-1 text-destructive">*</span>}
      </label>
      {field.type === "select" ? (
        <select
          {...sharedProps}
          className="flex h-9 w-full rounded-2xl border border-transparent bg-input/50 px-3 text-sm outline-none transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30 aria-invalid:border-destructive aria-invalid:ring-destructive/20"
        >
          <option value="">เลือก{field.label}</option>
          {field.options?.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      ) : field.type === "textarea" ? (
        <Textarea
          {...sharedProps}
          rows={4}
          placeholder={field.placeholder}
          className="min-h-24"
        />
      ) : (
        <Input
          {...sharedProps}
          type={field.type}
          min={field.min}
          placeholder={field.placeholder}
          className="h-9"
        />
      )}
      {error ? (
        <p id={`${inputId}-error`} role="alert" className="text-xs text-destructive">
          {error}
        </p>
      ) : field.helpText ? (
        <p id={`${inputId}-help`} className="text-xs text-muted-foreground">
          {field.helpText}
        </p>
      ) : null}
    </div>
  );
}

function RequestDetail({ request }: { request: MockRequest }) {
  const status = REQUEST_STATUS_META[request.status];
  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 border-b border-border pb-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="font-mono text-xs text-muted-foreground">{request.id}</p>
          <h3 className="mt-1 text-base font-semibold text-foreground">{request.title}</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            {request.typeLabel} · ยื่นเมื่อ {request.displayDate}
          </p>
        </div>
        <Badge variant={status.variant} className="h-auto self-start py-1">
          {status.label}
        </Badge>
      </div>

      <section aria-labelledby="member-request-data-heading">
        <h4 id="member-request-data-heading" className="mb-2 text-xs font-semibold text-foreground">
          ข้อมูลในคำร้อง
        </h4>
        <dl className="grid gap-3 rounded-2xl bg-muted/50 p-4 sm:grid-cols-2">
          {request.fields.map((field) => (
            <div key={field.id} className="min-w-0">
              <dt className="text-xs text-muted-foreground">{field.label}</dt>
              <dd className="mt-1 break-words text-sm font-medium text-foreground">
                {field.value}
              </dd>
            </div>
          ))}
          {request.attachment && (
            <div className="min-w-0 sm:col-span-2">
              <dt className="text-xs text-muted-foreground">ไฟล์แนบ</dt>
              <dd className="mt-1 flex items-center gap-2 text-sm font-medium text-foreground">
                <span className="material-symbols-outlined text-lg text-primary">attach_file</span>
                <span className="truncate">{request.attachment.name}</span>
                <span className="shrink-0 text-xs font-normal text-muted-foreground">
                  ({formatFileSize(request.attachment.size)})
                </span>
              </dd>
            </div>
          )}
        </dl>
      </section>

      {request.reviewerNote && (
        <section className="rounded-2xl border border-info-border bg-info-soft p-4" aria-labelledby="reviewer-note-heading">
          <h4 id="reviewer-note-heading" className="text-xs font-semibold text-info-on-soft">
            หมายเหตุจากเจ้าหน้าที่
          </h4>
          <p className="mt-1 text-sm text-info-on-soft">{request.reviewerNote}</p>
          {request.reviewedBy && (
            <p className="mt-2 text-xs text-info-on-soft/80">โดย {request.reviewedBy}</p>
          )}
        </section>
      )}

      <section aria-labelledby="request-progress-heading">
        <h4 id="request-progress-heading" className="mb-3 text-xs font-semibold text-foreground">
          ความคืบหน้า
        </h4>
        <ol className="space-y-3 border-l-2 border-border pl-5">
          {request.progress.map((progress, index) => (
            <li key={`${progress}-${index}`} className="relative text-xs text-foreground">
              <span className="absolute -left-[27px] top-0.5 h-3 w-3 rounded-full bg-primary ring-4 ring-card" />
              {progress}
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}

export default function MemberRequestsPage() {
  const { requests, storageError, addRequest, updateRequest } = useRequestStore();
  const [filter, setFilter] = useState<RequestFilter>("all");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [categoryId, setCategoryId] = useState<RequestCategoryId | null>(null);
  const [values, setValues] = useState<FormValues>({});
  const [errors, setErrors] = useState<FormErrors>({});
  const [attachment, setAttachment] = useState<File | null>(null);
  const [existingAttachment, setExistingAttachment] = useState<FileMetadata | undefined>();
  const [attachmentError, setAttachmentError] = useState("");
  const [detailId, setDetailId] = useState<string | null>(null);
  const [editingRequestId, setEditingRequestId] = useState<string | null>(null);

  const category = categoryId ? getRequestCategory(categoryId) : undefined;
  const detailRequest = requests.find((request) => request.id === detailId) ?? null;
  const filteredRequests = useMemo(
    () =>
      filter === "all"
        ? requests
        : requests.filter((request) => request.status === filter),
    [filter, requests],
  );

  const resetDraft = () => {
    setStep(1);
    setCategoryId(null);
    setValues({});
    setErrors({});
    setAttachment(null);
    setExistingAttachment(undefined);
    setAttachmentError("");
    setEditingRequestId(null);
  };

  const handleCreateOpenChange = (open: boolean) => {
    setIsCreateOpen(open);
    if (!open) resetDraft();
  };

  const selectCategory = (nextCategoryId: RequestCategoryId) => {
    setCategoryId(nextCategoryId);
    setValues({});
    setErrors({});
    setAttachment(null);
    setExistingAttachment(undefined);
    setAttachmentError("");
  };

  const startRevision = (request: MockRequest) => {
    if (request.categoryId === "legacy") return;
    const requestCategory = getRequestCategory(request.categoryId);
    if (!requestCategory) return;

    setEditingRequestId(request.id);
    setCategoryId(request.categoryId);
    setValues(Object.fromEntries(request.fields.map((field) => [field.id, field.value])));
    setErrors({});
    setAttachment(null);
    setExistingAttachment(request.attachment);
    setAttachmentError("");
    setStep(2);
    setDetailId(null);
    window.setTimeout(() => setIsCreateOpen(true), 150);
  };

  const updateValue = (fieldId: string, value: string) => {
    setValues((current) => ({ ...current, [fieldId]: value }));
    setErrors((current) => {
      if (!current[fieldId]) return current;
      const next = { ...current };
      delete next[fieldId];
      return next;
    });
  };

  const validateDetails = (selectedCategory: RequestCategoryDefinition) => {
    const nextErrors: FormErrors = {};
    selectedCategory.fields.forEach((field) => {
      const value = values[field.id]?.trim() ?? "";
      if (field.required && !value) {
        nextErrors[field.id] = `กรุณากรอก${field.label}`;
      } else if (field.type === "number" && value) {
        const numberValue = Number(value);
        if (!Number.isFinite(numberValue) || numberValue < (field.min ?? 0)) {
          nextErrors[field.id] = `กรุณาระบุ${field.label}ให้ถูกต้อง`;
        }
      }
    });
    setErrors(nextErrors);
    const firstInvalidField = selectedCategory.fields.find(
      (field) => nextErrors[field.id],
    );
    if (firstInvalidField) {
      window.requestAnimationFrame(() => {
        document.getElementById(`request-field-${firstInvalidField.id}`)?.focus();
      });
    }
    return Object.keys(nextErrors).length === 0 && !attachmentError;
  };

  const handleAttachment = (event: ChangeEvent<HTMLInputElement>) => {
    const input = event.currentTarget;
    const file = input.files?.[0];
    setAttachmentError("");
    if (!file) {
      setAttachment(null);
      return;
    }
    if (!category?.attachment) {
      input.value = "";
      setAttachment(null);
      return;
    }
    if (!category.attachment.acceptedTypes.includes(file.type)) {
      input.value = "";
      setAttachment(null);
      setAttachmentError("รองรับเฉพาะไฟล์ PDF, JPG หรือ PNG");
      return;
    }
    if (file.size > category.attachment.maxBytes) {
      input.value = "";
      setAttachment(null);
      setAttachmentError("ไฟล์ต้องมีขนาดไม่เกิน 5 MB");
      return;
    }
    setAttachment(file);
    setExistingAttachment(undefined);
  };

  const goNext = () => {
    if (step === 1) {
      if (!category) return;
      setStep(2);
      return;
    }
    if (step === 2 && category && validateDetails(category)) {
      setStep(3);
    }
  };

  const submitRequest = () => {
    if (!category || !validateDetails(category)) {
      setStep(2);
      return;
    }
    const now = new Date();
    const identity = currentMemberPassport.identity;
    const fieldEntries = category.fields
      .map((field) => ({
        id: field.id,
        label: field.label,
        value: values[field.id]?.trim() ?? "",
      }))
      .filter((field) => field.value);
    const headline = fieldEntries[0]?.value;
    const attachmentMetadata = attachment
      ? toFileMetadata(attachment)
      : existingAttachment;
    const request: MockRequest = {
      id: makeRequestId(category, now),
      categoryId: category.id,
      typeLabel: category.name,
      title: headline ? `${category.name}: ${headline}` : category.name,
      displayDate: formatThaiRequestDate(now),
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
      status: "pending",
      requester: {
        memberId: currentMemberPassport.memberId,
        name: `${identity.titleTh} ${identity.firstNameTh} ${identity.lastNameTh}`,
        email: identity.email,
      },
      fields: fieldEntries,
      attachment: attachmentMetadata,
      progress: progressForStatus("pending"),
    };
    if (editingRequestId) {
      updateRequest(editingRequestId, (current) => ({
        ...current,
        typeLabel: request.typeLabel,
        title: request.title,
        updatedAt: request.updatedAt,
        status: "pending",
        fields: request.fields,
        attachment: request.attachment,
        progress: progressForStatus("pending"),
        reviewerNote: undefined,
        reviewedAt: undefined,
        reviewedBy: undefined,
      }));
    } else {
      addRequest(request);
    }
    handleCreateOpenChange(false);
    setFilter("all");
    toast.success(editingRequestId ? "ส่งข้อมูลเพิ่มเติมเรียบร้อยแล้ว" : "ยื่นคำร้องเรียบร้อยแล้ว", {
      description: `หมายเลขคำร้อง ${editingRequestId ?? request.id}`,
    });
  };

  return (
    <>
      <PageShell>
        <div className="mb-5 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <h1 className="mb-1 text-lg font-semibold md:text-xl">คำร้องของฉัน</h1>
            <p className="text-xs text-muted-foreground">
              ยื่นคำร้อง ติดตามสถานะ และอ่านคำแนะนำจากเจ้าหน้าที่
            </p>
          </div>
          <Button onClick={() => setIsCreateOpen(true)} className="gap-1.5">
            <span className="material-symbols-outlined text-base">add</span>
            ยื่นคำร้องใหม่
          </Button>
        </div>

        {storageError && (
          <div role="alert" className="mb-4 flex gap-2 rounded-2xl border border-warning-border bg-warning-soft p-3 text-xs text-warning-on-soft">
            <span className="material-symbols-outlined text-lg">warning</span>
            <span>{storageError}</span>
          </div>
        )}

        <div className="mb-4 flex gap-2 overflow-x-auto pb-1" aria-label="กรองสถานะคำร้อง">
          {FILTERS.map((item) => {
            const count =
              item.id === "all"
                ? requests.length
                : requests.filter((request) => request.status === item.id).length;
            return (
              <button
                key={item.id}
                type="button"
                aria-pressed={filter === item.id}
                onClick={() => setFilter(item.id)}
                className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/30 ${
                  filter === item.id
                    ? "border-brand-border bg-brand-soft text-brand-on-soft"
                    : "border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                {item.label} ({count})
              </button>
            );
          })}
        </div>

        {filteredRequests.length > 0 ? (
          <div className="space-y-3">
            {filteredRequests.map((request) => {
              const status = REQUEST_STATUS_META[request.status];
              return (
                <Card key={request.id} className={`border-l-4 ${status.borderClass}`}>
                  <CardContent className="px-4">
                    <button
                      type="button"
                      onClick={() => setDetailId(request.id)}
                      className="w-full rounded-xl text-left outline-none focus-visible:ring-3 focus-visible:ring-ring/30"
                    >
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0">
                          <div className="mb-1 flex flex-wrap items-center gap-2">
                            <span className="font-mono text-xs text-muted-foreground">{request.id}</span>
                            <Badge variant={status.variant} className="h-auto py-1 text-xs">
                              {status.label}
                            </Badge>
                          </div>
                          <h2 className="truncate text-sm font-semibold text-foreground">{request.title}</h2>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {request.typeLabel} · {request.displayDate}
                          </p>
                          {request.status === "needs_information" && request.reviewerNote && (
                            <p className="mt-2 line-clamp-2 rounded-xl bg-info-soft px-3 py-2 text-xs text-info-on-soft">
                              เจ้าหน้าที่: {request.reviewerNote}
                            </p>
                          )}
                        </div>
                        <span className="material-symbols-outlined self-end text-xl text-muted-foreground sm:self-center">
                          chevron_right
                        </span>
                      </div>
                    </button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card>
            <CardContent className="flex min-h-56 flex-col items-center justify-center text-center">
              <span className="material-symbols-outlined mb-3 text-4xl text-muted-foreground">inbox</span>
              <h2 className="text-sm font-semibold text-foreground">ไม่พบคำร้องในสถานะนี้</h2>
              <p className="mt-1 text-xs text-muted-foreground">เลือกสถานะอื่นหรือยื่นคำร้องใหม่ได้ทันที</p>
            </CardContent>
          </Card>
        )}

        <Dialog open={isCreateOpen} onOpenChange={handleCreateOpenChange}>
          <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
            <DialogHeader>
              <DialogTitle>{editingRequestId ? "ส่งข้อมูลเพิ่มเติม" : "ยื่นคำร้องใหม่"}</DialogTitle>
              <DialogDescription>
                {editingRequestId && "แก้ไขตามหมายเหตุเจ้าหน้าที่ · "}
                ขั้นตอนที่ {step} จาก 3: {step === 1 ? "เลือกประเภทคำร้อง" : step === 2 ? "กรอกข้อมูล" : "ตรวจสอบและยืนยัน"}
              </DialogDescription>
            </DialogHeader>

            <ol className="grid grid-cols-3 gap-2" aria-label="ขั้นตอนการยื่นคำร้อง">
              {["เลือกประเภท", "กรอกข้อมูล", "ยืนยัน"].map((label, index) => {
                const number = index + 1;
                return (
                  <li key={label} className="flex min-w-0 items-center gap-2">
                    <span
                      aria-current={step === number ? "step" : undefined}
                      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                        step >= number
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {number}
                    </span>
                    <span className={`truncate text-xs ${step >= number ? "font-medium text-foreground" : "text-muted-foreground"}`}>
                      {label}
                    </span>
                  </li>
                );
              })}
            </ol>

            {step === 1 && (
              <div className="grid gap-3 sm:grid-cols-2">
                {REQUEST_CATALOG.map((item) => {
                  const selected = item.id === categoryId;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      aria-pressed={selected}
                      onClick={() => selectCategory(item.id)}
                      className={`rounded-2xl border p-4 text-left transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/30 ${
                        selected
                          ? "border-primary bg-primary/5"
                          : "border-border bg-card hover:bg-muted/50"
                      }`}
                    >
                      <span className="material-symbols-outlined text-2xl text-primary">{item.icon}</span>
                      <span className="mt-2 block text-sm font-semibold text-foreground">{item.name}</span>
                      <span className="mt-1 block text-xs leading-relaxed text-muted-foreground">{item.description}</span>
                    </button>
                  );
                })}
              </div>
            )}

            {step === 2 && category && (
              <div className="space-y-5">
                <div className="rounded-2xl border border-brand-border bg-brand-soft p-3">
                  <p className="text-xs font-semibold text-brand-on-soft">{category.name}</p>
                  <p className="mt-0.5 text-xs text-brand-on-soft/80">{category.description}</p>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  {category.fields.map((field) => (
                    <RequestFieldControl
                      key={field.id}
                      field={field}
                      value={values[field.id] ?? ""}
                      error={errors[field.id]}
                      onChange={(value) => updateValue(field.id, value)}
                    />
                  ))}
                </div>
                {category.attachment && (
                  <div className="space-y-1.5 border-t border-border pt-4">
                    <label htmlFor="request-attachment" className="text-xs font-medium text-foreground">
                      {category.attachment.label}
                    </label>
                    <Input
                      key={attachment ? `${attachment.name}-${attachment.lastModified}` : "empty"}
                      id="request-attachment"
                      type="file"
                      accept={category.attachment.acceptedTypes.join(",")}
                      onChange={handleAttachment}
                      aria-invalid={Boolean(attachmentError)}
                      aria-describedby={attachmentError ? "request-attachment-error" : attachment || existingAttachment ? "request-attachment-selected" : "request-attachment-help"}
                      className="h-auto py-1"
                    />
                    {attachmentError ? (
                      <p id="request-attachment-error" role="alert" className="text-xs text-destructive">
                        {attachmentError}
                      </p>
                    ) : attachment ? (
                      <div id="request-attachment-selected" className="flex flex-wrap items-center justify-between gap-2 text-xs">
                        <span className="min-w-0 truncate text-foreground">
                          เลือกแล้ว: {attachment.name} ({formatFileSize(attachment.size)})
                        </span>
                        <button
                          type="button"
                          onClick={() => setAttachment(null)}
                          className="font-medium text-destructive hover:underline"
                        >
                          นำไฟล์ออก
                        </button>
                      </div>
                    ) : existingAttachment ? (
                      <div id="request-attachment-selected" className="flex flex-wrap items-center justify-between gap-2 text-xs">
                        <span className="min-w-0 truncate text-foreground">
                          ไฟล์เดิม: {existingAttachment.name} ({formatFileSize(existingAttachment.size)})
                        </span>
                        <button
                          type="button"
                          onClick={() => setExistingAttachment(undefined)}
                          className="font-medium text-destructive hover:underline"
                        >
                          นำไฟล์ออก
                        </button>
                      </div>
                    ) : (
                      <p id="request-attachment-help" className="text-xs text-muted-foreground">
                        {category.attachment.helpText}
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}

            {step === 3 && category && (
              <div className="space-y-4">
                <div className="rounded-2xl border border-success-border bg-success-soft p-4">
                  <div className="flex items-center gap-2 text-success-on-soft">
                    <span className="material-symbols-outlined">fact_check</span>
                    <h3 className="text-sm font-semibold">ตรวจสอบข้อมูลก่อนยืนยัน</h3>
                  </div>
                  <p className="mt-1 text-xs text-success-on-soft/80">คำร้องจะถูกส่งให้เจ้าหน้าที่ตรวจสอบหลังจากกดยืนยัน</p>
                </div>
                <dl className="grid gap-3 rounded-2xl bg-muted/50 p-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <dt className="text-xs text-muted-foreground">ประเภทคำร้อง</dt>
                    <dd className="mt-1 text-sm font-semibold text-foreground">{category.name}</dd>
                  </div>
                  {category.fields.map((field) => {
                    const value = values[field.id]?.trim();
                    if (!value) return null;
                    return (
                      <div key={field.id} className={field.type === "textarea" ? "sm:col-span-2" : undefined}>
                        <dt className="text-xs text-muted-foreground">{field.label}</dt>
                        <dd className="mt-1 whitespace-pre-wrap text-sm font-medium text-foreground">{value}</dd>
                      </div>
                    );
                  })}
                  {(attachment || existingAttachment) && (
                    <div className="sm:col-span-2">
                      <dt className="text-xs text-muted-foreground">ไฟล์แนบ</dt>
                      <dd className="mt-1 text-sm font-medium text-foreground">
                        {(attachment ?? existingAttachment)?.name} ({formatFileSize((attachment ?? existingAttachment)?.size ?? 0)})
                      </dd>
                    </div>
                  )}
                </dl>
              </div>
            )}

            <DialogFooter className="border-t border-border pt-4">
              <Button variant="outline" onClick={() => handleCreateOpenChange(false)}>
                ยกเลิก
              </Button>
              {step > (editingRequestId ? 2 : 1) && (
                <Button variant="outline" onClick={() => setStep((current) => current - 1)}>
                  ย้อนกลับ
                </Button>
              )}
              {step < 3 ? (
                <Button onClick={goNext} disabled={step === 1 && !category}>
                  ถัดไป
                </Button>
              ) : (
                <Button onClick={submitRequest}>
                  {editingRequestId ? "ยืนยันและส่งตรวจอีกครั้ง" : "ยืนยันการยื่นคำร้อง"}
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={Boolean(detailRequest)} onOpenChange={(open) => !open && setDetailId(null)}>
          <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">description</span>
                รายละเอียดคำร้อง
              </DialogTitle>
              <DialogDescription>ข้อมูลและสถานะล่าสุดของคำร้อง</DialogDescription>
            </DialogHeader>
            {detailRequest && <RequestDetail request={detailRequest} />}
            <DialogFooter>
              <Button variant="outline" onClick={() => setDetailId(null)}>ปิด</Button>
              {detailRequest?.status === "needs_information" && detailRequest.categoryId !== "legacy" && (
                <Button onClick={() => startRevision(detailRequest)}>
                  แก้ไขและส่งข้อมูลเพิ่ม
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </PageShell>
      <Footer />
    </>
  );
}
