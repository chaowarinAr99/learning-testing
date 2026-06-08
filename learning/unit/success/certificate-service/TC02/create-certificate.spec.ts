import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { CertificateService } from 'src/certificate.service.js';

describe('CertificateService.createCertificate', () => {
  const certificateApiClient = {
    generateCertificate: jest.fn(),
  };

  let service: CertificateService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new CertificateService(certificateApiClient as never);
  });

  it('TC02-Create Certificate by progress 100%', async () => {
    certificateApiClient.generateCertificate.mockResolvedValue({
      certificate_id: 'CERT002',
      certificate_url: 'https://certificate.example.com/CERT002.pdf',
      status: 'issued',
      issued_at: '2026-05-15T10:00:00Z',
    });

    const result = await service.createCertificate({
      enrollmentId: 'ENR002',
      employeeId: 'EMP002',
      courseId: 'CHE001',
    });

    expect(result).toEqual({
      certificateId: 'CERT002',
      certificateUrl: 'https://certificate.example.com/CERT002.pdf',
      issuedAt: '2026-05-15T10:00:00Z',
    });

    expect(certificateApiClient.generateCertificate).toHaveBeenCalledWith({
      refId: 'ENR002',
      learnerId: 'EMP002',
      courseRef: 'CHE001',
    });
  });
});
