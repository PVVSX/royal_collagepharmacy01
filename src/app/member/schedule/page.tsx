"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageShell } from "@/roles/shared/components/layout/PageShell";
import { cn } from "@/lib/utils";

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

const gridRowStartClass: Record<number, string> = {
  1: "row-start-1",
  2: "row-start-2",
  3: "row-start-3",
  4: "row-start-4",
  5: "row-start-5",
};

const gridColumnStartClass: Record<number, string> = {
  1: "col-start-1",
  2: "col-start-2",
  3: "col-start-3",
  4: "col-start-4",
  5: "col-start-5",
  6: "col-start-6",
  7: "col-start-7",
  8: "col-start-8",
  9: "col-start-9",
  10: "col-start-10",
};

const gridColumnSpanClass: Record<number, string> = {
  1: "col-span-1",
  2: "col-span-2",
  3: "col-span-3",
  4: "col-span-4",
};

export default function SchedulePage() {
  return (
    <>
      <PageShell bottom="roomy">
        <div className="mb-5 flex justify-end gap-3">
          <div className="flex gap-2">
            <Badge variant="info" className="text-xs px-2 py-1">ทฤษฎี (Lecture)</Badge>
            <Badge variant="success" className="text-xs px-2 py-1">ปฏิบัติการ (Lab)</Badge>
          </div>
        </div>

        <Card className="overflow-hidden">
          <CardContent className="p-0">
            <div className="overflow-x-auto custom-scrollbar pb-2">
              <div className="grid min-w-[1100px] grid-cols-[80px_repeat(9,minmax(110px,1fr))] border-b border-border text-xs">
                {/* Header Row */}
                <div className="col-start-1 row-start-1 border-b border-r border-border bg-muted/40 py-4 text-center font-semibold">วัน/เวลา</div>
                {times.map((time, i) => (
                  <div
                    key={i}
                    className={cn(
                      "border-b border-r border-border bg-muted/40 py-4 text-center font-semibold",
                      gridRowStartClass[1],
                      gridColumnStartClass[i + 2]
                    )}
                  >
                    {time}
                  </div>
                ))}

                {/* Day Labels */}
                {Object.keys(dayRowMap).map((day, i) => (
                  <div
                    key={day}
                    className={cn(
                      "flex items-center justify-center border-b border-r border-border bg-muted/10 py-6 text-center font-medium",
                      gridRowStartClass[i + 2],
                      gridColumnStartClass[1]
                    )}
                  >
                    {day}
                  </div>
                ))}

                {/* Empty Grid Cells for Borders */}
                {Array.from({ length: 4 }).map((_, r) => (
                  Array.from({ length: 9 }).map((_, c) => (
                    <div
                      key={`empty-${r}-${c}`}
                      className={cn(
                        "border-b border-r border-border/50",
                        gridRowStartClass[r + 2],
                        gridColumnStartClass[c + 2]
                      )}
                    />
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
                    className={cn(
                      "m-1 flex cursor-pointer flex-col items-center justify-center overflow-hidden rounded-md border p-2 text-center shadow-sm transition-transform hover:scale-[1.02]",
                      gridRowStartClass[dayRowMap[evt.day]],
                      gridColumnStartClass[evt.start - 6],
                      gridColumnSpanClass[evt.duration],
                      evt.type === "lab"
                        ? "border-success-border bg-success-soft text-success-on-soft"
                        : "border-info-border bg-info-soft text-info-on-soft"
                    )}
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
    </>
  );
}
