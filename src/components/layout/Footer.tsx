"use client";

import { institutionInfo, legalReferences } from "@/data";

export default function Footer() {
  const handleClick = (msg: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    alert(msg);
  };

  return (
    <footer className="bg-surface-container-low border-t border-outline-variant w-full py-6 px-4 md:px-10 mt-auto">
      <div className="flex flex-col gap-4 max-w-[1280px] mx-auto">
        {/* Top row: copyright + links */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
          <div className="text-xs text-muted-foreground text-center sm:text-left">
            © 2569 {institutionInfo.nameTh} ({institutionInfo.nameEn}). All Rights Reserved.
          </div>
          <div className="flex space-x-6 text-xs">
            <a href="#" onClick={handleClick(`ติดต่อเรา\n\n${institutionInfo.address}\n\nโทร: ${institutionInfo.phone}\nอีเมล: ${institutionInfo.emails.general}`)} className="text-on-surface-variant hover:underline transition-all cursor-pointer">
              ติดต่อเรา
            </a>
            <a href="#" onClick={handleClick(`นโยบายความเป็นส่วนตัว\n\nข้อมูลส่วนบุคคลของผู้เข้าศึกษาจะถูกเก็บเป็นความลับตามพระราชบัญญัติคุ้มครองข้อมูลส่วนบุคคล พ.ศ. 2562`)} className="text-on-surface-variant hover:underline transition-all cursor-pointer">
              นโยบายความเป็นส่วนตัว
            </a>
            <a href="#" onClick={handleClick(`ข้อกำหนดการใช้งาน\n\n${legalReferences[0]}\n\n${legalReferences[1]}`)} className="text-on-surface-variant hover:underline transition-all cursor-pointer">
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
