"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Footer from "@/roles/shared/components/layout/Footer";
import { PageShell } from "@/roles/shared/components/layout/PageShell";

const scheduleData = [
  { day: "เสาร์ (สัปดาห์ที่ 1)", type: "lec", subject: "Adv. Pharmacotherapeutics I", room: "Online (Zoom)", start: 9, duration: 3 },
  { day: "เสาร์ (สัปดาห์ที่ 1)", type: "lec", subject: "Evidence-Based Medicine", room: "Online (Zoom)", start: 13, duration: 3 },
  
  { day: "อาทิตย์ (สัปดาห์ที่ 1)", type: "lec", subject: "Clinical Pharmacokinetics", room: "Online (Zoom)", start: 9, duration: 3 },
  { day: "อาทิตย์ (สัปดาห์ที่ 1)", type: "lec", subject: "Research Methodology", room: "Online (Zoom)", start: 13, duration: 3 },
  
  { day: "เสาร์ (สัปดาห์ที่ 3)", type: "lab", subject: "Case Discussion: Internal Med.", room: "ห้องประชุมวิทยาลัย", start: 9, duration: 3 },
  { day: "เสาร์ (สัปดาห์ที่ 3)", type: "lab", subject: "Workshop: Pharmacotherapy Plan", room: "ห้องประชุมวิทยาลัย", start: 13, duration: 4 },
  
  { day: "อาทิตย์ (สัปดาห์ที่ 3)", type: "lab", subject: "Bedside Teaching", room: "ศูนย์จำลองสถานการณ์", start: 9, duration: 4 },
  { day: "อาทิตย์ (สัปดาห์ที่ 3)", type: "lec", subject: "Seminar & Presentation", room: "ห้องประชุมวิทยาลัย", start: 14, duration: 3 },
];

const dayRowMap: Record<string, number> = {
  "เสาร์ (สัปดาห์ที่ 1)": 2,
  "อาทิตย์ (สัปดาห์ที่ 1)": 3,
  "เสาร์ (สัปดาห์ที่ 3)": 4,
  "อาทิตย์ (สัปดาห์ที่ 3)": 5,
};

const times = ["8:00-9:00", "9:00-10:00", "10:00-11:00", "11:00-12:00", "12:00-13:00", "13:00-14:00", "14:00-15:00", "15:00-16:00", "16:00-17:00"];

export default function SchedulePage() {
  return (
    <>
      <PageShell bottom="roomy">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-5 gap-3">
          <div>
            <h1 className="text-lg md:text-xl font-semibold mb-1">ตารางกิจกรรมการฝึกอบรม</h1>
            <p className="text-xs text-muted-foreground">หลักสูตรวุฒิบัตรฯ สาขาเภสัชบำบัด (BCP) · ภาคทฤษฎีและปฏิบัติการ (สัปดาห์ที่ 1 และ 3 ของเดือน)</p>
          </div>
          <div className="flex gap-2">
            <Badge variant="info" className="text-xs px-2 py-1">ทฤษฎี (Lecture)</Badge>
            <Badge variant="success" className="text-xs px-2 py-1">ปฏิบัติการ (Lab)</Badge>
          </div>
        </div>

        <Card className="card-shadow overflow-hidden">
          <CardContent className="p-0">
            <div className="overflow-x-auto custom-scrollbar pb-2">
              <div className="grid min-w-[1100px] grid-cols-[80px_repeat(9,minmax(110px,1fr))] border-b border-border text-xs">
                {/* Header Row */}
                <div className="col-start-1 row-start-1 border-b border-r border-border bg-muted/40 py-4 text-center font-semibold">วัน/เวลา</div>
                {times.map((time, i) => (
                  <div key={i} className="font-semibold text-center py-4 border-b border-r border-border bg-muted/40" style={{ gridRow: 1, gridColumn: i + 2 }}>
                    {time}
                  </div>
                ))}

                {/* Day Labels */}
                {Object.keys(dayRowMap).map((day, i) => (
                  <div key={day} className="font-medium text-center flex items-center justify-center border-b border-r border-border bg-muted/10 py-6" style={{ gridRow: i + 2, gridColumn: 1 }}>
                    {day}
                  </div>
                ))}

                {/* Empty Grid Cells for Borders */}
                {Array.from({ length: 4 }).map((_, r) => (
                  Array.from({ length: 9 }).map((_, c) => (
                    <div key={`empty-${r}-${c}`} className="border-b border-r border-border/50" style={{ gridRow: r + 2, gridColumn: c + 2 }}></div>
                  ))
                ))}

                {/* Lunch Break */}
                <div className="col-start-6 row-[2/7] flex items-center justify-center overflow-hidden border-b border-r border-border/50 bg-muted/30 text-muted-foreground">
                  <span className="rotate-90 whitespace-nowrap font-medium tracking-widest text-caption">พักรับประทานอาหารกลางวัน</span>
                </div>

                {/* Event Cells */}
                {scheduleData.map((evt, i) => (
                  <div 
                    key={i} 
                    className={`m-1 p-2 rounded-md border flex flex-col items-center justify-center text-center shadow-sm transition-transform hover:scale-[1.02] cursor-pointer overflow-hidden
                      ${evt.type === 'lab'
                        ? 'bg-success-soft border-success-border text-success-on-soft'
                        : 'bg-info-soft border-info-border text-info-on-soft'}`}
                    style={{ gridRow: dayRowMap[evt.day], gridColumn: `${(evt.start - 8) + 2} / span ${evt.duration}` }}
                  >
                    <span className={`font-semibold line-clamp-2 leading-tight break-words w-full ${evt.subject.length > 15 && evt.duration === 1 ? 'text-micro' : ''}`}>{evt.subject}</span>
                    <span className="text-micro opacity-75 mt-1 font-mono">({evt.room})</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </PageShell>
      <Footer />
    </>
  );
}
