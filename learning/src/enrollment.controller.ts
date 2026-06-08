import type {
  ApproveEnrollmentResult,
  CreateEnrollmentResult,
  GenerateCertificateResult,
  RejectEnrollmentResult,
} from './types.js';
import type { EnrollmentService } from './enrollment.service.js';

export class EnrollmentController {
  constructor(private readonly enrollmentService: EnrollmentService) {}

  async createEnrollment(body: {
    employeeId: string;
    courseId: string;
  }): Promise<CreateEnrollmentResult> {
    return this.enrollmentService.createEnrollment({
      employeeId: body.employeeId,
      courseId: body.courseId,
    });
  }

  async approveEnrollment(
    enrollmentId: string,
    body: { approvedBy: string },
  ): Promise<ApproveEnrollmentResult> {
    return this.enrollmentService.approveEnrollment({
      enrollmentId,
      approvedBy: body.approvedBy,
    });
  }

  async rejectEnrollment(
    enrollmentId: string,
    body: { rejectedBy: string },
  ): Promise<RejectEnrollmentResult> {
    return this.enrollmentService.rejectEnrollment({
      enrollmentId,
      rejectedBy: body.rejectedBy,
    });
  }

  async generateCertificate(
    enrollmentId: string,
    body: { progress: number },
  ): Promise<GenerateCertificateResult> {
    return this.enrollmentService.generateCertificate({
      enrollmentId,
      progress: body.progress,
    });
  }
}
