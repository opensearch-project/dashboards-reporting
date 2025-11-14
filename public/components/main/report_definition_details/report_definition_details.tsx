/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { i18n } from '@osd/i18n';
import {
  EuiFlexGroup,
  EuiFlexItem,
  EuiPageHeader,
  EuiTitle,
  EuiPageContent,
  EuiHorizontalRule,
  EuiSpacer,
  EuiPageHeaderSection,
  EuiSmallButton,
  EuiIcon,
  EuiLink,
  EuiGlobalToastList,
  EuiOverlayMask,
  EuiConfirmModal,
} from '@elastic/eui';
import moment from 'moment';
import {
  ReportDetailsComponent,
  trimAndRenderAsText,
} from '../report_details/report_details';
import {
  fileFormatsUpper,
  generateReportFromDefinitionId,
} from '../main_utils';
import { ReportDefinitionSchemaType } from '../../../../server/model';
import {
  permissionsMissingToast,
  permissionsMissingActions,
} from '../../utils/utils';
import { GenerateReportLoadingModal } from '../loading_modal';
import { REPORTING_NOTIFICATIONS_DASHBOARDS_API } from '../../../../common';

const ON_DEMAND = 'On demand';

interface ReportDefinitionDetails {
  name: string;
  description: string;
  created: string;
  lastUpdated: string;
  source: string;
  recordLimit: number | undefined;
  timePeriod: string;
  fileFormat: string;
  status: string | undefined;
  reportHeader: string;
  reportFooter: string;
  triggerType: string;
  scheduleDetails: string;
  baseUrl: string;
  channelName: string;
}

export function ReportDefinitionDetails(props: {
  match?: any;
  setBreadcrumbs?: any;
  httpClient?: any;
  chrome: any;
}) {
  const { chrome } = props;
  const [reportDefinitionDetails, setReportDefinitionDetails] = useState<
    ReportDefinitionDetails
  >({
    name: '',
    description: '',
    created: '',
    lastUpdated: '',
    source: '',
    recordLimit: 0,
    timePeriod: '',
    fileFormat: '',
    status: '',
    reportHeader: '',
    reportFooter: '',
    triggerType: '',
    scheduleDetails: '',
    baseUrl: '',
    emailrecipients: [],
  });
  const [
    reportDefinitionRawResponse,
    setReportDefinitionRawResponse,
  ] = useState<any>({});
  const [toasts, setToasts] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showLoading, setShowLoading] = useState(false);
  const reportDefinitionId = props.match.params.reportDefinitionId;
  const getNavGroupEnabled = chrome.navGroup.getNavGroupEnabled();

  const handleLoading = (e: boolean | ((prevState: boolean) => boolean)) => {
    setShowLoading(e);
  };

  const handleShowDeleteModal = (
    e: boolean | ((prevState: boolean) => boolean)
  ) => {
    setShowDeleteModal(e);
  };

  const addPermissionsMissingStatusChangeToastHandler = () => {
    const toast = permissionsMissingToast(
      permissionsMissingActions.CHANGE_SCHEDULE_STATUS
    );
    // @ts-ignore
    setToasts(toasts.concat(toast));
  };

  const addPermissionsMissingDeleteToastHandler = () => {
    const toast = permissionsMissingToast(
      permissionsMissingActions.DELETE_REPORT_DEFINITION
    );
    // @ts-ignore
    setToasts(toasts.concat(toast));
  };

  const handlePermissionsMissingDeleteToast = () => {
    addPermissionsMissingDeleteToastHandler();
  };

  const addPermissionsMissingGenerateReportToastHandler = () => {
    const toast = permissionsMissingToast(
      permissionsMissingActions.GENERATING_REPORT
    );
    // @ts-ignore
    setToasts(toasts.concat(toast));
  };

  const addErrorLoadingDetailsToastHandler = () => {
    const errorToast = {
      title: i18n.translate(
        'opensearch.reports.reportDefinitionsDetails.toast.errorLoadingReportDefinitionDetails. ',
        { defaultMessage: 'Error loading report definition details.' }
      ),
      color: 'danger',
      iconType: 'alert',
      id: 'reportDefinitionDetailsErrorToast',
    };
    // @ts-ignore
    setToasts(toasts.concat(errorToast));
  };

  const handleDetailsErrorToast = () => {
    addErrorLoadingDetailsToastHandler();
  };

  const addSuccessGeneratingReportToastHandler = () => {
    const successToast = {
      title: i18n.translate(
        'opensearch.reports.reportDefinitionsDetails.toast.successfullyGeneratedReport. ',
        { defaultMessage: 'Successfully generated report.' }
      ),
      color: 'success',
      iconType: 'check',
      id: 'generateReportSuccessToast',
    };
    // @ts-ignore
    setToasts(toasts.concat(successToast));
  };

  const handleSuccessGeneratingReportToast = () => {
    addSuccessGeneratingReportToastHandler();
  };

  const addErrorGeneratingReportToastHandler = () => {
    const errorToast = {
      title: i18n.translate(
        'opensearch.reports.reportDefinitionsDetails.toast.errorGeneratingReport. ',
        { defaultMessage: 'Error generating report.' }
      ),
      color: 'danger',
      iconType: 'alert',
      id: 'generateReportErrorToast',
    };
    // @ts-ignore
    setToasts(toasts.concat(errorToast));
  };

  const handleErrorGeneratingReportToast = (errorType: string) => {
    if (errorType === 'permissions') {
      addPermissionsMissingGenerateReportToastHandler();
    } else if (errorType === 'API') {
      addErrorGeneratingReportToastHandler();
    }
  };

  const addSuccessEnablingScheduleToastHandler = () => {
    const successToast = {
      title: i18n.translate(
        'opensearch.reports.reportDefinitionsDetails.toast.successfullyEnabledSchedule. ',
        { defaultMessage: 'Successfully enabled schedule.' }
      ),
      color: 'success',
      iconType: 'check',
      id: 'successEnableToast',
    };
    // @ts-ignore
    setToasts(toasts.concat(successToast));
  };

  const addErrorEnablingScheduleToastHandler = () => {
    const errorToast = {
      title: i18n.translate(
        'opensearch.reports.reportDefinitionsDetails.toast.errorEnablingSchedule. ',
        { defaultMessage: 'Error enabling schedule.' }
      ),
      color: 'danger',
      iconType: 'alert',
      id: 'errorToast',
    };
    // @ts-ignore
    setToasts(toasts.concat(errorToast));
  };

  const addSuccessDisablingScheduleToastHandler = () => {
    const successToast = {
      title: i18n.translate(
        'opensearch.reports.reportDefinitionsDetails.toast.successfullyDisabledSchedule.  ',
        { defaultMessage: 'Successfully disabled schedule.' }
      ),
      color: 'success',
      iconType: 'check',
      id: 'successDisableToast',
    };
    // @ts-ignore
    setToasts(toasts.concat(successToast));
  };

  const handleSuccessChangingScheduleStatusToast = (statusChange: string) => {
    if (statusChange === 'enable') {
      addSuccessEnablingScheduleToastHandler();
    } else if (statusChange === 'disable') {
      addSuccessDisablingScheduleToastHandler();
    }
  };

  const addErrorDisablingScheduleToastHandler = () => {
    const errorToast = {
      title: i18n.translate(
        'opensearch.reports.reportDefinitionsDetails.toast.errorDisablingSchedule.  ',
        { defaultMessage: 'Error disabling schedule.' }
      ),
      color: 'danger',
      iconType: 'alert',
      id: 'errorDisableToast',
    };
    // @ts-ignore
    setToasts(toasts.concat(errorToast));
  };

  const handleErrorChangingScheduleStatusToast = (statusChange: string) => {
    if (statusChange === 'enable') {
      addErrorEnablingScheduleToastHandler();
    } else if (statusChange === 'disable') {
      addErrorDisablingScheduleToastHandler();
    } else if (statusChange === 'permissions') {
      addPermissionsMissingStatusChangeToastHandler();
    }
  };

  const addErrorDeletingReportDefinitionToastHandler = () => {
    const errorToast = {
      title: i18n.translate(
        'opensearch.reports.reportDefinitionsDetails.toast.errorDeletingReport definition.  ',
        { defaultMessage: 'Error deleting report definition.' }
      ),
      color: 'danger',
      iconType: 'alert',
      id: 'errorDeleteToast',
    };
    // @ts-ignore
    setToasts(toasts.concat(errorToast));
  };

  const handleErrorDeletingReportDefinitionToast = () => {
    addErrorDeletingReportDefinitionToastHandler();
  };

  const removeToast = (removedToast: { id: string }) => {
    setToasts(toasts.filter((toast: any) => toast.id !== removedToast.id));
  };

  const handleReportDefinitionDetails = (e: ReportDefinitionDetails) => {
    setReportDefinitionDetails(e);
  };

  const handleReportDefinitionRawResponse = (e: {}) => {
    setReportDefinitionRawResponse(e);
  };

  const DeleteConfirmationModal = () => {
    const closeModal = () => {
      setShowDeleteModal(false);
    };

    return (
      <div>
        <EuiOverlayMask>
          <EuiConfirmModal
            title={i18n.translate(
              'opensearch.reports.reportDefinitionsDetails.button.delete.title',
              { defaultMessage: 'Delete report definition' }
            )}
            onCancel={closeModal}
            onConfirm={deleteReportDefinition}
            cancelButtonText={i18n.translate(
              'opensearch.reports.reportDefinitionsDetails.button.delete.cancel',
              { defaultMessage: 'Cancel' }
            )}
            confirmButtonText={i18n.translate(
              'opensearch.reports.reportDefinitionsDetails.button.delete.confirm',
              { defaultMessage: 'Delete' }
            )}
            buttonColor="danger"
            defaultFocusedButton="confirm"
          >
            <p>
              {i18n.translate(
                'opensearch.reports.reportDefinitionsDetails.button.delete.query',
                {
                  defaultMessage: 'Are you sure you want to delete "{name}"?',
                  values: { name: reportDefinitionDetails.name },
                }
              )}
            </p>
          </EuiConfirmModal>
        </EuiOverlayMask>
      </div>
    );
  };

  const humanReadableScheduleDetails = (trigger) => {
    let scheduleDetails = '';
    if (trigger.trigger_type === 'Schedule') {
      if (trigger.trigger_params.schedule_type === 'Recurring') {
        // Daily
        if (
          trigger.trigger_params.schedule.interval.unit === 'DAYS' &&
          trigger.trigger_params.schedule.interval.period === 1
        ) {
          const date = new Date(
            trigger.trigger_params.schedule.interval.start_time
          );
          scheduleDetails = i18n.translate(
            'opensearch.reports.reportDefinitionsDetails.schedule.dailyAt',
            {
              defaultMessage: 'Daily @ {time}',
              values: { time: date.toTimeString() },
            }
          );
        } else {
          // By interval
          const date = new Date(
            trigger.trigger_params.schedule.interval.start_time
          );
          scheduleDetails = i18n.translate(
            'opensearch.reports.reportDefinitionsDetails.schedule.byInterval',
            {
              defaultMessage:
                'By interval, every  {period} {unit}, starting @ {time}',
              values: {
                period: trigger.trigger_params.schedule.interval.period,
                unit: trigger.trigger_params.schedule.interval.unit.toLowerCase(),
                time: date.toTimeString(),
              },
            }
          );
        }
      } else if (trigger.trigger_params.schedule_type === 'Cron based') {
        // Cron
        scheduleDetails = i18n.translate(
          'opensearch.reports.reportDefinitionsDetails.schedule.cronBased',
          {
            defaultMessage: 'Cron based: {expression} ({timezone})',
            values: {
              expression: trigger.trigger_params.schedule.cron.expression,
              timezone: trigger.trigger_params.schedule.cron.timezone,
            },
          }
        );
      }
    }
    return scheduleDetails;
  };

  const getReportDefinitionDetailsMetadata = async (
    data: ReportDefinitionSchemaType
  ): Promise<ReportDefinitionDetails> => {
    const reportDefinition: ReportDefinitionSchemaType = data;
    const {
      report_params: reportParams,
      trigger,
      delivery,
      time_created: timeCreated,
      last_updated: lastUpdated,
    } = reportDefinition;
    const {
      trigger_type: triggerType,
      trigger_params: triggerParams,
    } = trigger;
    const {
      core_params: {
        base_url: baseUrl,
        report_format: reportFormat,
        time_duration: timeDuration,
      },
    } = reportParams;

    const readableDate = new Date(timeCreated);
    const displayCreatedDate =
      readableDate.toDateString() + ' ' + readableDate.toLocaleTimeString();

    const readableUpdatedDate = new Date(lastUpdated);
    const displayUpdatedDate =
      readableUpdatedDate.toDateString() +
      ' ' +
      readableUpdatedDate.toLocaleTimeString();

    const reportDefinitionDetailsMetaData = {
      name: reportParams.report_name,
      description:
        reportParams.description === '' ? `\u2014` : reportParams.description,
      created: displayCreatedDate,
      lastUpdated: displayUpdatedDate,
      source: reportParams.report_source,
      recordLimit:
        reportParams.report_source !== 'Saved search'
          ? `\u2014`
          : reportParams.core_params.limit,
      baseUrl,
      // TODO: need better display
      timePeriod: moment.duration(timeDuration).humanize(),
      fileFormat: reportFormat,
      reportHeader:
        reportParams.core_params.hasOwnProperty('header') &&
        reportParams.core_params.header !== ''
          ? reportParams.core_params.header
          : `\u2014`,
      reportFooter:
        reportParams.core_params.hasOwnProperty('footer') &&
        reportParams.core_params.footer !== ''
          ? reportParams.core_params.footer
          : `\u2014`,
      triggerType,
      scheduleDetails: triggerParams
        ? humanReadableScheduleDetails(data.trigger)
        : `\u2014`,
      status: reportDefinition.status,
      channelName: '',
      emailSubject: delivery.title,
      emailBody: delivery.textDescription,
    };

    if (delivery.configIds.length > 0) {
      const configsChannels = await getConfigChannel(delivery.configIds);
      reportDefinitionDetailsMetaData.channelName = configsChannels
        .map((channel) => channel.config.name)
        .join(', ');
    }
    return reportDefinitionDetailsMetaData;
  };

  useEffect(() => {
    const { httpClient } = props;
    httpClient
      .get(`../api/reporting/reportDefinitions/${reportDefinitionId}`)
      .then(
        async (response: { report_definition: ReportDefinitionSchemaType }) => {
          handleReportDefinitionRawResponse(response);
          handleReportDefinitionDetails(
            await getReportDefinitionDetailsMetadata(response.report_definition)
          );
          props.setBreadcrumbs([
            {
              text: i18n.translate(
                'opensearch.reports.reportDefinitionsDetails.schedule.breadcrumb.reporting',
                { defaultMessage: 'Reporting' }
              ),
              href: '#',
            },
            {
              text: i18n.translate(
                'opensearch.reports.reportDefinitionsDetails.schedule.breadcrumb.reportDefinitionDetails',
                {
                  defaultMessage: 'Report definition details: {name}',
                  values: {
                    name: response.report_definition.report_params.report_name,
                  },
                }
              ),
            },
          ]);
        }
      )
      .catch((error: any) => {
        console.error(
          i18n.translate(
            'opensearch.reports.reportDefinitionsDetails.schedule.breadcrumb.error',
            {
              defaultMessage:
                'error when getting report definition details: {error}',
              values: { error },
            }
          )
        );
        handleDetailsErrorToast();
      });
  }, []);

  const downloadIconDownload = async () => {
    handleLoading(true);
    await generateReportFromDetails();
    handleLoading(false);
  };

  const fileFormatDownload = (data: { [x: string]: any }) => {
    let formatUpper = data.fileFormat;
    formatUpper = fileFormatsUpper[formatUpper];
    return (
      <EuiLink
        onClick={downloadIconDownload}
        id="generateReportFromDetailsFileFormat"
      >
        {formatUpper + ' '}
        <EuiIcon type="importAction" />
      </EuiLink>
    );
  };

  const sourceURL = (data: ReportDefinitionDetails) => {
    return (
      <EuiLink
        id="reportDefinitionSourceURL"
        href={`${data.baseUrl}`}
        target="_blank"
      >
        {data.source}
      </EuiLink>
    );
  };

  const changeScheduledReportDefinitionStatus = (statusChange: string) => {
    const updatedReportDefinition =
      reportDefinitionRawResponse.report_definition;
    if (statusChange === 'Disable') {
      updatedReportDefinition.trigger.trigger_params.enabled = false;
      updatedReportDefinition.status = 'Disabled';
    } else if (statusChange === 'Enable') {
      updatedReportDefinition.trigger.trigger_params.enabled = true;
      updatedReportDefinition.status = 'Active';
    }
    const { httpClient } = props;
    httpClient
      .put(`../api/reporting/reportDefinitions/${reportDefinitionId}`, {
        body: JSON.stringify(updatedReportDefinition),
        params: reportDefinitionId.toString(),
      })
      .then(async () => {
        const updatedRawResponse = { report_definition: {} };
        updatedRawResponse.report_definition = updatedReportDefinition;
        handleReportDefinitionRawResponse(updatedRawResponse);
        setReportDefinitionDetails(
          await getReportDefinitionDetailsMetadata(updatedReportDefinition)
        );
        if (statusChange === 'Enable') {
          handleSuccessChangingScheduleStatusToast('enable');
        } else if (statusChange === 'Disable') {
          handleSuccessChangingScheduleStatusToast('disable');
        }
      })
      .catch((error: { body: { statusCode: number } }) => {
        console.error('error in updating report definition status:', error);
        if (error.body.statusCode === 403) {
          handleErrorChangingScheduleStatusToast('permissions');
        } else {
          if (statusChange === 'Enable') {
            handleErrorChangingScheduleStatusToast('enable');
          } else if (statusChange === 'Disable') {
            handleErrorChangingScheduleStatusToast('disable');
          }
        }
      });
  };

  const ScheduledDefinitionStatus = () => {
    const status =
      reportDefinitionDetails.status === 'Active' ? 'Disable' : 'Enable';

    return (
      <EuiSmallButton
        onClick={() => changeScheduledReportDefinitionStatus(status)}
        id={'changeStatusFromDetailsButton'}
      >
        {status}
      </EuiSmallButton>
    );
  };

  const generateReportFromDetails = async () => {
    const { httpClient } = props;
    handleLoading(true);
    const generateReportSuccess = await generateReportFromDefinitionId(
      reportDefinitionId,
      httpClient
    );
    handleLoading(false);
    if (generateReportSuccess.status) {
      handleSuccessGeneratingReportToast();
    } else {
      if (generateReportSuccess.permissionsError) {
        handleErrorGeneratingReportToast('permissions');
      } else {
        handleErrorGeneratingReportToast('API');
      }
    }
  };

  const deleteReportDefinition = () => {
    const { httpClient } = props;
    httpClient
      .delete(`../api/reporting/reportDefinitions/${reportDefinitionId}`)
      .then(() => {
        window.location.assign(`reports-dashboards#/delete=success`);
      })
      .catch((error: { body: { statusCode: number } }) => {
        console.log('error when deleting report definition:', error);
        if (error.body.statusCode === 403) {
          handlePermissionsMissingDeleteToast();
        } else {
          handleErrorDeletingReportDefinitionToast();
        }
      });
  };

  const showActionButton =
    reportDefinitionDetails.triggerType === ON_DEMAND ? (
      <EuiSmallButton
        onClick={() => generateReportFromDetails()}
        id={'generateReportFromDetailsButton'}
      >
        Generate report
      </EuiSmallButton>
    ) : (
      <ScheduledDefinitionStatus />
    );

  const triggerSection =
    reportDefinitionDetails.triggerType === ON_DEMAND ? (
      <ReportDetailsComponent
        reportDetailsComponentTitle={i18n.translate(
          'opensearch.reports.reportDefinitionsDetails.schedule.triggerSection.triggerType',
          { defaultMessage: 'Report trigger' }
        )}
        reportDetailsComponentContent={reportDefinitionDetails.triggerType}
      />
    ) : (
      <EuiFlexGroup>
        <ReportDetailsComponent
          reportDetailsComponentTitle={i18n.translate(
            'opensearch.reports.reportDefinitionsDetails.schedule.triggerSection.triggerType',
            { defaultMessage: 'Report trigger' }
          )}
          reportDetailsComponentContent={reportDefinitionDetails.triggerType}
        />
        <ReportDetailsComponent
          reportDetailsComponentTitle={i18n.translate(
            'opensearch.reports.reportDefinitionsDetails.schedule.triggerSection.scheduleDetails',
            { defaultMessage: 'Schedule details' }
          )}
          reportDetailsComponentContent={
            reportDefinitionDetails.scheduleDetails
          }
        />
        <ReportDetailsComponent
          reportDetailsComponentTitle={i18n.translate(
            'opensearch.reports.reportDefinitionsDetails.schedule.triggerSection.status',
            { defaultMessage: 'Status' }
          )}
          reportDetailsComponentContent={reportDefinitionDetails.status}
        />
        <ReportDetailsComponent
          reportDetailsComponentTitle={''}
          reportDetailsComponentContent={''}
        />
      </EuiFlexGroup>
    );

  const showDeleteConfirmationModal = showDeleteModal ? (
    <DeleteConfirmationModal />
  ) : null;

  const showLoadingModal = showLoading ? (
    <GenerateReportLoadingModal setShowLoading={setShowLoading} />
  ) : null;

  const addToast = (toast: any) => {
    setToasts(toasts.concat(toast));
  };

  const getConfigChannel = async (idChannels: string[]): Promise<any[]> => {
    const { httpClient } = props;

    if (!idChannels?.length) {
      return [];
    }

    try {
      const results = await Promise.allSettled(
        idChannels.map(async (id) => {
          const { config_list: configList } = await httpClient.get(
            `${REPORTING_NOTIFICATIONS_DASHBOARDS_API.GET_CONFIG}/${id}`
          );
          return configList;
        })
      );
      const successfulConfigs = results
        .filter(
          (result): result is PromiseFulfilledResult<any> =>
            result.status === 'fulfilled'
        )
        .map((result) => result.value)
        .flat();

      const failedResults = results
        .map((result, index) => ({ result, id: idChannels[index] }))
        .filter(({ result }) => result.status === 'rejected');

      if (failedResults.length > 0) {
        addToast({
          title: i18n.translate(
            'opensearch.reports.reportDefinitionsDetails.toast.failedChannelConfigs',
            { defaultMessage: 'Failed to fetch some channel configs.' }
          ),
          color: 'danger',
          iconType: 'alert',
          id: 'failedChannelConfigsToast',
          text: `${failedResults
            .map(({ id, result }) => `ID: ${id}, Error: ${result.reason}`)
            .join(', ')}`,
        });
      }
      return successfulConfigs;
    } catch (error) {
      addToast({
        title: i18n.translate(
          'opensearch.reports.reportDefinitionsDetails.toast.errorFetchingChannelConfigs',
          { defaultMessage: 'Error fetching channel configs.' }
        ),
        color: 'danger',
        iconType: 'alert',
        id: 'errorFetchingChannelConfigsToast',
        text: error.message || 'Unknown error occurred',
      });
    }
  };

  const notificationSection = (
    <EuiFlexGroup>
      <ReportDetailsComponent
        reportDetailsComponentTitle={i18n.translate(
          'opensearch.reports.reportDefinitionsDetails.fields.channel',
          { defaultMessage: 'Channel name' }
        )}
        reportDetailsComponentContent={reportDefinitionDetails.channelName}
      />
      <ReportDetailsComponent
        reportDetailsComponentTitle={i18n.translate(
          'opensearch.reports.reportDefinitionsDetails.fields.emailSubject',
          { defaultMessage: 'Email subject' }
        )}
        reportDetailsComponentContent={reportDefinitionDetails.emailSubject}
      />
      <ReportDetailsComponent
        reportDetailsComponentTitle={i18n.translate(
          'opensearch.reports.reportDefinitionsDetails.fields.emailBody',
          { defaultMessage: 'Email body' }
        )}
        reportDetailsComponentContent={trimAndRenderAsText(
          reportDefinitionDetails.emailBody
        )}
      />
      <EuiFlexItem />
    </EuiFlexGroup>
  );

  return (
    <>
      <EuiTitle size="l">
        <h1>
          {!getNavGroupEnabled &&
            i18n.translate(
              'opensearch.reports.reportDefinitionsDetails.title',
              {
                defaultMessage: 'Report definition details',
              }
            )}
        </h1>
      </EuiTitle>
      {!getNavGroupEnabled && <EuiSpacer size="s" />}
      <EuiPageContent panelPaddingSize={'l'}>
        <EuiPageHeader>
          <EuiFlexGroup>
            <EuiFlexItem>
              <EuiPageHeaderSection>
                <EuiTitle>
                  <h3>{reportDefinitionDetails.name}</h3>
                </EuiTitle>
              </EuiPageHeaderSection>
            </EuiFlexItem>
          </EuiFlexGroup>
          <EuiFlexGroup
            justifyContent="flexEnd"
            alignItems="flexEnd"
            gutterSize="l"
          >
            <EuiFlexItem grow={false}>
              <EuiSmallButton
                color={'danger'}
                onClick={(show: any) => handleShowDeleteModal(show)}
                id={'deleteReportDefinitionButton'}
              >
                {i18n.translate(
                  'opensearch.reports.reportDefinitionsDetails.deleteReportDefinitionButton',
                  { defaultMessage: 'Delete' }
                )}
              </EuiSmallButton>
            </EuiFlexItem>
            <EuiFlexItem grow={false}>{showActionButton}</EuiFlexItem>
            <EuiFlexItem grow={false}>
              <EuiSmallButton
                fill={true}
                onClick={() => {
                  window.location.assign(
                    `reports-dashboards#/edit/${reportDefinitionId}`
                  );
                }}
                id={'editReportDefinitionButton'}
              >
                {i18n.translate(
                  'opensearch.reports.reportDefinitionsDetails.editReportDefinitionButton',
                  { defaultMessage: 'Edit' }
                )}
              </EuiSmallButton>
            </EuiFlexItem>
          </EuiFlexGroup>
        </EuiPageHeader>
        <EuiHorizontalRule />
        <EuiTitle>
          <h3>
            {i18n.translate(
              'opensearch.reports.reportDefinitionsDetails.reportSettings',
              { defaultMessage: 'Report settings' }
            )}
          </h3>
        </EuiTitle>
        <EuiSpacer />
        <EuiFlexGroup>
          <ReportDetailsComponent
            reportDetailsComponentTitle={i18n.translate(
              'opensearch.reports.reportDefinitionsDetails.fields.name',
              { defaultMessage: 'Name' }
            )}
            reportDetailsComponentContent={reportDefinitionDetails.name}
          />
          <ReportDetailsComponent
            reportDetailsComponentTitle={i18n.translate(
              'opensearch.reports.reportDefinitionsDetails.fields.description',
              { defaultMessage: 'Description' }
            )}
            reportDetailsComponentContent={reportDefinitionDetails.description}
          />
          <ReportDetailsComponent
            reportDetailsComponentTitle={i18n.translate(
              'opensearch.reports.reportDefinitionsDetails.fields.created',
              { defaultMessage: 'Created' }
            )}
            reportDetailsComponentContent={reportDefinitionDetails.created}
          />
          <ReportDetailsComponent
            reportDetailsComponentTitle={i18n.translate(
              'opensearch.reports.reportDefinitionsDetails.fields.lastUpdated',
              { defaultMessage: 'Last updated' }
            )}
            reportDetailsComponentContent={reportDefinitionDetails.lastUpdated}
          />
        </EuiFlexGroup>
        <EuiSpacer />
        <EuiFlexGroup>
          <ReportDetailsComponent
            reportDetailsComponentTitle={i18n.translate(
              'opensearch.reports.reportDefinitionsDetails.fields.source',
              { defaultMessage: 'Source' }
            )}
            reportDetailsComponentContent={sourceURL(reportDefinitionDetails)}
          />
          <ReportDetailsComponent
            reportDetailsComponentTitle={i18n.translate(
              'opensearch.reports.reportDefinitionsDetails.fields.recordLimit',
              { defaultMessage: 'Record limit' }
            )}
            reportDetailsComponentContent={reportDefinitionDetails.recordLimit}
          />
          <ReportDetailsComponent
            reportDetailsComponentTitle={i18n.translate(
              'opensearch.reports.reportDefinitionsDetails.fields.timePeriod',
              { defaultMessage: 'Time period' }
            )}
            reportDetailsComponentContent={`Last ${reportDefinitionDetails.timePeriod}`}
          />
          <ReportDetailsComponent
            reportDetailsComponentTitle={i18n.translate(
              'opensearch.reports.reportDefinitionsDetails.fields.fileFormat',
              { defaultMessage: 'File format' }
            )}
            reportDetailsComponentContent={fileFormatDownload(
              reportDefinitionDetails
            )}
          />
          <EuiFlexItem />
        </EuiFlexGroup>
        <EuiSpacer />
        <EuiFlexGroup>
          <ReportDetailsComponent
            reportDetailsComponentTitle={i18n.translate(
              'opensearch.reports.reportDefinitionsDetails.fields.reportHeader',
              { defaultMessage: 'Report header' }
            )}
            reportDetailsComponentContent={trimAndRenderAsText(
              reportDefinitionDetails.reportHeader
            )}
          />
          <ReportDetailsComponent
            reportDetailsComponentTitle={i18n.translate(
              'opensearch.reports.reportDefinitionsDetails.fields.reportFooter',
              { defaultMessage: 'Report footer' }
            )}
            reportDetailsComponentContent={trimAndRenderAsText(
              reportDefinitionDetails.reportFooter
            )}
          />
          <EuiFlexItem />
          <EuiFlexItem />
        </EuiFlexGroup>
        <EuiSpacer />
        {triggerSection}
        {notificationSection}
      </EuiPageContent>
      <EuiGlobalToastList
        toasts={toasts}
        dismissToast={removeToast}
        toastLifeTimeMs={6000}
      />
      {showDeleteConfirmationModal}
      {showLoadingModal}
    </>
  );
}
