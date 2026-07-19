"use client";

import { cpdData } from "@/data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Footer from "@/components/layout/Footer";
import Link from "next/link";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";

export default function CPDPage() {
  const percentage = (cpdData.currentCredits / cpdData.targetCredits) * 100;
  
  return (
    <>
      <div className="p-4 md:p-6 pb-16 max-w-[1280px] mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl md:text-2xl font-bold mb-1 tracking-tight text-primary">ระบบสะสมหน่วยกิตการศึกษาต่อเนื่อง (CPD)</h1>
            <p className="text-sm text-muted-foreground">ติดตามสถานะและประวัติการสะสมหน่วยกิตของคุณ</p>
          </div>
          <Button size="sm" className="h-9 gap-1.5 shadow-sm">
            <span className="material-symbols-outlined text-base">sync</span>
            ซิงค์ข้อมูลกับ ศธภ.
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column: Radial Progress & Overview */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="card-shadow border-t-4 border-t-primary overflow-hidden relative">
              {/* Background Decoration */}
              <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                <span className="material-symbols-outlined text-9xl">stars</span>
              </div>
              <CardContent className="p-6 flex flex-col items-center justify-center text-center relative z-10">
                <Badge variant={cpdData.status === 'active' ? 'default' : 'destructive'} className="mb-6 px-3 py-1 shadow-sm">
                  {cpdData.status === 'active' ? 'สถานะปกติ' : 'ใกล้หมดอายุ'}
                </Badge>
                
                {/* Radial Custom CSS Gauge */}
                <div className="relative w-48 h-48 mb-6 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" className="text-muted/20" strokeWidth="10" />
                    <circle 
                      cx="50" cy="50" r="45" fill="none" stroke="currentColor" 
                      className="text-primary transition-all duration-1000 ease-out" 
                      strokeWidth="10" 
                      strokeLinecap="round"
                      strokeDasharray={`${(percentage * 283) / 100} 283`}
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center justify-center">
                    <span className="text-4xl font-bold tracking-tighter text-foreground">{cpdData.currentCredits}</span>
                    <span className="text-sm text-muted-foreground font-medium">/ {cpdData.targetCredits} CPD</span>
                  </div>
                </div>

                <div className="w-full bg-muted/30 p-4 rounded-lg border border-border/50 text-left">
                  <div className="flex justify-between items-center mb-2 border-b border-border/50 pb-2">
                    <span className="text-xs text-muted-foreground">วันหมดอายุใบประกอบฯ</span>
                    <span className="text-sm font-semibold text-foreground">{cpdData.expiryDate}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">ระยะเวลาที่เหลือ</span>
                    <span className="text-sm font-semibold text-amber-600 dark:text-amber-500">{cpdData.timeLeft}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Breakdown Chart */}
            <Card className="card-shadow">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-xl">pie_chart</span>
                  แหล่งที่มาของหน่วยกิต
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 mt-2">
                  {cpdData.breakdown.map((item, index) => (
                    <div key={index}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="font-medium text-muted-foreground">{item.category}</span>
                        <span className="font-bold">{item.value} <span className="font-normal text-muted-foreground">CPD</span></span>
                      </div>
                      <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full rounded-full transition-all duration-1000" 
                          style={{ width: `${(item.value / cpdData.currentCredits) * 100}%`, backgroundColor: item.fill }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: History & Recommended */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* History Timeline */}
            <Card className="card-shadow">
              <CardHeader className="pb-4 border-b">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-base flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-xl">history</span>
                    ประวัติการได้รับหน่วยกิตล่าสุด
                  </CardTitle>
                  <Button variant="outline" size="sm" className="h-8 text-xs gap-1">
                    <span className="material-symbols-outlined text-sm">download</span> โหลดรายงาน (PDF)
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">
                  {cpdData.history.map((item, index) => (
                    <div key={item.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                      {/* Timeline Dot */}
                      <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-card bg-primary text-primary-foreground shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                        <span className="material-symbols-outlined text-lg">
                          {item.category === 'ประชุมวิชาการ' ? 'groups' : item.category === 'e-Learning' ? 'computer' : 'edit_document'}
                        </span>
                      </div>
                      
                      {/* Content Card */}
                      <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-lg border bg-card/50 shadow-sm transition-colors hover:border-primary/40 hover:bg-muted/10">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                          <Badge variant="outline" className="w-fit text-[10px] uppercase tracking-wider">{item.category}</Badge>
                          <span className="text-xs text-muted-foreground font-mono bg-muted/50 px-2 py-0.5 rounded">{item.date}</span>
                        </div>
                        <h4 className="text-sm font-semibold text-foreground line-clamp-2">{item.title}</h4>
                        <div className="mt-3 flex items-center justify-between">
                          <div className="flex items-center gap-1.5 text-primary font-medium">
                            <span className="material-symbols-outlined text-base">add_circle</span>
                            <span className="text-sm">{item.credits} CPD</span>
                          </div>
                          <Button variant="outline" size="sm" className="h-7 text-[10px] gap-1 bg-background" onClick={(e) => { e.stopPropagation(); toast.success('ดาวน์โหลด e-Certificate เรียบร้อยแล้ว'); }}>
                            <span className="material-symbols-outlined text-[14px] text-amber-500">workspace_premium</span>
                            e-Certificate
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recommended Activities */}
            <div className="space-y-4">
              <h3 className="text-base font-semibold flex items-center gap-2 px-1">
                <span className="material-symbols-outlined text-amber-500">lightbulb</span>
                แนะนำกิจกรรมเก็บหน่วยกิต (คุณขาดอีก {cpdData.targetCredits - cpdData.currentCredits} CPD)
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {cpdData.recommended.map((item) => (
                  <Dialog key={item.id}>
                    <DialogTrigger asChild>
                      <Card className="group overflow-hidden border-muted-foreground/20 hover:border-primary/50 transition-all duration-300 ease-out active:scale-[0.97] cursor-pointer text-left">
                        <CardContent className="p-0">
                          <div className="p-4 bg-gradient-to-br from-card to-muted/30">
                            <div className="flex justify-between items-start mb-3">
                              <Badge className="bg-primary/10 text-primary hover:bg-primary/20 border-0">{item.type}</Badge>
                              <Badge variant="secondary" className="font-bold">+{item.credits} CPD</Badge>
                            </div>
                            <h4 className="text-sm font-semibold mb-2 group-hover:text-primary transition-colors line-clamp-2 h-10">{item.title}</h4>
                            <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                              <span className="material-symbols-outlined text-sm">calendar_today</span>
                              {item.date}
                            </p>
                          </div>
                          <div className="px-4 py-3 bg-muted/50 border-t flex justify-between items-center group-hover:bg-primary/5 transition-colors">
                            <span className="text-xs font-medium text-muted-foreground group-hover:text-primary transition-colors">ดูรายละเอียด</span>
                            <span className="material-symbols-outlined text-sm text-muted-foreground group-hover:text-primary transition-all group-hover:translate-x-1">arrow_forward</span>
                          </div>
                        </CardContent>
                      </Card>
                    </DialogTrigger>
                    
                    <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden border-none shadow-2xl rounded-lg data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 duration-300">
                      {/* Image Banner */}
                      <div className="w-full h-48 md:h-56 relative bg-muted/50">
                        <img src={item.image || "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&q=80"} alt={item.title} className="w-full h-full object-cover transition-opacity duration-500" loading="lazy" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                        <div className="absolute bottom-4 left-5 flex gap-2">
                          <Badge className="bg-primary text-primary-foreground border-0 shadow-md">{item.type}</Badge>
                          <Badge variant="secondary" className="bg-white text-black font-bold shadow-md hover:bg-gray-100">+{item.credits} CPD</Badge>
                        </div>
                      </div>
                      
                      <div className="p-6">
                        <DialogHeader className="text-left">
                          <DialogTitle className="text-xl font-bold leading-snug pr-6">{item.title}</DialogTitle>
                          <DialogDescription className="flex items-center gap-1.5 text-muted-foreground mt-2 font-medium">
                            <span className="material-symbols-outlined text-[16px]">calendar_today</span>
                            {item.date}
                          </DialogDescription>
                        </DialogHeader>
                        
                        <div className="mt-5 pt-5 border-t border-border/50">
                          <h4 className="text-sm font-semibold mb-2 flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-[18px] text-primary">info</span>
                            รายละเอียดกิจกรรม
                          </h4>
                          <p className="text-sm text-foreground/80 leading-relaxed bg-muted/30 p-4 rounded-lg border border-border/50">
                            {item.description || "ไม่มีรายละเอียดเพิ่มเติม"}
                          </p>
                        </div>
                        
                        <DialogFooter className="mt-6 flex gap-3 sm:justify-between w-full">
                          <Button variant="outline" className="w-full sm:w-auto rounded-full" onClick={() => toast.success("บันทึกกิจกรรมลงในสิ่งที่น่าสนใจแล้ว")}>
                            <span className="material-symbols-outlined mr-2 text-[18px]">bookmark_add</span> บันทึกไว้
                          </Button>
                          <Button className="w-full sm:w-auto rounded-full" onClick={() => window.open(item.url, "_blank")}>
                            ไปที่หน้าลงทะเบียน <span className="material-symbols-outlined ml-2 text-[18px]">open_in_new</span>
                          </Button>
                        </DialogFooter>
                      </div>
                    </DialogContent>
                  </Dialog>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
