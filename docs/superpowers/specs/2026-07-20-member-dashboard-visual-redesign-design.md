


# Member Dashboard Visual Redesign — Design Spec

Date: 2026-07-20
Status: Approved by user, ready for implementation plan

## Background

`royal_collagepharmacy01` เป็นพอร์ทัลราชวิทยาลัยเภสัชกรรมแห่งประเทศไทย ทิศทางที่ยืนยันไว้ก่อนหน้านี้คือ UI ต้อง "ทางการขึ้น ลด gradient/glassmorphism" ([[royal-pharmacy-portal]]) แต่ยังไม่เคยเจาะจงเป็น spec ที่ implement ได้ งานนี้คือการทำให้ทิศทางนั้นเป็นรูปธรรม เฉพาะส่วน **member dashboard** (route group `src/app/(dashboard)/`) — ไม่รวม admin panel (`src/app/admin/`)

## Scope

**In scope:** ทุกหน้าใน `src/app/(dashboard)/` (dashboard, admission, cpd, finance, help, news, passport, pathway, programs, registration, requests, research, schedule, settings, students) และ shared components ที่หน้าเหล่านี้ใช้ร่วมกัน (`Sidebar.tsx`, `TopNav.tsx`, `PageHeader.tsx`, `Footer.tsx`, `globals.css` tokens)

**Out of scope:** admin panel (`src/app/admin/`, `AdminSidebar.tsx`), print pages, verify page, IA/navigation restructuring, สีหลัก/ฟอนต์ ระดับ token

## ปัญหาที่แก้ (ยืนยันโดยผู้ใช้)

1. Gradient/glassmorphism เกินความจำเป็น ไม่เป็นทางการพอ
2. Visual hierarchy สับสน หาข้อมูลสำคัญยาก
3. จัดวาง/Layout ไม่เป็นระเบียบ (ไม่มี spacing/grid มาตรฐานเดียวกันข้ามหน้า)

## สิ่งที่ต้องคงไว้ (ยืนยันโดยผู้ใช้)

- สีหลักเขียวมะกอก `#737300` (`--primary` และอนุพันธ์ทั้งหมดใน `:root`/`.dark`)
- ฟอนต์ Kanit (`--font-kanit`)
- โครงสร้าง sidebar navigation เดิม (รายการเมนู, active state indicator, ลำดับ, ส่วน profile ด้านล่าง)
- แบนเนอร์กิจกรรมสำคัญในหน้า dashboard หลัก (รูปซ้อน gradient ดำ 3 ชั้น) — **ไม่แก้**
- การ์ด metric 4 ใบเท่ากันในหน้า dashboard หลัก — **ไม่ลดจำนวน/ไม่เปลี่ยนเป็น 1 เด่น+3 รอง**

## Design

### 1. Design tokens (`src/app/globals.css`)

- `--radius` คงที่ `0.5rem` (rounded-lg) — เอฟเฟกต์ที่ต้องแก้คือการใช้ `rounded-xl` / `rounded-2xl` แบบ hardcode ในหน้าต่างๆ ให้เปลี่ยนเป็น `rounded-lg` เพื่อให้ตรง token
- ลบ `.glass-panel-primary` และ `.glass-panel` ที่นิยามไว้บรรทัด 162–182 (หรือคงนิยามไว้เผื่อใช้ที่อื่น แต่เลิกใช้ในทุกจุดที่อยู่ใน scope นี้)
- Hover pattern มาตรฐานใหม่สำหรับการ์ด: `transition-colors hover:border-primary/40` — ห้ามใช้ `hover:-translate-y-1` หรือ `hover:shadow-md` ใน scope นี้อีก
- Gradient มาตรฐานใหม่สำหรับ header/section band: ห้ามใช้ `bg-gradient-to-r from-*/[0.0x] to-transparent` แทนที่ด้วยพื้นสีทึบ/โปร่งแสงคงที่ระดับเดียว เช่น `bg-card border-b-2 border-primary` (ไม่มี gradient)
- ข้อยกเว้นเดียว: แบนเนอร์กิจกรรม dashboard หลัก (gradient ทับรูปภาพ) คงไว้ตามเดิมทุกประการ

### 2. Sidebar (`src/components/layout/Sidebar.tsx`)

- เปลี่ยน container จาก `fixed left-4 top-4 bottom-4 rounded-2xl glass-panel-primary` (floating card, บรรทัด 152) เป็น `fixed left-0 top-0 bottom-0 bg-sidebar` — ชนขอบจอซ้าย/บน/ล่าง, พื้นทึบ (ไม่มี backdrop-blur/opacity), ไม่มี border-radius
- เนื่องจาก sidebar ไม่มี margin รอบตัวอีกต่อไป ต้องปรับ main content area (layout wrapper ที่ครอบ children ของ `(dashboard)`) ให้เพิ่ม `padding-left` เท่ากับความกว้าง sidebar (`w-60` เดิม) แทน margin ที่เคยเผื่อไว้จาก floating card
- คงทุกอย่างภายใน sidebar เดิม: nav item list, active dot indicator, profile section, logo container

### 3. Metric cards

- คงจำนวนและ layout เดิม (4 การ์ดเท่ากัน, `grid-cols-2 lg:grid-cols-4`)
- ปรับเฉพาะ: ชุดสี/ไอคอนต่อการ์ดให้สื่อสถานะ (เช่น ใกล้ deadline/ค้างชำระ → ใช้โทน destructive/warning ชัดเจนกว่าเดิมที่เกือบทุกใบใช้สี primary/muted เหมือนกันหมด) และ border-radius ให้ตรง token ใหม่
- ไม่เปลี่ยนโครงสร้าง JSX/data mapping

### 4. Layout & spacing scale (ใช้เหมือนกันทุกหน้าใน scope)

- Container มาตรฐาน: `p-4 md:p-6 pb-16 max-w-[1280px] mx-auto` (ของเดิมในหน้า dashboard ถูกต้องแล้ว ให้ใช้เป็น reference สำหรับหน้าอื่น)
- Gap มาตรฐาน: `gap-4` ระหว่าง section/การ์ดระดับบนสุด, `gap-3` ภายใน group เดียวกัน — ไล่แก้ทุกหน้าที่ใช้ค่าไม่ตรง (เช่น `gap-5`, `gap-6`, `p-6` เดี่ยวๆ)
- Grid breakpoint มาตรฐาน: metric/summary row ใช้ `grid-cols-2 lg:grid-cols-4`, content row หลักใช้ `grid-cols-1 lg:grid-cols-3`
- แต่ละหน้าที่มี pattern ไม่ตรงกับมาตรฐานนี้ ให้ปรับให้เข้ากับ pattern โดยไม่เปลี่ยนเนื้อหา/ฟังก์ชันการทำงาน

### 5. Rollout

ทำ token + Sidebar ก่อน (ส่งผลกระทบทุกหน้าโดยอัตโนมัติเพราะ shared component) จากนั้นไล่ apply pattern ที่เหลือ (radius, hover, gradient, spacing) ทีละหน้าในทั้ง 11 หน้าย่อยของ `(dashboard)/` ในรอบเดียวกัน ไม่แบ่ง phase/pilot

## Testing

- Visual check ด้วยตาแต่ละหน้าใน dev server (light + dark mode) หลังแก้ — ไม่มี unit test สำหรับ CSS/layout
- ตรวจว่า sidebar ไม่มี glass effect เหลืออยู่, ไม่มี `-translate-y-1` เหลืออยู่ใน scope (grep ยืนยัน)
- ตรวจว่า main content ไม่โดน sidebar ทับ (padding-left ถูกต้อง) ทั้งจอ desktop และ mobile (sidebar ซ่อนใน mobile อยู่แล้วตาม `hidden md:flex` เดิม)
