# TC02 Component Flow

## Scenario
1. `POST /enrollments` สร้าง enrollment ใหม่เป็น `ENR002`
2. ตรวจ state ใน repository ว่าเป็น `PENDING_APPROVAL`
3. `PATCH /enrollments/:id/approve` อนุมัติ enrollment
4. ตรวจ state ใน repository ว่าเปลี่ยนเป็น `APPROVED`
5. `POST /enrollments/:id/certificate` สร้าง certificate เมื่อ progress = 100
6. ตรวจ state ใน repository ว่า `certificateStatus = CERTIFICATE_ISSUED`

## Files
- `create-enrollment.component.spec.ts`
- `approve-enrollment.component.spec.ts`
- `generate-certificate.component.spec.ts`

## Notes
- ใช้ `InMemory...` ตาม pattern ของ TC01
- เพื่อให้ได้ `ENR002` ให้ seed ข้อมูลเริ่มต้นไว้ 1 record ก่อนสร้าง enrollment
- external certificate API ใช้ fake client ที่คืน `CERT002`
