# TC12 Component Flow

## Scenario
1. `POST /enrollments` สร้าง enrollment ใหม่เป็น `ENR012`
2. `PATCH /enrollments/:id/reject` เปลี่ยนสถานะเป็น `REJECTED`
3. `POST /enrollments/:id/certificate` ยิงต่อแล้วต้องได้ `409 Enrollment is not approved`

## Notes
- ใช้ service behavior จริงใน repo
- เคส certificate นี้ไม่เรียก Mountebank เพราะ fail ที่สถานะก่อนถึง external call
