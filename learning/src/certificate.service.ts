import {
  BadRequestError,
  CertificateApiError,
  CertificateApiTimeoutError,
  InvalidCertificateResponseError,
} from './errors.js';
import type {
  ExternalCertificateRequest,
  ExternalCertificateResponse,
} from './types.js';

export type CreateCertificateInput = {
  enrollmentId: string;
  employeeId: string;
  courseId: string;
};

export type CreateCertificateResult = {
  certificateId: string;
  certificateUrl: string;
  issuedAt: string;
};

export type CertificateApiClient = {
  generateCertificate(
    payload: ExternalCertificateRequest,
  ): Promise<ExternalCertificateResponse>;
};

export class CertificateService {
  constructor(private readonly certificateApiClient: CertificateApiClient) {}

  async createCertificate(
    input: CreateCertificateInput,
  ): Promise<CreateCertificateResult> {
    this.validateInput(input);

    const payload: ExternalCertificateRequest = {
      refId: input.enrollmentId,
      learnerId: input.employeeId,
      courseRef: input.courseId,
    };

    try {
      const response = await this.certificateApiClient.generateCertificate(
        payload,
      );

      this.validateExternalResponse(response);

      return {
        certificateId: response.certificate_id,
        certificateUrl: response.certificate_url,
        issuedAt: response.issued_at,
      };
    } catch (error: any) {
      if (error instanceof InvalidCertificateResponseError) {
        throw error;
      }

      if (error?.code === 'TIMEOUT') {
        throw new CertificateApiTimeoutError('Certificate API timeout');
      }

      throw new CertificateApiError('Cannot generate certificate');
    }
  }

  private validateInput(input: CreateCertificateInput): void {
    if (!input.enrollmentId) {
      throw new BadRequestError('enrollmentId is required');
    }

    if (!input.employeeId) {
      throw new BadRequestError('employeeId is required');
    }

    if (!input.courseId) {
      throw new BadRequestError('courseId is required');
    }
  }

  private validateExternalResponse(response: ExternalCertificateResponse): void {
    if (!response.certificate_id) {
      throw new InvalidCertificateResponseError('certificate_id is required');
    }

    if (!response.certificate_url) {
      throw new InvalidCertificateResponseError('certificate_url is required');
    }

    if (!response.issued_at) {
      throw new InvalidCertificateResponseError('issued_at is required');
    }

    if (response.status !== 'issued') {
      throw new InvalidCertificateResponseError('certificate status is invalid');
    }
  }
}
