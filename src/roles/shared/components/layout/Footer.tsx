"use client";

import { institutionInfo, legalReferences } from "@/roles/shared/data";

export default function Footer() {
  const handleClick = (msg: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    alert(msg);
  };

  return (
    <footer className="mt-auto w-full border-t border-border bg-transparent px-4 py-6 md:px-10">
      <div className="mx-auto flex max-w-7xl flex-col gap-4">
        {/* Top row: copyright + links */}
        <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
          <div className="text-center text-xs text-muted-foreground sm:text-left">
            © 2569 {institutionInfo.nameTh} ({institutionInfo.nameEn}). All Rights Reserved.
          </div>
          <div className="flex gap-6 text-xs">
            <a href="#" onClick={handleClick(`ติดต่อเรา\n\n${institutionInfo.address}\n\nโทร: ${institutionInfo.phone}\nอีเมล: ${institutionInfo.emails.general}`)} className="cursor-pointer text-foreground transition-all hover:underline">
              ติดต่อเรา
            </a>
            <a href="#" onClick={handleClick(`นโยบายความเป็นส่วนตัว\n\nข้อมูลส่วนบุคคลของผู้เข้าศึกษาจะถูกเก็บเป็นความลับตามพระราชบัญญัติคุ้มครองข้อมูลส่วนบุคคล พ.ศ. 2562`)} className="cursor-pointer text-foreground transition-all hover:underline">
              นโยบายความเป็นส่วนตัว
            </a>
            <a href="#" onClick={handleClick(`ข้อกำหนดการใช้งาน\n\n${legalReferences[0]}\n\n${legalReferences[1]}`)} className="cursor-pointer text-foreground transition-all hover:underline">
              ข้อกำหนดการใช้งาน
            </a>
          </div>
        </div>

        {/* Bottom row: under council */}
        <div className="text-center text-xs text-muted-foreground">
          {institutionInfo.parentOrg} | {institutionInfo.address} | โทร: {institutionInfo.phone}
        </div>
      </div>
    </footer>
  );
}
