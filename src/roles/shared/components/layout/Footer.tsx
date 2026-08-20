import Link from "next/link";

import { institutionInfo } from "@/roles/shared/data";

export default function Footer() {
  return (
    <footer className="mt-8 w-full border-t border-border/70 pt-4">
      <nav
        aria-label="ลิงก์ส่วนท้าย"
        className="flex flex-col items-center justify-center gap-y-1 text-2xs leading-relaxed text-muted-foreground sm:flex-row sm:gap-x-2 sm:text-xs"
      >
        <span className="whitespace-nowrap">© 2569 {institutionInfo.nameTh}</span>
        <span className="flex items-center gap-2">
          <span aria-hidden="true" className="hidden text-border sm:inline">
            •
          </span>
          <Link
            href="/contact"
            className="inline-flex min-h-6 items-center whitespace-nowrap rounded-sm font-medium underline-offset-4 transition-colors hover:text-foreground hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            ติดต่อเรา
          </Link>
          <span aria-hidden="true" className="text-border">
            •
          </span>
          <Link
            href="/terms"
            className="inline-flex min-h-6 items-center whitespace-nowrap rounded-sm font-medium underline-offset-4 transition-colors hover:text-foreground hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            ข้อตกลงการใช้งาน
          </Link>
        </span>
      </nav>
    </footer>
  );
}
