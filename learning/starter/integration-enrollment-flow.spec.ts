describe('Enrollment flow integration', () => {
  it('should allow re-enrollment after rejected enrollment', async () => {
    // Arrange
    // TODO: seed REJECTED enrollment
    //
    // Act
    // TODO: call createEnrollment

    // Assert
    // TODO: expect new enrollment created
  });

  it('should block re-enrollment when active enrollment exists', async () => {
    // Arrange
    // TODO: seed PENDING_APPROVAL or APPROVED enrollment

    // Act
    // TODO: call createEnrollment

    // Assert
    // TODO: expect duplicate error
  });
});
