"use client";
import { toast } from "sonner";
import { useState } from "react";
import { newsData } from "@/roles/shared/data";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SegmentedFilterButton, SegmentedFilterGroup } from "@/components/ui/segmented-filter";
import { PageShell } from "@/roles/shared/components/layout/PageShell";

const cm: Record<string, { border: string; variant: "brand" | "danger" | "success" | "warning" }> = {
  red: { border: "border-t-danger", variant: "danger" },
  purple: { border: "border-t-brand", variant: "brand" },
  gold: { border: "border-t-warning", variant: "warning" },
  green: { border: "border-t-success", variant: "success" },
};

export default function NewsPage() {
  const [activeFilter, setActiveFilter] = useState("ทั้งหมด");
  const filters = ["ทั้งหมด", "ประกาศสำคัญ", "วิชาการ", "การเงิน", "กิจกรรม"];
  const filtered = activeFilter === "ทั้งหมด" ? newsData : newsData.filter((n) => n.category === activeFilter);

  return (
    <>
      <PageShell>
        <div className="mb-8 h-[200px] w-full overflow-hidden rounded-2xl shadow-sm md:h-[280px]">
          <img src="/images/assets/news/header page.png" alt="" aria-hidden="true" className="h-full w-full object-cover" />
        </div>
        <SegmentedFilterGroup aria-label="กรองหมวดหมู่ข่าว" className="mb-5">{filters.map((f) => (
          <SegmentedFilterButton key={f} active={activeFilter === f} onClick={() => setActiveFilter(f)}>{f}</SegmentedFilterButton>
        ))}</SegmentedFilterGroup>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">{filtered.map((item) => { const c = cm[item.categoryColor]; return (
          <Card key={item.id} className={`border-t-4 border-l-0 ${c.border} hover:shadow-md transition-all hover:-translate-y-1 overflow-hidden flex flex-col`}>
            <div className="relative w-full h-48 bg-muted">
              <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
              <Badge variant={c.variant} className="absolute top-3 right-3 text-xs px-2.5 py-0.5 shadow-sm">{item.category}</Badge>
            </div>
            <CardContent className="p-5 flex-1 flex flex-col">
              <div className="flex items-center gap-1.5 mb-3"><span className="material-symbols-outlined text-sm text-muted-foreground">calendar_today</span><span className="text-xs text-muted-foreground">{item.date}</span></div>
            <h3 className="text-sm font-semibold mb-1.5 line-clamp-2">{item.title}</h3>
            <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{item.excerpt}</p>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-0.5"><span className="material-symbols-outlined text-sm">group</span>{item.target}</span>
                {item.hasAttachment && <span className="flex items-center gap-0.5 text-destructive"><span className="material-symbols-outlined text-sm">attach_file</span>PDF</span>}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground flex items-center gap-0.5"><span className="material-symbols-outlined text-sm">visibility</span>{item.views.toLocaleString()}</span>
                <Button variant="link" size="sm" className="text-primary h-auto p-0 text-xs" onClick={() => toast.info(`อ่าน: ${item.title}\n\n${item.excerpt}\n\nวันที่: ${item.date}\nหมวดหมู่: ${item.category}\nกลุ่มเป้าหมาย: ${item.target}\nผู้เข้าชม: ${item.views.toLocaleString()} ครั้ง\n\nอ่านฉบับเต็มได้ที่หน้านี้`)}>อ่านต่อ</Button>
              </div>
            </div>
            </CardContent>
          </Card>
        );})}</div>
      </PageShell>
    </>
  );
}
