import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { CertificateService } from 'src/certificate.service.js';
import { EnrollmentService } from 'src/enrollment.service.js';
import {
  InMemoryCertificateApiClient,
  InMemoryCourseRepository,
  InMemoryEnrollmentRepository,
} from 'src/in-memory.js';

describe('TC02 Component - Generate Certificate', () => {
  const courseRepository = new InMemoryCourseRepository([
    {
      id: 'CHE001',
      title: 'Chemistry with sir title',
      status: 'OPEN',
      seatLimit: 99,
      enrolledCount: 0,
    },
  ]);

  const enrollmentRepository = new InMemoryEnrollmentRepository([
    {
      id: 'ENR002',
      employeeId: 'EMP002',
      courseId: 'CHE001',
      status: 'APPROVED',
    },
  ]);

  const certificateApiClient = new InMemoryCertificateApiClient(async () => ({
    certificate_id: 'CERT002',
    certificate_url: 'https://certificate.example.com/CERT002.pdf',
    status: 'issued',
    issued_at: '2026-05-15T10:00:00Z',
  }));

  let enrollmentService: EnrollmentService;

  beforeEach(() => {
    jest.clearAllMocks();
    enrollmentService = new EnrollmentService(
      courseRepository as never,
      enrollmentRepository as never,
      new CertificateService(certificateApiClient) as never,
    );
  });

  it('issues certificate CERT002 and persists CERTIFICATE_ISSUED state', async () => {
    const issued = await enrollmentService.generateCertificate({
      enrollmentId: 'ENR002',
      progress: 100,
    });

    expect(issued).toEqual({
      enrollmentId: 'ENR002',
      certificateStatus: 'CERTIFICATE_ISSUED',
      certificate: {
        certificateId: 'CERT002',
        certificateUrl: 'https://certificate.example.com/CERT002.pdf',
        issuedAt: '2026-05-15T10:00:00Z',
      },
    });

    const afterCertificate = await enrollmentRepository.findById('ENR002');
    expect(afterCertificate).toMatchObject({
      id: 'ENR002',
      employeeId: 'EMP002',
      courseId: 'CHE001',
      status: 'APPROVED',
      certificateStatus: 'CERTIFICATE_ISSUED',
      certificateUrl: 'https://certificate.example.com/CERT002.pdf',
    });
  });
});
