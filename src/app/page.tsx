"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    setIsSubmitting(true);
    toast.loading("กำลังตรวจสอบข้อมูล...", { id: "login" });
    
    setTimeout(() => {
      toast.success("เข้าสู่ระบบสำเร็จ", { id: "login" });
      if (email.toLowerCase() === "admin" && password === "2323") {
        router.push("/admin/dashboard");
      } else {
        router.push("/dashboard");
      }
    }, 1500);
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-background">
      
      {/* Left Panel: Background Image */}
      <div className="hidden md:flex md:w-1/2 lg:w-[55%] relative flex-col justify-end p-12 text-white overflow-hidden">
        <div 
          className="absolute inset-0 z-0 bg-cover bg-center" 
          style={{ backgroundImage: "url('/login_bg.png')" }} 
        />
        {/* Dark overlay for text readability */}
        <div className="absolute inset-0 z-10 bg-gradient-to-t from-[#203a15]/90 via-[#2a4e1b]/40 to-transparent" />
        
        <div className="relative z-20 max-w-xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            <div className="w-20 h-20 rounded-xl bg-white/10 backdrop-blur-md p-3 mb-6 border border-white/20 shadow-lg">
              <img src="/logo_pharmacy.jpg" alt="Logo" className="w-full h-full object-contain" />
            </div>
            <h1 className="text-4xl font-bold mb-4 leading-tight">
              ราชวิทยาลัยเภสัชกรรม<br />แห่งประเทศไทย
            </h1>
            <p className="text-lg text-white/80 font-medium">
              Royal Pharmacy College Portal<br />
              ระบบสารสนเทศสมาชิกและการสอบวิชาชีพ
            </p>
          </motion.div>
        </div>
      </div>

      {/* Right Panel: Login Form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 relative border-t-4 border-primary md:border-t-0">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-sm"
        >
          <div className="md:hidden flex flex-col items-center mb-8">
            <div className="w-20 h-20 bg-white rounded-full shadow-sm border border-border p-3 mb-4">
              <img src="/logo_pharmacy.jpg" alt="Logo" className="w-full h-full object-contain" />
            </div>
            <h1 className="text-xl font-bold text-center text-primary">ราชวิทยาลัยเภสัชกรรม<br/>แห่งประเทศไทย</h1>
          </div>

          <div className="mb-8">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-primary mb-1">ระบบสารสนเทศสมาชิก · Member Portal</p>
            <h2 className="text-2xl font-bold text-foreground mb-2">เข้าสู่ระบบ</h2>
            <p className="text-sm text-muted-foreground">กรุณาเข้าสู่ระบบเพื่อเข้าใช้งานหนังสือเดินทางวิชาชีพและบริการต่างๆ</p>
          </div>

          <form className="space-y-5" onSubmit={handleLogin}>
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-foreground/80" htmlFor="email">
                อีเมล (Email)
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-muted-foreground">
                  <span className="material-symbols-outlined text-[20px]">mail</span>
                </span>
                <Input 
                  id="email" 
                  type="text" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com" 
                  className="pl-10 h-11 bg-muted/30 focus-visible:bg-transparent transition-colors" 
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-foreground/80" htmlFor="password">
                  รหัสผ่าน (Password)
                </label>
                <a href="#" onClick={(e) => { e.preventDefault(); toast.info("กรุณาติดต่อฝ่ายทะเบียนเพื่อรีเซ็ตรหัสผ่าน"); }} className="text-xs font-semibold text-primary hover:underline">
                  ลืมรหัสผ่าน?
                </a>
              </div>
              <div className="relative">
                <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-muted-foreground">
                  <span className="material-symbols-outlined text-[20px]">lock</span>
                </span>
                <Input 
                  id="password" 
                  type={showPassword ? "text" : "password"} 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••" 
                  className="pl-10 pr-10 h-11 bg-muted/30 focus-visible:bg-transparent transition-colors" 
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground hover:text-foreground transition-colors">
                  <span className="material-symbols-outlined text-[20px]">
                    {showPassword ? "visibility" : "visibility_off"}
                  </span>
                </button>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <input 
                type="checkbox" 
                id="remember" 
                className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary accent-[#137333]"
              />
              <label
                htmlFor="remember"
                className="text-sm font-medium leading-none text-muted-foreground cursor-pointer"
              >
                จดจำฉันไว้ในระบบ
              </label>
            </div>

            <Button type="submit" disabled={isSubmitting} className="w-full h-11 text-base font-semibold shadow-md mt-2">
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined animate-spin">progress_activity</span>
                  กำลังเข้าสู่ระบบ...
                </div>
              ) : (
                "เข้าสู่ระบบ"
              )}
            </Button>
          </form>

          <div className="mt-8 text-center text-sm text-muted-foreground">
            ยังไม่มีบัญชีผู้ใช้งาน?{" "}
            <a href="#" onClick={(e) => { e.preventDefault(); toast.info("ฟีเจอร์ลงทะเบียนด้วยตนเองกำลังพัฒนา"); }} className="font-semibold text-primary hover:underline">
              ลงทะเบียนใหม่
            </a>
          </div>

          <div className="mt-12 pt-6 border-t border-border flex items-center justify-center gap-4 text-xs text-muted-foreground/60">
            <span>© 2026 Pharmacy Council</span>
            <span>•</span>
            <a href="#" className="hover:text-primary transition-colors">นโยบายความเป็นส่วนตัว</a>
            <span>•</span>
            <a href="#" className="hover:text-primary transition-colors">ติดต่อเรา</a>
          </div>
        </motion.div>
      </div>

    </div>
  );
}
