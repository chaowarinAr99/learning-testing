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
      id: 'ENR002',
      employeeId: 'EMP002',
      courseId: 'CHE001',
      status: 'APPROVED',
    });

    certificateService.createCertificate.mockResolvedValue({
      certificateId: 'CERT002',
      certificateUrl: 'https://certificate.example.com/CERT002.pdf',
      issuedAt: '2026-05-15T10:00:00Z',
    });

    enrollmentRepository.updateCertificateStatus.mockResolvedValue(undefined);

    const result = await service.generateCertificate({
      enrollmentId: 'ENR002',
      progress: 100,
    });

    expect(result).toEqual({
      enrollmentId: 'ENR002',
      certificateStatus: 'CERTIFICATE_ISSUED',
      certificate: {
        certificateId: 'CERT002',
        certificateUrl: 'https://certificate.example.com/CERT002.pdf',
        issuedAt: '2026-05-15T10:00:00Z',
      },
    });

    expect(enrollmentRepository.findById).toHaveBeenCalledWith('ENR002');
    expect(certificateService.createCertificate).toHaveBeenCalledWith({
      enrollmentId: 'ENR002',
      employeeId: 'EMP002',
      courseId: 'CHE001',
    });
    expect(enrollmentRepository.updateCertificateStatus).toHaveBeenCalledWith({
      enrollmentId: 'ENR002',
      certificateStatus: 'CERTIFICATE_ISSUED',
      certificateUrl: 'https://certificate.example.com/CERT002.pdf',
    });
  });
});
