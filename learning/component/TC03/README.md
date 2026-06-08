# TC03 Component Flow

## Scenario
1. `POST /enrollments` สร้าง enrollment ใหม่เป็น `ENR003`
2. `PATCH /enrollments/:id/approve` อนุมัติ enrollment
3. `POST /enrollments/:id/certificate` สร้าง certificate ผ่าน Mountebank
4. ตรวจว่า state ใน repository เปลี่ยนตาม flow ถูกต้อง

## Files
- `create-enrollment.component.spec.ts`
- `approve-enrollment.component.spec.ts`
- `generate-certificate.component.spec.ts`
- `fixtures/certificate-api-success.json`

## Notes
- ชุดนี้ใช้ Mountebank เป็น external stub จริง
- ใช้ `COM001`, `ENR003`, `HR002`, `CERT003` ตาม design
