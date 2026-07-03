"use client";

import { toast } from "sonner";
import { useState } from "react";
import { requestsData } from "@/data";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import Footer from "@/components/layout/Footer";

const sb: Record<string, { variant: "default" | "secondary" | "destructive"; label: string; className?: string }> = {
  pending: { variant: "default", label: "รอดำเนินการ", className: "bg-amber-500 hover:bg-amber-600 text-white" }, approved: { variant: "default", label: "อนุมัติแล้ว" }, rejected: { variant: "destructive", label: "ถูกปฏิเสธ" },
};
const bc: Record<string, string> = { pending: "border-l-amber-500", approved: "border-l-chart-3", rejected: "border-l-destructive" };

const requestTypes = [
  { id: "จ.1", name: "คำร้องทั่วไป", active: true },
  { id: "ง.1", name: "การเงิน", active: true },
  { id: "อ.1", name: "เอกสารสำคัญ", active: true },
  { id: "จบ", name: "คำร้องขอจบการศึกษา", active: false },
];

export default function RequestsPage() {
  const [activeTab, setActiveTab] = useState("ทั้งหมด");
  const [showModal, setShowModal] = useState(false);
  const [step, setStep] = useState(1);
  const [selectedType, setSelectedType] = useState("");
  const [requestList, setRequestList] = useState(requestsData);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const tabs = [{ key: "ทั้งหมด", count: requestList.length },
    { key: "รอดำเนินการ", count: requestList.filter((r) => r.status === "pending").length },
    { key: "อนุมัติแล้ว", count: requestList.filter((r) => r.status === "approved").length },
    { key: "ถูกปฏิเสธ", count: requestList.filter((r) => r.status === "rejected").length }];

  const filtered = activeTab === "ทั้งหมด" ? requestList : requestList.filter((r) => {
    if (activeTab === "รอดำเนินการ") return r.status === "pending";
    if (activeTab === "อนุมัติแล้ว") return r.status === "approved";
    if (activeTab === "ถูกปฏิเสธ") return r.status === "rejected";
    return true;
  });

  const openModal = () => { setShowModal(true); setStep(1); setSelectedType(""); };
  const closeModal = () => { setShowModal(false); setStep(1); };

  const handleNext = () => {
    if (step === 1 && !selectedType) { toast.info("กรุณาเลือกประเภทคำร้องก่อน"); return; }
    if (step === 3) {
      const newId = `${selectedType}-${Date.now().toString().slice(-6)}`;
      const typeName = requestTypes.find((t) => t.id === selectedType)?.name || selectedType;
      toast.info(`ยื่นคำร้องสำเร็จ!\n\nหมายเลขคำร้อง: ${newId}\nประเภท: ${typeName}\nวันที่: ${new Date().toLocaleDateString("th-TH")}\n\nติดตามสถานะได้ที่หน้าคำร้อง`);
      setRequestList((prev) => [{ id: newId, type: typeName, title: `คำร้อง ${typeName}`, date: new Date().toLocaleDateString("th-TH"), status: "pending", progress: ["เจ้าหน้าที่ ◷", "หัวหน้าสาขา", "เสร็จสิ้น"] }, ...prev]);
      closeModal();
      return;
    }
    setStep((s) => s + 1);
  };

  return (
    <>
      <div className="p-4 md:p-6 pb-16 max-w-[1280px] mx-auto">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-5 gap-3">
          <div><h1 className="text-lg md:text-xl font-semibold mb-1">คำร้องของฉัน</h1><p className="text-xs text-muted-foreground">ติดตามสถานะคำร้องและการยื่นคำร้องใหม่</p></div>
          <Button onClick={openModal} size="sm" className="h-8 text-xs gap-1.5"><span className="material-symbols-outlined text-base">add</span>ยื่นคำร้องใหม่</Button>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">{tabs.map((tab) => (
          <Badge key={tab.key} variant={activeTab === tab.key ? "default" : "outline"} className="cursor-pointer text-xs px-3 py-1.5" onClick={() => setActiveTab(tab.key)}>{tab.key} ({tab.count})</Badge>
        ))}</div>

        <div className="space-y-3">{filtered.map((req) => { const s = sb[req.status]; return (
          <Card key={req.id} className={`card-shadow border-l-4 ${bc[req.status]} cursor-pointer hover:bg-muted/50 transition-colors`} onClick={() => { setSelectedRequest(req); setShowDetailModal(true); }}><CardContent className="p-4">
            <div className="flex items-start justify-between mb-2"><div><div className="flex items-center gap-2 mb-0.5"><span className="text-xs text-muted-foreground font-mono">{req.id}</span><Badge variant={s.variant} className={`text-xs opacity-90 px-1.5 py-0 ${s.className || ""}`}>{s.label}</Badge></div><h3 className="text-sm font-semibold">{req.title}</h3><p className="text-xs text-muted-foreground mt-0.5">{req.type} · {req.date}</p></div></div>
            <div className="flex items-center gap-1">{req.progress.map((step, i) => (<div key={i} className="flex items-center gap-1"><Badge variant="outline" className="text-xs opacity-90 px-1.5 py-0">{step}</Badge>{i < req.progress.length - 1 && <span className="text-muted-foreground text-xs opacity-90 mx-0.5">→</span>}</div>))}</div>
          </CardContent></Card>
        );})}</div>

        {/* Dialog */}
        <Dialog open={showModal} onOpenChange={setShowModal}>
          <DialogContent className="max-w-md">
            <DialogHeader><DialogTitle className="text-base">ยื่นคำร้องใหม่</DialogTitle></DialogHeader>

            {/* Stepper */}
            <div className="flex items-center gap-2 mb-4 text-xs">
              {[1, 2, 3].map((n) => (
                <span key={n} className="flex items-center gap-2">
                  <Badge className={`w-7 h-7 rounded-full flex items-center justify-center text-xs ${step >= n ? "" : ""}`} variant={step >= n ? "default" : "outline"}>{n}</Badge>
                  <span className={step >= n ? "text-primary font-medium" : "text-muted-foreground"}>
                    {n === 1 ? "เลือกประเภท" : n === 2 ? "กรอกข้อมูล" : "ยืนยัน"}
                  </span>
                  {n < 3 && <span className="text-muted-foreground">—</span>}
                </span>
              ))}
            </div>

            {/* Step 1 */}
            {step === 1 && (
              <div className="space-y-2 mb-4">
                {requestTypes.map((type) => (
                  <Button key={type.id} variant={selectedType === type.id ? "default" : "outline"} disabled={!type.active}
                    className="w-full justify-start gap-2 h-auto py-3 text-xs"
                    onClick={() => setSelectedType(type.id)}>
                    <span className="material-symbols-outlined text-lg">description</span>
                    <div className="text-left"><p className="text-xs font-medium">{type.name}</p><p className="text-xs opacity-70">{type.id}</p></div>
                  </Button>
                ))}
              </div>
            )}

            {/* Step 2 */}
            {step === 2 && (
              <div className="text-center py-8 text-muted-foreground text-xs">
                <span className="material-symbols-outlined text-3xl mb-2 block">edit_note</span>
                <p>กรุณากรอกรายละเอียดคำร้อง</p>
                <p className="text-xs mt-1">ประเภท: {requestTypes.find((t) => t.id === selectedType)?.name}</p>
              </div>
            )}

            {/* Step 3 */}
            {step === 3 && (
              <div className="text-center py-8 text-xs">
                <span className="material-symbols-outlined text-3xl mb-2 block text-primary">check_circle</span>
                <p className="font-medium">ยืนยันการยื่นคำร้อง</p>
                <p className="text-xs text-muted-foreground mt-1">ประเภท: {requestTypes.find((t) => t.id === selectedType)?.name}</p>
                <p className="text-xs text-muted-foreground">เมื่อยืนยันแล้วจะไม่สามารถยกเลิกได้</p>
              </div>
            )}

            <DialogFooter>
              <Button variant="outline" size="sm" className="h-8 text-xs" onClick={closeModal}>
                {step === 1 ? "ยกเลิก" : "ยกเลิก"}
              </Button>
              {step > 1 && (
                <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => setStep((s) => s - 1)}>
                  ย้อนกลับ
                </Button>
              )}
              <Button size="sm" className="h-8 text-xs" onClick={handleNext}>
                {step === 3 ? "ยืนยัน" : "ถัดไป"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Request Details Dialog */}
        <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
          <DialogContent className="max-w-md">
            <DialogHeader><DialogTitle className="text-base flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">description</span>
              รายละเอียดคำร้อง
            </DialogTitle></DialogHeader>
            {selectedRequest && (
              <div className="space-y-4 text-sm mt-2">
                <div className="flex justify-between items-start border-b pb-3">
                  <div>
                    <h3 className="font-semibold text-lg">{selectedRequest.title}</h3>
                    <p className="text-xs text-muted-foreground mt-1">เลขที่: <span className="font-mono">{selectedRequest.id}</span></p>
                  </div>
                  <Badge variant={sb[selectedRequest.status].variant} className={sb[selectedRequest.status].className || ""}>{sb[selectedRequest.status].label}</Badge>
                </div>
                
                <div className="grid grid-cols-2 gap-4 bg-muted/30 p-3 rounded-lg">
                  <div>
                    <span className="text-xs text-muted-foreground block mb-1">ประเภท</span>
                    <span className="font-medium">{selectedRequest.type}</span>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground block mb-1">วันที่ยื่น</span>
                    <span className="font-medium">{selectedRequest.date}</span>
                  </div>
                </div>

                <div>
                  <span className="text-xs text-muted-foreground block mb-2">รายละเอียดเพิ่มเติม</span>
                  <div className="bg-card border p-3 rounded-md text-muted-foreground text-xs leading-relaxed">
                    {selectedRequest.type === 'คำร้องทั่วไป' && 'ต้องการขอแก้ไขข้อมูลที่อยู่ในระบบให้ตรงกับบัตรประชาชนปัจจุบันเพื่อใช้ในการออกเอกสารสำคัญ'}
                    {selectedRequest.type === 'การเงิน' && 'มีความประสงค์ขอผ่อนผันการชำระค่าลงทะเบียนเรียนประจำภาคการศึกษาเนื่องจากเหตุผลทางครอบครัว โดยจะชำระภายในวันที่ 15 ของเดือนถัดไป'}
                    {selectedRequest.type === 'เอกสารสำคัญ' && 'ขอหนังสือรับรองการเป็นผู้เข้าศึกษาเพื่อนำไปใช้ประกอบการขอวีซ่าเดินทางไปต่างประเทศ จำนวน 2 ฉบับ (ภาษาอังกฤษ)'}
                    {!['คำร้องทั่วไป', 'การเงิน', 'เอกสารสำคัญ'].includes(selectedRequest.type) && 'ไม่มีรายละเอียดเพิ่มเติมระบุไว้ในคำร้องนี้'}
                  </div>
                </div>

                <div>
                  <span className="text-xs text-muted-foreground block mb-2">ความคืบหน้า</span>
                  <div className="space-y-3 pl-2 border-l-2 border-border ml-2">
                    {selectedRequest.progress.map((step: string, i: number) => (
                      <div key={i} className="relative pl-4">
                        <span className={`absolute -left-[21px] top-1 w-3 h-3 rounded-full ring-4 ring-card ${i < selectedRequest.progress.length - (selectedRequest.status === 'pending' ? 1 : 0) ? 'bg-primary' : 'bg-muted-foreground/30'}`} />
                        <p className={`text-xs ${i < selectedRequest.progress.length - (selectedRequest.status === 'pending' ? 1 : 0) ? 'font-medium' : 'text-muted-foreground'}`}>{step.replace(' ◷', '')} {step.includes('◷') && <span className="text-[10px] text-amber-500 font-normal ml-1">(กำลังดำเนินการ)</span>}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" size="sm" onClick={() => setShowDetailModal(false)}>ปิดหน้าต่าง</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      <Footer />
    </>
  );
}
