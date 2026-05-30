describe('Authentication Flow', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('should show landing page', () => {
    cy.contains('AI-Powered Fundraising Platform').should('be.visible');
    cy.contains('Get Started Free').should('be.visible');
  });

  it('should navigate to login', () => {
    cy.contains('Sign In').click();
    cy.url().should('include', '/login');
    cy.contains('Sign In').should('be.visible');
  });

  it('should handle login with valid credentials', () => {
    cy.visit('/login');
    cy.get('input[type="email"]').type('test@ventureflow.io');
    cy.get('input[type="password"]').type('TestPassword123!');
    cy.get('button').contains('Sign In').click();
    cy.url().should('include', '/dashboard');
  });

  it('should handle signup', () => {
    cy.visit('/signup');
    cy.get('input[name="firstName"]').type('John');
    cy.get('input[name="lastName"]').type('Doe');
    cy.get('input[name="organizationName"]').type('Acme Corp');
    cy.get('input[type="email"]').type('john@acme.com');
    cy.get('input[type="password"]').type('Password123!');
    cy.get('button').contains('Sign Up').click();
    cy.url().should('include', '/dashboard');
  });

  it('should show error on invalid login', () => {
    cy.visit('/login');
    cy.get('input[type="email"]').type('invalid@example.com');
    cy.get('input[type="password"]').type('WrongPassword');
    cy.get('button').contains('Sign In').click();
    cy.contains('Invalid email or password').should('be.visible');
  });
});
