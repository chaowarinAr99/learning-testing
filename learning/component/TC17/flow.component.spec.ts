import { afterAll, beforeAll, describe, expect, it } from '@jest/globals';
import { readFile } from 'node:fs/promises';
import { spawn, type ChildProcessWithoutNullStreams } from 'node:child_process';
import { resolve } from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';
import { buildEnrollmentFlowApp } from '../test-helpers/enrollment-flow-app.js';
import { InMemoryCourseRepository, InMemoryEnrollmentRepository } from 'src/in-memory.js';

const MB_ADMIN_PORT = 2526;
const MB_BINARY = resolve(process.cwd(), 'node_modules/mountebank/bin/mb');
const FIXTURE_PATH = new URL('./fixtures/certificate-api-error.json', import.meta.url);

let mbProcess: ChildProcessWithoutNullStreams | undefined;

async function waitForMountebank(): Promise<void> {
  for (let attempt = 0; attempt < 50; attempt += 1) {
    try {
      const response = await fetch(`http://127.0.0.1:${MB_ADMIN_PORT}/imposters`);
      if (response.ok) return;
    } catch {
      // retry
    }

    await delay(200);
  }

  throw new Error('Mountebank did not start');
}

async function createImposter(): Promise<void> {
  const fixture = JSON.parse(await readFile(FIXTURE_PATH, 'utf8')) as {
    port: number;
    protocol: string;
    name: string;
    stubs: unknown[];
  };

  const response = await fetch(`http://127.0.0.1:${MB_ADMIN_PORT}/imposters`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(fixture),
  });

  if (!response.ok) {
    throw new Error(`Failed to create Mountebank imposter: ${response.status}`);
  }
}

async function deleteImposter(): Promise<void> {
  await fetch('http://127.0.0.1:2526/imposters/4546', { method: 'DELETE' }).catch(() => undefined);
}

describe('TC17 Component - Certificate API Error', () => {
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
    { id: 'ENR014', employeeId: 'EMP014', courseId: 'COM001', status: 'APPROVED' },
    { id: 'ENR015', employeeId: 'EMP015', courseId: 'PHY001', status: 'REJECTED' },
    { id: 'ENR016', employeeId: 'EMP016', courseId: 'CHE001', status: 'REJECTED' },
  ]);

  const app = buildEnrollmentFlowApp(courseRepository, enrollmentRepository, {
    async generateCertificate(payload) {
      const response = await fetch('http://127.0.0.1:4546/generate-certificate', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Cannot generate certificate');
      }

      return response.json();
    },
  });

  beforeAll(async () => {
    mbProcess = spawn(process.execPath, [MB_BINARY, '--port', String(MB_ADMIN_PORT), '--loglevel', 'error'], {
      stdio: 'ignore',
    });

    await waitForMountebank();
    await createImposter();
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
    await deleteImposter();

    if (mbProcess && !mbProcess.killed) {
      mbProcess.kill('SIGTERM');
      await delay(300);
    }
  });

  it('creates ENR017, approves it, and marks certificate as failed on API error', async () => {
    const created = await app.inject({
      method: 'POST',
      url: '/enrollments',
      headers: { 'content-type': 'application/json' },
      payload: { employeeId: 'EMP017', courseId: 'COM001' },
    });

    expect(created.statusCode).toBe(201);
    expect(created.json()).toEqual({
      enrollmentId: 'ENR017',
      employeeId: 'EMP017',
      courseId: 'COM001',
      status: 'PENDING_APPROVAL',
    });

    const approved = await app.inject({
      method: 'PATCH',
      url: '/enrollments/ENR017/approve',
      headers: { 'content-type': 'application/json' },
      payload: { approvedBy: 'HR003' },
    });

    expect(approved.statusCode).toBe(200);
    expect(approved.json()).toEqual({
      enrollmentId: 'ENR017',
      status: 'APPROVED',
      approvedBy: 'HR003',
      approvedAt: expect.any(String),
    });

    const certificate = await app.inject({
      method: 'POST',
      url: '/enrollments/ENR017/certificate',
      headers: { 'content-type': 'application/json' },
      payload: { progress: 100 },
    });

    expect(certificate.statusCode).toBe(502);
    expect(certificate.json()).toEqual({
      message: 'Cannot generate certificate',
      code: 'CERTIFICATE_API_ERROR',
    });

    expect(await enrollmentRepository.findById('ENR017')).toMatchObject({
      id: 'ENR017',
      employeeId: 'EMP017',
      courseId: 'COM001',
      status: 'APPROVED',
      certificateStatus: 'CERTIFICATE_FAILED',
    });
  });
});
