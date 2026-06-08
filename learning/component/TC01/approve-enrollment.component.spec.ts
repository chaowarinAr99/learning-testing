import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { CertificateService } from 'src/certificate.service.js';
import { EnrollmentService } from 'src/enrollment.service.js';
import {
  InMemoryCertificateApiClient,
  InMemoryCourseRepository,
  InMemoryEnrollmentRepository,
} from 'src/in-memory.js';

describe('TC01 Component - Approve Enrollment', () => {
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
      status: 'PENDING_APPROVAL',
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

  it('approves enrollment and persists APPROVED state', async () => {
    const approved = await enrollmentService.approveEnrollment({
      enrollmentId: 'ENR001',
      approvedBy: 'HR001',
    });

    expect(approved).toEqual({
      enrollmentId: 'ENR001',
      status: 'APPROVED',
      approvedBy: 'HR001',
      approvedAt: expect.any(String),
    });

    const afterApprove = await enrollmentRepository.findById('ENR001');
    expect(afterApprove).toMatchObject({
      id: 'ENR001',
      employeeId: 'EMP001',
      courseId: 'PHY001',
      status: 'APPROVED',
    });
    expect(afterApprove?.approvedBy).toBeUndefined();
  });
});
