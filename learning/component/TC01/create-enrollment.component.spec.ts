import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { CertificateService } from 'src/certificate.service.js';
import { EnrollmentService } from 'src/enrollment.service.js';
import {
  InMemoryCertificateApiClient,
  InMemoryCourseRepository,
  InMemoryEnrollmentRepository,
} from 'src/in-memory.js';

describe('TC01 Component - Create Enrollment', () => {
  const courseRepository = new InMemoryCourseRepository([
    {
      id: 'PHY001',
      title: 'Physic with sir title',
      status: 'OPEN',
      seatLimit: 99,
      enrolledCount: 0,
    },
  ]);

  const enrollmentRepository = new InMemoryEnrollmentRepository();

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

  it('creates enrollment and persists PENDING_APPROVAL state', async () => {
    const created = await enrollmentService.createEnrollment({
      employeeId: 'EMP001',
      courseId: 'PHY001',
    });

    expect(created).toEqual({
      enrollmentId: 'ENR001',
      employeeId: 'EMP001',
      courseId: 'PHY001',
      status: 'PENDING_APPROVAL',
    });

    const afterCreate = await enrollmentRepository.findById(created.enrollmentId);
    expect(afterCreate).toMatchObject({
      id: 'ENR001',
      employeeId: 'EMP001',
      courseId: 'PHY001',
      status: 'PENDING_APPROVAL',
    });
  });
});
