import Fastify from 'fastify';
import { CertificateService } from 'src/certificate.service.js';
import { EnrollmentController } from 'src/enrollment.controller.js';
import { EnrollmentExceptionFilter } from 'src/enrollment-exception-filter.js';
import { EnrollmentService } from 'src/enrollment.service.js';

export function buildEnrollmentFlowApp(courseRepository, enrollmentRepository, certificateApiClient) {
  const fastify = Fastify({ logger: false });
  const filter = new EnrollmentExceptionFilter();
  const controller = new EnrollmentController(
    new EnrollmentService(
      courseRepository,
      enrollmentRepository,
      new CertificateService(certificateApiClient),
    ),
  );

  fastify.post('/enrollments', async (request, reply) => {
    try {
      const body = request.body;
      const result = await controller.createEnrollment({
        employeeId: body?.employeeId ?? '',
        courseId: body?.courseId ?? '',
      });
      return reply.code(201).send(result);
    } catch (error) {
      return filter.catch(error, {
        status(code) {
          return {
            json(payload) {
              return reply.code(code).send(payload);
            },
          };
        },
      });
    }
  });

  fastify.patch('/enrollments/:enrollmentId/approve', async (request, reply) => {
    try {
      const params = request.params;
      const body = request.body;
      const result = await controller.approveEnrollment(params.enrollmentId, {
        approvedBy: body?.approvedBy ?? '',
      });
      return reply.code(200).send(result);
    } catch (error) {
      return filter.catch(error, {
        status(code) {
          return {
            json(payload) {
              return reply.code(code).send(payload);
            },
          };
        },
      });
    }
  });

  fastify.patch('/enrollments/:enrollmentId/reject', async (request, reply) => {
    try {
      const params = request.params;
      const body = request.body;
      const result = await controller.rejectEnrollment(params.enrollmentId, {
        rejectedBy: body?.rejectedBy ?? '',
      });
      return reply.code(200).send(result);
    } catch (error) {
      return filter.catch(error, {
        status(code) {
          return {
            json(payload) {
              return reply.code(code).send(payload);
            },
          };
        },
      });
    }
  });

  fastify.post('/enrollments/:enrollmentId/certificate', async (request, reply) => {
    try {
      const params = request.params;
      const body = request.body;
      const result = await controller.generateCertificate(params.enrollmentId, {
        progress: Number(body?.progress ?? 0),
      });
      return reply.code(200).send(result);
    } catch (error) {
      return filter.catch(error, {
        status(code) {
          return {
            json(payload) {
              return reply.code(code).send(payload);
            },
          };
        },
      });
    }
  });

  return fastify;
}
