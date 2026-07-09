"use client";

import { useState } from "react";
import Footer from "@/components/layout/Footer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "จะสมัครสอบ Board Certified Pharmacotherapy ได้เมื่อไหร่?",
    answer: "โดยปกติทางราชวิทยาลัยฯ จะเปิดรับสมัครช่วงเดือนมีนาคม - พฤษภาคม ของทุกปี โปรดติดตามประกาศที่หน้าแรกหรือเมนูข่าวสาร",
  },
  {
    question: "ลืมรหัสผ่านเข้าระบบ ต้องทำอย่างไร?",
    answer: "สามารถกดปุ่ม 'ลืมรหัสผ่าน' ที่หน้าล็อกอิน เพื่อรับลิงก์รีเซ็ตรหัสผ่านทางอีเมลที่ได้ลงทะเบียนไว้ หากไม่สามารถเข้าอีเมลได้ กรุณาติดต่อแอดมินทางศูนย์ช่วยเหลือ",
  },
  {
    question: "ชำระเงินค่าลงทะเบียนแล้ว แต่สถานะยังไม่เปลี่ยน",
    answer: "ระบบจะใช้เวลาตรวจสอบยอดชำระเงินอัตโนมัติภายใน 1-3 ชั่วโมง หากเกินเวลาที่กำหนด โปรดแนบหลักฐานการโอนเงิน (สลิป) ผ่านระบบแจ้งปัญหา",
  },
  {
    question: "หน่วยกิตการศึกษาต่อเนื่อง (CPD) ไม่ขึ้นในระบบ",
    answer: "หากเป็นกิจกรรมที่จัดโดยองค์กรภายนอก อาจใช้เวลา 7-14 วันในการอัปเดตข้อมูลเข้าสู่ฐานข้อมูลกลางของสภาฯ คุณสามารถกดปุ่ม 'ซิงค์ข้อมูลกับ ศธภ.' ที่หน้า CPD เพื่อดึงข้อมูลล่าสุด",
  }
];

export default function HelpCenterPage() {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject || !message) {
      toast.error("กรุณากรอกข้อมูลให้ครบถ้วน");
      return;
    }
    
    setIsSubmitting(true);
    setTimeout(() => {
      toast.success("ส่งข้อความถึงเจ้าหน้าที่เรียบร้อยแล้ว (Ticket #8429)");
      setSubject("");
      setMessage("");
      setIsSubmitting(false);
    }, 1000);
  };

  return (
    <div className="flex flex-col min-h-full">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">ศูนย์ช่วยเหลือ (Help Center)</h1>
        <p className="text-sm text-muted-foreground mt-1">คำถามที่พบบ่อย และระบบติดต่อสอบถามเจ้าหน้าที่</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 mb-8">
        
        {/* FAQs */}
        <Card className="flex flex-col h-fit">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">live_help</span>
              คำถามที่พบบ่อย (FAQ)
            </CardTitle>
            <CardDescription>หากมีข้อสงสัย ลองหาคำตอบเบื้องต้นจากที่นี่ได้เลย</CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="text-sm text-left hover:text-primary">{faq.question}</AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground bg-muted/30 p-3 rounded-md mb-2">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>

        {/* Support Ticket */}
        <Card className="flex flex-col h-fit">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">support_agent</span>
              ติดต่อสอบถาม (Support Ticket)
            </CardTitle>
            <CardDescription>แจ้งปัญหา แจ้งโอนเงิน หรือสอบถามเรื่องอื่นๆ ทีมงานจะตอบกลับภายใน 24 ชม.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">หัวข้อเรื่อง <span className="text-destructive">*</span></label>
                <Input 
                  placeholder="เช่น แจ้งปัญหาการชำระเงิน, สอบถามเรื่อง CPD" 
                  value={subject} 
                  onChange={e => setSubject(e.target.value)} 
                  disabled={isSubmitting}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">รายละเอียด <span className="text-destructive">*</span></label>
                <Textarea 
                  placeholder="อธิบายรายละเอียดปัญหาของคุณอย่างชัดเจน..." 
                  className="min-h-[120px] resize-y" 
                  value={message} 
                  onChange={e => setMessage(e.target.value)}
                  disabled={isSubmitting}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">แนบไฟล์รูปภาพ (ถ้ามี)</label>
                <Input type="file" className="cursor-pointer" disabled={isSubmitting} />
                <p className="text-[10px] text-muted-foreground">รองรับไฟล์ JPG, PNG, PDF ขนาดไม่เกิน 5MB</p>
              </div>
              <Button type="submit" className="w-full mt-2" disabled={isSubmitting}>
                {isSubmitting ? 'กำลังส่งข้อมูล...' : 'ส่งข้อความถึงเจ้าหน้าที่'}
              </Button>
            </form>

            <div className="mt-8 pt-6 border-t">
              <h3 className="text-sm font-semibold mb-3">ช่องทางติดต่ออื่นๆ</h3>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px]">call</span>
                  โทรศัพท์: 0-2591-9992 (ในเวลาทำการ)
                </p>
                <p className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px]">mail</span>
                  อีเมล: info@cpat.ac.th
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

      </div>
      
      <Footer />
    </div>
  );
}
