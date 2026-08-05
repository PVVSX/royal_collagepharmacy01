"use client";

import { useRef, useState } from "react";
import { financeData } from "@/roles/shared/data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type PaymentItem = {
  id: number;
  description: string;
  amount: number;
  dueDate: string;
};

type PaymentDialogProps = {
  item: PaymentItem;
  onOpenChange: (open: boolean) => void;
  onSubmitted: (itemId: number) => void;
};

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ACCEPTED_FILE_TYPES = ["image/jpeg", "image/png", "application/pdf"];
const BANK_BACKGROUND_CLASS: Record<string, string> = {
  SCB: "bg-bank-scb",
  KTB: "bg-bank-ktb",
};

export default function PaymentDialog({ item, onOpenChange, onSubmitted }: PaymentDialogProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [referenceNo, setReferenceNo] = useState(`INV-2569-${String(item.id).padStart(3, "0")}`);
  const [amount, setAmount] = useState(String(item.amount));
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [copiedAccount, setCopiedAccount] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleFile = (selectedFile?: File) => {
    setError("");
    if (!selectedFile) {
      setFile(null);
      return;
    }
    if (!ACCEPTED_FILE_TYPES.includes(selectedFile.type)) {
      setFile(null);
      setError("รองรับเฉพาะไฟล์ JPG, PNG หรือ PDF");
      return;
    }
    if (selectedFile.size > MAX_FILE_SIZE) {
      setFile(null);
      setError("ไฟล์ต้องมีขนาดไม่เกิน 5MB");
      return;
    }
    setFile(selectedFile);
  };

  const copyAccount = async (accountNumber: string) => {
    try {
      await navigator.clipboard.writeText(accountNumber);
      setCopiedAccount(accountNumber);
      window.setTimeout(() => setCopiedAccount(""), 1800);
    } catch {
      setError("ไม่สามารถคัดลอกเลขบัญชีได้ กรุณาคัดลอกด้วยตนเอง");
    }
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    if (!referenceNo.trim()) {
      setError("กรุณากรอกเลขที่เอกสารหรือ Reference No.");
      return;
    }
    if (!amount || Number(amount) <= 0) {
      setError("กรุณาระบุจำนวนเงินที่โอนให้ถูกต้อง");
      return;
    }
    if (!file) {
      setError("กรุณาแนบสลิปหรือหลักฐานการชำระเงิน");
      return;
    }
    onSubmitted(item.id);
    setSubmitted(true);
  };

  return (
    <Dialog open onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto p-0 sm:max-w-6xl">
        {submitted ? (
          <div className="flex min-h-[420px] flex-col items-center justify-center px-6 py-12 text-center">
            <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
              <span className="material-symbols-outlined text-4xl">check_circle</span>
            </div>
            <DialogTitle className="mb-2 text-xl">ส่งหลักฐานเรียบร้อยแล้ว</DialogTitle>
            <DialogDescription className="max-w-md text-sm leading-6">
              รายการ {item.description} ถูกเปลี่ยนเป็นสถานะรอดำเนินการ เจ้าหน้าที่จะตรวจสอบหลักฐานภายใน 1–2 วันทำการ
            </DialogDescription>
            <Button className="mt-6 min-w-32" onClick={() => onOpenChange(false)}>เสร็จสิ้น</Button>
          </div>
        ) : (
          <>
            <DialogHeader className="border-b border-border px-6 py-5 pr-16">
              <DialogTitle className="text-xl">ช่องทางการชำระเงิน</DialogTitle>
              <DialogDescription>
                {item.description} · ฿{item.amount.toLocaleString()} · กำหนดชำระ {item.dueDate}
              </DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-1 gap-6 px-6 pb-6 lg:grid-cols-12">
              <section className="space-y-5 lg:col-span-8">
                <div>
                  <h2 className="mb-3 border-b border-border pb-2 text-base font-semibold">โอนเงินผ่านธนาคาร</h2>
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    {financeData.bankAccounts.map((account, index) => (
                      <div key={`${account.accountNumber}-${index}`} className="rounded-xl border border-border bg-card p-4 shadow-sm">
                        <div className="mb-4 flex items-center gap-3">
                          <div
                            className={cn(
                              "flex h-11 w-11 items-center justify-center rounded-full text-bank-foreground",
                              BANK_BACKGROUND_CLASS[account.bankEn] ?? "bg-bank-ktb",
                            )}
                          >
                            <span className="material-symbols-outlined">account_balance</span>
                          </div>
                          <div>
                            <h3 className="text-sm font-semibold">{account.bank}</h3>
                            <p className="text-xs text-muted-foreground">{account.branch}</p>
                          </div>
                        </div>
                        <div className="space-y-3 text-xs">
                          <div className="flex items-start justify-between gap-3 border-b border-border pb-3">
                            <span className="text-muted-foreground">ชื่อบัญชี</span>
                            <span className="text-right font-medium">{account.accountName}</span>
                          </div>
                          <div className="flex items-center justify-between gap-3">
                            <span className="text-muted-foreground">เลขที่บัญชี</span>
                            <div className="flex items-center gap-1.5">
                              <span className="font-mono text-sm font-bold text-primary">{account.accountNumber}</span>
                              <Button type="button" variant="ghost" size="icon-sm" aria-label={`คัดลอกเลขบัญชี ${account.accountNumber}`} onClick={() => copyAccount(account.accountNumber)}>
                                <span className="material-symbols-outlined text-lg">{copiedAccount === account.accountNumber ? "check" : "content_copy"}</span>
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col items-center gap-5 rounded-xl border border-border bg-card p-5 shadow-sm sm:flex-row">
                  <div className="flex h-36 w-36 shrink-0 items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted">
                    <span className="material-symbols-outlined text-6xl text-muted-foreground">qr_code_2</span>
                  </div>
                  <div className="text-center sm:text-left">
                    <h2 className="mb-1 flex items-center justify-center gap-2 text-base font-semibold sm:justify-start">
                      <span className="material-symbols-outlined text-primary">qr_code_scanner</span>
                      พร้อมเพย์ (PromptPay)
                    </h2>
                    <p className="mb-3 text-xs text-muted-foreground">สแกนเพื่อชำระเงินผ่านแอปพลิเคชันธนาคาร</p>
                    <div className="rounded-lg bg-muted px-4 py-3">
                      <span className="block text-xs text-muted-foreground">รหัสพร้อมเพย์ / หมายเลขผู้เสียภาษี</span>
                      <span className="text-base font-bold text-primary">099-4-00000-00-0</span>
                    </div>
                  </div>
                </div>
              </section>

              <aside className="lg:col-span-4">
                <form className="space-y-4 rounded-xl border border-border bg-card p-5 shadow-sm" onSubmit={handleSubmit}>
                  <h2 className="flex items-center gap-2 text-base font-semibold">
                    <span className="material-symbols-outlined text-primary">upload_file</span>
                    แจ้งหลักฐานการชำระเงิน
                  </h2>
                  <div className="space-y-1.5">
                    <label htmlFor="payment-reference" className="text-xs font-medium">เลขที่เอกสาร / Reference No.</label>
                    <Input id="payment-reference" value={referenceNo} onChange={(event) => setReferenceNo(event.target.value)} />
                  </div>
                  <div className="space-y-1.5">
                    <label htmlFor="payment-amount" className="text-xs font-medium">จำนวนเงินที่โอน</label>
                    <div className="relative">
                      <Input id="payment-amount" type="number" min="0.01" step="0.01" className="pr-12" value={amount} onChange={(event) => setAmount(event.target.value)} />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">บาท</span>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <span className="text-xs font-medium">อัปโหลดสลิป / หลักฐาน</span>
                    <input ref={fileRef} type="file" className="hidden" accept=".jpg,.jpeg,.png,.pdf,image/jpeg,image/png,application/pdf" onChange={(event) => handleFile(event.target.files?.[0])} />
                    <button type="button" className="flex min-h-36 w-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-muted/40 p-4 text-center transition-colors hover:border-primary" onClick={() => fileRef.current?.click()}>
                      <span className={`material-symbols-outlined mb-2 text-4xl ${file ? "text-primary" : "text-muted-foreground"}`}>{file ? "check_circle" : "cloud_upload"}</span>
                      <span className="break-all text-xs font-medium">{file ? file.name : "คลิกเพื่อเลือกไฟล์"}</span>
                      <span className="mt-1 text-xs text-muted-foreground">JPG, PNG หรือ PDF ขนาดไม่เกิน 5MB</span>
                    </button>
                  </div>
                  {error && <p role="alert" className="rounded-md bg-destructive/10 px-3 py-2 text-xs text-destructive">{error}</p>}
                  <Button type="submit" className="w-full gap-2">
                    ส่งหลักฐาน
                    <span className="material-symbols-outlined text-lg">send</span>
                  </Button>
                </form>
              </aside>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
