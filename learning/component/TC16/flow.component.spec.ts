import { afterAll, beforeAll, describe, expect, it } from '@jest/globals';
import { buildEnrollmentFlowApp } from '../test-helpers/enrollment-flow-app.js';
import { InMemoryCourseRepository, InMemoryEnrollmentRepository } from 'src/in-memory.js';

describe('TC16 Component - Enrollment Flow', () => {
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
    { id: 'ENR001', employeeId: 'EMP001', courseId: 'CHE001', status: 'REJECTED' },
    { id: 'ENR002', employeeId: 'EMP002', courseId: 'CHE001', status: 'REJECTED' },
    { id: 'ENR003', employeeId: 'EMP003', courseId: 'CHE001', status: 'REJECTED' },
    { id: 'ENR004', employeeId: 'EMP004', courseId: 'CHE001', status: 'REJECTED' },
    { id: 'ENR005', employeeId: 'EMP005', courseId: 'CHE001', status: 'REJECTED' },
    { id: 'ENR006', employeeId: 'EMP006', courseId: 'CHE001', status: 'REJECTED' },
    { id: 'ENR007', employeeId: 'EMP007', courseId: 'CHE001', status: 'REJECTED' },
    { id: 'ENR008', employeeId: 'EMP008', courseId: 'CHE001', status: 'REJECTED' },
    { id: 'ENR009', employeeId: 'EMP009', courseId: 'CHE001', status: 'REJECTED' },
    { id: 'ENR010', employeeId: 'EMP010', courseId: 'CHE001', status: 'REJECTED' },
    { id: 'ENR011', employeeId: 'EMP011', courseId: 'CHE001', status: 'REJECTED' },
    { id: 'ENR012', employeeId: 'EMP012', courseId: 'PHY001', status: 'REJECTED' },
    { id: 'ENR013', employeeId: 'EMP013', courseId: 'CHE001', status: 'APPROVED' },
    { id: 'ENR014', employeeId: 'EMP014', courseId: 'COM001', status: 'APPROVED' },
    { id: 'ENR015', employeeId: 'EMP015', courseId: 'PHY001', status: 'REJECTED' },
  ]);

  const app = buildEnrollmentFlowApp(courseRepository, enrollmentRepository, {
    async generateCertificate() {
      throw new Error('should not be called when enrollment is rejected');
    },
  });

  beforeAll(async () => {
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  it('creates ENR016, rejects it, and blocks certificate generation', async () => {
    const created = await app.inject({
      method: 'POST',
      url: '/enrollments',
      headers: { 'content-type': 'application/json' },
      payload: { employeeId: 'EMP016', courseId: 'CHE001' },
    });

    expect(created.statusCode).toBe(201);
    expect(created.json()).toEqual({
      enrollmentId: 'ENR016',
      employeeId: 'EMP016',
      courseId: 'CHE001',
      status: 'PENDING_APPROVAL',
    });

    const rejected = await app.inject({
      method: 'PATCH',
      url: '/enrollments/ENR016/reject',
      headers: { 'content-type': 'application/json' },
      payload: { rejectedBy: 'HR003' },
    });

    expect(rejected.statusCode).toBe(200);
    expect(rejected.json()).toEqual({
      enrollmentId: 'ENR016',
      status: 'REJECTED',
      rejectedBy: 'HR003',
      rejectedAt: expect.any(String),
    });

    const rejectedCertificate = await app.inject({
      method: 'POST',
      url: '/enrollments/ENR016/certificate',
      headers: { 'content-type': 'application/json' },
      payload: { progress: 0 },
    });

    expect(rejectedCertificate.statusCode).toBe(409);
    expect(rejectedCertificate.json()).toEqual({ message: 'Enrollment is not approved' });

    expect(await enrollmentRepository.findById('ENR016')).toMatchObject({
      id: 'ENR016',
      employeeId: 'EMP016',
      courseId: 'CHE001',
      status: 'REJECTED',
    });
  });
});
