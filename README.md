# Royal Pharmacy College Portal

Member and administrator portal for Royal Pharmacy College of Thailand.

## Development

```bash
npm ci
npm run dev
```

Open `http://localhost:3000`.

## Checks

```bash
npm run typecheck
npm test
npm run build
```

## Structure

- `src/app` - Next.js routes and layouts
- `src/components` - shared UI primitives (`components/ui/*`)
- `src/roles/admin` - ส่วนของผู้ดูแลระบบ
- `src/roles/member` - ส่วนของสมาชิก
- `src/roles/shared` - โค้ดที่ใช้ร่วมกัน เช่น mock data, domain
- `src/providers` - application-wide React providers
- `src/lib` - shared utilities
- สมาชิกปัจจุบันอยู่ที่ `src/app/member/...` และ business logic เชื่อมผ่าน `src/roles/*`

ดูรายละเอียดและข้อตกลงของ source ได้ที่ [src/README.md](src/README.md)
