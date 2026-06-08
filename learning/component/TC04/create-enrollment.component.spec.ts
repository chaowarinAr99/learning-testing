import { afterAll, beforeAll, describe, expect, it } from '@jest/globals';
import { buildCreateEnrollmentApp } from '../test-helpers/create-enrollment-app.js';
import { InMemoryCourseRepository, InMemoryEnrollmentRepository } from 'src/in-memory.js';

describe('TC04 Component - Create Enrollment', () => {
  const app = buildCreateEnrollmentApp(
    new InMemoryCourseRepository([
      {
        id: 'COM001',
        title: 'Communication with sir title',
        status: 'OPEN',
        seatLimit: 99,
        enrolledCount: 0,
      },
    ]),
    new InMemoryEnrollmentRepository(),
  );

  beforeAll(async () => {
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  it('returns 400 when employeeId is missing', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/enrollments',
      headers: { 'content-type': 'application/json' },
      payload: { employeeId: null, courseId: 'COM001' },
    });

    expect(response.statusCode).toBe(400);
    expect(response.json()).toEqual({ message: 'employeeId is required' });
  });
});
