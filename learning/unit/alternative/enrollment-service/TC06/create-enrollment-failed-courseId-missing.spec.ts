import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { EnrollmentService } from 'src/enrollment.service.js';
import { CourseNotFoundError } from 'src/errors.js';

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

  it('TC06 - Create enrollment failed when course is not found', async () => {
    const input = {
      employeeId: 'EMP006',
      courseId: 'BIG001',
    };

    courseRepository.findById.mockResolvedValue(null);
    await expect(service.createEnrollment(input)).rejects.toThrow(CourseNotFoundError);
    await expect(service.createEnrollment(input)).rejects.toThrow('Course not found');

    expect(courseRepository.findById).toHaveBeenCalledWith('BIG001');
  });
});
