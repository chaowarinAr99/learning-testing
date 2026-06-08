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
  it('TC12 - Reject enrollment success with ENR012', async () => {
    const input = {
      enrollmentId: 'ENR012',
      rejectedBy: 'HR003',
    };
    enrollmentRepository.findById.mockResolvedValue({
      id: 'ENR012',
      status: 'PENDING_APPROVAL',
    });
    enrollmentRepository.reject.mockResolvedValue({
      enrollmentId: 'ENR012',
      status: 'REJECTED',
      rejectedBy: 'HR003',
      rejectedAt: '2026-05-15T10:00:00Z',
    });
    const result = await service.rejectEnrollment(input);
    expect(result).toEqual({
      enrollmentId: 'ENR012',
      status: 'REJECTED',
      rejectedBy: 'HR003',
      rejectedAt: '2026-05-15T10:00:00Z',
    });
    expect(enrollmentRepository.findById).toHaveBeenCalledWith('ENR012');
    expect(enrollmentRepository.reject).toHaveBeenCalledWith({
      enrollmentId: 'ENR012',
      rejectedBy: 'HR003',
      rejectedAt: expect.any(String),
    });
  });
});