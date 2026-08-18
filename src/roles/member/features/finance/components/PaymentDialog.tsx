"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { PaymentMethod } from "@/roles/shared/features/finance";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type PaymentItem = {
  id: string;
  description: string;
  amount: number;
  baseAmount: number;
  lateFee: number;
  dueAt?: string;
};

type PaymentDialogProps = {
  item: PaymentItem;
  onOpenChange: (open: boolean) => void;
  onSubmitted: (itemId: string, method: PaymentMethod, referenceNo: string) => void;
};

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ACCEPTED_FILE_TYPES = ["image/jpeg", "image/png", "application/pdf"];

export default function PaymentDialog({ item, onOpenChange, onSubmitted }: PaymentDialogProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [method, setMethod] = useState<PaymentMethod>("promptpay");
  const [referenceNo, setReferenceNo] = useState(item.id);
  const [file, setFile] = useState<File | null>(null);
  const [cardholder, setCardholder] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleFile = (selectedFile?: File) => {
    setError("");
    if (!selectedFile) return setFile(null);
    if (!ACCEPTED_FILE_TYPES.includes(selectedFile.type)) {
      setFile(null);
      return setError("รองรับเฉพาะไฟล์ JPG, PNG หรือ PDF");
    }
    if (selectedFile.size > MAX_FILE_SIZE) {
      setFile(null);
      return setError("ไฟล์ต้องมีขนาดไม่เกิน 5MB");
    }
    setFile(selectedFile);
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    if (method === "promptpay") {
      if (!referenceNo.trim()) return setError("กรุณากรอก Reference No.");
      if (!file) return setError("กรุณาแนบหลักฐานการชำระเงิน");
    } else {
      const digits = cardNumber.replace(/\D/g, "");
      if (!cardholder.trim() || digits.length !== 16 || !/^\d{2}\/\d{2}$/.test(expiry) || !/^\d{3,4}$/.test(cvv)) {
        return setError("กรุณากรอกข้อมูลบัตรให้ครบถ้วน");
      }
    }

    const safeReference = method === "promptpay"
      ? referenceNo.trim()
      : `${method === "credit_card" ? "CARD" : "DEBIT"}-${Date.now()}`;
    onSubmitted(item.id, method, safeReference);

    // Sensitive card fields never leave this component and are cleared immediately.
    setCardholder("");
    setCardNumber("");
    setExpiry("");
    setCvv("");
    setSubmitted(true);
  };

  return (
    <Dialog open onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto p-0 sm:max-w-3xl">
        {submitted ? (
          <div className="flex min-h-[380px] flex-col items-center justify-center px-6 py-12 text-center">
            <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
              <span className="material-symbols-outlined text-4xl">check_circle</span>
            </div>
            <DialogTitle className="mb-2 text-xl">
              ชำระเงินสำเร็จ
            </DialogTitle>
            <DialogDescription className="max-w-md text-sm leading-6">
              {method === "promptpay"
                ? "System Actor ยืนยันรายการแล้ว ระบบบันทึกเลขอ้างอิงและข้อมูลไฟล์หลักฐาน"
                : "ระบบบันทึกเฉพาะวิธีชำระและเลขอ้างอิง ไม่จัดเก็บเลขบัตรหรือ CVV"}
            </DialogDescription>
            <Button className="mt-6 min-w-32" onClick={() => onOpenChange(false)}>เสร็จสิ้น</Button>
          </div>
        ) : (
          <>
            <DialogHeader className="border-b border-border px-6 py-5 pr-16">
              <DialogTitle className="text-xl">ช่องทางการชำระเงิน</DialogTitle>
              <DialogDescription>{item.description} · ฿{item.amount.toLocaleString()}</DialogDescription>
            </DialogHeader>
            <form className="space-y-5 px-6 pb-6" onSubmit={handleSubmit}>
              <div className="grid grid-cols-3 gap-2">
                {([
                  ["promptpay", "พร้อมเพย์", "qr_code_scanner"],
                  ["credit_card", "บัตรเครดิต", "credit_card"],
                  ["debit_card", "บัตรเดบิต", "credit_card"],
                ] as const).map(([id, label, icon]) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => { setMethod(id); setError(""); }}
                    className={`rounded-xl border p-3 text-center text-xs font-medium transition-colors ${method === id ? "border-brand bg-brand-soft text-brand-on-soft" : "border-border bg-card hover:bg-muted"}`}
                  >
                    <span className="material-symbols-outlined mb-1 block text-xl">{icon}</span>
                    {label}
                  </button>
                ))}
              </div>

              <div className="rounded-xl border border-border bg-surface-container-low p-4 text-sm">
                <div className="flex justify-between"><span>ยอดลงทะเบียน</span><span>฿{item.baseAmount.toLocaleString()}</span></div>
                {item.lateFee > 0 && <div className="mt-2 flex justify-between text-danger"><span>ค่าปรับค้างชำระ</span><span>฿{item.lateFee.toLocaleString()}</span></div>}
                <div className="mt-3 flex justify-between border-t border-border pt-3 font-bold"><span>ยอดชำระรวม</span><span>฿{item.amount.toLocaleString()}</span></div>
              </div>

              {method === "promptpay" ? (
                <div className="grid gap-5 md:grid-cols-2">
                  <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-card p-5 text-center">
                    <div className="flex h-40 w-40 items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted">
                      <span className="material-symbols-outlined text-7xl text-muted-foreground">qr_code_2</span>
                    </div>
                    <p className="mt-3 text-sm font-semibold">พร้อมเพย์ (PromptPay)</p>
                    <p className="mt-1 text-xs text-content-muted">สแกน QR แล้วแนบหลักฐาน</p>
                  </div>
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label htmlFor="payment-reference" className="text-xs font-medium">Reference No.</label>
                      <Input id="payment-reference" value={referenceNo} onChange={(event) => setReferenceNo(event.target.value)} />
                    </div>
                    <div className="space-y-1.5">
                      <span className="text-xs font-medium">หลักฐานการชำระเงิน</span>
                      <input ref={fileRef} type="file" className="hidden" accept=".jpg,.jpeg,.png,.pdf,image/jpeg,image/png,application/pdf" onChange={(event) => handleFile(event.target.files?.[0])} />
                      <button type="button" className="flex min-h-28 w-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-muted/40 p-4 text-center hover:border-primary" onClick={() => fileRef.current?.click()}>
                        <span className="material-symbols-outlined mb-1 text-3xl text-primary">{file ? "check_circle" : "cloud_upload"}</span>
                        <span className="break-all text-xs font-medium">{file ? file.name : "เลือกไฟล์ JPG, PNG หรือ PDF"}</span>
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4 rounded-xl border border-border bg-card p-5">
                  <div className="rounded-lg border border-info-border bg-info-soft p-3 text-xs text-info-on-soft">
                    ระบบไม่จัดเก็บเลขบัตรหรือ CVV
                  </div>
                  <div className="space-y-1.5">
                    <label htmlFor="cardholder" className="text-xs font-medium">ชื่อบนบัตร</label>
                    <Input id="cardholder" autoComplete="cc-name" value={cardholder} onChange={(event) => setCardholder(event.target.value)} />
                  </div>
                  <div className="space-y-1.5">
                    <label htmlFor="card-number" className="text-xs font-medium">เลขบัตร 16 หลัก</label>
                    <Input id="card-number" inputMode="numeric" autoComplete="cc-number" maxLength={19} value={cardNumber} onChange={(event) => setCardNumber(event.target.value.replace(/[^\d ]/g, ""))} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5"><label htmlFor="card-expiry" className="text-xs font-medium">MM/YY</label><Input id="card-expiry" autoComplete="cc-exp" maxLength={5} value={expiry} onChange={(event) => setExpiry(event.target.value)} /></div>
                    <div className="space-y-1.5"><label htmlFor="card-cvv" className="text-xs font-medium">CVV</label><Input id="card-cvv" type="password" inputMode="numeric" autoComplete="cc-csc" maxLength={4} value={cvv} onChange={(event) => setCvv(event.target.value.replace(/\D/g, ""))} /></div>
                  </div>
                </div>
              )}

              {error && <p role="alert" className="rounded-md bg-destructive/10 px-3 py-2 text-xs text-destructive">{error}</p>}
              <Button type="submit" className="w-full">ชำระเงิน</Button>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
