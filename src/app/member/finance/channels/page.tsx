"use client";

import { useRef, useState } from "react";
import { financeData } from "@/roles/shared/data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function PaymentChannelsPage() {
  const d = financeData;
  const fileRef = useRef<HTMLInputElement>(null);
  const [refNo, setRefNo] = useState("");
  const [amount, setAmount] = useState("");
  const [fileName, setFileName] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!refNo || !amount) {
      alert("กรุณากรอกข้อมูลให้ครบถ้วน\n\n- เลขที่อ้างอิง\n- จำนวนเงิน");
      return;
    }
    alert(`ส่งหลักฐานเรียบร้อย!\n\nเลขที่อ้างอิง: ${refNo}\nจำนวน: ${Number(amount).toLocaleString()} บาท\n${fileName ? `ไฟล์: ${fileName}` : "ไม่มีไฟล์แนบ"}\n\nเจ้าหน้าที่จะตรวจสอบภายใน 1-2 วันทำการ`);
    setRefNo("");
    setAmount("");
    setFileName("");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <header className="text-center mb-6">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3"><span className="material-symbols-outlined text-primary text-2xl">account_balance</span></div>
          <h1 className="text-lg font-semibold mb-1">ช่องทางการชำระเงิน</h1>
          <p className="text-xs text-muted-foreground">ชำระค่าเทอมและค่าธรรมเนียมการศึกษา</p>
        </header>

        <Card className="card-shadow mb-4"><CardHeader className="pb-2 pt-4 px-5"><CardTitle className="text-sm flex items-center gap-2"><span className="material-symbols-outlined text-primary text-lg">account_balance</span>โอนเงินผ่านธนาคาร</CardTitle></CardHeader>
          <CardContent className="space-y-3 px-5 pb-5">{d.bankAccounts.map((acc) => (
            <div key={acc.accountNumber} className="bg-muted rounded-lg p-3 border"><div className="flex items-center justify-between mb-1"><span className="text-xs font-semibold">{acc.bank}</span><span className="text-xs opacity-90 text-muted-foreground">{acc.branch}</span></div><p className="text-base font-mono font-medium mb-0.5">{acc.accountNumber}</p><p className="text-xs text-muted-foreground">ชื่อบัญชี: {acc.accountName}</p><span className="text-xs opacity-90 text-muted-foreground">{acc.bankEn} · ออมทรัพย์</span></div>
          ))}</CardContent></Card>

        <Card className="card-shadow mb-4"><CardHeader className="pb-2 pt-4 px-5"><CardTitle className="text-sm flex items-center gap-2"><span className="material-symbols-outlined text-primary text-lg">qr_code_scanner</span>พร้อมเพย์ (PromptPay)</CardTitle></CardHeader>
          <CardContent className="flex flex-col items-center pb-5"><div className="w-36 h-36 bg-muted rounded-lg flex items-center justify-center mb-2"><span className="material-symbols-outlined text-muted-foreground text-5xl">qr_code</span></div><p className="text-xs text-muted-foreground">สแกน QR Code เพื่อชำระเงิน</p></CardContent></Card>

        <Card className="card-shadow"><CardHeader className="pb-2 pt-4 px-5"><CardTitle className="text-sm">อัปโหลดหลักฐานการชำระเงิน</CardTitle></CardHeader>
          <CardContent className="px-5 pb-5"><form className="space-y-3" onSubmit={handleSubmit}>
            <div className="space-y-1"><label className="text-xs font-medium text-muted-foreground">เลขที่อ้างอิง</label><Input placeholder="Ref. No." className="h-8 text-xs" value={refNo} onChange={(e) => setRefNo(e.target.value)} /></div>
            <div className="space-y-1"><label className="text-xs font-medium text-muted-foreground">จำนวนเงิน (บาท)</label><Input type="number" placeholder="0.00" className="h-8 text-xs" value={amount} onChange={(e) => setAmount(e.target.value)} /></div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">อัปโหลดสลิป</label>
              <input type="file" ref={fileRef} className="hidden" accept="image/*,.pdf" onChange={(e) => setFileName(e.target.files?.[0]?.name || "")} />
              <div className="border-2 border-dashed border-border rounded-lg p-5 text-center hover:border-primary transition-colors cursor-pointer" onClick={() => fileRef.current?.click()}>
                {fileName ? (
                  <div><span className="material-symbols-outlined text-primary text-3xl mb-1">check_circle</span><p className="text-xs font-medium text-primary">{fileName}</p><p className="text-xs text-muted-foreground mt-0.5">คลิกเพื่อเปลี่ยนไฟล์</p></div>
                ) : (
                  <div><span className="material-symbols-outlined text-muted-foreground text-3xl mb-1">upload_file</span><p className="text-xs text-muted-foreground">ลากไฟล์มาวางที่นี่ หรือคลิกเพื่อเลือกไฟล์</p><p className="text-xs text-muted-foreground mt-0.5">PNG, JPG หรือ PDF สูงสุด 10MB</p></div>
                )}
              </div>
            </div>
            <Button type="submit" className="w-full h-9 text-sm font-semibold">ส่งหลักฐาน</Button>
          </form></CardContent></Card>
      </div>
    </div>
  );
}
