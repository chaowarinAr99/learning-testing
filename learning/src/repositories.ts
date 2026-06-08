import type {
  ApproveEnrollmentResult,
  CertificateStatus,
  Course,
  Enrollment,
  EnrollmentStatus,
  RejectEnrollmentResult,
} from './types.js';

export type CourseRepository = {
  findById(courseId: string): Promise<Course | null>;
};

export type EnrollmentRepository = {
  findActiveByEmployeeAndCourse(
    employeeId: string,
    courseId: string,
  ): Promise<Enrollment | null>;

  create(input: {
    employeeId: string;
    courseId: string;
    status: EnrollmentStatus;
  }): Promise<Enrollment>;

  findById(enrollmentId: string): Promise<Enrollment | null>;

  approve(input: {
    enrollmentId: string;
    approvedBy: string;
    approvedAt: string;
  }): Promise<ApproveEnrollmentResult>;

  reject(input: {
    enrollmentId: string;
    rejectedBy: string;
    rejectedAt: string;
  }): Promise<RejectEnrollmentResult>;

  updateCertificateStatus(input: {
    enrollmentId: string;
    certificateStatus: CertificateStatus;
    certificateUrl?: string;
  }): Promise<void>;
};
