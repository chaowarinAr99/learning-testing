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

  it('creates enrollment when course is open and no active enrollment exists', async () => {
    courseRepository.findById.mockResolvedValue({
      id: 'CHE001',
      title: 'Chemistry with sir title',
      status: 'OPEN',
      seatLimit: 99,
      enrolledCount: 1,
    });

    enrollmentRepository.findActiveByEmployeeAndCourse.mockResolvedValue(null);

    enrollmentRepository.create.mockResolvedValue({
      id: 'ENR002',
      employeeId: 'EMP002',
      courseId: 'CHE001',
      status: 'PENDING_APPROVAL',
    });

    const result = await service.createEnrollment({
      employeeId: 'EMP002',
      courseId: 'CHE001',
    });

    expect(result).toEqual({
      enrollmentId: 'ENR002',
      employeeId: 'EMP002',
      courseId: 'CHE001',
      status: 'PENDING_APPROVAL',
    });

    expect(courseRepository.findById).toHaveBeenCalledWith('CHE001');
    expect(enrollmentRepository.findActiveByEmployeeAndCourse).toHaveBeenCalledWith(
      'EMP002',
      'CHE001',
    );
    expect(enrollmentRepository.create).toHaveBeenCalledWith({
      employeeId: 'EMP002',
      courseId: 'CHE001',
      status: 'PENDING_APPROVAL',
    });
  });
});
