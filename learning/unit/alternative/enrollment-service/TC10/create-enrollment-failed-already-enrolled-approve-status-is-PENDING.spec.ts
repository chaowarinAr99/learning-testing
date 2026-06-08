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

  it('TC10 - Create enrollment failed when employee already enrolled by approve status is APPROVED', async () => {
    const input = {
      employeeId: 'EMP010',
      courseId: 'CHE001',
    };

    courseRepository.findById.mockResolvedValue({
      id: 'CHE001',
      title: 'Chemistry with sir title',
      status: 'OPEN',
      seatLimit: 98,
      enrolledCount: 1,
    });

    enrollmentRepository.findActiveByEmployeeAndCourse.mockResolvedValue({
      id: 'ENR010',
      employeeId: 'EMP010',
      courseId: 'CHE001',
      status: 'APPROVED',
    });

    await expect(service.createEnrollment(input)).rejects.toThrow(
      DuplicateEnrollmentError,
    );
    await expect(service.createEnrollment(input)).rejects.toThrow(
      'Employee already enrolled',
    );

    expect(courseRepository.findById).toHaveBeenCalledWith('CHE001');
    expect(enrollmentRepository.findActiveByEmployeeAndCourse).toHaveBeenCalledWith(
      'EMP010',
      'CHE001',
    );
    expect(enrollmentRepository.create).not.toHaveBeenCalled();
  });
});
