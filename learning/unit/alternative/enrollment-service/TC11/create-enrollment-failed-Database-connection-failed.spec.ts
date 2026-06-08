import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { EnrollmentService } from 'src/enrollment.service.js';

describe('EnrollmentService.createEnrollment', () => {
  const courseRepository = {
    findById: jest.fn(),
  };

  const enrollmentRepository = {
    findActiveByEmployeeAndCourse: jest.fn(),
    create: jest.fn(),
    findById: jest.fn(),
    approve: jest.fn(),
    reject: jest.fn(),
    updateCertificateStatus: jest.fn(),
  };

  const certificateService = {
    createCertificate: jest.fn(),
  };

  let service: EnrollmentService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new EnrollmentService(
      courseRepository as never,
      enrollmentRepository as never,
      certificateService as never,
    );
  });

it('TC11 - Create enrollment failed by Database connection failed', async () => {
  const input = {
    employeeId: 'EMP011',
    courseId: 'COM001',
  };

  courseRepository.findById.mockResolvedValue({
    id: 'COM001',
    status: 'OPEN',
    seatLimit: 99,
    enrolledCount: 98,
  });
  
  enrollmentRepository.findActiveByEmployeeAndCourse.mockResolvedValue(null);
  enrollmentRepository.create.mockRejectedValue(new Error('Database connection failed'));
  await expect(service.createEnrollment(input)).rejects.toThrow('Database connection failed');
});
});
