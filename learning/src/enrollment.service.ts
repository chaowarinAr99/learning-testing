import {
  BadRequestError,
  CourseClosedError,
  CourseFullError,
  CourseNotFoundError,
  DuplicateEnrollmentError,
  EnrollmentCannotBeRejectedError,
  EnrollmentNotFoundError,
  InvalidEnrollmentStatusError,
  ProgressNotCompletedError,
} from './errors.js';
import type { CertificateService } from './certificate.service.js';
import type { CourseRepository, EnrollmentRepository } from './repositories.js';
import type {
  ApproveEnrollmentInput,
  ApproveEnrollmentResult,
  CreateEnrollmentInput,
  CreateEnrollmentResult,
  GenerateCertificateInput,
  GenerateCertificateResult,
  RejectEnrollmentInput,
  RejectEnrollmentResult,
} from './types.js';

export class EnrollmentService {
  constructor(
    private readonly courseRepository: CourseRepository,
    private readonly enrollmentRepository: EnrollmentRepository,
    private readonly certificateService: CertificateService,
  ) {}

  async createEnrollment(
    input: CreateEnrollmentInput,
  ): Promise<CreateEnrollmentResult> {
    if (!input.employeeId) {
      throw new BadRequestError('employeeId is required');
    }

    if (!input.courseId) {
      throw new BadRequestError('courseId is required');
    }

    const course = await this.courseRepository.findById(input.courseId);

    if (!course) {
      throw new CourseNotFoundError('Course not found');
    }

    if (course.status !== 'OPEN') {
      throw new CourseClosedError('Course is not open for enrollment');
    }

    if (course.enrolledCount >= course.seatLimit) {
      throw new CourseFullError('Course is full');
    }

    const existingEnrollment =
      await this.enrollmentRepository.findActiveByEmployeeAndCourse(
        input.employeeId,
        input.courseId,
      );

    if (existingEnrollment) {
      throw new DuplicateEnrollmentError('Employee already enrolled');
    }

    const enrollment = await this.enrollmentRepository.create({
      employeeId: input.employeeId,
      courseId: input.courseId,
      status: 'PENDING_APPROVAL',
    });

    return {
      enrollmentId: enrollment.id,
      employeeId: enrollment.employeeId,
      courseId: enrollment.courseId,
      status: enrollment.status,
    };
  }

  async approveEnrollment(
    input: ApproveEnrollmentInput,
  ): Promise<ApproveEnrollmentResult> {
    if (!input.enrollmentId) {
      throw new BadRequestError('enrollmentId is required');
    }

    if (!input.approvedBy) {
      throw new BadRequestError('approvedBy is required');
    }

    const enrollment = await this.enrollmentRepository.findById(
      input.enrollmentId,
    );

    if (!enrollment) {
      throw new EnrollmentNotFoundError('Enrollment not found');
    }

    if (enrollment.status !== 'PENDING_APPROVAL') {
      throw new InvalidEnrollmentStatusError('Enrollment cannot be approved');
    }

    return this.enrollmentRepository.approve({
      enrollmentId: input.enrollmentId,
      approvedBy: input.approvedBy,
      approvedAt: new Date().toISOString(),
    });
  }

  async rejectEnrollment(
    input: RejectEnrollmentInput,
  ): Promise<RejectEnrollmentResult> {
    if (!input.enrollmentId) {
      throw new BadRequestError('enrollmentId is required');
    }

    if (!input.rejectedBy) {
      throw new BadRequestError('rejectedBy is required');
    }

    const enrollment = await this.enrollmentRepository.findById(
      input.enrollmentId,
    );

    if (!enrollment) {
      throw new EnrollmentNotFoundError('Enrollment not found');
    }

    if (enrollment.status !== 'PENDING_APPROVAL') {
      throw new EnrollmentCannotBeRejectedError('Enrollment cannot be rejected');
    }

    return this.enrollmentRepository.reject({
      enrollmentId: input.enrollmentId,
      rejectedBy: input.rejectedBy,
      rejectedAt: new Date().toISOString(),
    });
  }

  async generateCertificate(
    input: GenerateCertificateInput,
  ): Promise<GenerateCertificateResult> {
    if (!input.enrollmentId) {
      throw new BadRequestError('enrollmentId is required');
    }

    const enrollment = await this.enrollmentRepository.findById(
      input.enrollmentId,
    );

    if (!enrollment) {
      throw new EnrollmentNotFoundError('Enrollment not found');
    }

    if (enrollment.status !== 'APPROVED') {
      throw new InvalidEnrollmentStatusError('Enrollment is not approved');
    }

    if (input.progress !== 100) {
      throw new ProgressNotCompletedError('Progress must be 100%');
    }

    try {
      const certificate = await this.certificateService.createCertificate({
        enrollmentId: enrollment.id,
        employeeId: enrollment.employeeId,
        courseId: enrollment.courseId,
      });

      await this.enrollmentRepository.updateCertificateStatus({
        enrollmentId: enrollment.id,
        certificateStatus: 'CERTIFICATE_ISSUED',
        certificateUrl: certificate.certificateUrl,
      });

      return {
        enrollmentId: enrollment.id,
        certificateStatus: 'CERTIFICATE_ISSUED',
        certificate,
      };
    } catch (error) {
      await this.enrollmentRepository.updateCertificateStatus({
        enrollmentId: enrollment.id,
        certificateStatus: 'CERTIFICATE_FAILED',
      });

      throw error;
    }
  }
}
