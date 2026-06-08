# Test Strategy

## ลำดับที่ควรฝึก
1. Unit test ของ `EnrollmentService`
2. Unit test ของ `CertificateService`
3. API test ของ controller
4. Integration test สำหรับ repository behavior

## Unit Test Scope
### EnrollmentService.createEnrollment
- missing `employeeId`
- missing `courseId`
- course not found
- course closed
- course full
- duplicate active enrollment
- duplicate inactive enrollment should allow create
- success path

### EnrollmentService.approveEnrollment
- missing `enrollmentId`
- missing `approvedBy`
- enrollment not found
- status not `PENDING_APPROVAL`
- success path

### EnrollmentService.generateCertificate
- missing `enrollmentId`
- enrollment not found
- enrollment not approved
- progress not 100
- certificate success
- certificate API error
- certificate API timeout

### CertificateService.createCertificate
- missing input fields
- map payload correctly
- valid external response
- invalid external response
- timeout handling
- generic api error handling

## API Test Scope
- ตรวจ status code ให้ตรง spec
- ตรวจ response body shape
- ตรวจ error message
- ตรวจ controller-to-service mapping

## Integration Test Scope
- `findActiveByEmployeeAndCourse` ต้องบล็อกเฉพาะ `PENDING_APPROVAL` และ `APPROVED`
- `updateCertificateStatus` ต้องอัปเดตสถานะถูกต้อง
