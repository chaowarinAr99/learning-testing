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

  it('TC01 creates enrollment when course is open and no active enrollment exists', async () => {
    courseRepository.findById.mockResolvedValue({
      id: 'PHY001',
      title: 'Physic with sir title',
      status: 'OPEN',
      seatLimit: 99,
      enrolledCount: 0,
    });

    enrollmentRepository.findActiveByEmployeeAndCourse.mockResolvedValue(null);

    enrollmentRepository.create.mockResolvedValue({
      id: 'ENR001',
      employeeId: 'EMP001',
      courseId: 'PHY001',
      status: 'PENDING_APPROVAL',
    });

    const result = await service.createEnrollment({
      employeeId: 'EMP001',
      courseId: 'PHY001',
    });

    expect(result).toEqual({
      enrollmentId: 'ENR001',
      employeeId: 'EMP001',
      courseId: 'PHY001',
      status: 'PENDING_APPROVAL',
    });

    expect(courseRepository.findById).toHaveBeenCalledWith('PHY001');
    expect(enrollmentRepository.findActiveByEmployeeAndCourse).toHaveBeenCalledWith(
      'EMP001',
      'PHY001',
    );
    expect(enrollmentRepository.create).toHaveBeenCalledWith({
      employeeId: 'EMP001',
      courseId: 'PHY001',
      status: 'PENDING_APPROVAL',
    });
  });
});
