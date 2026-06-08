# Unit Test Layout

โครงนี้แยกตาม service และ method เพื่อให้ test อ่านง่ายและไม่ปนกัน

## โครงสร้าง
```text
unit/
  enrollment-service/
    TC01/
      create-enrollment.spec.ts
      approve-enrollment.spec.ts
      reject-enrollment.spec.ts
      generate-certificate.spec.ts
  certificate-service/
    TC01/
      create-certificate.spec.ts
```

## Mapping
- `enrollment-service/TC01/*` = เคสสมัคร/อนุมัติ/reject/certificate ของ scenario แรก
- `certificate-service/TC01/*` = unit test ของ external certificate flow สำหรับ scenario แรก

## แนวทาง
- mock repository และ external client ทุกตัว
- test 1 case ต่อ 1 it
- แยก success / error ให้ชัด
- ใช้ชื่อ test ที่บอกเงื่อนไขและ expected result
