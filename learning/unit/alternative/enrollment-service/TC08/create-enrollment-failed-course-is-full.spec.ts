import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { EnrollmentService } from 'src/enrollment.service.js';
import { CourseFullError } from 'src/errors.js';

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

it('TC08 - Create enrollment failed when course is full', async () => {
  const input = {
    employeeId: 'EMP008',
    courseId: 'BIO001',
  };
  
    courseRepository.findById.mockResolvedValue({
      id: 'BIO001',
      title: 'Chemistry with sir title',
      status: 'OPEN',
      seatLimit: 99,
      enrolledCount: 99,
    });
    await expect(service.createEnrollment(input)).rejects.toThrow(CourseFullError);
    await expect(service.createEnrollment(input)).rejects.toThrow('Course is full');

    expect(courseRepository.findById).toHaveBeenCalledWith('BIO001');
  });
});
