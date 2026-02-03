/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { ReportDefinitions } from '../report_definitions_table';

const pagination = {
  initialPageSize: 10,
  pageSizeOptions: [8, 10, 13],
};

describe('<ReportDefinitions /> panel', () => {
  test('render component', () => {
    let reportDefinitionsTableContent = [
      {
        reportName: 'test report name',
        type: 'Download',
        owner: 'davidcui',
        source: 'Dashboard',
        lastUpdated: 'test updated time',
        details: '',
        status: 'Created',
      },
      {
        reportName: 'test report name 2',
        type: 'Download',
        owner: 'davidcui',
        source: 'Dashboard',
        lastUpdated: 'test updated time',
        details: '',
        status: 'Created',
      },
    ];
    const { container } = render(
      <ReportDefinitions
        pagination={pagination}
        reportDefinitionsTableContent={reportDefinitionsTableContent}
      />
    );
    expect(container.firstChild).toMatchSnapshot();
  });

  test('render empty table', () => {
    const { container } = render(
      <ReportDefinitions
        pagination={pagination}
        reportDefinitionsTableContent={[]}
      />
    );
    expect(container.firstChild).toMatchSnapshot();
  });

  test('test click on report definition row', async () => {
    window = Object.create(window);
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: {
        assign: jest.fn(),
      },
    });
    let reportDefinitionsTableContent = [
      {
        reportName: 'test report name',
        type: 'Download',
        owner: 'davidcui',
        source: 'Dashboard',
        lastUpdated: 'test updated time',
        details: '',
        status: 'Created',
      },
      {
        reportName: 'test report name 2',
        type: 'Download',
        owner: 'davidcui',
        source: 'Dashboard',
        lastUpdated: 'test updated time',
        details: '',
        status: 'Created',
      },
    ];

    render(
      <ReportDefinitions
        pagination={pagination}
        reportDefinitionsTableContent={reportDefinitionsTableContent}
      />
    );

    await waitFor(() => {
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(3);
    });

    const buttons = screen.getAllByRole('button');
    await act(async () => {
      fireEvent.click(buttons[3]);
    });
  });
});
