import { afterAll, beforeAll, describe, expect, it } from '@jest/globals';
import { buildEnrollmentFlowApp } from '../test-helpers/enrollment-flow-app.js';
import { InMemoryCourseRepository, InMemoryEnrollmentRepository } from 'src/in-memory.js';

describe('TC14 Component - Enrollment Flow', () => {
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
    { id: 'ENR001', employeeId: 'EMP001', courseId: 'COM001', status: 'REJECTED' },
    { id: 'ENR002', employeeId: 'EMP002', courseId: 'COM001', status: 'REJECTED' },
    { id: 'ENR003', employeeId: 'EMP003', courseId: 'COM001', status: 'REJECTED' },
    { id: 'ENR004', employeeId: 'EMP004', courseId: 'COM001', status: 'REJECTED' },
    { id: 'ENR005', employeeId: 'EMP005', courseId: 'COM001', status: 'REJECTED' },
    { id: 'ENR006', employeeId: 'EMP006', courseId: 'COM001', status: 'REJECTED' },
    { id: 'ENR007', employeeId: 'EMP007', courseId: 'COM001', status: 'REJECTED' },
    { id: 'ENR008', employeeId: 'EMP008', courseId: 'COM001', status: 'REJECTED' },
    { id: 'ENR009', employeeId: 'EMP009', courseId: 'COM001', status: 'REJECTED' },
    { id: 'ENR010', employeeId: 'EMP010', courseId: 'COM001', status: 'REJECTED' },
    { id: 'ENR011', employeeId: 'EMP011', courseId: 'COM001', status: 'REJECTED' },
    { id: 'ENR012', employeeId: 'EMP012', courseId: 'PHY001', status: 'REJECTED' },
    { id: 'ENR013', employeeId: 'EMP013', courseId: 'CHE001', status: 'APPROVED' },
  ]);

  const app = buildEnrollmentFlowApp(courseRepository, enrollmentRepository, {
    async generateCertificate() {
      throw new Error('should not be called for progress 0');
    },
  });

  beforeAll(async () => {
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  it('creates ENR014, approves it, and blocks certificate generation at progress 0', async () => {
    const created = await app.inject({
      method: 'POST',
      url: '/enrollments',
      headers: { 'content-type': 'application/json' },
      payload: { employeeId: 'EMP014', courseId: 'COM001' },
    });

    expect(created.statusCode).toBe(201);
    expect(created.json()).toEqual({
      enrollmentId: 'ENR014',
      employeeId: 'EMP014',
      courseId: 'COM001',
      status: 'PENDING_APPROVAL',
    });

    const approved = await app.inject({
      method: 'PATCH',
      url: '/enrollments/ENR014/approve',
      headers: { 'content-type': 'application/json' },
      payload: { approvedBy: 'HR001' },
    });

    expect(approved.statusCode).toBe(200);
    expect(approved.json()).toEqual({
      enrollmentId: 'ENR014',
      status: 'APPROVED',
      approvedBy: 'HR001',
      approvedAt: expect.any(String),
    });

    const rejectedCertificate = await app.inject({
      method: 'POST',
      url: '/enrollments/ENR014/certificate',
      headers: { 'content-type': 'application/json' },
      payload: { progress: 0 },
    });

    expect(rejectedCertificate.statusCode).toBe(409);
    expect(rejectedCertificate.json()).toEqual({ message: 'Progress must be 100%' });

    expect(await enrollmentRepository.findById('ENR014')).toMatchObject({
      id: 'ENR014',
      employeeId: 'EMP014',
      courseId: 'COM001',
      status: 'APPROVED',
    });
  });
});
