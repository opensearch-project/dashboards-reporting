/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { marked } from 'marked';

// search param key name to trigger report generation, value is a report ID
export const GENERATE_REPORT_PARAM = 'visualReportId';
export const GENERATE_REPORT_PARAM_REGEX = new RegExp(
  '[&?]' + GENERATE_REPORT_PARAM + '=[^&]+',
  ''
);

export enum VISUAL_REPORT_TYPE {
  dashboard = 'Dashboard',
  visualization = 'Visualization',
  notebook = 'Notebook',
}
export enum SELECTOR {
  dashboard = '#dashboardViewport',
  visualization = '.visEditor__content',
  notebook = '.euiPageBody',
}

export const DEFAULT_REPORT_HEADER = '<h1>OpenSearch Dashboards Reports</h1>';

export const converter = {
  makeHtml: (text: string) => marked(text, { gfm: true }) as string,
};
