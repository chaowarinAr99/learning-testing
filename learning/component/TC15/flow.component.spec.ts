import { afterAll, beforeAll, describe, expect, it } from '@jest/globals';
import { buildEnrollmentFlowApp } from '../test-helpers/enrollment-flow-app.js';
import { InMemoryCourseRepository, InMemoryEnrollmentRepository } from 'src/in-memory.js';

describe('TC15 Component - Enrollment Flow', () => {
  const courseRepository = new InMemoryCourseRepository([
    {
      id: 'PHY001',
      title: 'Physics with sir title',
      status: 'OPEN',
      seatLimit: 99,
      enrolledCount: 0,
    },
  ]);

  const enrollmentRepository = new InMemoryEnrollmentRepository([
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
    { id: 'ENR012', employeeId: 'EMP012', courseId: 'PHY001', status: 'REJECTED' },
    { id: 'ENR013', employeeId: 'EMP013', courseId: 'CHE001', status: 'APPROVED' },
    { id: 'ENR014', employeeId: 'EMP014', courseId: 'COM001', status: 'APPROVED' },
  ]);

  const app = buildEnrollmentFlowApp(courseRepository, enrollmentRepository, {
    async generateCertificate() {
      throw new Error('should not be called when enrollment is not approved');
    },
  });

  beforeAll(async () => {
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  it('creates ENR015 and blocks certificate generation because enrollment is not approved', async () => {
    const created = await app.inject({
      method: 'POST',
      url: '/enrollments',
      headers: { 'content-type': 'application/json' },
      payload: { employeeId: 'EMP015', courseId: 'PHY001' },
    });

    expect(created.statusCode).toBe(201);
    expect(created.json()).toEqual({
      enrollmentId: 'ENR015',
      employeeId: 'EMP015',
      courseId: 'PHY001',
      status: 'PENDING_APPROVAL',
    });

    const rejectedCertificate = await app.inject({
      method: 'POST',
      url: '/enrollments/ENR015/certificate',
      headers: { 'content-type': 'application/json' },
      payload: { progress: 0 },
    });

    expect(rejectedCertificate.statusCode).toBe(409);
    expect(rejectedCertificate.json()).toEqual({ message: 'Enrollment is not approved' });

    expect(await enrollmentRepository.findById('ENR015')).toMatchObject({
      id: 'ENR015',
      employeeId: 'EMP015',
      courseId: 'PHY001',
      status: 'PENDING_APPROVAL',
    });
  });
});
