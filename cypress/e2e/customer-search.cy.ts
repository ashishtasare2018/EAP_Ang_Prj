import 'cypress-real-events';

const leanne = {
  id: 1,
  name: 'Leanne Graham',
  username: 'Bret',
  email: 'Sincere@april.biz',
  address: {
    street: 'Kulas Light',
    suite: 'Apt. 556',
    city: 'Gwenborough',
    zipcode: '92998-3874',
    geo: { lat: '-37.3159', lng: '81.1496' },
  },
  phone: '1-770-736-8031 x56442',
  website: 'hildegard.org',
  company: {
    name: 'Romaguera-Crona',
    catchPhrase: 'Multi-layered client-server neural-net',
    bs: 'harness real-time e-markets',
  },
};

const clementine = {
  id: 4,
  name: 'Clementine Bauch',
  username: 'Samantha',
  email: 'Nathan@yesenia.net',
  address: {
    street: 'Douglas Extension',
    suite: 'Suite 847',
    city: 'McKenziehaven',
    zipcode: '59590-4157',
    geo: { lat: '24.8918', lng: '21.8984' },
  },
  phone: '1-463-123-4447',
  website: 'ramiro.info',
  company: {
    name: 'Yost and Sons',
    catchPhrase: 'Switchable contextually-based project',
    bs: 'aggregate real-time technologies',
  },
};

const searchInput = (): Cypress.Chainable<JQuery<HTMLElement>> =>
  cy.get('input[aria-label="Search customers"]');

const searchButton = (): Cypress.Chainable<JQuery<HTMLElement>> =>
  cy.get('button[type="submit"]');

const searchFor = (query: string): void => {
  searchInput().clear().type(query);
  searchButton().click();
};

describe('Customer Search', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('does not search automatically while typing', () => {
    cy.intercept('GET', '**/users/?username=Samantha*', { body: [clementine] }).as(
      'searchByUsername',
    );

    searchInput().type('Samantha');

    cy.get('@searchByUsername.all').should('have.length', 0);
    cy.get('[data-testid="search-result-card"]').should('not.exist');
  });

  it('shows a loading spinner then the customer card when searching by id', () => {
    cy.intercept('GET', '**/users/?id=1*', { body: [leanne], delay: 300 }).as('searchById');

    searchFor('1');

    cy.get('[data-testid="search-loading"]').should('be.visible');
    cy.wait('@searchById');
    cy.get('[data-testid="search-result-card"]').should('contain.text', 'Leanne Graham');
  });

  it('finds a customer by username', () => {
    cy.intercept('GET', '**/users/?username=Samantha*', { body: [clementine] }).as(
      'searchByUsername',
    );

    searchFor('Samantha');

    cy.wait('@searchByUsername');
    cy.get('[data-testid="search-result-card"]').should('contain.text', 'Clementine Bauch');
  });

  it('finds a customer by email', () => {
    cy.intercept('GET', '**/users/?email=Sincere@april.biz*', { body: [leanne] }).as(
      'searchByEmail',
    );

    searchFor('Sincere@april.biz');

    cy.wait('@searchByEmail');
    cy.get('[data-testid="search-result-card"]')
      .find(`a[href="mailto:${leanne.email}"]`)
      .should('have.text', leanne.email);
  });

  it('shows a validation error and does not call the API for a malformed email', () => {
    cy.intercept('GET', '**/users/**').as('anySearch');

    searchFor('not-an-email@');

    cy.get('[role="alert"]').should('be.visible').and('contain.text', 'valid email address');
    cy.get('@anySearch.all').should('have.length', 0);
  });

  it('shows "Customer not found" when the API returns an empty array', () => {
    cy.intercept('GET', '**/users/?username=Kedar*', { body: [] }).as('searchNotFound');

    searchFor('Kedar');

    cy.wait('@searchNotFound');
    cy.contains('Customer not found').should('be.visible');
  });

  it('shows an error message with role="alert" when the network request fails', () => {
    cy.intercept('GET', '**/users/?username=Offline*', { forceNetworkError: true }).as(
      'searchError',
    );

    searchFor('Offline');

    cy.wait('@searchError');
    cy.get('[role="alert"]').should('be.visible').and('contain.text', 'Something went wrong');
  });

  it('clears all results and resets to idle when the input is cleared', () => {
    cy.intercept('GET', '**/users/?username=Samantha*', { body: [clementine] }).as(
      'searchByUsername',
    );

    searchFor('Samantha');
    cy.wait('@searchByUsername');
    cy.get('[data-testid="search-result-card"]').should('exist');

    searchInput().clear();

    cy.get('[data-testid="search-result-card"]').should('not.exist');
    cy.get('[data-testid="search-loading"]').should('not.exist');
    cy.get('[role="alert"]').should('not.exist');
    cy.contains('Customer not found').should('not.exist');
  });

  it('supports keyboard-only navigation: tab to input, type, press Enter to search, tab to the result link, and activate it', () => {
    cy.intercept('GET', '**/users/?id=1*', { body: [leanne] }).as('searchById');

    cy.get('body').realPress('Tab');
    searchInput().should('have.focus').realType('1');
    cy.realPress('Enter');

    cy.wait('@searchById');
    cy.get('[data-testid="search-result-card"]').should('be.visible');

    cy.realPress('Tab'); // Search button
    cy.realPress('Tab'); // mailto link
    cy.realPress('Tab'); // website link
    cy.get(`a[href="https://${leanne.website}"]`).should('have.focus');

    cy.realPress('Enter');
    cy.location('pathname').should('eq', '/');
  });
});
