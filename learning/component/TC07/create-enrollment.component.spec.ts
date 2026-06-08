import { afterAll, beforeAll, describe, expect, it } from '@jest/globals';
import { buildCreateEnrollmentApp } from '../test-helpers/create-enrollment-app.js';
import { InMemoryCourseRepository, InMemoryEnrollmentRepository } from 'src/in-memory.js';

describe('TC07 Component - Create Enrollment', () => {
  const app = buildCreateEnrollmentApp(
    new InMemoryCourseRepository([
      {
        id: 'MTH001',
        title: 'Math with sir title',
        status: 'CLOSED',
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

  it('returns 409 when course is not open for enrollment', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/enrollments',
      headers: { 'content-type': 'application/json' },
      payload: { employeeId: 'EMP007', courseId: 'MTH001' },
    });

    expect(response.statusCode).toBe(409);
    expect(response.json()).toEqual({ message: 'Course is not open for enrollment' });
  });
});
