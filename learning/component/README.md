# Component Test Layout

Component test ในโปรเจกต์นี้จะเน้นตรวจว่า service ทำงานร่วมกับ repository/database ได้ถูกต้อง

## โครงสร้างที่แนะนำ
```text
component///
  TC01/
    README.md
    create-enrollment.component.spec.ts
    approve-enrollment.component.spec.ts
    generate-certificate.component.spec.ts
  TC02/
    README.md
    create-enrollment.component.spec.ts
    approve-enrollment.component.spec.ts
    generate-certificate.component.spec.ts
  TC03/
    README.md
    fixtures/
    create-enrollment.component.spec.ts
    approve-enrollment.component.spec.ts
    generate-certificate.component.spec.ts
  TC04/
  TC05/
  TC06/
  TC07/
  TC08/
  TC09/
  TC10/
  TC11/
  TC12/
  TC13/
  TC14/
  TC15/
  TC16/
  TC17/
```

## เป้าหมาย
- ทดสอบ `EnrollmentService` กับ repository/in-memory flow ให้เห็น state เปลี่ยนจริง
- ตรวจว่า data ถูกเขียน/อ่านจาก DB ถูกต้อง
- ใช้ mock หรือ Mountebank เฉพาะ external certificate API

## หลักการ
- ใช้ test database แยกจาก production
- seed ข้อมูลก่อน run
- cleanup หลัง run
- assert state ใน DB หลังทำ action
