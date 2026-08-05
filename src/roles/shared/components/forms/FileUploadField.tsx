"use client";

import { useId, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DEFAULT_UPLOAD_MAX_BYTES,
  DEFAULT_UPLOAD_TYPES,
  formatFileSize,
  toFileMetadata,
  type FileMetadata,
} from "@/roles/shared/features/file-metadata";

interface FileUploadFieldProps {
  label: string;
  description?: string;
  value?: FileMetadata;
  onChange: (file?: FileMetadata) => void;
  required?: boolean;
  maxBytes?: number;
  acceptedTypes?: readonly string[];
  error?: string;
  compact?: boolean;
}

export function FileUploadField({
  label,
  description,
  value,
  onChange,
  required = false,
  maxBytes = DEFAULT_UPLOAD_MAX_BYTES,
  acceptedTypes = DEFAULT_UPLOAD_TYPES,
  error,
  compact = false,
}: FileUploadFieldProps) {
  const generatedId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [localError, setLocalError] = useState("");
  const errorMessage = error || localError;
  const descriptionId = `${generatedId}-description`;
  const errorId = `${generatedId}-error`;
  const describedBy = [
    description ? descriptionId : undefined,
    errorMessage ? errorId : undefined,
  ].filter(Boolean).join(" ") || undefined;

  const rejectFile = (message: string) => {
    setLocalError(message);
    onChange(undefined);
    if (inputRef.current) inputRef.current.value = "";
  };

  const handleFile = (file?: File) => {
    setLocalError("");
    if (!file) return;
    if (!acceptedTypes.includes(file.type)) {
      rejectFile("รองรับเฉพาะไฟล์ PDF, JPG และ PNG");
      return;
    }
    if (file.size > maxBytes) {
      rejectFile(`ไฟล์ต้องมีขนาดไม่เกิน ${formatFileSize(maxBytes)}`);
      return;
    }
    onChange(toFileMetadata(file));
  };

  return (
    <div className="space-y-2">
      <div>
        <label htmlFor={generatedId} className="text-sm font-medium text-foreground">
          {label}
          {required && <span className="ml-1 text-danger" aria-hidden="true">*</span>}
        </label>
        {description && <p id={descriptionId} className="mt-1 text-xs leading-relaxed text-muted-foreground">{description}</p>}
      </div>

      <input
        ref={inputRef}
        id={generatedId}
        type="file"
        tabIndex={-1}
        className="sr-only"
        accept={acceptedTypes.join(",")}
        aria-required={required}
        aria-invalid={Boolean(errorMessage)}
        aria-describedby={describedBy}
        onChange={(event) => handleFile(event.target.files?.[0])}
      />

      {value ? (
        <div className="flex items-center gap-3 rounded-lg border border-success-border bg-success-soft px-3 py-3">
          <span className="material-symbols-outlined text-xl text-success-on-soft">draft</span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-foreground">{value.name}</p>
            <p className="text-xs text-muted-foreground">{formatFileSize(value.size)}</p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 shrink-0 text-xs"
            onClick={() => {
              setLocalError("");
              onChange(undefined);
              if (inputRef.current) inputRef.current.value = "";
            }}
          >
            นำออก
          </Button>
        </div>
      ) : (
        <button
          type="button"
          className={compact
            ? "flex min-h-12 w-full items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-muted/30 px-3 py-2.5 text-center transition-colors hover:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            : "flex min-h-28 w-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-muted/30 px-4 py-5 text-center transition-colors hover:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"}
          onClick={() => inputRef.current?.click()}
        >
          <span className={`material-symbols-outlined text-primary ${compact ? "text-xl" : "mb-1 text-3xl"}`}>upload_file</span>
          <span className="text-sm font-medium text-foreground">{compact ? "แนบไฟล์" : "เลือกไฟล์จากอุปกรณ์"}</span>
          {!compact && <span className="mt-1 text-xs text-muted-foreground">PDF, JPG หรือ PNG ขนาดไม่เกิน {formatFileSize(maxBytes)}</span>}
        </button>
      )}

      {errorMessage && (
        <p id={errorId} role="alert" className="text-xs text-danger">
          {errorMessage}
        </p>
      )}
    </div>
  );
}
