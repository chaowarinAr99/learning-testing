import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { CertificateService } from 'src/certificate.service.js';
import { EnrollmentService } from 'src/enrollment.service.js';
import {
  InMemoryCertificateApiClient,
  InMemoryCourseRepository,
  InMemoryEnrollmentRepository,
} from 'src/in-memory.js';

describe('TC03 Component - Approve Enrollment', () => {
  const courseRepository = new InMemoryCourseRepository([
    {
      id: 'COM001',
      title: 'Communication with sir title',
      status: 'OPEN',
      seatLimit: 99,
      enrolledCount: 0,
    },
  ]);

  const enrollmentRepository = new InMemoryEnrollmentRepository([
    {
      id: 'ENR001',
      employeeId: 'EMP001',
      courseId: 'COM001',
      status: 'REJECTED',
    },
    {
      id: 'ENR002',
      employeeId: 'EMP002',
      courseId: 'COM001',
      status: 'REJECTED',
    },
    {
      id: 'ENR003',
      employeeId: 'EMP003',
      courseId: 'COM001',
      status: 'PENDING_APPROVAL',
    },
  ]);

  const certificateApiClient = new InMemoryCertificateApiClient(async () => ({
    certificate_id: 'CERT003',
    certificate_url: 'https://certificate.example.com/CERT003.pdf',
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

  it('approves ENR003 and persists APPROVED state', async () => {
    const approved = await enrollmentService.approveEnrollment({
      enrollmentId: 'ENR003',
      approvedBy: 'HR002',
    });

    expect(approved).toEqual({
      enrollmentId: 'ENR003',
      status: 'APPROVED',
      approvedBy: 'HR002',
      approvedAt: expect.any(String),
    });

    const afterApprove = await enrollmentRepository.findById('ENR003');
    expect(afterApprove).toMatchObject({
      id: 'ENR003',
      employeeId: 'EMP003',
      courseId: 'COM001',
      status: 'APPROVED',
    });
  });
});
