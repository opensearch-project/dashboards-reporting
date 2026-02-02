/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { ReportDefinitionDetails } from '../report_definition_details';
import httpClientMock from '../../../../../test/httpMockClient';
import 'babel-polyfill';

function setBreadcrumbs(array: []) {
  jest.fn();
}

const chromeMock = {
  navGroup: {
    getNavGroupEnabled: jest.fn().mockReturnValue(false),
  },
};

describe('<ReportDefinitionDetails /> panel', () => {
  let propsMock = {
    match: {
      params: {
        reportDefinitionId: jest.fn(),
      },
    },
  };

  const match = {
    params: {
      reportDefinitionId: '1',
    },
  };
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('render on demand definition details', async () => {
    const report_definition = {
      report_params: {
        report_name: 'test create report definition trigger',
        report_source: 'Dashboard',
        description: '',
        core_params: {
          base_url: '',
          report_format: '',
          header: '',
          footer: '',
          time_duration: '',
        },
      },
      delivery: {
        configIds: [],
        title: '',
        textDescription: '',
        htmlDescription: ''
      },
      trigger: {
        trigger_type: 'On demand',
      },
    };

    httpClientMock.get = jest.fn().mockResolvedValue({
      report_definition,
      config_list: []
    });

    const { container } = render(
      <ReportDefinitionDetails
        httpClient={httpClientMock}
        props={propsMock}
        match={match}
        setBreadcrumbs={setBreadcrumbs}
        chrome={chromeMock}
      />
    );
    expect(container.firstChild).toMatchSnapshot();
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });
  });

  test('render 5 hours recurring definition details', async () => {
    const report_definition = {
      report_params: {
        report_name: 'test create report definition trigger',
        report_source: 'Dashboard',
        description: '',
        core_params: {
          base_url: '',
          report_format: '',
          header: '',
          footer: '',
          time_duration: '',
        },
      },
      delivery: {
        configIds: [],
        title: '',
        textDescription: '',
        htmlDescription: ''
      },
      trigger: {
        trigger_type: 'Schedule',
        trigger_params: {
          schedule_type: 'Recurring',
          schedule: {
            interval: {
              period: 5,
              unit: 'HOURS',
              timezone: 'PST8PDT',
            },
          },
          enabled_time: 1114939203,
          enabled: true,
        },
      },
    };

    httpClientMock.get = jest.fn().mockResolvedValue({
      report_definition,
      config_list: []
    });

    const { container } = render(
      <ReportDefinitionDetails
        httpClient={httpClientMock}
        props={propsMock}
        match={match}
        setBreadcrumbs={setBreadcrumbs}
        chrome={chromeMock}
      />
    );
    expect(container.firstChild).toMatchSnapshot();
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });
  });

  test('render disabled daily definition, click', async () => {
    const report_definition = {
      report_params: {
        report_name: 'test create report definition trigger',
        report_source: 'Dashboard',
        description: '',
        core_params: {
          base_url: '',
          report_format: '',
          header: '',
          footer: '',
          time_duration: '',
        },
      },
      delivery: {
        configIds: [],
        title: '',
        textDescription: '',
        htmlDescription: ''
      },
      trigger: {
        trigger_type: 'Schedule',
        trigger_params: {
          schedule_type: 'Recurring',
          schedule: {
            interval: {
              period: 1,
              unit: 'DAYS',
              timezone: 'PST8PDT',
            },
          },
          enabled_time: 1114939203,
          enabled: false,
        },
      },
    };

    httpClientMock.get = jest.fn().mockResolvedValue({
      report_definition,
      config_list: []
    });

    const { container } = render(
      <ReportDefinitionDetails
        httpClient={httpClientMock}
        props={propsMock}
        match={match}
        setBreadcrumbs={setBreadcrumbs}
        chrome={chromeMock}
      />
    );

    expect(container.firstChild).toMatchSnapshot();
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });
  });

  test('simulate click on generateReport', async () => {
    const report_definition = {
      report_params: {
        report_name: null,
        report_source: 'Dashboard',
        description: '',
        core_params: {
          base_url: '',
          report_format: '',
          header: '',
          footer: '',
          time_duration: '',
        },
      },
      delivery: {
        configIds: [],
        title: '',
        textDescription: '',
        htmlDescription: ''
      },
      trigger: {
        trigger_type: 'On demand',
      },
    };

    httpClientMock.get = jest.fn().mockResolvedValue({
      report_definition,
      config_list: []
    });

    render(
      <ReportDefinitionDetails
        httpClient={httpClientMock}
        props={propsMock}
        match={match}
        setBreadcrumbs={setBreadcrumbs}
        chrome={chromeMock}
      />
    );

    await waitFor(() => {
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(1);
    });

    const buttons = screen.getAllByRole('button');
    await act(async () => {
      fireEvent.click(buttons[1]);
    });
  });

  test('simulate click on delete', async () => {
    const report_definition = {
      report_params: {
        report_name: null,
        report_source: 'Dashboard',
        description: '',
        core_params: {
          base_url: '',
          report_format: '',
          header: '',
          footer: '',
          time_duration: '',
        },
      },
      delivery: {
        configIds: [],
        title: '',
        textDescription: '',
        htmlDescription: ''
      },
      trigger: {
        trigger_type: 'Schedule',
        trigger_params: {
          schedule_type: 'Recurring',
          schedule: {
            interval: {
              period: 1,
              unit: 'DAYS',
              timezone: 'PST8PDT',
            },
          },
          enabled_time: 1114939203,
          enabled: false,
        },
      },
    };

    httpClientMock.get = jest.fn().mockResolvedValue({
      report_definition,
      config_list: []
    });

    render(
      <ReportDefinitionDetails
        httpClient={httpClientMock}
        props={propsMock}
        match={match}
        setBreadcrumbs={setBreadcrumbs}
        chrome={chromeMock}
      />
    );

    await waitFor(() => {
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
    });

    const buttons = screen.getAllByRole('button');
    await act(async () => {
      fireEvent.click(buttons[0]);
    });
  });

  test('simulate click to enable', async () => {
    const report_definition = {
      status: 'Disabled',
      report_params: {
        report_name: 'test click on enable disable',
        report_source: 'Dashboard',
        description: '',
        core_params: {
          base_url: '',
          report_format: '',
          header: '',
          footer: '',
          time_duration: '',
        },
      },
      delivery: {
        configIds: [],
        title: '',
        textDescription: '',
        htmlDescription: ''
      },
      trigger: {
        trigger_type: 'Schedule',
        trigger_params: {
          schedule_type: 'Recurring',
          schedule: {
            interval: {
              period: 1,
              unit: 'DAYS',
              timezone: 'PST8PDT',
            },
          },
          enabled_time: 1114939203,
          enabled: false,
        },
      },
    };

    httpClientMock.get = jest.fn().mockResolvedValue({
      report_definition,
      config_list: []
    });

    httpClientMock.put = jest.fn().mockResolvedValue({});

    render(
      <ReportDefinitionDetails
        httpClient={httpClientMock}
        props={propsMock}
        match={match}
        setBreadcrumbs={setBreadcrumbs}
        chrome={chromeMock}
      />
    );

    await waitFor(() => {
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(1);
    });

    const buttons = screen.getAllByRole('button');
    await act(async () => {
      fireEvent.click(buttons[1]);
    });
  });

  test('simulate click to disable', async () => {
    const report_definition = {
      status: 'Active',
      report_params: {
        report_name: 'test click on enable disable',
        report_source: 'Dashboard',
        description: '',
        core_params: {
          base_url: '',
          report_format: '',
          header: '',
          footer: '',
          time_duration: '',
        },
      },
      delivery: {
        configIds: [],
        title: '',
        textDescription: '',
        htmlDescription: ''
      },
      trigger: {
        trigger_type: 'Schedule',
        trigger_params: {
          schedule_type: 'Recurring',
          schedule: {
            interval: {
              period: 1,
              unit: 'DAYS',
              timezone: 'PST8PDT',
            },
          },
          enabled_time: 1114939203,
          enabled: true,
        },
      },
    };

    httpClientMock.get = jest.fn().mockResolvedValue({
      report_definition,
      config_list: []
    });

    httpClientMock.put = jest.fn().mockResolvedValue({});

    render(
      <ReportDefinitionDetails
        httpClient={httpClientMock}
        props={propsMock}
        match={match}
        setBreadcrumbs={setBreadcrumbs}
        chrome={chromeMock}
      />
    );

    await waitFor(() => {
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(1);
    });

    const buttons = screen.getAllByRole('button');
    await act(async () => {
      fireEvent.click(buttons[1]);
    });
  });
});
