/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { i18n } from '@osd/i18n';
import 'babel-polyfill';
import { HttpSetup } from '../../../../../src/core/public';
import { uiSettingsService } from '../utils/settings_service';
import { GENERATE_REPORT_PARAM } from '../visual_report/constants';
import { REPORTING_NOTIFICATIONS_DASHBOARDS_API } from '../../../common';

export const getAvailableNotificationsChannels = (configList: any) => {
  const availableChannels = [];
  for (let i = 0; i < configList.length; ++i) {
    let channelEntry = {};
    channelEntry = {
      label: configList[i].config.name,
      id: configList[i].config_id,
    };
    availableChannels.push(channelEntry);
  }
  return availableChannels;
};

interface FileFormatsOptions {
  [key: string]: string;
}

export const fileFormatsUpper: FileFormatsOptions = {
  csv: 'CSV',
  xlsx: 'XLSX',
  pdf: 'PDF',
  png: 'PNG',
};

export const humanReadableDate = (date: string | number | Date) => {
  const readableDate = new Date(date);
  return (
    readableDate.toDateString() + ' @ ' + readableDate.toLocaleTimeString()
  );
};

export const extractFilename = (filename: string) => {
  const index = filename.lastIndexOf('.');
  if (index === -1) {
    return filename;
  }

  return filename.slice(0, index);
};

export const extractFileFormat = (filename: string) => {
  const index = filename.lastIndexOf('.');
  return filename.slice(index + 1);
};

export const getFileFormatPrefix = (fileFormat: string) => {
  const fileFormatPrefix = 'data:' + fileFormat + ';base64,';
  return fileFormatPrefix;
};

export const addReportsTableContent = (data: string | any[]) => {
  const reportsTableItems = [];
  for (let index = 0; index < data.length; ++index) {
    const item = data[index];
    const report = item._source;
    const reportDefinition = report.report_definition;
    const reportParams = reportDefinition.report_params;
    const trigger = reportDefinition.trigger;

    const reportsTableEntry = {
      id: item._id,
      reportName: reportParams.report_name,
      type: trigger.trigger_type,
      channel: reportDefinition.delivery.configIds,
      sender: reportDefinition.delivery.emailSender,
      opensearchDashboardsRecipients: `\u2014`,
      emailRecipients: reportDefinition.delivery.emailRecipients,
      reportSource: reportParams.report_source,
      // TODO: wrong name
      timeCreated: report.time_created,
      state: report.state,
      url: report.query_url,
      format: reportParams.core_params.report_format,
      htmldescription: reportDefinition.delivery.htmlDescription,
      textDescription: reportDefinition.delivery.textDescription,
      title: reportDefinition.delivery.title,
    };
    reportsTableItems.push(reportsTableEntry);
  }
  return reportsTableItems;
};

export const addReportDefinitionsTableContent = (data: any) => {
  const reportDefinitionsTableItems = [];
  for (let index = 0; index < data.length; ++index) {
    const item = data[index];
    const reportDefinition = item._source.report_definition;
    const reportNotification = reportDefinition.delivery;
    const reportParams = reportDefinition.report_params;
    const trigger = reportDefinition.trigger;
    const triggerParams = trigger.trigger_params;
    const reportDefinitionsTableEntry = {
      id: item._id,
      reportName: reportParams.report_name,
      type: trigger.trigger_type,
      owner: `\u2014`, // Todo: replace
      source: reportParams.report_source,
      baseUrl: reportParams.core_params.base_url,
      lastUpdated: reportDefinition.last_updated,
      details:
        trigger.trigger_type === 'On demand'
          ? `\u2014`
          : triggerParams.schedule_type, // e.g. recurring, cron based
      status: reportDefinition.status,
      notificationsEnabled:
        reportNotification.configIds.length > 0 ? 'Enabled' : 'Disabled',
    };
    reportDefinitionsTableItems.push(reportDefinitionsTableEntry);
  }
  return reportDefinitionsTableItems;
};

export const removeDuplicatePdfFileFormat = (filename: string) => {
  return filename.substring(0, filename.length - 4);
};

async function getDataReportURL(
  stream: string,
  fileFormat: string
): Promise<string> {
  if (fileFormat === 'xlsx') {
    const response = await fetch(stream);
    const blob = await response.blob();
    return URL.createObjectURL(blob);
  }

  const blob = new Blob([stream]);
  return URL.createObjectURL(blob);
}

export const readDataReportToFile = async (
  stream: string,
  fileFormat: string,
  fileName: string
) => {
  const url = await getDataReportURL(stream, fileFormat);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const readStreamToFile = async (
  stream: string,
  fileFormat: string,
  fileName: string
) => {
  const link = document.createElement('a');
  if (fileName.includes('csv') || fileName.includes('xlsx')) {
    readDataReportToFile(stream, fileFormat, fileName);
    return;
  }
  const fileFormatPrefix = getFileFormatPrefix(fileFormat);
  const url = fileFormatPrefix + stream;
  if (typeof link.download !== 'string') {
    window.open(url, '_blank');
    return;
  }
  link.download = fileName;
  link.href = url;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const generateReportFromDefinitionId = async (
  reportDefinitionId: string,
  httpClient: HttpSetup
) => {
  let status = false;
  let permissionsError = false;
  await httpClient
    .post(`../api/reporting/generateReport/${reportDefinitionId}`, {
      headers: {
        'Content-Type': 'application/json',
      },
      query: uiSettingsService.getSearchParams(),
    })
    .then(async (response: any) => {
      // for emailing a report, this API response doesn't have response body
      if (!response) return;
      const fileFormat = extractFileFormat(response.filename);
      const fileName = response.filename;
      if (fileFormat === 'csv' || fileFormat === 'xlsx') {
        await readStreamToFile(await response.data, fileFormat, fileName);
        status = true;
        return;
      }

      // generate reports in browser is memory intensive, do it in a new process by removing referrer
      const a = document.createElement('a');
      a.href =
        window.location.origin +
        `${response.queryUrl}&${GENERATE_REPORT_PARAM}=${response.reportId}`;
      a.target = '_blank';
      a.rel = 'noreferrer';
      a.click();
      status = true;
    })
    .catch((error) => {
      console.log('error on generating report:', error);
      if (error.body.statusCode === 403) {
        permissionsError = true;
      }
      status = false;
    });
  return {
    status,
    permissionsError,
  };
};

export const generateReportById = async (
  reportId: string,
  httpClient: HttpSetup,
  handleSuccessToast,
  handleErrorToast,
  handlePermissionsMissingToast
) => {
  await httpClient
    .get(`../api/reporting/generateReport/${reportId}`, {
      query: uiSettingsService.getSearchParams(),
    })
    .then(async (response) => {
      // TODO: duplicate code, extract to be a function that can reuse. e.g. handleResponse(response)
      const fileFormat = extractFileFormat(response.filename);
      const fileName = response.filename;
      if (fileFormat === 'csv' || fileFormat === 'xlsx') {
        await readStreamToFile(await response.data, fileFormat, fileName);
        handleSuccessToast();
        return response;
      }

      // generate reports in browser is memory intensive, do it in a new process by removing referrer
      const a = document.createElement('a');
      a.href =
        window.location.origin +
        `${response.queryUrl}&${GENERATE_REPORT_PARAM}=${reportId}`;
      a.target = '_blank';
      a.rel = 'noreferrer';
      a.click();
    })
    .catch((error) => {
      console.log('error on generating report by id:', error);
      if (error.body.statusCode === 403) {
        handlePermissionsMissingToast();
      } else if (error.body.statusCode === 503) {
        handleErrorToast(
          i18n.translate('opensearch.reports.utils.errorTitle', {
            defaultMessage: 'Error generating report.',
          }),
          i18n.translate('opensearch.reports.utils.errorText', {
            defaultMessage:
              'Timed out generating report ID {reportId}. Try again later.',
            values: { reportId },
            description: 'Error number toast',
          })
        );
      } else {
        handleErrorToast();
      }
    });
};
export const sendTestNotificationsMessage = async (
  id: string,
  httpClientProps: HttpSetup,
  item: any
) => {
  try {
    await httpClientProps.get(
      `${REPORTING_NOTIFICATIONS_DASHBOARDS_API.SEND_TEST_MESSAGE}/${item.channel[0]}`,
      {
        query: { feature: 'report' },
      }
    );
  } catch (error) {
    console.log('error', error);
  }
};
export const getChannelsDetails = async (data: any, httpClient: HttpSetup) => {
  try {
    const arrayData = data.data;
    for (let i = 0; i < arrayData.length; i++) {
      const id = arrayData[i]._source.report_definition.delivery.configIds[0];
      const channel = await httpClient.get(
        `${REPORTING_NOTIFICATIONS_DASHBOARDS_API.GET_CONFIG}/${id}`
      );
      const sender = await httpClient.get(
        `${REPORTING_NOTIFICATIONS_DASHBOARDS_API.GET_CONFIG}/${channel.config_list[0].config.email.email_account_id}`
      );
      arrayData[i]._source.report_definition.delivery.emailRecipients =
        channel.config_list[0].config.email.recipient_list;
      arrayData[i]._source.report_definition.delivery.emailSender =
        sender.config_list[0].config.smtp_account.from_address;
    }
    return arrayData;
  } catch (error) {
    console.log('error', error);
  }
};
