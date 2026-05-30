describe('Dashboard', () => {
  beforeEach(() => {
    // Login
    cy.visit('/login');
    cy.get('input[type="email"]').type('test@ventureflow.io');
    cy.get('input[type="password"]').type('TestPassword123!');
    cy.get('button').contains('Sign In').click();
    cy.url().should('include', '/dashboard');
  });

  it('should display dashboard metrics', () => {
    cy.contains('Welcome back').should('be.visible');
    cy.contains('Total Investors').should('be.visible');
    cy.contains('Active Startups').should('be.visible');
    cy.contains('Pipeline Value').should('be.visible');
    cy.contains('Conversion Rate').should('be.visible');
  });

  it('should display activity chart', () => {
    cy.contains('Weekly Activity').should('be.visible');
  });

  it('should display pipeline breakdown', () => {
    cy.contains('Pipeline Breakdown').should('be.visible');
    cy.contains('Target').should('be.visible');
    cy.contains('Contacted').should('be.visible');
    cy.contains('Meeting').should('be.visible');
  });

  it('should navigate to investors page', () => {
    cy.contains('👥').click();
    cy.url().should('include', '/investors');
  });

  it('should navigate to startups page', () => {
    cy.contains('🚀').click();
    cy.url().should('include', '/startups');
  });

  it('should navigate to pipeline', () => {
    cy.contains('📈').click();
    cy.url().should('include', '/pipeline');
  });

  it('should logout', () => {
    cy.contains('Logout').click();
    cy.url().should('include', '/login');
  });
});
