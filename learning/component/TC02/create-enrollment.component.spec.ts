import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { CertificateService } from 'src/certificate.service.js';
import { EnrollmentService } from 'src/enrollment.service.js';
import {
  InMemoryCertificateApiClient,
  InMemoryCourseRepository,
  InMemoryEnrollmentRepository,
} from 'src/in-memory.js';

describe('TC02 Component - Create Enrollment', () => {
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
      id: 'ENR001',
      employeeId: 'EMP002',
      courseId: 'CHE001',
      status: 'REJECTED',
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

  it('creates enrollment ENR002 and persists PENDING_APPROVAL state', async () => {
    const created = await enrollmentService.createEnrollment({
      employeeId: 'EMP002',
      courseId: 'CHE001',
    });

    expect(created).toEqual({
      enrollmentId: 'ENR002',
      employeeId: 'EMP002',
      courseId: 'CHE001',
      status: 'PENDING_APPROVAL',
    });

    const afterCreate = await enrollmentRepository.findById(created.enrollmentId);
    expect(afterCreate).toMatchObject({
      id: 'ENR002',
      employeeId: 'EMP002',
      courseId: 'CHE001',
      status: 'PENDING_APPROVAL',
    });
  });
});
