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

  it('TC03-Create Certificate by progress 100%', async () => {
    certificateApiClient.generateCertificate.mockResolvedValue({
      certificate_id: 'CERT003',
      certificate_url: 'https://certificate.example.com/CERT003.pdf',
      status: 'issued',
      issued_at: '2026-05-15T10:00:00Z',
    });

    const result = await service.createCertificate({
      enrollmentId: 'ENR003',
      employeeId: 'EMP003',
      courseId: 'COM001',
    });

    expect(result).toEqual({
      certificateId: 'CERT003',
      certificateUrl: 'https://certificate.example.com/CERT003.pdf',
      issuedAt: '2026-05-15T10:00:00Z',
    });

    expect(certificateApiClient.generateCertificate).toHaveBeenCalledWith({
      refId: 'ENR003',
      learnerId: 'EMP003',
      courseRef: 'COM001',
    });
  });
});
