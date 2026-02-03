/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { ReportSettings } from '../report_settings';
import 'babel-polyfill';
import 'regenerator-runtime';
import httpClientMock from '../../../../../test/httpMockClient';

const emptyRequest = {
  report_params: {
    report_name: '',
    report_source: '',
    description: '',
    core_params: {
      base_url: '',
      report_format: '',
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
    trigger_type: '',
    trigger_params: {},
  },
  time_created: 0,
  last_updated: 0,
  status: '',
};

let timeRange = {
  timeFrom: new Date(123456789),
  timeTo: new Date(1234567890),
};

const dashboardHits = {
  hits: [
    {
      _id: 'dashboard:abcdefghijklmnop12345',
      _source: {
        dashboard: {
          description: 'mock dashboard value',
          hits: 0,
          timeFrom: 'now-24h',
          timeTo: 'now',
          title: 'Mock Dashboard',
        },
        notebook: {
          name: 'mock notebook name'
        }
      },
    },
  ],
};

const visualizationHits = {
  hits: [
    {
      _id: 'visualization:abcdefghijklmnop12345',
      _source: {
        visualization: {
          description: 'mock visualization value',
          title: 'Mock Visualization',
        },
        notebook: {
          name: 'mock notebook name'
        },
      },
    },
  ],
};

const savedSearchHits = {
  hits: [
    {
      _id: 'search:abcdefghijklmnop12345',
      _source: {
        search: {
          title: 'Mock saved search value',
        },
        notebook: {
          name: 'mock notebook name'
        },
      },
    },
  ],
};

describe('<ReportSettings /> panel', () => {
  jest.spyOn(console, 'log').mockImplementation(() => {});

  test('render component', () => {
    const { container } = render(
      <ReportSettings
        edit={false}
        reportDefinitionRequest={emptyRequest}
        httpClientProps={httpClientMock}
        timeRange={timeRange}
        showSettingsReportNameError={false}
        showTimeRangeError={false}
      />
    );

    expect(container.firstChild).toMatchSnapshot();
  });

  test('render edit, dashboard source', async () => {
    let report_definition = {
      report_params: {
        report_name: 'test create report definition trigger',
        report_source: 'Dashboard',
        description: 'test description',
        core_params: {
          base_url: 'http://localhost:5601/dashboard/abcdefghijklmnop12345',
          report_format: 'pdf',
          header: 'header content',
          footer: 'footer content',
          time_duration: 'PT30M',
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
          enabled: false,
          enabled_time: 1234567890,
          schedule: {
            interval: {
              period: 1,
              start_time: 123456789,
              unit: 'Days'
            }
          }
        },
      },
    };

    httpClientMock.get = jest.fn().mockResolvedValue({
      report_definition,
      hits: dashboardHits,
    });

    const { container } = render(
      <ReportSettings
        edit={true}
        reportDefinitionRequest={emptyRequest}
        httpClientProps={httpClientMock}
        timeRange={timeRange}
        showSettingsReportNameError={false}
        showTimeRangeError={false}
      />
    );

    expect(container.firstChild).toMatchSnapshot();
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });
  });

  test('render edit, visualization source', async () => {
    let report_definition = {
      report_params: {
        report_name: 'test create report definition trigger',
        report_source: 'Visualization',
        description: 'test description',
        core_params: {
          base_url: 'http://localhost:5601/edit/abcdefghijklmnop12345',
          report_format: 'png',
          header: 'header content',
          footer: 'footer content',
          time_duration: 'PT30M',
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
          enabled: false,
          enabled_time: 1234567890,
          schedule: {
            interval: {
              period: 1,
              start_time: 123456789,
              unit: 'Days'
            }
          }
        },
      },
    };

    httpClientMock.get = jest.fn().mockResolvedValue({
      report_definition,
      hits: visualizationHits,
    });

    const { container } = render(
      <ReportSettings
        edit={true}
        reportDefinitionRequest={emptyRequest}
        httpClientProps={httpClientMock}
        timeRange={timeRange}
        showSettingsReportNameError={false}
        showTimeRangeError={false}
      />
    );

    expect(container.firstChild).toMatchSnapshot();
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });
  });

  test('render edit, saved search source', async () => {
    let report_definition = {
      report_params: {
        report_name: 'test create report definition trigger',
        report_source: 'Saved search',
        description: 'test description',
        core_params: {
          base_url: 'http://localhost:5601/discover/abcdefghijklmnop12345',
          report_format: 'csv',
          header: 'test header content',
          footer: 'test footer content',
          time_duration: 'PT30M',
          saved_search_id: 'abcdefghijk',
          limit: 10000,
          excel: true,
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
          enabled: false,
          enabled_time: 1234567890,
          schedule: {
            interval: {
              period: 1,
              start_time: 123456789,
              unit: 'Days'
            }
          }
        },
      },
    };

    httpClientMock.get = jest.fn().mockResolvedValue({
      report_definition,
      hits: savedSearchHits,
    });

    const { container } = render(
      <ReportSettings
        edit={true}
        reportDefinitionRequest={emptyRequest}
        httpClientProps={httpClientMock}
        timeRange={timeRange}
        showSettingsReportNameError={false}
        showTimeRangeError={false}
      />
    );

    expect(container.firstChild).toMatchSnapshot();
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });
  });

  test('render edit, dashboard source', async () => {
    let report_definition = {
      report_params: {
        report_name: 'test create report definition trigger',
        report_source: 'Saved search',
        description: 'test description',
        core_params: {
          base_url: 'http://localhost:5601',
          report_format: 'csv',
          header: 'test header content',
          footer: 'test footer content',
          time_duration: 'PT30M',
          saved_search_id: 'abcdefghijk',
          limit: 10000,
          excel: true,
        },
      },
      delivery: {
        delivery_type: '',
        delivery_params: {},
      },
      trigger: {
        trigger_type: 'Schedule',
        trigger_params: {
          schedule_type: 'Recurring',
          enabled: false,
          enabled_time: 1234567890,
          schedule: {
            interval: {
              period: 1,
              start_time: 123456789,
              unit: 'Days'
            }
          }
        },
      },
    };

    httpClientMock.get = jest.fn().mockResolvedValue({
      report_definition,
      hits: dashboardHits,
    });

    const { container } = render(
      <ReportSettings
        edit={true}
        reportDefinitionRequest={emptyRequest}
        httpClientProps={httpClientMock}
        timeRange={timeRange}
        showSettingsReportNameError={false}
        showTimeRangeError={false}
      />
    );

    expect(container.firstChild).toMatchSnapshot();
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });
  });

  test('render edit, visualization source', async () => {
    let report_definition = {
      report_params: {
        report_name: 'test create report definition trigger',
        report_source: 'Saved search',
        description: 'test description',
        core_params: {
          base_url: 'http://localhost:5601',
          report_format: 'csv',
          header: 'test header content',
          footer: 'test footer content',
          time_duration: 'PT30M',
          saved_search_id: 'abcdefghijk',
          limit: 10000,
          excel: true,
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
          enabled: false,
          enabled_time: 1234567890,
          schedule: {
            interval: {
              period: 1,
              start_time: 123456789,
              unit: 'Days'
            }
          }
        },
      },
    };

    httpClientMock.get = jest.fn().mockResolvedValue({
      report_definition,
      hits: visualizationHits,
    });

    const { container } = render(
      <ReportSettings
        edit={true}
        reportDefinitionRequest={emptyRequest}
        httpClientProps={httpClientMock}
        timeRange={timeRange}
        showSettingsReportNameError={false}
        showTimeRangeError={false}
      />
    );

    expect(container.firstChild).toMatchSnapshot();
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });
  });


  test('dashboard create from in-context', async () => {
    window = Object.create(window);
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: {
        href:
          'http://localhost:5601/app/reports-dashboards#/create?previous=dashboard:abcdefghijklmnop12345?timeFrom=2020-10-26T20:52:56.382Z?timeTo=2020-10-27T20:52:56.384Z',
      },
    });

    let report_definition = {
      report_params: {
        report_name: 'test create report definition trigger',
        report_source: 'Dashboard',
        description: '',
        core_params: {
          base_url: 'http://localhost:5601/dashboard/abcdefghijklmnop12345',
          report_format: 'png',
          header: '',
          footer: '',
          time_duration: 'PT30M',
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
          enabled: false,
          enabled_time: 1234567890,
          schedule: {
            interval: {
              period: 1,
              start_time: 123456789,
              unit: 'Days'
            }
          }
        },
      },
    };

    httpClientMock.get = jest.fn().mockResolvedValue({
      report_definition,
      hits: dashboardHits,
    });

    const { container } = render(
      <ReportSettings
        edit={false}
        reportDefinitionRequest={emptyRequest}
        httpClientProps={httpClientMock}
        timeRange={timeRange}
        showSettingsReportNameError={false}
        showTimeRangeError={false}
      />
    );

    expect(container.firstChild).toMatchSnapshot();
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });
  });

  test('visualization create from in-context', async () => {
    // @ts-ignore
    delete window.location; // reset window.location.href for in-context testing

    window = Object.create(window);
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: {
        href:
          'http://localhost:5601/app/reports-dashboards#/create?previous=visualize:abcdefghijklmnop12345?timeFrom=2020-10-26T20:52:56.382Z?timeTo=2020-10-27T20:52:56.384Z',
      },
    });

    let report_definition = {
      report_params: {
        report_name: 'test create report definition trigger',
        report_source: 'Visualization',
        description: '',
        core_params: {
          base_url: 'http://localhost:5601/edit/abcdefghijklmnop12345',
          report_format: 'pdf',
          header: '',
          footer: '',
          time_duration: 'PT30M',
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
          enabled: false,
          enabled_time: 1234567890,
          schedule: {
            interval: {
              period: 1,
              start_time: 123456789,
              unit: 'Days'
            }
          }
        },
      },
    };

    httpClientMock.get = jest.fn().mockResolvedValue({
      report_definition,
      hits: visualizationHits,
    });

    const { container } = render(
      <ReportSettings
        edit={false}
        reportDefinitionRequest={emptyRequest}
        httpClientProps={httpClientMock}
        timeRange={timeRange}
        showSettingsReportNameError={false}
        showTimeRangeError={false}
      />
    );

    expect(container.firstChild).toMatchSnapshot();
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });
  });

  test('saved search create from in-context', async () => {
    // @ts-ignore
    delete window.location; // reset window.location.href for in-context testing

    window = Object.create(window);
    Object.defineProperty(window, 'location', {
      value: {
        href:
          'http://localhost:5601/app/reports-dashboards#/create?previous=discover:abcdefghijklmnop12345?timeFrom=2020-10-26T20:52:56.382Z?timeTo=2020-10-27T20:52:56.384Z',
      },
    });

    let report_definition = {
      report_params: {
        report_name: 'test create report definition trigger',
        report_source: 'Saved search',
        description: '',
        core_params: {
          base_url: 'http://localhost:5601/discover/abcdefghijklmnop12345',
          report_format: 'csv',
          header: '',
          footer: '',
          time_duration: 'PT30M',
          saved_search_id: 'abcdefghijk',
          limit: 10000,
          excel: true,
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
        trigger_params: {},
      },
    };

    httpClientMock.get = jest.fn().mockResolvedValue({
      report_definition,
      hits: savedSearchHits,
    });

    const { container } = render(
      <ReportSettings
        edit={false}
        reportDefinitionRequest={emptyRequest}
        httpClientProps={httpClientMock}
        timeRange={timeRange}
        showSettingsReportNameError={false}
        showTimeRangeError={false}
      />
    );

    expect(container.firstChild).toMatchSnapshot();
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });
  });

  test('simulate click on dashboard combo box', async () => {
    let report_definition = {
      report_params: {
        report_name: 'test create report definition trigger',
        report_source: 'Saved search',
        description: 'test description',
        core_params: {
          base_url: 'http://localhost:5601',
          report_format: 'csv',
          header: 'test header content',
          footer: 'test footer content',
          time_duration: 'PT30M',
          saved_search_id: 'abcdefghijk',
          limit: 10000,
          excel: true,
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
          enabled: false,
          enabled_time: 1234567890,
          schedule: {
            interval: {
              period: 1,
              start_time: 123456789,
              unit: 'Days'
            }
          }
        },
      },
    };

    httpClientMock.get = jest.fn().mockResolvedValue({
      report_definition,
      hits: dashboardHits,
    });

    const { container } = render(
      <ReportSettings
        edit={false}
        reportDefinitionRequest={emptyRequest}
        httpClientProps={httpClientMock}
        timeRange={timeRange}
        showSettingsReportNameError={false}
        showTimeRangeError={false}
      />
    );

    // Wait for component to render with dashboard radio visible and selected by default
    await waitFor(() => {
      expect(screen.getByLabelText('Dashboard')).toBeInTheDocument();
    });

    // Verify the Dashboard radio is present and has checked attribute
    const dashboardRadio = screen.getByLabelText('Dashboard');
    expect(dashboardRadio).toHaveAttribute('checked');
  });

  test('simulate click on visualization radio', async () => {
    let report_definition = {
      report_params: {
        report_name: 'test create report definition trigger',
        report_source: 'Visualization',
        description: 'test description',
        core_params: {
          base_url: 'http://localhost:5601',
          report_format: 'pdf',
          header: 'test header content',
          footer: 'test footer content',
          time_duration: 'PT30M',
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
          enabled: false,
          enabled_time: 1234567890,
          schedule: {
            interval: {
              period: 1,
              start_time: 123456789,
              unit: 'Days'
            }
          }
        },
      },
    };

    httpClientMock.get = jest.fn().mockResolvedValue({
      report_definition,
      hits: visualizationHits,
    });

    const { container } = render(
      <ReportSettings
        edit={false}
        reportDefinitionRequest={emptyRequest}
        httpClientProps={httpClientMock}
        timeRange={timeRange}
        showSettingsReportNameError={false}
        showTimeRangeError={false}
      />
    );

    // Wait for the component to render
    await waitFor(() => {
      expect(screen.getByLabelText('Visualization')).toBeInTheDocument();
    });

    // Click on the Visualization radio button
    const visualizationRadio = screen.getByLabelText('Visualization');
    await act(async () => {
      fireEvent.click(visualizationRadio);
    });

    // Verify visualization radio is now selected
    expect(visualizationRadio).toBeChecked();
  });

  test('simulate click on saved search radio', async () => {
    let report_definition = {
      report_params: {
        report_name: 'test create report definition trigger',
        report_source: 'Saved search',
        description: 'test description',
        core_params: {
          base_url: 'http://localhost:5601',
          report_format: 'pdf',
          header: 'test header content',
          footer: 'test footer content',
          time_duration: 'PT30M',
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
          enabled: false,
          enabled_time: 1234567890,
          schedule: {
            interval: {
              period: 1,
              start_time: 123456789,
              unit: 'Days'
            }
          }
        },
      },
    };

    httpClientMock.get = jest.fn().mockResolvedValue({
      report_definition,
      hits: savedSearchHits,
    });

    const { container } = render(
      <ReportSettings
        edit={false}
        reportDefinitionRequest={emptyRequest}
        httpClientProps={httpClientMock}
        timeRange={timeRange}
        showSettingsReportNameError={false}
        showTimeRangeError={false}
      />
    );

    // Wait for the component to render
    await waitFor(() => {
      expect(screen.getByLabelText('Saved search')).toBeInTheDocument();
    });

    // Click on the Saved search radio button
    const savedSearchRadio = screen.getByLabelText('Saved search');
    await act(async () => {
      fireEvent.click(savedSearchRadio);
    });

    // Verify saved search radio is now selected
    expect(savedSearchRadio).toBeChecked();
  });

  test('display errors on create', async () => {
    const { container } = render(
      <ReportSettings
        edit={false}
        reportDefinitionRequest={emptyRequest}
        httpClientProps={httpClientMock}
        timeRange={timeRange}
        showSettingsReportNameError={true}
        showTimeRangeError={true}
      />
    );

    expect(container.firstChild).toMatchSnapshot();
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });
  });
});
