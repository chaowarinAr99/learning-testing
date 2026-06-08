# TC17 Component Flow

## Scenario
1. `POST /enrollments` สร้าง enrollment ใหม่เป็น `ENR017`
2. `PATCH /enrollments/:id/approve` เปลี่ยนสถานะเป็น `APPROVED`
3. `POST /enrollments/:id/certificate` แล้ว external API ตอบ error
4. ตรวจว่า repo ถูกอัปเดตเป็น `CERTIFICATE_FAILED`

## Notes
- ใช้ service behavior จริงใน repo
- เคสนี้ต้องใช้ Mountebank เพราะ fail หลังเรียก external API แล้ว
