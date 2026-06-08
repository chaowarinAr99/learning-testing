# Bruno Collection

ชุดนี้ไว้รันทดสอบ API บนระบบที่รันจาก Docker

## วิธีใช้
1. เปิด Bruno
2. Import โฟลเดอร์ `learning/bruno`
3. รันเคสใน `success/` ก่อน เช่น `success/TC01_Create_Certificate_Success_course_PHY001`
4. ระบบจะเซ็ต `enrollmentId` ให้อัตโนมัติจาก response
5. จากนั้นรันเคสใน `alternative/` เช่น `alternative/TC04_Create_EmployeeId_Required`

## หมายเหตุ
- ถ้ายังไม่มี `enrollmentId` ให้รัน `success/TC01_Create_Certificate_Success_course_PHY001/create-enrollment.bru` ก่อน
- ถ้าจะทดสอบเคสอื่น ให้เปลี่ยนค่าของ `employeeId` หรือ `courseId`

## โครงสร้าง
- `success/` = เคสปกติ
- `alternative/` = เคส error / validation / business rule
