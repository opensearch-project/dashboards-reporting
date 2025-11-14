/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { i18n } from '@osd/i18n';
import {
  EuiSmallButtonEmpty,
  EuiFlexGroup,
  EuiFlexItem,
  EuiGlobalToastList,
  EuiSmallButton,
  EuiTitle,
  EuiPageBody,
  EuiSpacer,
} from '@elastic/eui';
import { ReportSettings } from '../report_settings';
import { generateReportFromDefinitionId } from '../../main/main_utils';
import {
  permissionsMissingToast,
  permissionsMissingActions,
} from '../../utils/utils';
import { definitionInputValidation } from '../utils/utils';
import { ReportDelivery } from '../delivery';

interface ReportParamsType {
  report_name: string;
  report_source: string;
  description: string;
  core_params: VisualReportParams | DataReportParams;
}
interface VisualReportParams {
  base_url: string;
  report_format: string;
  header: string;
  footer: string;
  time_duration: string;
  timeRangeParams: TimeRangeParams;
}

interface DataReportParams {
  saved_search_id: number;
  base_url: string;
  report_format: string;
  time_duration: string;
  timeRangeParams: TimeRangeParams;
}
interface TriggerType {
  trigger_type: string;
  trigger_params?: any;
}

interface DeliveryType {
  configIds: string[];
  title: string;
  textDescription: string;
  htmlDescription: string;
}

export interface TriggerParamsType {
  schedule_type: string;
  schedule: Recurring | Cron;
  enabled_time: number;
  enabled: boolean;
}

interface Recurring {
  interval: {
    period: number;
    unit: string;
    start_time: number;
  };
}

interface Cron {
  cron: {
    cron_expression: string;
    time_zone: string;
  };
}

export interface ReportDefinitionParams {
  report_params: ReportParamsType;
  delivery: DeliveryType;
  trigger: TriggerType;
}

export interface TimeRangeParams {
  timeFrom: Date;
  timeTo: Date;
}

export function CreateReport(props: {
  [x: string]: any;
  setBreadcrumbs?: any;
  httpClient?: any;
  chrome: any;
}) {
  const { chrome } = props;

  let createReportDefinitionRequest: ReportDefinitionParams = {
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
      htmlDescription: '',
    },
    trigger: {
      trigger_type: '',
    },
  };

  const [toasts, setToasts] = useState([]);
  const [comingFromError, setComingFromError] = useState(false);
  const [preErrorData, setPreErrorData] = useState({});

  const [
    showSettingsReportNameError,
    setShowSettingsReportNameError,
  ] = useState(false);
  const [
    settingsReportNameErrorMessage,
    setSettingsReportNameErrorMessage,
  ] = useState('');
  const [
    showSettingsReportSourceError,
    setShowSettingsReportSourceError,
  ] = useState(false);
  const [
    settingsReportSourceErrorMessage,
    setSettingsReportSourceErrorMessage,
  ] = useState('');
  const [
    showTriggerIntervalNaNError,
    setShowTriggerIntervalNaNError,
  ] = useState(false);
  const [showCronError, setShowCronError] = useState(false);
  const [showTimeRangeError, setShowTimeRangeError] = useState(false);
  const getNavGroupEnabled = chrome.navGroup.getNavGroupEnabled();

  // preserve the state of the request after an invalid create report definition request
  if (comingFromError) {
    createReportDefinitionRequest = preErrorData;
  }

  const addInputValidationErrorToastHandler = () => {
    const errorToast = {
      title: i18n.translate(
        'opensearch.reports.createReportDefinition.error.fieldsHaveAnError',
        {
          defaultMessage:
            'One or more fields have an error. Please check and try again.',
        }
      ),
      color: 'danger',
      iconType: 'alert',
      id: 'errorToast',
    };
    // @ts-ignore
    setToasts(toasts.concat(errorToast));
  };

  const handleInputValidationErrorToast = () => {
    addInputValidationErrorToastHandler();
  };

  const addErrorOnCreateToastHandler = (errorType: string) => {
    let toast = {};
    if (errorType === 'permissions') {
      toast = permissionsMissingToast(
        permissionsMissingActions.CREATING_REPORT_DEFINITION
      );
    } else if (errorType === 'API') {
      toast = {
        title: i18n.translate(
          'opensearch.reports.createReportDefinition.error.errorCreating',
          { defaultMessage: 'Error creating report definition.' }
        ),
        color: 'danger',
        iconType: 'alert',
        id: 'errorToast',
      };
    }
    // @ts-ignore
    setToasts(toasts.concat(toast));
  };

  const handleErrorOnCreateToast = (errorType: string) => {
    addErrorOnCreateToastHandler(errorType);
  };

  const removeToast = (removedToast: { id: string }) => {
    setToasts(toasts.filter((toast: any) => toast.id !== removedToast.id));
  };

  const newTimeRange = {
    timeFrom: new Date(),
    timeTo: new Date(),
  };

  const createNewReportDefinition = async (
    metadata: ReportDefinitionParams,
    timeRange: TimeRangeParams
  ) => {
    const { httpClient } = props;
    // TODO: need better handle
    if (
      metadata.trigger.trigger_type === 'On demand' &&
      metadata.trigger.trigger_params !== undefined
    ) {
      delete metadata.trigger.trigger_params;
    }

    let error = false;
    await definitionInputValidation(
      metadata,
      error,
      setShowSettingsReportNameError,
      setSettingsReportNameErrorMessage,
      setShowSettingsReportSourceError,
      setSettingsReportSourceErrorMessage,
      setShowTriggerIntervalNaNError,
      timeRange,
      setShowTimeRangeError,
      setShowCronError
    ).then((response) => {
      error = response;
    });
    if (error) {
      handleInputValidationErrorToast();
      setPreErrorData(metadata);
      setComingFromError(true);
    } else {
      httpClient
        .post('../api/reporting/reportDefinition', {
          body: JSON.stringify(metadata),
          headers: {
            'Content-Type': 'application/json',
          },
        })
        .then(
          async (resp: {
            scheduler_response: { reportDefinitionId: string };
          }) => {
            // TODO: consider handle the on demand report generation from server side instead
            if (metadata.trigger.trigger_type === 'On demand') {
              const reportDefinitionId =
                resp.scheduler_response.reportDefinitionId;
              generateReportFromDefinitionId(reportDefinitionId, httpClient);
            }
            window.location.assign(`reports-dashboards#/create=success`);
          }
        )
        .catch((errorRequest: { body: { statusCode: number } }) => {
          console.log('error in creating report definition: ' + errorRequest);
          if (errorRequest.body.statusCode === 403) {
            handleErrorOnCreateToast('permissions');
          } else {
            handleErrorOnCreateToast('API');
          }
        });
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    props.setBreadcrumbs([
      {
        text: i18n.translate(
          'opensearch.reports.createReportDefinition.breadcrumb.reporting',
          { defaultMessage: 'Reporting' }
        ),
        href: '#',
      },
      {
        text: i18n.translate(
          'opensearch.reports.createReportDefinition.breadcrumb.createReportDefinition',
          { defaultMessage: 'Create report definition' }
        ),
        href: '#/create',
      },
    ]);
  }, []);

  return (
    <div>
      <EuiPageBody>
        <EuiTitle>
          <h1>
            {!getNavGroupEnabled &&
              i18n.translate(
                'opensearch.reports.createReportDefinition.title',
                {
                  defaultMessage: 'Create report definition',
                }
              )}
          </h1>
        </EuiTitle>
        {!getNavGroupEnabled && <EuiSpacer size="s" />}
        <ReportSettings
          edit={false}
          editDefinitionId={''} // empty string since we are coming from create
          reportDefinitionRequest={createReportDefinitionRequest}
          httpClientProps={props.httpClient}
          timeRange={newTimeRange}
          showSettingsReportNameError={showSettingsReportNameError}
          settingsReportNameErrorMessage={settingsReportNameErrorMessage}
          showSettingsReportSourceError={showSettingsReportSourceError}
          settingsReportSourceErrorMessage={settingsReportSourceErrorMessage}
          showTimeRangeError={showTimeRangeError}
          showTriggerIntervalNaNError={showTriggerIntervalNaNError}
          showCronError={showCronError}
        />
        <EuiSpacer />
        <ReportDelivery
          edit={false}
          reportDefinitionRequest={createReportDefinitionRequest}
          httpClientProps={props.httpClient}
        />
        <EuiSpacer />
        <EuiFlexGroup justifyContent="flexEnd">
          <EuiFlexItem grow={false}>
            <EuiSmallButtonEmpty
              onClick={() => {
                window.location.assign(`reports-dashboards#/`);
              }}
            >
              {i18n.translate(
                'opensearch.reports.createReportDefinition.cancel',
                { defaultMessage: 'Cancel' }
              )}
            </EuiSmallButtonEmpty>
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <EuiSmallButton
              fill={true}
              onClick={() =>
                createNewReportDefinition(
                  createReportDefinitionRequest,
                  newTimeRange
                )
              }
              id={'createNewReportDefinition'}
            >
              {i18n.translate(
                'opensearch.reports.createReportDefinition.create',
                { defaultMessage: 'Create' }
              )}
            </EuiSmallButton>
          </EuiFlexItem>
        </EuiFlexGroup>
        <EuiGlobalToastList
          toasts={toasts}
          dismissToast={removeToast}
          toastLifeTimeMs={6000}
        />
      </EuiPageBody>
    </div>
  );
}
