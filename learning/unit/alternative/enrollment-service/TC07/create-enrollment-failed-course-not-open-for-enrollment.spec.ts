import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { EnrollmentService } from 'src/enrollment.service.js';
import { CourseClosedError } from 'src/errors.js';

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

it('TC07 - Create enrollment failed when course is not open for enrollment', async () => {
  const input = {
    employeeId: 'EMP007',
    courseId: 'MTH001',
  };
  
    courseRepository.findById.mockResolvedValue({
      id: 'MTH001',
      title: 'Math with sir title',
      status: 'CLOSED',
      seatLimit: 99,
      enrolledCount: 0,
    });
    await expect(service.createEnrollment(input)).rejects.toThrow(CourseClosedError);
    await expect(service.createEnrollment(input)).rejects.toThrow('Course is not open for enrollment');

  expect(courseRepository.findById).toHaveBeenCalledWith('MTH001');
  });
});
