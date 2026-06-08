# TC15 Component Flow

## Scenario
1. `POST /enrollments` สร้าง enrollment ใหม่เป็น `ENR015`
2. ไม่ approve
3. `POST /enrollments/:id/certificate` แล้วต้องได้ `409 Enrollment is not approved`

## Notes
- ใช้ service behavior จริงใน repo
- ไม่ต้องใช้ Mountebank เพราะ fail ที่ status ก่อนเรียก external API
