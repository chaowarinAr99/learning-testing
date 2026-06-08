import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { EnrollmentService } from 'src/enrollment.service.js';
import { BadRequestError } from 'src/errors.js';

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

  it('TC04 - Create enrollment failed when employeeId is missing', async () => {
    const input = {
      employeeId: '',
      courseId: 'COM001',
    };

    await expect(service.createEnrollment(input)).rejects.toThrow(BadRequestError);
    await expect(service.createEnrollment(input)).rejects.toThrow('employeeId is required');
  });
});
