# TC13 Component Flow

## Scenario
1. `POST /enrollments` สร้าง enrollment ใหม่เป็น `ENR013`
2. `PATCH /enrollments/:id/approve` เปลี่ยนสถานะเป็น `APPROVED`
3. `POST /enrollments/:id/certificate` ส่ง progress 99 แล้วต้องได้ `409 Progress must be 100%`

## Notes
- ใช้ service behavior จริงใน repo
- ไม่ต้องใช้ Mountebank เพราะ fail ที่ progress ก่อนเรียก external API
