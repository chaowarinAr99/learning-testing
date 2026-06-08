import { afterAll, beforeAll, describe, expect, it } from '@jest/globals';
import { buildCreateEnrollmentApp } from '../test-helpers/create-enrollment-app.js';
import { InMemoryEnrollmentRepository } from 'src/in-memory.js';

describe('TC11 Component - Create Enrollment', () => {
  const courseRepository = {
    async findById() {
      throw new Error('database connection failed');
    },
  };

  const app = buildCreateEnrollmentApp(courseRepository as never, new InMemoryEnrollmentRepository());

  beforeAll(async () => {
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  it('returns 500 when an unexpected error occurs', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/enrollments',
      headers: { 'content-type': 'application/json' },
      payload: { employeeId: 'EMP011', courseId: 'COM001' },
    });

    expect(response.statusCode).toBe(500);
    expect(response.json()).toEqual({ message: 'Internal server error' });
  });
});
