describe('Investors Page', () => {
  beforeEach(() => {
    cy.visit('/login');
    cy.get('input[type="email"]').type('test@ventureflow.io');
    cy.get('input[type="password"]').type('TestPassword123!');
    cy.get('button').contains('Sign In').click();
    cy.visit('/investors');
  });

  it('should display investors list', () => {
    cy.contains('Investors').should('be.visible');
    cy.contains('Add Investor').should('be.visible');
  });

  it('should have search functionality', () => {
    cy.get('input[placeholder*="Search"]').type('Accel');
    cy.get('input[placeholder*="Search"]').should('have.value', 'Accel');
  });

  it('should have sector filter', () => {
    cy.contains('All Sectors').click();
    cy.contains('AI').click();
  });

  it('should have stage filter', () => {
    cy.contains('All Stages').click();
    cy.contains('Series A').click();
  });

  it('should display investor table', () => {
    cy.get('table').should('be.visible');
    cy.contains('Name').should('be.visible');
    cy.contains('Firm').should('be.visible');
    cy.contains('Sectors').should('be.visible');
  });

  it('should have view action', () => {
    cy.contains('View').click();
  });
});
