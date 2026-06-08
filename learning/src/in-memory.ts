import type { CertificateApiClient } from './certificate.service.js';
import type { CourseRepository, EnrollmentRepository } from './repositories.js';
import type {
  CertificateStatus,
  Course,
  Enrollment,
  ExternalCertificateRequest,
  ExternalCertificateResponse,
  EnrollmentStatus,
  RejectEnrollmentResult,
} from './types.js';

export class InMemoryCourseRepository implements CourseRepository {
  constructor(private readonly courses: Course[] = []) {}

  async findById(courseId: string): Promise<Course | null> {
    return this.courses.find((course) => course.id === courseId) ?? null;
  }

  seed(course: Course) {
    this.courses.push(course);
  }
}

export class InMemoryEnrollmentRepository implements EnrollmentRepository {
  constructor(private readonly enrollments: Enrollment[] = []) {}

  private nextEnrollmentId(): string {
    const nextNumber = this.enrollments.length + 1;
    return `ENR${String(nextNumber).padStart(3, '0')}`;
  }

  async findActiveByEmployeeAndCourse(
    employeeId: string,
    courseId: string,
  ): Promise<Enrollment | null> {
    return (
      this.enrollments.find(
        (enrollment) =>
          enrollment.employeeId === employeeId &&
          enrollment.courseId === courseId &&
          (enrollment.status === 'PENDING_APPROVAL' ||
            enrollment.status === 'APPROVED'),
      ) ?? null
    );
  }

  async create(input: {
    employeeId: string;
    courseId: string;
    status: EnrollmentStatus;
  }): Promise<Enrollment> {
    const enrollment: Enrollment = {
      id: this.nextEnrollmentId(),
      employeeId: input.employeeId,
      courseId: input.courseId,
      status: input.status,
    };

    this.enrollments.push(enrollment);
    return enrollment;
  }

  async findById(enrollmentId: string): Promise<Enrollment | null> {
    return this.enrollments.find((enrollment) => enrollment.id === enrollmentId) ?? null;
  }

  async approve(input: {
    enrollmentId: string;
    approvedBy: string;
    approvedAt: string;
  }) {
    const enrollment = await this.findById(input.enrollmentId);

    if (!enrollment) {
      throw new Error('Enrollment not found');
    }

    enrollment.status = 'APPROVED';

    return {
      enrollmentId: enrollment.id,
      status: enrollment.status,
      approvedBy: input.approvedBy,
      approvedAt: input.approvedAt,
    };
  }

  async reject(input: {
    enrollmentId: string;
    rejectedBy: string;
    rejectedAt: string;
  }): Promise<RejectEnrollmentResult> {
    const enrollment = await this.findById(input.enrollmentId);

    if (!enrollment) {
      throw new Error('Enrollment not found');
    }

    enrollment.status = 'REJECTED';

    return {
      enrollmentId: enrollment.id,
      status: enrollment.status,
      rejectedBy: input.rejectedBy,
      rejectedAt: input.rejectedAt,
    };
  }

  async updateCertificateStatus(input: {
    enrollmentId: string;
    certificateStatus: CertificateStatus;
    certificateUrl?: string;
  }): Promise<void> {
    const enrollment = await this.findById(input.enrollmentId);

    if (!enrollment) {
      throw new Error('Enrollment not found');
    }

    enrollment.certificateStatus = input.certificateStatus;
    enrollment.certificateUrl = input.certificateUrl;
  }
}

export class InMemoryCertificateApiClient implements CertificateApiClient {
  constructor(
    private readonly behavior: (payload: ExternalCertificateRequest) => Promise<ExternalCertificateResponse>,
  ) {}

  async generateCertificate(
    payload: ExternalCertificateRequest,
  ): Promise<ExternalCertificateResponse> {
    return this.behavior(payload);
  }
}
