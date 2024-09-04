/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { I18nProvider } from '@osd/i18n/react';
import { HashRouter as Router, Route, Switch } from 'react-router-dom';
import { i18n } from '@osd/i18n';
import { EuiPage, EuiPageBody, EuiPageContentBody } from '@elastic/eui';
import {
  CoreStart,
  ChromeBreadcrumb,
  IUiSettingsClient,
} from '../../../../src/core/public';
import { NavigationPublicPluginStart } from '../../../../src/plugins/navigation/public';
import { CreateReport } from './report_definitions/create/create_report_definition';
import { Main } from './main/main';
import { ReportDetails } from './main/report_details/report_details';
import { ReportDefinitionDetails } from './main/report_definition_details/report_definition_details';
import { EditReportDefinition } from './report_definitions/edit/edit_report_definition';


export interface CoreInterface {
  http: CoreStart['http'];
  uiSettings: IUiSettingsClient;
  setBreadcrumbs: (newBreadcrumbs: ChromeBreadcrumb[]) => void;
}

interface ReportsDashboardsAppDeps {
  basename: string;
  notifications: CoreStart['notifications'];
  http: CoreStart['http'];
  navigation: NavigationPublicPluginStart;
  chrome: CoreStart['chrome'];
}

export const ReportsDashboardsApp = ({
  basename,
  http,
  chrome,
}: ReportsDashboardsAppDeps) => {
  // Render the application DOM.
  return (
    <Router basename={'/' + basename}>
      <I18nProvider>
        <div>
          <EuiPage>
            <EuiPageBody>
              <EuiPageContentBody>
                <Switch>
                  <Route
                    path="/report_details/:reportId"
                    render={(props) => (
                      <ReportDetails
                        title={i18n.translate(
                          'opensearch.reports.app.reportDetails',
                          { defaultMessage: 'Report Details' }
                        )}
                        httpClient={http}
                        chrome={chrome}
                        {...props}
                        setBreadcrumbs={chrome.setBreadcrumbs}
                      />
                    )}
                  />
                  <Route
                    path="/report_definition_details/:reportDefinitionId"
                    render={(props) => (
                      <ReportDefinitionDetails
                        title={i18n.translate(
                          'opensearch.reports.app.reportDefinitionDetails',
                          { defaultMessage: 'Report Definition Details' }
                        )}
                        httpClient={http}
                        chrome={chrome}
                        {...props}
                        setBreadcrumbs={chrome.setBreadcrumbs}
                      />
                    )}
                  />
                  <Route
                    path="/create"
                    render={(props) => (
                      <CreateReport
                        title={i18n.translate(
                          'opensearch.reports.app.createReport',
                          { defaultMessage: 'Create Report' }
                        )}
                        httpClient={http}
                        chrome={chrome}
                        {...props}
                        setBreadcrumbs={chrome.setBreadcrumbs}
                      />
                    )}
                  />
                  <Route
                    path="/edit/:reportDefinitionId"
                    render={(props) => (
                      <EditReportDefinition
                        title={i18n.translate(
                          'opensearch.reports.app.editReportDefinition',
                          { defaultMessage: 'Edit Report Definition' }
                        )}
                        httpClient={http}
                        {...props}
                        setBreadcrumbs={chrome.setBreadcrumbs}
                      />
                    )}
                  />
                  <Route
                    path="/"
                    render={(props) => (
                      <Main
                        title={i18n.translate(
                          'opensearch.reports.app.reportingHomepage',
                          { defaultMessage: 'Reporting Homepage' }
                        )}
                        httpClient={http}
                        {...props}
                        setBreadcrumbs={chrome.setBreadcrumbs}
                        chrome={chrome}
                      />
                    )}
                  />
                </Switch>
              </EuiPageContentBody>
            </EuiPageBody>
          </EuiPage>
        </div>
      </I18nProvider>
    </Router>
  );
};
