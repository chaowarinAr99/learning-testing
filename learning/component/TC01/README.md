# TC01 Component Flow

## Scenario
1. `POST /enrollments` สร้าง enrollment ใหม่
2. ตรวจใน DB ว่าถูกบันทึกเป็น `PENDING_APPROVAL`
3. `PATCH /enrollments/:id/approve` อนุมัติ enrollment
4. ตรวจใน DB ว่าสถานะเปลี่ยนเป็น `APPROVED`
5. `POST /enrollments/:id/certificate` สร้าง certificate เมื่อ progress = 100
6. ตรวจใน DB ว่า `certificateStatus = CERTIFICATE_ISSUED`

## Files
- `create-enrollment.component.spec.ts`
- `approve-enrollment.component.spec.ts`
- `generate-certificate.component.spec.ts`

## สิ่งที่ต้องระวัง
- หลัง approve แล้ว `status` ต้องเป็น `APPROVED` ไม่ใช่ `PENDING_APPROVAL`
- `approvedBy` และ `approvedAt` ต้องมีค่าเฉพาะหลัง approve
- หลัง certificate สำเร็จ `certificateUrl` ต้องถูกเก็บใน DB
- external certificate API ควรถูก mock ด้วย Mountebank หรือ fake client
- ถ้าฝึกแบบ flow แยกไฟล์ ให้แต่ละไฟล์ seed state ของตัวเองก่อน run
