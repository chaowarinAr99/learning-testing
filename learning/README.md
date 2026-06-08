# Learning: Test Setup Workshop

ชุดไฟล์นี้ไว้ฝึกคิดและจัดโครง `test setup` สำหรับระบบสมัครเรียนและออก Certificate //

## วิธีใช้
1. อ่าน `system-context.md` เพื่อเข้าใจ flow และ business rule
2. อ่าน `test-strategy.md` เพื่อแยกว่าอะไรควรเป็น unit, API, integration
3. ใช้ `test-cases.md` เป็น checklist ตอนเขียน test จริง
4. เปิดไฟล์ใน `starter/` แล้วลองเติม implementation ของคุณเอง
5. ดูโค้ดจริงใน `src/` เพื่อเข้าใจวิธีประกอบระบบ

## เป้าหมายการฝึก
- แยก test scope ได้ถูก
- รู้ว่าจะ mock อะไร และไม่ควร mock อะไร
- ตั้ง fixture / arrange / act / assert ได้เป็นระบบ
- เห็นจุดเสี่ยงของ code ที่อาจทำให้ test flaky หรือ coverage หลอกตา

## กติกา
- Unit test: mock repository และ external service
- API test: focus ที่ request / response / status code
- Integration test: verify data flow ระหว่าง service กับ repository
- Time-dependent logic ควร mock เวลา
- External API ต้องมีเคส success / error / timeout

## โค้ดจริง
- `src/` = implementation ที่สร้างตาม spec
- `src/in-memory.ts` = adapter ตัวอย่างสำหรับฝึกเรียกใช้งานโดยไม่ต้องต่อ DB จริง

## Run จริงด้วย Docker
1. ไปที่โฟลเดอร์ `learning`
2. รัน `docker compose up --build`
3. เปิด `http://localhost:3000/health`
4. ถ้าต้องการล้างข้อมูลแล้ว seed ใหม่ ให้รัน `docker compose down -v` ก่อน

## API ที่ลองเล่นได้
- `POST /enrollments`
- `PATCH /enrollments/:enrollmentId/approve`
- `POST /enrollments/:enrollmentId/certificate`

## ข้อมูลตัวอย่างใน Seed
- `PHY001` เปิดและที่นั่งยังเหลือ
- `CHE001` เปิดและมี active enrollment บางส่วน
- `COM001` เปิดและใกล้เต็ม
- `MTH001` ปิดรับสมัคร
- `BIO001` เต็มแล้ว

## รูปแบบ enrollmentId
- ใช้รูปแบบ `ENR001`, `ENR002`, ...

## จำลอง certificate API
- `CERTIFICATE_API_MODE=success` ค่า default
- `CERTIFICATE_API_MODE=error` จำลอง external error
- `CERTIFICATE_API_MODE=timeout` จำลอง timeout

## ตัวอย่างทดสอบด้วย curl
```bash
curl -X POST http://localhost:3000/enrollments \
  -H 'content-type: application/json' \
  -d '{"employeeId":"EMP100","courseId":"PHY001"}'
```
