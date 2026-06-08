describe('EnrollmentController', () => {
  describe('POST /enrollments', () => {
    it('should return 201 and enrollment payload on success', async () => {
      // TODO: call controller via test module or supertest
      // TODO: assert HTTP 201
      // TODO: assert response shape
      // 
    });
  });

  describe('PATCH /enrollments/:enrollmentId/approve', () => {
    it('should return 200 and approved payload on success', async () => {
      // TODO: assert HTTP 200
    });
  });

  describe('POST /enrollments/:enrollmentId/certificate', () => {
    it('should return 200 on issued certificate', async () => {
      // TODO: assert HTTP 200 and certificateStatus CERTIFICATE_ISSUED
    });
  });
});
