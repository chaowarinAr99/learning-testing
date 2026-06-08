import { afterAll, beforeAll, describe, expect, it } from '@jest/globals';
import { buildCreateEnrollmentApp } from '../test-helpers/create-enrollment-app.js';
import { InMemoryCourseRepository, InMemoryEnrollmentRepository } from 'src/in-memory.js';

describe('TC09 Component - Create Enrollment', () => {
  const app = buildCreateEnrollmentApp(
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
      {
        id: 'ENR001',
        employeeId: 'EMP009',
        courseId: 'PHY001',
        status: 'PENDING_APPROVAL',
      },
    ]),
  );

  beforeAll(async () => {
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  it('returns 409 when active duplicate enrollment exists for PHY001', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/enrollments',
      headers: { 'content-type': 'application/json' },
      payload: { employeeId: 'EMP009', courseId: 'PHY001' },
    });

    expect(response.statusCode).toBe(409);
    expect(response.json()).toEqual({ message: 'Employee already enrolled' });
  });
});
