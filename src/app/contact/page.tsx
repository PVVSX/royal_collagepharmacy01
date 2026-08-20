import type { Metadata } from "next";

import { Button } from "@/components/ui/button";
import { PublicInformationPage } from "@/roles/shared/components/layout/PublicInformationPage";
import { institutionInfo } from "@/roles/shared/data";

export const metadata: Metadata = {
  title: `ติดต่อเรา | ${institutionInfo.nameTh}`,
  description: `ข้อมูลติดต่อ ${institutionInfo.nameTh}`,
};

const contactItems = [
  {
    icon: "location_on",
    label: "ที่อยู่",
    value: institutionInfo.address,
  },
  {
    icon: "call",
    label: "โทรศัพท์",
    value: `${institutionInfo.phone} ${institutionInfo.phoneExtensions["ราชวิทยาลัย"]}`,
    href: `tel:${institutionInfo.phone.replaceAll("-", "")}`,
  },
  {
    icon: "mail",
    label: "อีเมล",
    value: institutionInfo.emails.general,
    href: `mailto:${institutionInfo.emails.general}`,
  },
] as const;

export default function ContactPage() {
  return (
    <PublicInformationPage
      eyebrow="Contact"
      title="ติดต่อเรา"
      description="ติดต่อราชวิทยาลัยเพื่อสอบถามข้อมูลการใช้งานระบบและบริการสมาชิกวิชาชีพ"
    >
      <div className="space-y-6">
        <div>
          <h2 className="font-heading text-xl font-semibold">{institutionInfo.nameTh}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{institutionInfo.parentOrg}</p>
        </div>

        <dl className="divide-y divide-border">
          {contactItems.map((item) => (
            <div key={item.label} className="grid gap-2 py-4 first:pt-0 last:pb-0 sm:grid-cols-[9rem_1fr]">
              <dt className="flex items-center gap-2 text-sm font-medium">
                <span aria-hidden="true" className="material-symbols-outlined text-xl text-primary">
                  {item.icon}
                </span>
                {item.label}
              </dt>
              <dd className="text-sm leading-6 text-muted-foreground sm:text-base">
                {"href" in item ? (
                  <a
                    href={item.href}
                    className="rounded-sm font-medium text-foreground underline decoration-border underline-offset-4 transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    {item.value}
                  </a>
                ) : (
                  item.value
                )}
              </dd>
            </div>
          ))}
        </dl>

        <div className="flex flex-col gap-3 border-t border-border pt-6 sm:flex-row">
          <Button asChild size="lg">
            <a href={`mailto:${institutionInfo.emails.general}`}>
              <span aria-hidden="true" className="material-symbols-outlined">
                mail
              </span>
              ส่งอีเมล
            </a>
          </Button>
          <Button asChild variant="outline" size="lg">
            <a href={`tel:${institutionInfo.phone.replaceAll("-", "")}`}>
              <span aria-hidden="true" className="material-symbols-outlined">
                call
              </span>
              โทร {institutionInfo.phone} {institutionInfo.phoneExtensions["ราชวิทยาลัย"]}
            </a>
          </Button>
          <Button asChild variant="ghost" size="lg">
            <a href={institutionInfo.officialWebsite} target="_blank" rel="noreferrer">
              <span aria-hidden="true" className="material-symbols-outlined">
                open_in_new
              </span>
              เว็บไซต์สภาเภสัชกรรม
            </a>
          </Button>
        </div>
      </div>
    </PublicInformationPage>
  );
}
