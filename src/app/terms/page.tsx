import type { Metadata } from "next";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { PublicInformationPage } from "@/roles/shared/components/layout/PublicInformationPage";
import { institutionInfo } from "@/roles/shared/data";

export const metadata: Metadata = {
  title: `ข้อตกลงการใช้งาน | ${institutionInfo.nameTh}`,
  description: `ข้อตกลงและแนวทางการใช้งานระบบบริการสมาชิกของ ${institutionInfo.nameTh}`,
};

export default function TermsPage() {
  return (
    <PublicInformationPage
      eyebrow="Terms of Use"
      title="ข้อตกลงการใช้งาน"
      description="ช่องทางตรวจสอบข้อกำหนดและประกาศที่เกี่ยวข้องกับการใช้บริการสมาชิก"
    >
      <div className="space-y-6">
        <section aria-labelledby="official-terms-heading" className="rounded-2xl border border-info-border bg-info-soft p-5 text-info-on-soft">
          <h2 id="official-terms-heading" className="font-heading text-lg font-semibold">
            เอกสารฉบับที่มีผลใช้บังคับ
          </h2>
          <p className="mt-2 text-sm leading-7">
            ให้ยึดประกาศ ข้อบังคับ และเอกสารฉบับล่าสุดที่เผยแพร่โดยสภาเภสัชกรรมหรือราชวิทยาลัยเป็นหลัก
            เนื้อหาในหน้านี้ไม่แก้ไขหรือใช้แทนเอกสารดังกล่าว
          </p>
        </section>

        <section aria-labelledby="how-to-check-heading">
          <h2 id="how-to-check-heading" className="font-heading text-lg font-semibold">
            วิธีตรวจสอบข้อมูลล่าสุด
          </h2>
          <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm leading-7 text-muted-foreground marker:font-semibold marker:text-primary">
            <li>ตรวจสอบประกาศและข้อบังคับจากเว็บไซต์สภาเภสัชกรรม</li>
            <li>หากต้องใช้ข้อมูลเพื่ออ้างอิงทางราชการ ให้ยืนยันฉบับและวันที่มีผลกับราชวิทยาลัยโดยตรง</li>
            <li>กรณีพบข้อมูลไม่ตรงกัน ให้ใช้เอกสารทางการฉบับล่าสุดเป็นหลัก</li>
          </ol>
        </section>

        <div className="flex flex-col gap-3 border-t border-border pt-6 sm:flex-row">
          <Button asChild>
            <a href={institutionInfo.officialWebsite} target="_blank" rel="noreferrer">
              <span aria-hidden="true" className="material-symbols-outlined">open_in_new</span>
              เว็บไซต์สภาเภสัชกรรม
            </a>
          </Button>
          <Button asChild variant="outline">
            <Link href="/contact">ติดต่อราชวิทยาลัย</Link>
          </Button>
        </div>
      </div>
    </PublicInformationPage>
  );
}
