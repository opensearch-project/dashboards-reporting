/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { ReportDefinitions } from '../report_definitions_table';
import { getResourceSharingAvailableTypes } from '../../utils/resource_sharing_service';

jest.mock('../../utils/resource_sharing_service', () => ({
  getResourceSharingAvailableTypes: jest.fn(),
  REPORT_DEFINITION_RESOURCE_TYPE: 'report-definition',
}));

beforeEach(() =>
  (getResourceSharingAvailableTypes as jest.Mock).mockResolvedValue([])
);

const pagination = {
  initialPageSize: 10,
  pageSizeOptions: [8, 10, 13],
};

describe('<ReportDefinitions /> panel', () => {
  test('render component', () => {
    const reportDefinitionsTableContent = [
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
    const reportDefinitionsTableContent = [
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

describe('<ReportDefinitions /> resource sharing Access column', () => {
  const content = [
    {
      id: 'definition-1',
      reportName: 'my report definition',
      type: 'Download',
      owner: 'davidcui',
      source: 'Dashboard',
      lastUpdated: 'test updated time',
      details: '',
      status: 'Created',
    },
  ];

  afterEach(() => (getResourceSharingAvailableTypes as jest.Mock).mockReset());

  test('renders the Access column with a share-button marker when resource sharing is available', async () => {
    (getResourceSharingAvailableTypes as jest.Mock).mockResolvedValue([
      'report-definition',
    ]);
    const { container } = render(
      <ReportDefinitions
        pagination={pagination}
        reportDefinitionsTableContent={content}
      />
    );
    await waitFor(() => {
      expect(
        container.querySelector('[data-resource-share-button]')
      ).not.toBeNull();
    });
    const marker = container.querySelector('[data-resource-share-button]');
    expect(marker!.getAttribute('data-resource-id')).toBe('definition-1');
    expect(marker!.getAttribute('data-resource-type')).toBe(
      'report-definition'
    );
    expect(marker!.getAttribute('data-resource-name')).toBe(
      'my report definition'
    );
    expect(marker!.getAttribute('data-resource-share-display')).toBe('icon');
  });

  test('does not render the Access column when resource sharing is unavailable', async () => {
    (getResourceSharingAvailableTypes as jest.Mock).mockResolvedValue([]);
    const { container } = render(
      <ReportDefinitions
        pagination={pagination}
        reportDefinitionsTableContent={content}
      />
    );
    await act(async () => {});
    expect(container.querySelector('[data-resource-share-button]')).toBeNull();
  });

  test('does not show the Access column using a stale result resolved for a previous data source', async () => {
    // First render (dataSourceId="ds-a") resolves availability immediately.
    (getResourceSharingAvailableTypes as jest.Mock).mockResolvedValueOnce([
      'report-definition',
    ]);
    const { container, rerender } = render(
      <ReportDefinitions
        pagination={pagination}
        reportDefinitionsTableContent={content}
        dataSourceId="ds-a"
      />
    );
    await waitFor(() => {
      expect(
        container.querySelector('[data-resource-share-button]')
      ).not.toBeNull();
    });

    // Switch to a new data source ("ds-b") whose probe never resolves within
    // this test, simulating an in-flight request. Without the dataSourceId
    // equality guard, the Access column would keep showing based on the
    // stale ds-a result above.
    (getResourceSharingAvailableTypes as jest.Mock).mockImplementation(
      () => new Promise(() => {})
    );
    rerender(
      <ReportDefinitions
        pagination={pagination}
        reportDefinitionsTableContent={content}
        dataSourceId="ds-b"
      />
    );

    await waitFor(() => {
      expect(
        container.querySelector('[data-resource-share-button]')
      ).toBeNull();
    });
  });
});
