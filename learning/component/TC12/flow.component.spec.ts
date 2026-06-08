import { afterAll, beforeAll, describe, expect, it } from '@jest/globals';
import { buildEnrollmentFlowApp } from '../test-helpers/enrollment-flow-app.js';
import { InMemoryCourseRepository, InMemoryEnrollmentRepository } from 'src/in-memory.js';

describe('TC12 Component - Enrollment Flow', () => {
  const app = buildEnrollmentFlowApp(
    new InMemoryCourseRepository([
      {
        id: 'PHY001',
        title: 'Physics with sir title',
        status: 'OPEN',
        seatLimit: 99,
        enrolledCount: 0,
      },
    ]),
    new InMemoryEnrollmentRepository([
      { id: 'ENR001', employeeId: 'EMP001', courseId: 'PHY001', status: 'REJECTED' },
      { id: 'ENR002', employeeId: 'EMP002', courseId: 'PHY001', status: 'REJECTED' },
      { id: 'ENR003', employeeId: 'EMP003', courseId: 'PHY001', status: 'REJECTED' },
      { id: 'ENR004', employeeId: 'EMP004', courseId: 'PHY001', status: 'REJECTED' },
      { id: 'ENR005', employeeId: 'EMP005', courseId: 'PHY001', status: 'REJECTED' },
      { id: 'ENR006', employeeId: 'EMP006', courseId: 'PHY001', status: 'REJECTED' },
      { id: 'ENR007', employeeId: 'EMP007', courseId: 'PHY001', status: 'REJECTED' },
      { id: 'ENR008', employeeId: 'EMP008', courseId: 'PHY001', status: 'REJECTED' },
      { id: 'ENR009', employeeId: 'EMP009', courseId: 'PHY001', status: 'REJECTED' },
      { id: 'ENR010', employeeId: 'EMP010', courseId: 'PHY001', status: 'REJECTED' },
      { id: 'ENR011', employeeId: 'EMP011', courseId: 'PHY001', status: 'REJECTED' },
    ]),
    {
      async generateCertificate() {
        return {
          certificate_id: 'CERT012',
          certificate_url: 'https://certificate.example.com/CERT012.pdf',
          status: 'issued',
          issued_at: '2026-05-15T10:00:00Z',
        };
      },
    },
  );

  beforeAll(async () => {
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  it('creates ENR012, rejects it, and blocks certificate generation', async () => {
    const created = await app.inject({
      method: 'POST',
      url: '/enrollments',
      headers: { 'content-type': 'application/json' },
      payload: { employeeId: 'EMP012', courseId: 'PHY001' },
    });

    expect(created.statusCode).toBe(201);
    expect(created.json()).toEqual({
      enrollmentId: 'ENR012',
      employeeId: 'EMP012',
      courseId: 'PHY001',
      status: 'PENDING_APPROVAL',
    });

    const rejected = await app.inject({
      method: 'PATCH',
      url: '/enrollments/ENR012/reject',
      headers: { 'content-type': 'application/json' },
      payload: { rejectedBy: 'HR003' },
    });

    expect(rejected.statusCode).toBe(200);
    expect(rejected.json()).toEqual({
      enrollmentId: 'ENR012',
      status: 'REJECTED',
      rejectedBy: 'HR003',
      rejectedAt: expect.any(String),
    });

    const rejectedCertificate = await app.inject({
      method: 'POST',
      url: '/enrollments/ENR012/certificate',
      headers: { 'content-type': 'application/json' },
      payload: { progress: 99 },
    });

    expect(rejectedCertificate.statusCode).toBe(409);
    expect(rejectedCertificate.json()).toEqual({ message: 'Enrollment is not approved' });
  });
});
