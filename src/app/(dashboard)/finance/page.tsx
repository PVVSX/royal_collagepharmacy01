"use client";

import { toast } from "sonner";
import { useState, useEffect } from "react";
import { financeData, profileData } from "@/data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Footer from "@/components/layout/Footer";
import PaymentDialog from "@/components/finance/PaymentDialog";
import { useMockDb, Payment } from "@/context/MockDbContext";

type PaymentStatus = "paid" | "unpaid" | "pending";
type PaymentItem = Omit<(typeof financeData.items)[number], "status"> & { status: PaymentStatus };

const s: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; label: string }> = {
  paid: { variant: "default", label: "จ่ายแล้ว" },
  unpaid: { variant: "destructive", label: "ค้างชำระ" },
  pending: { variant: "secondary", label: "รอดำเนินการ" },
};

export default function FinancePage() {
  const d = financeData;
  const { payments: adminPayments, addPayment } = useMockDb();
  
  // Initialize with financeData items, but override status if it's in adminPayments
  const [items, setItems] = useState<PaymentItem[]>(() => d.items.map((item) => ({ ...item, status: item.status as PaymentStatus })));
  
  // Sync with MockDb
  useEffect(() => {
    setItems(current => current.map(item => {
      // Find if this item has been paid/submitted in MockDb
      // We match by description/type roughly since IDs are different format
      const matchedPayment = adminPayments.find(p => p.type === item.description);
      if (matchedPayment) {
        return { ...item, status: matchedPayment.status as PaymentStatus };
      }
      return item;
    }));
  }, [adminPayments]);

  const [selectedItem, setSelectedItem] = useState<PaymentItem | null>(null);
  const outstandingBalance = items.filter((item) => item.status === "unpaid").reduce((sum, item) => sum + item.amount, 0);

  const handleSubmitted = (itemId: number) => {
    const item = items.find(i => i.id === itemId);
    if (item) {
      const newPayment: Payment = {
        id: `PAY-2026-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
        studentId: profileData.personalInfo.licenseNumber || "รอตรวจสอบ",
        name: `${profileData.personalInfo.firstName} ${profileData.personalInfo.lastName}`,
        program: "เภสัชบำบัด",
        amount: item.amount,
        date: new Date().toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' }),
        status: "pending",
        type: item.description
      };
      addPayment(newPayment);
    }
  };

  return (
    <>
      <div className="p-4 md:p-6 pb-16 max-w-[1280px] mx-auto">
        <header className="mb-6">
          <h1 className="text-lg md:text-xl font-semibold mb-1">การชำระเงิน</h1>
          <p className="text-xs text-muted-foreground">รายละเอียดค่าใช้จ่าย</p>
        </header>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <Card className="card-shadow"><CardContent className="p-5 flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center"><span className="material-symbols-outlined text-xl text-primary">account_balance_wallet</span></div>
            <div><h2 className="text-xs font-medium text-muted-foreground mb-0.5">ค่าใช้จ่ายทั้งหมด</h2><div className="text-2xl font-bold">฿{d.totalFees.toLocaleString()}</div></div>
          </CardContent></Card>
          <Card className="card-shadow border-l-4 border-l-destructive"><CardContent className="p-5 flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center"><span className="material-symbols-outlined text-xl text-destructive">warning</span></div>
            <div><h2 className="text-xs font-medium text-muted-foreground mb-0.5">ยอดค้างชำระ</h2><div className="text-2xl font-bold text-destructive">฿{outstandingBalance.toLocaleString()}</div></div>
          </CardContent></Card>
        </div>
        <Card className="card-shadow"><CardHeader className="pb-0 pt-4 px-5"><CardTitle className="text-sm">รายการชำระเงิน</CardTitle></CardHeader>
          <CardContent className="p-0 mt-3">
            <Table><TableHeader><TableRow>
              <TableHead className="text-xs h-9">รายการ</TableHead><TableHead className="text-xs h-9">จำนวน</TableHead><TableHead className="text-xs h-9">กำหนดชำระ</TableHead><TableHead className="text-xs h-9">สถานะ</TableHead><TableHead className="text-xs h-9">การดำเนินการ</TableHead>
            </TableRow></TableHeader><TableBody>
              {items.map((item) => { const st = s[item.status]; return (
                <TableRow key={item.id}>
                  <TableCell className="text-xs py-3">{item.description}</TableCell>
                  <TableCell className="text-xs py-3 font-medium">฿{item.amount.toLocaleString()}</TableCell>
                  <TableCell className="text-xs py-3">{item.dueDate}</TableCell>
                  <TableCell className="text-xs py-3"><Badge variant={st.variant} className="text-xs opacity-90 px-1.5 py-0">{st.label}</Badge></TableCell>
                  <TableCell className="text-xs py-3">
                    {item.status === "unpaid" && <Button size="sm" className="h-7 text-xs" onClick={() => setSelectedItem(item)}>ชำระเงิน</Button>}
                    {item.status === "paid" && <Button variant="ghost" size="icon" className="h-7 w-7" aria-label={`ดาวน์โหลดใบเสร็จ ${item.description}`} onClick={() => toast.info(`กำลังดาวน์โหลดใบเสร็จ...\n\nรายการ: ${item.description}\nจำนวน: ฿${item.amount.toLocaleString()}\nวันที่ชำระ: ${item.dueDate}\n\nรูปแบบไฟล์: PDF`)}><span className="material-symbols-outlined text-base">download</span></Button>}
                    {item.status === "pending" && <span className="text-muted-foreground">กำลังตรวจสอบ</span>}
                  </TableCell>
                </TableRow>
              );})}
            </TableBody></Table>
          </CardContent>
        </Card>
      </div>
      <Footer />
      {selectedItem && (
        <PaymentDialog
          item={selectedItem}
          onSubmitted={handleSubmitted}
          onOpenChange={(open) => { if (!open) setSelectedItem(null); }}
        />
      )}
    </>
  );
}
