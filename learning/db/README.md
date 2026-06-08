# Database Seed

ไฟล์ `seed.mongo.js` ใช้สำหรับ seed MongoDB ใน `learning_system_db`

## หมายเหตุ
- `status` ใน collection `course` ถูก normalize เป็น `OPEN` / `CLOSED` เพื่อให้ตรงกับ service
- `enrollment` มีตัวอย่าง `PENDING_APPROVAL`, `APPROVED`, `REJECTED`
- `enrollment.id` จะเป็นรูปแบบ `ENR001`, `ENR002`, ...
- ถ้าใช้ Mongo shell หรือ `mongosh` ให้รันไฟล์นี้ตรงๆ ได้
