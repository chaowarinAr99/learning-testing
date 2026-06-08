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

  it('TC01-Create Certificate by progress 100%', async () => {
    certificateApiClient.generateCertificate.mockResolvedValue({
      certificate_id: 'CERT001',
      certificate_url: 'https://certificate.example.com/CERT001.pdf',
      status: 'issued',
      issued_at: '2026-05-15T10:00:00Z',
    });

    const result = await service.createCertificate({
      enrollmentId: 'ENR001',
      employeeId: 'EMP001',
      courseId: 'PHY001',
    });

    expect(result).toEqual({
      certificateId: 'CERT001',
      certificateUrl: 'https://certificate.example.com/CERT001.pdf',
      issuedAt: '2026-05-15T10:00:00Z',
    });

    expect(certificateApiClient.generateCertificate).toHaveBeenCalledWith({
      refId: 'ENR001',
      learnerId: 'EMP001',
      courseRef: 'PHY001',
    });
  });
});
