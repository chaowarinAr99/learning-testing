import Fastify from 'fastify';
import { CertificateService } from './certificate.service.js';
import { EnrollmentController } from './enrollment.controller.js';
import { EnrollmentExceptionFilter } from './enrollment-exception-filter.js';
import { EnrollmentService } from './enrollment.service.js';
import { connectMongo } from './mongo.js';

type CreateEnrollmentBody = {
  employeeId?: string;
  courseId?: string;
};

type ApproveEnrollmentBody = {
  approvedBy?: string;
};

type GenerateCertificateBody = {
  progress?: number;
};

function toHttpError(reply: any, error: Error) {
  const filter = new EnrollmentExceptionFilter();
  return filter.catch(error, {
    status(code: number) {
      return {
        json(payload: unknown) {
          return reply.code(code).send(payload);
        },
      };
    },
  });
}

async function bootstrap() {
  const port = Number(process.env.PORT ?? 3000);
  const fastify = Fastify({ logger: true });

  const { client, courseRepository, enrollmentRepository } = await connectMongo();

  let certificateApiMode: 'success' | 'error' | 'timeout' = 'success';

  const certificateApiClient = {
    async generateCertificate(payload: {
      refId: string;
      learnerId: string;
      courseRef: string;
    }) {
      const failMode = certificateApiMode || process.env.CERTIFICATE_API_MODE;

      if (failMode === 'timeout') {
        const error = new Error('timeout') as Error & { code?: string };
        error.code = 'TIMEOUT';
        throw error;
      }

      if (failMode === 'error') {
        throw new Error('external certificate api failed');
      }

      return {
        certificate_id: `CERT-${payload.refId}`,
        certificate_url: `https://certificate.example.com/${payload.refId}.pdf`,
        status: 'issued' as const,
        issued_at: new Date().toISOString(),
      };
    },
  };

  const certificateService = new CertificateService(certificateApiClient);
  const enrollmentService = new EnrollmentService(
    courseRepository,
    enrollmentRepository,
    certificateService,
  );
  const controller = new EnrollmentController(enrollmentService);

  fastify.get('/health', async () => ({ status: 'ok' }));

  fastify.post('/enrollments', async (request, reply) => {
    try {
      const body = (request.body ?? {}) as CreateEnrollmentBody;
      const result = await controller.createEnrollment({
        employeeId: body.employeeId ?? '',
        courseId: body.courseId ?? '',
      });

      return reply.code(201).send(result);
    } catch (error) {
      return toHttpError(reply, error as Error);
    }
  });

  fastify.patch('/enrollments/:enrollmentId/approve', async (request, reply) => {
    try {
      const params = request.params as { enrollmentId: string };
      const body = (request.body ?? {}) as ApproveEnrollmentBody;

      const result = await controller.approveEnrollment(params.enrollmentId, {
        approvedBy: body.approvedBy ?? '',
      });

      return reply.code(200).send(result);
    } catch (error) {
      return toHttpError(reply, error as Error);
    }
  });

  fastify.patch('/enrollments/:enrollmentId/reject', async (request, reply) => {
    try {
      const params = request.params as { enrollmentId: string };
      const body = (request.body ?? {}) as { rejectedBy?: string };

      const result = await controller.rejectEnrollment(params.enrollmentId, {
        rejectedBy: body.rejectedBy ?? '',
      });

      return reply.code(200).send(result);
    } catch (error) {
      return toHttpError(reply, error as Error);
    }
  });

  fastify.post('/enrollments/:enrollmentId/certificate', async (request, reply) => {
    try {
      const params = request.params as { enrollmentId: string };
      const body = (request.body ?? {}) as GenerateCertificateBody;
      certificateApiMode = (request.headers['x-certificate-api-mode'] as
        | 'success'
        | 'error'
        | 'timeout'
        | undefined) ?? 'success';

      const result = await controller.generateCertificate(params.enrollmentId, {
        progress: Number(body.progress ?? 0),
      });

      certificateApiMode = 'success';
      return reply.code(200).send(result);
    } catch (error) {
      certificateApiMode = 'success';
      return toHttpError(reply, error as Error);
    }
  });

  const shutdown = async () => {
    await fastify.close();
    await client.close();
  };

  process.on('SIGINT', () => void shutdown());
  process.on('SIGTERM', () => void shutdown());

  await fastify.listen({ host: '0.0.0.0', port });
}

void bootstrap();
