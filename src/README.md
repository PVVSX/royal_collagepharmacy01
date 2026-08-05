# Source structure

โครงสร้างใหม่แยกตาม Role:

```text
src/
├── app/             # Next.js routes and route layouts only
├── components/      # Shared UI primitives (`components/ui/*`)
├── providers/       # Application-wide React providers
├── lib/             # Framework-agnostic shared utilities
└── roles/           # โค้ดตามบริบทการใช้งาน
    ├── admin/       # ส่วนผู้ดูแลระบบ
    ├── member/      # ส่วนสมาชิก
    └── shared/      # โค้ดที่แชร์ระหว่าง role
        ├── data/            # ข้อมูล mock/reference ร่วม
        ├── components/      # layout และ primitive ที่ใช้ร่วม
        └── member/domain/   # SSOT ข้อมูลผู้ใช้/สมาชิก
```

## หลักเกณฑ์

- Route pages (`app/`) ควรเป็น "entry point" ล้วนและ import จาก `roles/*`, `providers/*` หรือ `components/ui/*`
- ส่วนที่เป็น business logic ของ role ใด role หนึ่งให้อยู่ใน `roles/<role>/...`
- ส่วนที่ใช้ได้ทั้งระบบให้ไปไว้ที่ `roles/shared/...`
- เก็บ tests ไว้ใกล้ไฟล์ที่เกี่ยวข้อง

## Route/path current

- หน้า Member ที่เป็น entry points อยู่ที่ `src/app/member/...`
- หน้า admin อยู่ที่ `src/app/admin/...`
- โค้ดหน้า route ควร import จาก `roles/*`, `providers/*`, `components/ui/*` ตามแนว route→role boundary
