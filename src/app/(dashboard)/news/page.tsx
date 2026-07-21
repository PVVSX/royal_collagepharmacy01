"use client";
import { toast } from "sonner";
import { useState } from "react";
import { newsData } from "@/data";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Footer from "@/components/layout/Footer";

const cm: Record<string, { border: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  red: { border: "border-l-destructive", variant: "destructive" }, purple: { border: "border-l-chart-3", variant: "default" },
  gold: { border: "border-l-secondary", variant: "secondary" }, green: { border: "border-l-chart-3", variant: "default" },
};

export default function NewsPage() {
  const [activeFilter, setActiveFilter] = useState("ทั้งหมด");
  const filters = ["ทั้งหมด", "ประกาศสำคัญ", "วิชาการ", "การเงิน", "กิจกรรม"];
  const filtered = activeFilter === "ทั้งหมด" ? newsData : newsData.filter((n) => n.category === activeFilter);

  return (
    <>
      <div className="p-4 md:p-6 pb-16 max-w-[1280px] mx-auto">
        <div className="relative w-full h-[200px] md:h-[280px] rounded-lg overflow-hidden mb-8 shadow-sm">
          <img src="/images/assets/news/header page.png" alt="News Banner" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex flex-col justify-end p-6 md:p-10">
            <h1 className="text-2xl md:text-3xl font-bold mb-2 text-white drop-shadow-md">ข่าวสารและประกาศ</h1>
            <p className="text-sm md:text-base text-gray-200 drop-shadow-sm">ติดตามข่าวสาร ประกาศ และกิจกรรมของวิทยาลัย</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 mb-5">{filters.map((f) => (
          <Badge key={f} variant={activeFilter === f ? "default" : "outline"} className="cursor-pointer text-xs px-3 py-1.5" onClick={() => setActiveFilter(f)}>{f}</Badge>
        ))}</div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">{filtered.map((item) => { const c = cm[item.categoryColor]; return (
          <Card key={item.id} className={`card-shadow border-t-4 border-l-0 ${c.border.replace('border-l', 'border-t')} hover:border-primary/40 transition-colors overflow-hidden flex flex-col`}>
            <div className="relative w-full h-48 bg-muted">
              <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
              <Badge variant={c.variant} className="absolute top-3 right-3 text-xs px-2.5 py-0.5 shadow-sm">{item.category}</Badge>
            </div>
            <CardContent className="p-5 flex-1 flex flex-col">
              <div className="flex items-center gap-1.5 mb-3"><span className="material-symbols-outlined text-[14px] text-muted-foreground">calendar_today</span><span className="text-xs text-muted-foreground">{item.date}</span></div>
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
      </div>
      <Footer />
    </>
  );
}
