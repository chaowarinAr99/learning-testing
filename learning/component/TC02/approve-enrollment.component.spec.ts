import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { CertificateService } from 'src/certificate.service.js';
import { EnrollmentService } from 'src/enrollment.service.js';
import {
  InMemoryCertificateApiClient,
  InMemoryCourseRepository,
  InMemoryEnrollmentRepository,
} from 'src/in-memory.js';

describe('TC02 Component - Approve Enrollment', () => {
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
    {
      id: 'ENR002',
      employeeId: 'EMP002',
      courseId: 'CHE001',
      status: 'PENDING_APPROVAL',
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

  it('approves ENR002 and persists APPROVED state', async () => {
    const approved = await enrollmentService.approveEnrollment({
      enrollmentId: 'ENR002',
      approvedBy: 'HR001',
    });

    expect(approved).toEqual({
      enrollmentId: 'ENR002',
      status: 'APPROVED',
      approvedBy: 'HR001',
      approvedAt: expect.any(String),
    });

    const afterApprove = await enrollmentRepository.findById('ENR002');
    expect(afterApprove).toMatchObject({
      id: 'ENR002',
      employeeId: 'EMP002',
      courseId: 'CHE001',
      status: 'APPROVED',
    });
  });
});
