import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { EnrollmentService } from 'src/enrollment.service.js';

describe('EnrollmentService.rejectEnrollment', () => {
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

  it('rejects pending enrollment', async () => {
    enrollmentRepository.findById.mockResolvedValue({
      id: 'ENR001',
      employeeId: 'EMP001',
      courseId: 'PHY001',
      status: 'PENDING_APPROVAL',
    });

    enrollmentRepository.reject.mockResolvedValue({
      enrollmentId: 'ENR001',
      status: 'REJECTED',
      rejectedBy: 'HR003',
      rejectedAt: '2026-05-15T10:00:00Z',
    });

    const result = await service.rejectEnrollment({
      enrollmentId: 'ENR001',
      rejectedBy: 'HR003',
    });

    expect(result).toEqual({
      enrollmentId: 'ENR001',
      status: 'REJECTED',
      rejectedBy: 'HR003',
      rejectedAt: '2026-05-15T10:00:00Z',
    });

    expect(enrollmentRepository.findById).toHaveBeenCalledWith('ENR001');
    expect(enrollmentRepository.reject).toHaveBeenCalledWith({
      enrollmentId: 'ENR001',
      rejectedBy: 'HR003',
      rejectedAt: expect.any(String),
    });
  });
});
