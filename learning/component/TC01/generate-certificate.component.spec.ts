import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { CertificateService } from 'src/certificate.service.js';
import { EnrollmentService } from 'src/enrollment.service.js';
import {
  InMemoryCertificateApiClient,
  InMemoryCourseRepository,
  InMemoryEnrollmentRepository,
} from 'src/in-memory.js';

describe('TC01 Component - Generate Certificate', () => {
  const courseRepository = new InMemoryCourseRepository([
    {
      id: 'PHY001',
      title: 'Physic with sir title',
      status: 'OPEN',
      seatLimit: 99,
      enrolledCount: 0,
    },
  ]);

  const enrollmentRepository = new InMemoryEnrollmentRepository([
    {
      id: 'ENR001',
      employeeId: 'EMP001',
      courseId: 'PHY001',
      status: 'APPROVED',
    },
  ]);

  const certificateApiClient = new InMemoryCertificateApiClient(async (payload) => ({
    certificate_id: `CERT-${payload.refId}`,
    certificate_url: `https://certificate.example.com/CERT-${payload.refId}.pdf`,
    status: 'issued',
    issued_at: new Date().toISOString(),
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

  it('issues certificate and persists CERTIFICATE_ISSUED state', async () => {
    const issued = await enrollmentService.generateCertificate({
      enrollmentId: 'ENR001',
      progress: 100,
    });

    expect(issued.certificateStatus).toBe('CERTIFICATE_ISSUED');
    expect(issued.certificate?.certificateId).toBe('CERT-ENR001');

    const afterCertificate = await enrollmentRepository.findById('ENR001');
    expect(afterCertificate).toMatchObject({
      id: 'ENR001',
      status: 'APPROVED',
      certificateStatus: 'CERTIFICATE_ISSUED',
      certificateUrl: 'https://certificate.example.com/CERT-ENR001.pdf',
    });
  });
});
