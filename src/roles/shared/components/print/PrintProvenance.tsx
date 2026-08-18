"use client";

import { useEffect, useState } from "react";

interface PrintProvenanceProps {
  documentTitle: string;
}

interface GeneratedTimestamp {
  iso: string;
  label: string;
}

const thaiDateTimeFormatter = new Intl.DateTimeFormat("th-TH", {
  dateStyle: "long",
  timeStyle: "medium",
  timeZone: "Asia/Bangkok",
});

export function PrintProvenance({ documentTitle }: PrintProvenanceProps) {
  const [generatedAt, setGeneratedAt] = useState<GeneratedTimestamp | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const timestamp = new Date();
      setGeneratedAt({
        iso: timestamp.toISOString(),
        label: thaiDateTimeFormatter.format(timestamp),
      });
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  return (
    <footer
      aria-label="ข้อมูลที่มาของเอกสาร"
      className="absolute inset-x-[20mm] bottom-[8mm] break-inside-avoid border-t border-print-border pt-2 text-center text-[9px] leading-4 text-print-subtle"
    >
      <p>
        จัดทำจากระบบสารสนเทศสมาชิกและการสอบวิชาชีพ ·{" "}
        ราชวิทยาลัยเภสัชกรรมแห่งประเทศไทย
      </p>
      <p className="min-h-4">
        {generatedAt ? (
          <>
            เอกสาร: {documentTitle} · สร้างเมื่อ{" "}
            <time dateTime={generatedAt.iso}>{generatedAt.label}</time> (เวลาไทย)
          </>
        ) : (
          <span aria-hidden="true">กำลังเตรียมข้อมูลวันและเวลา…</span>
        )}
      </p>
    </footer>
  );
}
