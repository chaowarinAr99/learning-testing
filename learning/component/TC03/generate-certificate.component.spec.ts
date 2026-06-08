import { afterAll, beforeAll, beforeEach, describe, expect, it } from '@jest/globals';
import { readFile } from 'node:fs/promises';
import { spawn, type ChildProcessWithoutNullStreams } from 'node:child_process';
import { resolve } from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';
import { CertificateService } from 'src/certificate.service.js';
import { EnrollmentService } from 'src/enrollment.service.js';
import { InMemoryCourseRepository, InMemoryEnrollmentRepository } from 'src/in-memory.js';

const MB_ADMIN_PORT = 2525;
const MB_BINARY = resolve(process.cwd(), 'node_modules/mountebank/bin/mb');
const FIXTURE_PATH = new URL('./fixtures/certificate-api-success.json', import.meta.url);

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
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify(fixture),
  });

  if (!response.ok) {
    throw new Error(`Failed to create Mountebank imposter: ${response.status}`);
  }
}

async function deleteImposter(): Promise<void> {
  await fetch('http://127.0.0.1:2525/imposters/4545', {
    method: 'DELETE',
  }).catch(() => undefined);
}

describe('TC03 Component - Generate Certificate', () => {
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
    {
      id: 'ENR001',
      employeeId: 'EMP001',
      courseId: 'COM001',
      status: 'REJECTED',
    },
    {
      id: 'ENR002',
      employeeId: 'EMP002',
      courseId: 'COM001',
      status: 'REJECTED',
    },
    {
      id: 'ENR003',
      employeeId: 'EMP003',
      courseId: 'COM001',
      status: 'APPROVED',
    },
  ]);

  let enrollmentService: EnrollmentService;

  beforeAll(async () => {
    mbProcess = spawn(process.execPath, [MB_BINARY, '--port', String(MB_ADMIN_PORT), '--loglevel', 'error'], {
      stdio: 'ignore',
    });

    await waitForMountebank();
    await createImposter();
  });

  afterAll(async () => {
    await deleteImposter();

    if (mbProcess && !mbProcess.killed) {
      mbProcess.kill('SIGTERM');
      await delay(300);
    }
  });

  beforeEach(() => {
    const certificateApiClient = {
      async generateCertificate(payload: {
        refId: string;
        learnerId: string;
        courseRef: string;
      }) {
        const response = await fetch('http://127.0.0.1:4545/generate-certificate', {
          method: 'POST',
          headers: {
            'content-type': 'application/json',
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          throw new Error(`External API returned ${response.status}`);
        }

        return response.json();
      },
    };

    enrollmentService = new EnrollmentService(
      courseRepository as never,
      enrollmentRepository as never,
      new CertificateService(certificateApiClient) as never,
    );
  });

  it('issues certificate CERT003 and persists CERTIFICATE_ISSUED state', async () => {
    const issued = await enrollmentService.generateCertificate({
      enrollmentId: 'ENR003',
      progress: 100,
    });

    expect(issued).toEqual({
      enrollmentId: 'ENR003',
      certificateStatus: 'CERTIFICATE_ISSUED',
      certificate: {
        certificateId: 'CERT003',
        certificateUrl: 'https://certificate.example.com/CERT003.pdf',
        issuedAt: '2026-05-15T10:00:00Z',
      },
    });

    const afterCertificate = await enrollmentRepository.findById('ENR003');
    expect(afterCertificate).toMatchObject({
      id: 'ENR003',
      employeeId: 'EMP003',
      courseId: 'COM001',
      status: 'APPROVED',
      certificateStatus: 'CERTIFICATE_ISSUED',
      certificateUrl: 'https://certificate.example.com/CERT003.pdf',
    });
  });
});
