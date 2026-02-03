/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { ReportsTable } from '../reports_table';
import httpClientMock from '../../../../test/httpMockClient';

const pagination = {
  initialPageSize: 10,
  pageSizeOptions: [8, 10, 13],
};

describe('<ReportsTable /> panel', () => {
  test('render component', () => {
    let reportsTableItems = [
      {
        id: '1',
        reportName: 'test report table item',
        type: 'Test type',
        sender: 'N/A',
        recipients: 'N/A',
        reportSource: 'Test report source',
        lastUpdated: 'test updated time',
        state: 'Created',
        url: 'Test url',
      },
    ];
    const { container } = render(
      <ReportsTable
        reportsTableItems={reportsTableItems}
        httpClient={httpClientMock}
        pagination={pagination}
      />
    );
    expect(container.firstChild).toMatchSnapshot();
  });

  test('render empty component', async () => {
    const { container } = render(
      <ReportsTable
        reportsTableItems={[]}
        httpClient={httpClientMock}
        pagination={pagination}
      />
    );
    expect(container.firstChild).toMatchSnapshot();
  });

  test('click on generate button', async () => {
    let reportsTableItems = [
      {
        id: '1',
        reportName: 'test report table item',
        type: 'Test type',
        sender: 'N/A',
        recipients: 'N/A',
        reportSource: 'Test report source',
        lastUpdated: 'test updated time',
        state: 'Created',
        url: 'Test url',
      },
    ];

    render(
      <ReportsTable
        reportsTableItems={reportsTableItems}
        httpClient={httpClientMock}
        pagination={pagination}
      />
    );

    await waitFor(() => {
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(6);
    });

    const buttons = screen.getAllByRole('button');
    await act(async () => {
      fireEvent.click(buttons[6]);
    });
  });
});
