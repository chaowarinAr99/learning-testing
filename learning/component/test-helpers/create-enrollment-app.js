import Fastify from 'fastify';
import { CertificateService } from 'src/certificate.service.js';
import { EnrollmentController } from 'src/enrollment.controller.js';
import { EnrollmentExceptionFilter } from 'src/enrollment-exception-filter.js';
import { EnrollmentService } from 'src/enrollment.service.js';

export function buildCreateEnrollmentApp(courseRepository, enrollmentRepository) {
  const fastify = Fastify({ logger: false });
  const filter = new EnrollmentExceptionFilter();
  const certificateService = new CertificateService({
    async generateCertificate() {
      return {
        certificate_id: 'CERT000',
        certificate_url: 'https://certificate.example.com/CERT000.pdf',
        status: 'issued',
        issued_at: new Date().toISOString(),
      };
    },
  });

  const controller = new EnrollmentController(
    new EnrollmentService(courseRepository, enrollmentRepository, certificateService),
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

  return fastify;
}
