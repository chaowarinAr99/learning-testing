import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { EnrollmentService } from 'src/enrollment.service.js';

describe('EnrollmentService.generateCertificate', () => {
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

  it('issues certificate when approved and progress is 100', async () => {
    enrollmentRepository.findById.mockResolvedValue({
      id: 'ENR001',
      employeeId: 'EMP001',
      courseId: 'PHY001',
      status: 'APPROVED',
    });

    certificateService.createCertificate.mockResolvedValue({
      certificateId: 'CERT001',
      certificateUrl: 'https://certificate.example.com/CERT001.pdf',
      issuedAt: '2026-05-15T10:00:00Z',
    });

    enrollmentRepository.updateCertificateStatus.mockResolvedValue(undefined);

    const result = await service.generateCertificate({
      enrollmentId: 'ENR001',
      progress: 100,
    });

    expect(result).toEqual({
      enrollmentId: 'ENR001',
      certificateStatus: 'CERTIFICATE_ISSUED',
      certificate: {
        certificateId: 'CERT001',
        certificateUrl: 'https://certificate.example.com/CERT001.pdf',
        issuedAt: '2026-05-15T10:00:00Z',
      },
    });

    expect(enrollmentRepository.findById).toHaveBeenCalledWith('ENR001');
    expect(certificateService.createCertificate).toHaveBeenCalledWith({
      enrollmentId: 'ENR001',
      employeeId: 'EMP001',
      courseId: 'PHY001',
    });
    expect(enrollmentRepository.updateCertificateStatus).toHaveBeenCalledWith({
      enrollmentId: 'ENR001',
      certificateStatus: 'CERTIFICATE_ISSUED',
      certificateUrl: 'https://certificate.example.com/CERT001.pdf',
    });
  });
});
