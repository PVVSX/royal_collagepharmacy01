export interface FileMetadata {
  name: string;
  type: string;
  size: number;
  lastModified: number;
}

export const DEFAULT_UPLOAD_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
] as const;

export const DEFAULT_UPLOAD_MAX_BYTES = 5 * 1024 * 1024;

export function toFileMetadata(file: File): FileMetadata {
  return {
    name: file.name,
    type: file.type,
    size: file.size,
    lastModified: file.lastModified,
  };
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
