/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import createDOMPurify from 'dompurify';
import React, { useEffect, useState } from 'react';
import { i18n } from '@osd/i18n';
import {
  EuiFieldNumber,
  EuiCompressedFieldText,
  EuiFlexGroup,
  EuiFlexItem,
  EuiCompressedFormRow,
  EuiPageHeader,
  EuiTitle,
  EuiPageContent,
  EuiPageContentBody,
  EuiHorizontalRule,
  EuiSpacer,
  EuiCompressedRadioGroup,
  EuiCompressedTextArea,
  EuiCompressedCheckboxGroup,
  EuiCompressedComboBox,
  EuiFormRow,
  EuiCallOut,
} from '@elastic/eui';
import ReactMde from 'react-mde';
import { ReportDefinitionSchemaType } from 'server/model';
import {
  REPORT_SOURCE_RADIOS,
  PDF_PNG_FILE_FORMAT_OPTIONS,
  HEADER_FOOTER_CHECKBOX,
  REPORT_SOURCE_TYPES,
  SAVED_SEARCH_FORMAT_OPTIONS,
  NOTEBOOKS_REPORT_SOURCE_ID,
  OBSERVABILITY_DASHBOARDS_PLUGIN_ID,
} from './report_settings_constants';
import 'react-mde/lib/styles/css/react-mde-all.css';
import {
  ReportDefinitionParams,
  TimeRangeParams,
} from '../create/create_report_definition';
import {
  parseInContextUrl,
  getSavedSearchBaseUrlCreate,
  getVisualizationBaseUrlCreate,
  getSavedSearchOptions,
  getVisualizationOptions,
  getDashboardBaseUrlCreate,
  getDashboardOptions,
  handleDataToVisualReportSourceChange,
  getNotebooksOptions,
  getNotebooksBaseUrlCreate,
  getReportSourceFromURL,
} from './report_settings_helpers';
import { TimeRangeSelect } from './time_range';
import { converter } from '../utils';
import { ReportTrigger } from '../report_trigger';
import { pluginsService } from '../../utils/plugins_service';

interface ReportSettingProps {
  edit: boolean;
  editDefinitionId: string;
  reportDefinitionRequest: ReportDefinitionParams;
  httpClientProps: any;
  timeRange: TimeRangeParams;
  showSettingsReportNameError: boolean;
  settingsReportNameErrorMessage: string;
  showSettingsReportSourceError: boolean;
  settingsReportSourceErrorMessage: string;
  showTimeRangeError: boolean;
  showTriggerIntervalNaNError: boolean;
  showCronError: boolean;
}

export function ReportSettings(props: ReportSettingProps) {
  const {
    edit,
    editDefinitionId,
    reportDefinitionRequest,
    httpClientProps,
    timeRange,
    showSettingsReportNameError,
    settingsReportNameErrorMessage,
    showSettingsReportSourceError,
    settingsReportSourceErrorMessage,
    showTimeRangeError,
    showTriggerIntervalNaNError,
    showCronError,
  } = props;

  const [reportName, setReportName] = useState('');
  const [reportDescription, setReportDescription] = useState('');
  const [reportSourceId, setReportSourceId] = useState('dashboardReportSource');

  const [dashboardSourceSelect, setDashboardSourceSelect] = useState([] as any);
  const [dashboards, setDashboards] = useState([] as any);

  const [visualizationSourceSelect, setVisualizationSourceSelect] = useState(
    [] as any
  );
  const [visualizations, setVisualizations] = useState([] as any);

  const [savedSearchSourceSelect, setSavedSearchSourceSelect] = useState(
    [] as any
  );
  const [savedSearches, setSavedSearches] = useState([] as any);
  const [savedSearchRecordLimit, setSavedSearchRecordLimit] = useState(10000);

  const [notebooksSourceSelect, setNotebooksSourceSelect] = useState([] as any);
  const [notebooks, setNotebooks] = useState([] as any);

  const [fileFormat, setFileFormat] = useState('pdf');

  const isObservabilityDashboardsPluginAvailable = pluginsService.hasPlugin(
    OBSERVABILITY_DASHBOARDS_PLUGIN_ID
  );

  const handleDashboards = (e) => {
    setDashboards(e);
  };

  const handleVisualizations = (e) => {
    setVisualizations(e);
  };

  const handleSavedSearches = (e) => {
    setSavedSearches(e);
  };

  const handleNotebooks = (e) => {
    setNotebooks(e);
  };

  const handleReportName = (e: {
    target: { value: React.SetStateAction<string> };
  }) => {
    setReportName(e.target.value);
    reportDefinitionRequest.report_params.report_name = e.target.value.toString();
  };

  const handleReportDescription = (e: {
    target: { value: React.SetStateAction<string> };
  }) => {
    setReportDescription(e.target.value);
    reportDefinitionRequest.report_params.description = e.target.value.toString();
  };

  const handleReportSource = (e: React.SetStateAction<string>) => {
    setReportSourceId(e);
    let fromInContext = false;
    if (window.location.href.includes('?')) {
      fromInContext = true;
    }
    if (e === 'dashboardReportSource') {
      reportDefinitionRequest.report_params.report_source = 'Dashboard';
      reportDefinitionRequest.report_params.core_params.base_url =
        getDashboardBaseUrlCreate(edit, editDefinitionId, fromInContext) +
        dashboards[0]?.value;

      // set params to visual report params after switch from saved search
      handleDataToVisualReportSourceChange(reportDefinitionRequest);
      setFileFormat('pdf');
    } else if (e === 'visualizationReportSource') {
      reportDefinitionRequest.report_params.report_source = 'Visualization';
      reportDefinitionRequest.report_params.core_params.base_url =
        getVisualizationBaseUrlCreate(edit, editDefinitionId, fromInContext) +
        visualizations[0]?.value;

      // set params to visual report params after switch from saved search
      handleDataToVisualReportSourceChange(reportDefinitionRequest);
      setFileFormat('pdf');
    } else if (e === 'savedSearchReportSource') {
      reportDefinitionRequest.report_params.report_source = 'Saved search';
      reportDefinitionRequest.report_params.core_params.base_url =
        getSavedSearchBaseUrlCreate(edit, editDefinitionId, fromInContext) +
        savedSearches[0]?.value;
      reportDefinitionRequest.report_params.core_params.saved_search_id =
        savedSearches[0]?.value;
      reportDefinitionRequest.report_params.core_params.report_format = 'csv';
      reportDefinitionRequest.report_params.core_params.limit = savedSearchRecordLimit;
      reportDefinitionRequest.report_params.core_params.excel = true;
    } else if (e === NOTEBOOKS_REPORT_SOURCE_ID) {
      reportDefinitionRequest.report_params.report_source = 'Notebook';
      reportDefinitionRequest.report_params.core_params.base_url =
        getNotebooksBaseUrlCreate(edit, editDefinitionId, fromInContext) +
        notebooks[0]?.value;

      // set params to visual report params after switch from saved search
      handleDataToVisualReportSourceChange(reportDefinitionRequest);
      setFileFormat('pdf');
    }
  };

  const handleDashboardSelect = (e: string | any[]) => {
    setDashboardSourceSelect(e);

    let fromInContext = false;
    if (window.location.href.includes('?')) {
      fromInContext = true;
    }

    if (e.length > 0) {
      reportDefinitionRequest.report_params.core_params.base_url =
        getDashboardBaseUrlCreate(edit, editDefinitionId, fromInContext) +
        e[0].value;
    } else {
      reportDefinitionRequest.report_params.core_params.base_url = '';
    }
  };

  const handleVisualizationSelect = (e) => {
    setVisualizationSourceSelect(e);
    let fromInContext = false;
    if (window.location.href.includes('?')) {
      fromInContext = true;
    }

    if (e.length > 0) {
      reportDefinitionRequest.report_params.core_params.base_url =
        getVisualizationBaseUrlCreate(edit, editDefinitionId, fromInContext) +
        e[0].value;
    } else {
      reportDefinitionRequest.report_params.core_params.base_url = '';
    }
  };

  const handleSavedSearchSelect = (e) => {
    setSavedSearchSourceSelect(e);
    let fromInContext = false;
    if (window.location.href.includes('?')) {
      fromInContext = true;
    }
    if (e.length > 0) {
      reportDefinitionRequest.report_params.core_params.saved_search_id =
        e[0].value;

      reportDefinitionRequest.report_params.core_params.base_url =
        getSavedSearchBaseUrlCreate(edit, editDefinitionId, fromInContext) +
        e[0].value;
    } else {
      reportDefinitionRequest.report_params.core_params.base_url = '';
    }
  };

  const handleSavedSearchRecordLimit = (e) => {
    setSavedSearchRecordLimit(e.target.value);

    reportDefinitionRequest.report_params.core_params.limit = e.target.value;
  };

  const handleNotebooksSelect = (e) => {
    setNotebooksSourceSelect(e);
    let fromInContext = false;
    if (window.location.href.includes('?')) {
      fromInContext = true;
    }
    if (e.length > 0) {
      reportDefinitionRequest.report_params.core_params.base_url =
        getNotebooksBaseUrlCreate(edit, editDefinitionId, fromInContext) +
        e[0].value;
    } else {
      reportDefinitionRequest.report_params.core_params.base_url = '';
    }
  };

  const handleFileFormat = (e: React.SetStateAction<string>) => {
    setFileFormat(e);
    reportDefinitionRequest.report_params.core_params.report_format = e.toString();
  };

  const PDFandPNGFileFormats = () => {
    return (
      <div>
        <EuiCompressedFormRow
          label={i18n.translate(
            'opensearch.reports.reportSettingProps.fileFormat',
            {
              defaultMessage: 'File format',
            }
          )}
        >
          <EuiCompressedRadioGroup
            options={PDF_PNG_FILE_FORMAT_OPTIONS}
            idSelected={fileFormat}
            onChange={handleFileFormat}
          />
        </EuiCompressedFormRow>
      </div>
    );
  };

  const CSVandXLSXFileFormats = () => {
    return (
      <div>
        <EuiCompressedFormRow
          label={i18n.translate(
            'opensearch.reports.reportSettingProps.fileFormat',
            {
              defaultMessage: 'File format',
            }
          )}
        >
          <EuiCompressedRadioGroup
            options={SAVED_SEARCH_FORMAT_OPTIONS}
            idSelected={fileFormat}
            onChange={handleFileFormat}
          />
        </EuiCompressedFormRow>
      </div>
    );
  };

  const SettingsMarkdown = () => {
    const [
      checkboxIdSelectHeaderFooter,
      setCheckboxIdSelectHeaderFooter,
    ] = useState({ ['header']: false, ['footer']: false });

    const [footer, setFooter] = useState('');
    const [selectedTabFooter, setSelectedTabFooter] = React.useState<
      'write' | 'preview'
    >('write');

    const [header, setHeader] = useState('');
    const [selectedTabHeader, setSelectedTabHeader] = React.useState<
      'write' | 'preview'
    >('write');

    const handleHeader = (e) => {
      setHeader(e);
      reportDefinitionRequest.report_params.core_params.header = e;
    };

    const handleFooter = (e) => {
      setFooter(e);
      reportDefinitionRequest.report_params.core_params.footer = e;
    };

    const handleCheckboxHeaderFooter = (optionId) => {
      const newCheckboxIdToSelectedMap = {
        ...checkboxIdSelectHeaderFooter,
        ...{
          [optionId]: !checkboxIdSelectHeaderFooter[optionId],
        },
      };
      setCheckboxIdSelectHeaderFooter(newCheckboxIdToSelectedMap);
    };

    const DOMPurify = createDOMPurify(window);

    const showFooter = checkboxIdSelectHeaderFooter.footer ? (
      <EuiCompressedFormRow
        label={i18n.translate('opensearch.reports.reportSettingProps.footer', {
          defaultMessage: 'Footer',
        })}
        fullWidth={true}
      >
        <ReactMde
          value={footer}
          onChange={handleFooter}
          selectedTab={selectedTabFooter}
          onTabChange={setSelectedTabFooter}
          toolbarCommands={[
            ['header', 'bold', 'italic', 'strikethrough'],
            ['unordered-list', 'ordered-list', 'checked-list'],
          ]}
          generateMarkdownPreview={(markdown) =>
            Promise.resolve(DOMPurify.sanitize(converter.makeHtml(markdown)))
          }
        />
      </EuiCompressedFormRow>
    ) : null;

    const showHeader = checkboxIdSelectHeaderFooter.header ? (
      <EuiCompressedFormRow
        label={i18n.translate('opensearch.reports.reportSettingProps.header', {
          defaultMessage: 'Header',
        })}
        fullWidth={true}
      >
        <ReactMde
          value={header}
          onChange={handleHeader}
          selectedTab={selectedTabHeader}
          onTabChange={setSelectedTabHeader}
          toolbarCommands={[
            ['header', 'bold', 'italic', 'strikethrough'],
            ['unordered-list', 'ordered-list', 'checked-list'],
          ]}
          generateMarkdownPreview={(markdown) =>
            Promise.resolve(DOMPurify.sanitize(converter.makeHtml(markdown)))
          }
        />
      </EuiCompressedFormRow>
    ) : null;

    useEffect(() => {
      let unmounted = false;
      if (edit) {
        httpClientProps
          .get(`../api/reporting/reportDefinitions/${editDefinitionId}`)
          .then(async (response: {}) => {
            const reportDefinition: ReportDefinitionSchemaType =
              response.report_definition;
            const {
              report_params: {
                core_params: {
                  header: headerDefinitions,
                  footer: footerDefinitions,
                },
              },
            } = reportDefinition;
            // set header/footer default
            if (headerDefinitions) {
              checkboxIdSelectHeaderFooter.header = true;
              if (!unmounted) {
                setHeader(headerDefinitions);
              }
            }
            if (footerDefinitions) {
              checkboxIdSelectHeaderFooter.footer = true;
              if (!unmounted) {
                setFooter(footerDefinitions);
              }
            }
          })
          .catch((error: any) => {
            console.error(
              'error in fetching report definition details:',
              error
            );
          });
      } else {
        // keeps header/footer from re-rendering empty when other fields in Report Settings are changed
        checkboxIdSelectHeaderFooter.header =
          'header' in reportDefinitionRequest.report_params.core_params;
        checkboxIdSelectHeaderFooter.footer =
          'footer' in reportDefinitionRequest.report_params.core_params;
        if (checkboxIdSelectHeaderFooter.header) {
          setHeader(reportDefinitionRequest.report_params.core_params.header);
        }
        if (checkboxIdSelectHeaderFooter.footer) {
          setFooter(reportDefinitionRequest.report_params.core_params.footer);
        }
      }
      return () => {
        unmounted = true;
      };
    }, []);

    return (
      <div>
        <EuiCompressedCheckboxGroup
          options={HEADER_FOOTER_CHECKBOX}
          idToSelectedMap={checkboxIdSelectHeaderFooter}
          onChange={handleCheckboxHeaderFooter}
          legend={{
            children: i18n.translate(
              'opensearch.reports.reportSettingProps.headerAndFooter',
              { defaultMessage: 'Report header and footer' }
            ),
          }}
        />
        <EuiSpacer />
        {showHeader}
        {showFooter}
      </div>
    );
  };

  const VisualReportFormatAndMarkdown = () => {
    return (
      <div>
        <PDFandPNGFileFormats />
        <EuiSpacer />
      </div>
    );
  };

  const DataReportFormatAndMarkdown = () => {
    return (
      <div>
        <CSVandXLSXFileFormats />
      </div>
    );
  };

  const setReportSourceDropdownOption = (options, reportSource, url) => {
    let index = 0;
    if (reportSource === REPORT_SOURCE_TYPES.dashboard) {
      for (index = 0; index < options.dashboard.length; ++index) {
        if (url.includes(options.dashboard[index].value)) {
          setDashboardSourceSelect([options.dashboard[index]]);
        }
      }
    } else if (reportSource === REPORT_SOURCE_TYPES.visualization) {
      for (index = 0; index < options.visualizations.length; ++index) {
        if (url.includes(options.visualizations[index].value)) {
          setVisualizationSourceSelect([options.visualizations[index]]);
        }
      }
    } else if (reportSource === REPORT_SOURCE_TYPES.savedSearch) {
      for (index = 0; index < options.savedSearch.length; ++index) {
        if (url.includes(options.savedSearch[index].value)) {
          setSavedSearchSourceSelect([options.savedSearch[index]]);
        }
      }
    }
  };

  const setDefaultFileFormat = (fileFormatDefault) => {
    let index = 0;
    for (index = 0; index < PDF_PNG_FILE_FORMAT_OPTIONS.length; ++index) {
      if (
        fileFormatDefault.toUpperCase() ===
        PDF_PNG_FILE_FORMAT_OPTIONS[index].label
      ) {
        setFileFormat(PDF_PNG_FILE_FORMAT_OPTIONS[index].id);
      }
    }
  };

  const setDashboardFromInContextMenu = (response, id) => {
    let index;
    for (index = 0; index < response.dashboard.length; ++index) {
      if (id === response.dashboard[index].value) {
        setDashboardSourceSelect([response.dashboard[index]]);
      }
    }
  };

  const setVisualizationFromInContextMenu = (response, id) => {
    let index;
    for (index = 0; index < response.visualizations.length; ++index) {
      if (id === response.visualizations[index].value) {
        setVisualizationSourceSelect([response.visualizations[index]]);
      }
    }
  };

  const setSavedSearchFromInContextMenu = (response, id) => {
    let index;
    for (index = 0; index < response.savedSearch.length; ++index) {
      if (id === response.savedSearch[index].value) {
        setSavedSearchSourceSelect([response.savedSearch[index]]);
      }
    }
  };

  const setNotebookFromInContextMenu = (response, id) => {
    for (let index = 0; index < response.notebooks.length; ++index) {
      if (id === response.notebooks[index].value) {
        setNotebooksSourceSelect([response.notebooks[index]]);
      }
    }
  };

  const getReportSourceRadioOptions = () => {
    if (!isObservabilityDashboardsPluginAvailable) {
      return REPORT_SOURCE_RADIOS.filter(
        (radio) => radio.id !== NOTEBOOKS_REPORT_SOURCE_ID
      );
    }
    return REPORT_SOURCE_RADIOS;
  };

  const setInContextDefaultConfiguration = (response) => {
    const url = window.location.href;
    const source = getReportSourceFromURL(url);
    const id = parseInContextUrl(url, 'id');
    if (source === 'dashboard') {
      setReportSourceId('dashboardReportSource');
      reportDefinitionRequest.report_params.report_source =
        REPORT_SOURCE_RADIOS[0].label;

      setDashboardFromInContextMenu(response, id);
      reportDefinitionRequest.report_params.core_params.base_url =
        getDashboardBaseUrlCreate(edit, id, true) + id;
    } else if (source === 'visualize') {
      setReportSourceId('visualizationReportSource');
      reportDefinitionRequest.report_params.report_source =
        REPORT_SOURCE_RADIOS[1].label;

      setVisualizationFromInContextMenu(response, id);
      reportDefinitionRequest.report_params.core_params.base_url =
        getVisualizationBaseUrlCreate(edit, editDefinitionId, true) + id;
    } else if (source === 'discover') {
      setReportSourceId('savedSearchReportSource');
      reportDefinitionRequest.report_params.core_params.report_format = 'csv';
      reportDefinitionRequest.report_params.core_params.saved_search_id = id;
      reportDefinitionRequest.report_params.report_source =
        REPORT_SOURCE_RADIOS[2].label;

      setSavedSearchFromInContextMenu(response, id);
      reportDefinitionRequest.report_params.core_params.base_url =
        getSavedSearchBaseUrlCreate(edit, editDefinitionId, true) + id;
    } else if (source === 'notebook') {
      setReportSourceId(NOTEBOOKS_REPORT_SOURCE_ID);
      reportDefinitionRequest.report_params.report_source =
        REPORT_SOURCE_RADIOS[3].label;

      setNotebookFromInContextMenu(response, id);
      reportDefinitionRequest.report_params.core_params.base_url =
        getNotebooksBaseUrlCreate(edit, id, true) + id;
      // set placeholder time range since notebooks doesn't use it
      reportDefinitionRequest.report_params.core_params.time_duration = 'PT30M';
    }
  };

  const setDefaultEditValues = async (response, reportSourceOptions) => {
    setReportName(response.report_definition.report_params.report_name);
    setReportDescription(response.report_definition.report_params.description);
    reportDefinitionRequest.report_params.report_name =
      response.report_definition.report_params.report_name;
    reportDefinitionRequest.report_params.description =
      response.report_definition.report_params.description;
    reportDefinitionRequest.report_params =
      response.report_definition.report_params;
    const reportSource = response.report_definition.report_params.report_source;
    REPORT_SOURCE_RADIOS.map((radio) => {
      if (radio.label === reportSource) {
        setReportSourceId(radio.id);
        reportDefinitionRequest.report_params.report_source = reportSource;
      }
    });

    if (reportSource === REPORT_SOURCE_TYPES.savedSearch) {
      setSavedSearchRecordLimit(
        response.report_definition.report_params.core_params.limit
      );
    }

    setDefaultFileFormat(
      response.report_definition.report_params.core_params.report_format
    );
    setReportSourceDropdownOption(
      reportSourceOptions,
      reportSource,
      response.report_definition.report_params.core_params.base_url
    );
  };

  const defaultConfigurationEdit = async (httpClientPropsFunction) => {
    let editData = {};
    await httpClientPropsFunction
      .get(`../api/reporting/reportDefinitions/${editDefinitionId}`)
      .then(async (response: {}) => {
        editData = response;
      })
      .catch((error: any) => {
        console.error('error in fetching report definition details:', error);
      });
    return editData;
  };

  const defaultConfigurationCreate = async (httpClientPropsFunction) => {
    const reportSourceOptions = {
      dashboard: [],
      visualizations: [],
      savedSearch: [],
      notebooks: [],
    };
    reportDefinitionRequest.report_params.core_params.report_format = fileFormat;
    await httpClientPropsFunction
      .get('../api/reporting/getReportSource/dashboard')
      .then(async (response) => {
        const dashboardOptions = getDashboardOptions(response.hits.hits);
        reportSourceOptions.dashboard = dashboardOptions;
        handleDashboards(dashboardOptions);
        if (!edit) {
          reportDefinitionRequest.report_params.report_source = 'Dashboard';
        }
      })
      .catch((error) => {
        console.log('error when fetching dashboards:', error);
      });

    await httpClientPropsFunction
      .get('../api/reporting/getReportSource/visualization')
      .then(async (response) => {
        const visualizationOptions = getVisualizationOptions(
          response.hits.hits
        );
        reportSourceOptions.visualizations = visualizationOptions;
        await handleVisualizations(visualizationOptions);
      })
      .catch((error) => {
        console.log('error when fetching visualizations:', error);
      });

    await httpClientPropsFunction
      .get('../api/reporting/getReportSource/search')
      .then(async (response) => {
        const savedSearchOptions = getSavedSearchOptions(response.hits.hits);
        reportSourceOptions.savedSearch = savedSearchOptions;
        await handleSavedSearches(savedSearchOptions);
      })
      .catch((error) => {
        console.log('error when fetching saved searches:', error);
      });

    if (isObservabilityDashboardsPluginAvailable) {
      await httpClientPropsFunction
        .get('../api/observability/notebooks/savedNotebook')
        .catch((error: any) => {
          console.error(
            'error fetching notebooks, retrying with legacy api',
            error
          );
          return httpClientPropsFunction.get('../api/notebooks/');
        })
        .then(async (response: any) => {
          const notebooksOptions = getNotebooksOptions(response.data);
          reportSourceOptions.notebooks = notebooksOptions;
          await handleNotebooks(notebooksOptions);
        })
        .catch((error) => {
          console.log('error when fetching notebooks:', error);
        });
    }
    return reportSourceOptions;
  };

  useEffect(() => {
    let reportSourceOptions = {};
    let editData = {};
    if (edit) {
      defaultConfigurationEdit(httpClientProps).then(async (response) => {
        editData = response;
      });
    }
    defaultConfigurationCreate(httpClientProps).then(async (response) => {
      reportSourceOptions = response;
      // if coming from in-context menu
      if (window.location.href.indexOf('?') > -1) {
        setInContextDefaultConfiguration(response);
      }
      if (edit) {
        setDefaultEditValues(editData, reportSourceOptions);
      }
    });
  }, []);

  const displayDashboardSelect =
    reportSourceId === 'dashboardReportSource' ? (
      <div>
        <EuiCompressedFormRow
          id="reportSourceDashboardSelect"
          label={i18n.translate(
            'opensearch.reports.reportSettingProps.selectDashboard',
            { defaultMessage: 'Select dashboard' }
          )}
          isInvalid={showSettingsReportSourceError}
          error={settingsReportSourceErrorMessage}
        >
          <EuiCompressedComboBox
            id="reportSourceDashboardSelector"
            placeholder={i18n.translate(
              'opensearch.reports.reportSettingProps.placeholder.selectDashboard',
              { defaultMessage: 'Select a dashboard' }
            )}
            singleSelection={{ asPlainText: true }}
            options={dashboards}
            onChange={handleDashboardSelect}
            selectedOptions={dashboardSourceSelect}
          />
        </EuiCompressedFormRow>
        <EuiSpacer />
      </div>
    ) : null;

  const displayVisualizationSelect =
    reportSourceId === 'visualizationReportSource' ? (
      <div>
        <EuiCompressedFormRow
          label={i18n.translate(
            'opensearch.reports.reportSettingProps.form.selectVisualization',
            { defaultMessage: 'Select visualization' }
          )}
          isInvalid={showSettingsReportSourceError}
          error={settingsReportSourceErrorMessage}
        >
          <EuiCompressedComboBox
            id="reportSourceVisualizationSelect"
            placeholder={i18n.translate(
              'opensearch.reports.reportSettingProps.form.placeholder.selectAVisualization',
              { defaultMessage: 'Select a visualization' }
            )}
            singleSelection={{ asPlainText: true }}
            options={visualizations}
            onChange={handleVisualizationSelect}
            selectedOptions={visualizationSourceSelect}
          />
        </EuiCompressedFormRow>
        <EuiSpacer />
      </div>
    ) : null;

  const displaySavedSearchSelect =
    reportSourceId === 'savedSearchReportSource' ? (
      <div>
        <EuiCompressedFormRow
          label={i18n.translate(
            'opensearch.reports.reportSettingProps.form.selectSavedSearch',
            { defaultMessage: 'Select saved search' }
          )}
          isInvalid={showSettingsReportSourceError}
          error={settingsReportSourceErrorMessage}
        >
          <EuiCompressedComboBox
            id="reportSourceSavedSearchSelect"
            placeholder={i18n.translate(
              'opensearch.reports.reportSettingProps.form.placeholder.selectASavedSearch',
              { defaultMessage: 'Select a saved search' }
            )}
            singleSelection={{ asPlainText: true }}
            options={savedSearches}
            onChange={handleSavedSearchSelect}
            selectedOptions={savedSearchSourceSelect}
          />
        </EuiCompressedFormRow>
        <EuiSpacer />
        {savedSearchRecordLimit > 10000 ? (
          <>
            <EuiCallOut
              color="primary"
              title={i18n.translate(
                'opensearch.reports.reportSettingProps.form.savedSearchLargeRecordLimitWarning',
                {
                  defaultMessage:
                    'Generating reports with a large number of records can cause memory issues',
                }
              )}
              iconType="iInCircle"
              size="s"
            />
            <EuiSpacer size="xs" />
          </>
        ) : null}
        <EuiFormRow
          id="reportSourceSavedSearchRecordLimit"
          label={i18n.translate(
            'opensearch.reports.reportSettingProps.form.savedSearchRecordLimit',
            { defaultMessage: 'Record limit' }
          )}
        >
          <EuiFieldNumber
            value={savedSearchRecordLimit}
            onChange={handleSavedSearchRecordLimit}
            min={1}
          />
        </EuiFormRow>
        <EuiSpacer />
      </div>
    ) : null;

  const displayVisualReportsFormatAndMarkdown =
    reportSourceId !== 'savedSearchReportSource' ? (
      <div>
        <VisualReportFormatAndMarkdown />
        <SettingsMarkdown />
      </div>
    ) : (
      <DataReportFormatAndMarkdown />
    );

  const displayNotebooksSelect =
    reportSourceId === NOTEBOOKS_REPORT_SOURCE_ID ? (
      <div>
        <EuiCompressedFormRow
          label="Select notebook"
          isInvalid={showSettingsReportSourceError}
          error={settingsReportSourceErrorMessage}
        >
          <EuiCompressedComboBox
            id="reportSourceNotebooksSelect"
            placeholder="Select a notebook"
            singleSelection={{ asPlainText: true }}
            options={notebooks}
            onChange={handleNotebooksSelect}
            selectedOptions={notebooksSourceSelect}
          />
        </EuiCompressedFormRow>
        <EuiSpacer />
      </div>
    ) : null;

  const displayTimeRangeSelect =
    reportSourceId !== NOTEBOOKS_REPORT_SOURCE_ID ? (
      <div>
        <TimeRangeSelect
          timeRange={timeRange}
          reportDefinitionRequest={reportDefinitionRequest}
          edit={edit}
          id={editDefinitionId}
          httpClientProps={httpClientProps}
          showTimeRangeError={showTimeRangeError}
        />
        <EuiSpacer />
      </div>
    ) : null;

  return (
    <EuiPageContent panelPaddingSize={'l'}>
      <EuiPageHeader>
        <EuiTitle>
          <h3>
            {i18n.translate(
              'opensearch.reports.reportSettingProps.form.reportSettings',
              { defaultMessage: 'Report settings' }
            )}
          </h3>
        </EuiTitle>
      </EuiPageHeader>
      <EuiHorizontalRule />
      <EuiPageContentBody>
        <EuiFlexGroup>
          <EuiFlexItem>
            <EuiCompressedFormRow
              label={i18n.translate(
                'opensearch.reports.reportSettingProps.form.name',
                { defaultMessage: 'Name' }
              )}
              helpText={i18n.translate(
                'opensearch.reports.reportSettingProps.form.help.name',
                {
                  defaultMessage:
                    'Valid characters are a-z, A-Z, 0-9, (), [], _ (underscore), - (hyphen) and (space).',
                }
              )}
              isInvalid={showSettingsReportNameError}
              error={settingsReportNameErrorMessage}
              id={'reportSettingsName'}
            >
              <EuiCompressedFieldText
                placeholder={i18n.translate(
                  'opensearch.reports.reportSettingProps.form.placeholder.reportName',
                  {
                    defaultMessage:
                      'Report name (e.g Log Traffic Daily Report)',
                  }
                )}
                value={reportName}
                onChange={handleReportName}
              />
            </EuiCompressedFormRow>
          </EuiFlexItem>
        </EuiFlexGroup>
        <EuiFlexGroup style={{ maxWidth: 600 }}>
          <EuiFlexItem>
            <EuiCompressedFormRow
              label={i18n.translate(
                'opensearch.reports.reportSettingProps.form.description',
                { defaultMessage: 'Description (optional)' }
              )}
              id={'reportSettingsDescription'}
            >
              <EuiCompressedTextArea
                placeholder={i18n.translate(
                  'opensearch.reports.reportSettingProps.form.placeholder.description',
                  {
                    defaultMessage:
                      'Describe this report (e.g Morning daily reports for log traffic)',
                  }
                )}
                value={reportDescription}
                onChange={handleReportDescription}
              />
            </EuiCompressedFormRow>
          </EuiFlexItem>
        </EuiFlexGroup>
        <EuiSpacer />
        <EuiCompressedFormRow
          label={i18n.translate(
            'opensearch.reports.reportSettingProps.form.reportSource',
            { defaultMessage: 'Report source' }
          )}
        >
          <EuiCompressedRadioGroup
            options={getReportSourceRadioOptions()}
            idSelected={reportSourceId}
            onChange={handleReportSource}
            disabled={edit}
          />
        </EuiCompressedFormRow>
        <EuiSpacer />
        {displayDashboardSelect}
        {displayVisualizationSelect}
        {displaySavedSearchSelect}
        {/* <TimeRangeSelect
          timeRange={timeRange}
          reportDefinitionRequest={reportDefinitionRequest}
          edit={edit}
          id={editDefinitionId}
          httpClientProps={httpClientProps}
          showTimeRangeError={showTimeRangeError}
        />
        <EuiSpacer /> */}
        {displayNotebooksSelect}
        {displayTimeRangeSelect}
        {displayVisualReportsFormatAndMarkdown}
        <EuiSpacer />
        <ReportTrigger
          edit={edit}
          editDefinitionId={editDefinitionId}
          httpClientProps={httpClientProps}
          reportDefinitionRequest={reportDefinitionRequest}
          showTriggerIntervalNaNError={showTriggerIntervalNaNError}
          showCronError={showCronError}
        />
      </EuiPageContentBody>
    </EuiPageContent>
  );
}
