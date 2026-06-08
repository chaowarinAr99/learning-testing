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
      id: 'COM001',
      title: 'Computer with sir title',
      status: 'OPEN',
      seatLimit: 99,
      enrolledCount: 98,
    });

    enrollmentRepository.findActiveByEmployeeAndCourse.mockResolvedValue(null);

    enrollmentRepository.create.mockResolvedValue({
      id: 'ENR003',
      employeeId: 'EMP003',
      courseId: 'COM001',
      status: 'PENDING_APPROVAL',
    });

    const result = await service.createEnrollment({
      employeeId: 'EMP003',
      courseId: 'COM001',
    });

    expect(result).toEqual({
      enrollmentId: 'ENR003',
      employeeId: 'EMP003',
      courseId: 'COM001',
      status: 'PENDING_APPROVAL',
    });

    expect(courseRepository.findById).toHaveBeenCalledWith('COM001');
    expect(enrollmentRepository.findActiveByEmployeeAndCourse).toHaveBeenCalledWith(
      'EMP003',
      'COM001',
    );
    expect(enrollmentRepository.create).toHaveBeenCalledWith({
      employeeId: 'EMP003',
      courseId: 'COM001',
      status: 'PENDING_APPROVAL',
    });
  });
});
