# System Context

## ภาพรวม
ระบบนี้ใช้สำหรับสมัครเรียนคอร์สภายในองค์กร และสร้าง Certificate เมื่อเรียนครบ 100%

## Flow หลัก
1. `POST /enrollments`
2. `PATCH /enrollments/:enrollmentId/approve`
3. `POST /enrollments/:enrollmentId/certificate`

## Active Enrollment
Enrollment จะถือว่า active เมื่อสถานะเป็น:
- `PENDING_APPROVAL`
- `APPROVED`

Enrollment ที่ active จะบล็อกการสมัครซ้ำของ `employeeId + courseId`

## Non-active Enrollment
สถานะที่ไม่ควรบล็อกการสมัครซ้ำ:
- `REJECTED`

## Business Rules ที่ต้องจำ
- สมัครคอร์สได้เฉพาะ course ที่ `OPEN`
- ต้องมี seat เหลือ
- ห้ามสมัครซ้ำถ้ามี active enrollment เดิม
- อนุมัติได้เฉพาะ `PENDING_APPROVAL`
- สร้าง certificate ได้เฉพาะ `APPROVED` และ progress = `100`
- External certificate API มี outcome: success, error, timeout

## จุดที่ควรระวัง
- ลำดับการเช็กเงื่อนไขมีผลกับ error message
- `approvedAt` เป็นเวลาจริง ต้อง mock ใน test
- Flow certificate ใน code ปัจจุบันคืนผลแบบ success/fail ที่อาจไม่ตรงกับ spec เดิม
