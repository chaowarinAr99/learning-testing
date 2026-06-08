export type EnrollmentStatus =
  | 'PENDING_APPROVAL'
  | 'APPROVED'
  | 'REJECTED';

export type CertificateStatus =
  | 'CERTIFICATE_ISSUED'
  | 'CERTIFICATE_FAILED';

export type CourseStatus = 'OPEN' | 'CLOSED';

export type CreateEnrollmentInput = {
  employeeId: string;
  courseId: string;
};

export type CreateEnrollmentResult = {
  enrollmentId: string;
  employeeId: string;
  courseId: string;
  status: EnrollmentStatus;
};

export type ApproveEnrollmentInput = {
  enrollmentId: string;
  approvedBy: string;
};

export type ApproveEnrollmentResult = {
  enrollmentId: string;
  status: EnrollmentStatus;
  approvedBy: string;
  approvedAt: string;
};

export type RejectEnrollmentInput = {
  enrollmentId: string;
  rejectedBy: string;
};

export type RejectEnrollmentResult = {
  enrollmentId: string;
  status: EnrollmentStatus;
  rejectedBy: string;
  rejectedAt: string;
};

export type GenerateCertificateInput = {
  enrollmentId: string;
  progress: number;
};

export type GenerateCertificateResult = {
  enrollmentId: string;
  certificateStatus: CertificateStatus;
  certificate: {
    certificateId: string;
    certificateUrl: string;
    issuedAt: string;
  } | null;
};

export type Course = {
  id: string;
  title: string;
  status: CourseStatus;
  seatLimit: number;
  enrolledCount: number;
};

export type Enrollment = {
  id: string;
  employeeId: string;
  courseId: string;
  status: EnrollmentStatus;
  certificateStatus?: CertificateStatus;
  certificateUrl?: string;
};

export type ExternalCertificateRequest = {
  refId: string;
  learnerId: string;
  courseRef: string;
};

export type ExternalCertificateResponse = {
  certificate_id: string;
  certificate_url: string;
  status: 'issued' | 'failed';
  issued_at: string;
};
