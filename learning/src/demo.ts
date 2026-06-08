import { CertificateService } from './certificate.service.js';
import { EnrollmentController } from './enrollment.controller.js';
import { EnrollmentService } from './enrollment.service.js';
import { InMemoryCertificateApiClient, InMemoryCourseRepository, InMemoryEnrollmentRepository } from './in-memory.js';

async function main() {
  const courseRepository = new InMemoryCourseRepository([
    {
      id: 'COURSE001',
      title: 'SDET Foundations',
      status: 'OPEN',
      seatLimit: 10,
      enrolledCount: 0,
    },
  ]);

  const enrollmentRepository = new InMemoryEnrollmentRepository();
  const certificateApiClient = new InMemoryCertificateApiClient(async (payload: { refId: string }) => ({
    certificate_id: `CERT-${payload.refId}`,
    certificate_url: `https://certificate.example.com/${payload.refId}.pdf`,
    status: 'issued',
    issued_at: new Date().toISOString(),
  }));

  const certificateService = new CertificateService(certificateApiClient);
  const enrollmentService = new EnrollmentService(
    courseRepository,
    enrollmentRepository,
    certificateService,
  );
  const controller = new EnrollmentController(enrollmentService);

  const created = await controller.createEnrollment({
    employeeId: 'EMP001',
    courseId: 'COURSE001',
  });

  const approved = await controller.approveEnrollment(created.enrollmentId, {
    approvedBy: 'HR001',
  });

  const issued = await controller.generateCertificate(created.enrollmentId, {
    progress: 100,
  });

  console.log({ created, approved, issued });
}

void main();
