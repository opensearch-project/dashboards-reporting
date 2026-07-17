/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

const cypressPlugin = require('eslint-plugin-cypress');

const osdConfig = require('@elastic/eslint-config-kibana');
const { eui } = require('@elastic/eslint-config-kibana/extras');

const LICENSE_HEADER = `/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */`;

module.exports = [
  // Replaces .eslintignore (ESLint 10 no longer reads it).
  {
    ignores: [
      'node_modules',
      'data',
      'build',
      'target',
      'cypress.config.js',
      '**/*.d.ts',
    ],
  },
  ...osdConfig,
  ...eui,
  {
    // Register Cypress globals + plugin for the .cypress/ integration specs.
    // Previously provided by the nested .cypress/.eslintrc.js (`root: true`,
    // `plugin:cypress/recommended`, `cypress/globals` env) which ESLint 10 no
    // longer reads. Rule levels mirror that former nested config.
    files: ['.cypress/**/*.{js,ts}', 'cypress.config.js'],
    plugins: {
      cypress: cypressPlugin,
    },
    languageOptions: {
      globals: {
        ...cypressPlugin.configs.globals.languageOptions.globals,
      },
    },
    rules: {
      'cypress/no-assigning-return-values': 'error',
      'cypress/no-unnecessary-waiting': 'off',
      'cypress/assertion-before-screenshot': 'warn',
      'cypress/no-force': 'warn',
      'cypress/no-async-tests': 'error',
    },
  },
  {
    // Plain-JS browser globals used by legacy .js source that the shared
    // config's JS globals list omits.
    files: ['**/*.js'],
    languageOptions: {
      globals: {
        MutationObserver: 'readonly',
        history: 'readonly',
      },
    },
  },
  {
    // Jest mock/helper files that are not matched by the shared config's
    // test-file glob (they are imported by tests rather than being specs).
    // The old config enabled the jest env globally via plugin:jest/recommended.
    files: ['test/**/*.js'],
    languageOptions: {
      globals: {
        jest: 'readonly',
      },
    },
  },
  {
    files: ['**/*.{js,mjs,ts,tsx}'],
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/no-explicit-any': 'warn',
      'no-console': 0,
      '@osd/eslint/no-restricted-paths': [
        'error',
        {
          basePath: __dirname,
          zones: [
            {
              target: ['(public|server)/**/*'],
              from: ['../../packages/**/*', 'packages/**/*'],
            },
          ],
        },
      ],
      '@osd/eslint/require-license-header': [
        'error',
        { licenses: [LICENSE_HEADER] },
      ],
    },
  },
];
