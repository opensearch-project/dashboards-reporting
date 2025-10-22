/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { BASE_PATH } from '../support/constants';

if (Cypress.env('security_enabled')) {
  describe('Reporting Security - Internal User with reports_full_access', () => {
    const username = 'reportuser';
    const password = 'TestPassword123!';
    const roleName = `reports_full_access_${Math.random()
      .toString(36)
      .substring(2, 10)}`;
    const adminReportName = `Admin Report ${Math.random()
      .toString(36)
      .substring(2, 6)}`;

    it('creates a new internal user', () => {
      cy.visit(`${BASE_PATH}/app/security-dashboards-plugin#/users`);
      cy.contains('Internal users');
      cy.get('a[href="#/users/create"]').click({ force: true });

      cy.get('input[data-test-subj="name-text"]').type(username);
      cy.get('input[data-test-subj="password"]').type(password);
      cy.get('input[data-test-subj="re-enter-password"]').type(password);
      cy.get('button').contains('Create').click();
      // cy.wait(20000);
      cy.contains(username).should('exist');
    });

    it('creates a new role with reports_full_access permissions', () => {
      Cypress.on('uncaught:exception', () => false);

      cy.visit(`${BASE_PATH}/app/security-dashboards-plugin#/roles/create`);
      cy.get('input[data-test-subj="name-text"]').type(roleName);

      const permissions = [
        'cluster:admin/opendistro/reports/definition/create',
        'cluster:admin/opendistro/reports/definition/delete',
        'cluster:admin/opendistro/reports/definition/get',
        'cluster:admin/opendistro/reports/definition/list',
        'cluster:admin/opendistro/reports/definition/on_demand',
        'cluster:admin/opendistro/reports/definition/update',
        'cluster:admin/opendistro/reports/instance/get',
        'cluster:admin/opendistro/reports/instance/list',
        'cluster:admin/opendistro/reports/menu/download',
      ];

      permissions.forEach((perm) => {
        cy.get('input[data-test-subj="comboBoxSearchInput"]')
          .eq(0)
          .type(`${perm}{downArrow}{enter}`);
      });

      cy.get('button').contains('Create').click();
      cy.contains(roleName).should('exist');
    });

    it('maps the user to the reports_full_access role', () => {
      cy.visit(
        `${BASE_PATH}/app/security-dashboards-plugin#/roles/edit/${roleName}/mapuser`
      );
      cy.contains('Map users');

      cy.get('div[data-test-subj="comboBoxInput"]').type(username);
      cy.get('button[id="map"]').click();

      cy.contains(username).should('exist');
    });

    it('admin creates a report definition using helpers', () => {
      it('Adds sample data', () => {
        cy.visit(
          `${Cypress.env(
            'opensearchDashboards'
          )}/app/home#/tutorial_directory/sampleData`
        );
        cy.get('div[data-test-subj="sampleDataSetCardflights"]')
          .contains(/(Add|View) data/)
          .click();
        cy.wait(3000);
        cy.visit(
          `${Cypress.env(
            'opensearchDashboards'
          )}/app/home#/tutorial_directory/sampleData`
        );
        cy.get('div[data-test-subj="sampleDataSetCardecommerce"]')
          .contains(/(Add|View) data/)
          .click();
        cy.wait(3000);
        cy.visit(
          `${Cypress.env(
            'opensearchDashboards'
          )}/app/home#/tutorial_directory/sampleData`
        );
        cy.get('div[data-test-subj="sampleDataSetCardlogs"]')
          .contains(/(Add|View) data/)
          .click();
        cy.wait(3000);
      });
      cy.visit(
        `${Cypress.env('opensearchDashboards')}/app/reports-dashboards#/`
      );
      cy.location('pathname', { timeout: 60000 }).should(
        'include',
        '/reports-dashboards'
      );
      cy.wait(3000);
      cy.get('#createReportHomepageButton').click();

      cy.get('#reportSettingsName').type(adminReportName);
      cy.get('#reportSettingsDescription').type('Created by admin for test');
      cy.get('[data-test-subj="comboBoxInput"]').eq(0).click({ force: true });

      // Select an actual dashboard, e.g., sample data dashboard
      cy.contains('[Logs] Web Traffic').click();

      cy.get('#createNewReportDefinition').click({ force: true });

      // Confirm it appears
      cy.visit(`${BASE_PATH}/app/reports-dashboards#/`);
      cy.contains(adminReportName).should('exist');
    });

    it('verifies the user can access reporting', () => {
      cy.clearCookies();
      cy.clearLocalStorage();
      cy.visit(`${BASE_PATH}/app/reports-dashboards#/`);
      // Log out admin properly
      cy.get('[data-test-subj="account-popover"]').click({ force: true }); // profile icon
      cy.contains('Log out').click({ force: true });

      // // Go to login page and login as new user
      cy.visit(BASE_PATH);

      cy.get('[data-test-subj="user-name"]').type(username);
      cy.get('[data-test-subj="password"]').type(password);
      cy.get('[data-test-subj="submit"]').click();

      cy.contains('Home', { timeout: 10000 }).should('exist');

      // Go to reporting page and verify
      cy.contains('Reporting').should('exist');
      cy.contains(adminReportName).should('exist');
    });
  });
}
