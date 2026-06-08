describe('CertificateService', () => {
  it('should map internal input to external payload', async () => {
    // Arrange
    // TODO: mock certificateApiClient.generateCertificate success

    // Act
    // TODO: call createCertificate

    // Assert
    // TODO: verify refId/learnerId/courseRef mapping
  });

  it('should throw timeout error when external client times out', async () => {
    // TODO: mock error with code TIMEOUT
  });

  it('should throw invalid response error when response is malformed', async () => {
    // TODO: mock missing certificate_id or certificate_url or issued_at
  });
});
