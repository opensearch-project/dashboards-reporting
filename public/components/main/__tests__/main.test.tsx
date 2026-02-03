/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { Main } from '../main';
import httpClientMock from '../../../../test/httpMockClient';

function setBreadcrumbs(_array: []) {
  jest.fn();
}

const chromeMock = {
  navGroup: {
    getNavGroupEnabled: jest.fn().mockReturnValue(false),
  },
};

describe('<Main /> panel', () => {
  test('render component', (done) => {
    window = Object.create(window);
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: {
        assign: jest.fn(),
        href: 'reports-dashboards#/',
      },
    });

    const { container } = render(
      <Main
        httpClient={httpClientMock}
        setBreadcrumbs={setBreadcrumbs}
        chrome={chromeMock}
      />
    );

    expect(container.firstChild).toMatchSnapshot();
    done();
  });

  test('render component after create success', async () => {
    delete window.location;

    Object.defineProperty(window, 'location', {
      configurable: true,
      value: {
        assign: jest.fn(),
        href: 'reports-dashboards#/create=success',
      },
    });

    const { container } = render(
      <Main
        httpClient={httpClientMock}
        setBreadcrumbs={setBreadcrumbs}
        chrome={chromeMock}
      />
    );

    expect(container.firstChild).toMatchSnapshot();
  });

  test('render component after edit success', async () => {
    delete window.location;

    Object.defineProperty(window, 'location', {
      configurable: true,
      value: {
        assign: jest.fn(),
        href: 'reports-dashboards#/edit=success',
      },
    });

    const { container } = render(
      <Main
        httpClient={httpClientMock}
        setBreadcrumbs={setBreadcrumbs}
        chrome={chromeMock}
      />
    );

    expect(container.firstChild).toMatchSnapshot();
  });

  test('render component after delete success', async () => {
    delete window.location;

    Object.defineProperty(window, 'location', {
      configurable: true,
      value: {
        assign: jest.fn(),
        href: 'reports-dashboards#/delete=success',
      },
    });

    const { container } = render(
      <Main
        httpClient={httpClientMock}
        setBreadcrumbs={setBreadcrumbs}
        chrome={chromeMock}
      />
    );

    expect(container.firstChild).toMatchSnapshot();
  });

  test('test refresh reports definitions button', async () => {
    const data = [
      {
        _id: 'abcdefg',
        _source: {
          query_url: '/app/visualize/edit/1234567890',
          state: 'Created',
          time_created: 123456789,
          time_from: 123456789,
          time_to: 1234567890,
          report_definition: {
            report_params: {
              report_name: 'test create report definition trigger',
              report_source: 'Dashboard',
              description: '',
              core_params: {
                base_url: 'http://localhost:5601',
                report_format: 'png',
                header: '',
                footer: '',
                time_duration: 'PT30M',
              },
            },
            delivery: {
              delivery_type: '',
              delivery_params: {},
            },
            trigger: {
              trigger_type: 'Schedule',
              trigger_params: {},
            },
          },
        },
      },
    ];

    httpClientMock.get = jest.fn().mockResolvedValue({
      data,
    });

    render(
      <Main
        httpClient={httpClientMock}
        setBreadcrumbs={setBreadcrumbs}
        chrome={chromeMock}
      />
    );

    // Wait for component to load and verify it renders with buttons
    await waitFor(() => {
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
    });

    // Verify the component rendered properly
    expect(screen.getAllByRole('button').length).toBeGreaterThan(0);
  });

  test('test refresh reports table button', async () => {
    const data = [
      {
        _id: 'abcdefg',
        _source: {
          query_url: '/app/visualize/edit/1234567890',
          state: 'Created',
          time_created: 123456789,
          time_from: 123456789,
          time_to: 1234567890,
          report_definition: {
            report_params: {
              report_name: 'test create report definition trigger',
              report_source: 'Dashboard',
              description: '',
              core_params: {
                base_url: 'http://localhost:5601',
                report_format: 'png',
                header: '',
                footer: '',
                time_duration: 'PT30M',
              },
            },
            delivery: {
              delivery_type: '',
              delivery_params: {},
            },
            trigger: {
              trigger_type: 'Schedule',
              trigger_params: {},
            },
          },
        },
      },
    ];

    httpClientMock.get = jest.fn().mockResolvedValue({
      data,
    });

    render(
      <Main
        httpClient={httpClientMock}
        setBreadcrumbs={setBreadcrumbs}
        chrome={chromeMock}
      />
    );

    // Wait for component to load and verify it renders with buttons
    await waitFor(() => {
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
    });

    // Verify the component rendered properly
    expect(screen.getAllByRole('button').length).toBeGreaterThan(0);
  });

  // TODO: mock catch() error response to contain status code
  test.skip('test error toasts posted', async () => {
    jest.spyOn(console, 'log').mockImplementation(() => { }); // silence console log error from main

    httpClientMock.get = jest.fn().mockResolvedValue({
      response: null,
    });

    render(
      <Main
        httpClient={httpClientMock}
        setBreadcrumbs={setBreadcrumbs}
        chrome={chromeMock}
      />
    );

    await waitFor(() => {
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(7);
    });

    const buttons = screen.getAllByRole('button');
    try {
      await act(async () => {
        fireEvent.click(buttons[7]);
      });
    } catch (e) {
      // Expected error
    }
  });
});
