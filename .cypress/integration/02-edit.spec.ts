/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

describe('Cypress', () => {
  beforeEach(() => {
    // Wait before visiting to allow index refresh after previous test's save
    cy.wait(5000);
    cy.visit(`${Cypress.env('opensearchDashboards')}/app/reports-dashboards#/`, {
      timeout: 60000,
    });
    cy.location('pathname', { timeout: 60000 }).should(
      'include',
      '/reports-dashboards'
    );
    // Retry: if the list doesn't load, reload the page
    cy.get('body').then(($body) => {
      if ($body.find('#reportDefinitionDetailsLink').length === 0) {
        cy.wait(5000);
        cy.reload();
      }
    });
    cy.get('#reportDefinitionDetailsLink', { timeout: 60000 }).should('exist');
  });

  it('Visit edit page, update name and description', () => {
    cy.get('#reportDefinitionDetailsLink').first().click();

    cy.get('#editReportDefinitionButton').should('exist');
    cy.get('#editReportDefinitionButton').click();

    cy.url().should('include', 'edit');

    // update the report name
    cy.get('#reportSettingsName').type(' update name', { force: true });

    // update report description
    cy.get('#reportSettingsDescription').type(' update description');

    cy.get('#editReportDefinitionButton').click({ force: true });

    // check that re-direct to home page
    cy.get('#reportDefinitionDetailsLink', { timeout: 60000 }).should('exist');
  });

  it('Visit edit page, change report trigger', () => {
    cy.get('#reportDefinitionDetailsLink').first().click();

    cy.get('#editReportDefinitionButton').should('exist');
    cy.get('#editReportDefinitionButton').click();

    cy.url().should('include', 'edit');

    cy.get('#reportDefinitionTriggerTypes > div:nth-child(2)').click({
      force: true,
    });

    cy.get('#Schedule').check({ force: true });
    cy.get('#editReportDefinitionButton').click({ force: true });

    // check that re-direct to home page
    cy.get('#reportDefinitionDetailsLink', { timeout: 60000 }).should('exist');
  });

  it('Visit edit page, change report trigger back', () => {
    cy.get('#reportDefinitionDetailsLink').first().click();

    cy.get('#editReportDefinitionButton').should('exist');
    cy.get('#editReportDefinitionButton').click();

    cy.url().should('include', 'edit');

    cy.get('#reportDefinitionTriggerTypes > div:nth-child(1)').click({
      force: true,
    });

    cy.get('#editReportDefinitionButton').click({ force: true });

    // check that re-direct to home page
    cy.get('#reportDefinitionDetailsLink', { timeout: 60000 }).should('exist');
  });
});
