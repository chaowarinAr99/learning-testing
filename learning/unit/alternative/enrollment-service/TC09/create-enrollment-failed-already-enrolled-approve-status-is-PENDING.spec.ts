import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { EnrollmentService } from 'src/enrollment.service.js';
import { DuplicateEnrollmentError } from 'src/errors.js';

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

  it('TC09 - Create enrollment failed when employee already enrolled by approve status is PENDING', async () => {
    const input = {
      employeeId: 'EMP009',
      courseId: 'PHY001',
    };

    courseRepository.findById.mockResolvedValue({
      id: 'PHY001',
      title: 'Physic with sir title',
      status: 'OPEN',
      seatLimit: 97,
      enrolledCount: 2,
    });

    enrollmentRepository.findActiveByEmployeeAndCourse.mockResolvedValue({
      id: 'ENR001',
      employeeId: 'EMP009',
      courseId: 'PHY001',
      status: 'PENDING_APPROVAL',
    });

    await expect(service.createEnrollment(input)).rejects.toThrow(
      DuplicateEnrollmentError,
    );
    await expect(service.createEnrollment(input)).rejects.toThrow(
      'Employee already enrolled',
    );

    expect(courseRepository.findById).toHaveBeenCalledWith('PHY001');
    expect(enrollmentRepository.findActiveByEmployeeAndCourse).toHaveBeenCalledWith(
      'EMP009',
      'PHY001',
    );
    expect(enrollmentRepository.create).not.toHaveBeenCalled();
  });
});
