import { afterAll, beforeAll, describe, expect, it } from '@jest/globals';
import { buildCreateEnrollmentApp } from '../test-helpers/create-enrollment-app.js';
import { InMemoryCourseRepository, InMemoryEnrollmentRepository } from 'src/in-memory.js';

describe('TC08 Component - Create Enrollment', () => {
  const app = buildCreateEnrollmentApp(
    new InMemoryCourseRepository([
      {
        id: 'BIO001',
        title: 'Biology with sir title',
        status: 'OPEN',
        seatLimit: 1,
        enrolledCount: 1,
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

  it('returns 409 when course is full', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/enrollments',
      headers: { 'content-type': 'application/json' },
      payload: { employeeId: 'EMP008', courseId: 'BIO001' },
    });

    expect(response.statusCode).toBe(409);
    expect(response.json()).toEqual({ message: 'Course is full' });
  });
});
