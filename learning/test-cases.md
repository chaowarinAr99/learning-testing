# Test Cases

## 1. Create Enrollment

| Case | Input | Expected |
|---|---|---|
| success | valid employeeId/courseId | create `PENDING_APPROVAL` |
| missing employeeId | empty employeeId | `400` |
| missing courseId | empty courseId | `400` |
| course not found | course not found | `404` |
| course closed | status = `CLOSED` | `409` |
| course full | enrolledCount >= seatLimit | `409` |
| duplicate active | existing `PENDING_APPROVAL` / `APPROVED` | `409` |
| duplicate inactive | existing `REJECTED` only | allow create |

## 2. Approve Enrollment

| Case | Input | Expected |
|---|---|---|
| success | valid enrollmentId + approvedBy | `APPROVED` |
| missing enrollmentId | empty | `400` |
| missing approvedBy | empty | `400` |
| not found | enrollment missing | `404` |
| invalid status | not `PENDING_APPROVAL` | `409` |

## 3. Generate Certificate

| Case | Input | Expected |
|---|---|---|
| success | approved + progress 100 + external success | `CERTIFICATE_ISSUED` |
| not found | enrollment missing | `404` |
| not approved | status not `APPROVED` | `409` |
| progress not 100 | progress < 100 | `409` |
| external error | external client throws error | `CERTIFICATE_FAILED` |
| timeout | external client timeout | `CERTIFICATE_FAILED` / or `504` if you align spec |

## 4. Certificate Service

| Case | Input | Expected |
|---|---|---|
| missing enrollmentId | empty | throw bad request |
| missing employeeId | empty | throw bad request |
| missing courseId | empty | throw bad request |
| invalid response | missing certificate_id/url/issued_at | throw invalid response |
