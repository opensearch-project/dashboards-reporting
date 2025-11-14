/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { i18n } from '@osd/i18n';
import {
  AppMountParameters,
  CoreSetup,
  CoreStart,
  Plugin,
} from '../../../src/core/public';
import { DataSourcePluginSetup } from '../../../src/plugins/data_source/public';
import { PLUGIN_ID, PLUGIN_NAME } from '../common';
import './components/context_menu/context_menu';
import { applicationService } from './components/utils/application_service';
import { uiSettingsService } from './components/utils/settings_service';
import { registerAllPluginNavGroups } from './plugin_nav';
import {
  AppPluginStartDependencies,
  ReportsDashboardsPluginSetup,
  ReportsDashboardsPluginStart,
} from './types';
import { pluginsService } from './components/utils/plugins_service';

export interface ReportingPluginSetupDependencies {
  dataSource: DataSourcePluginSetup;
}

export class ReportsDashboardsPlugin
  implements
    Plugin<ReportsDashboardsPluginSetup, ReportsDashboardsPluginStart> {
  public setup(
    core: CoreSetup,
    { dataSource }: ReportingPluginSetupDependencies
  ): ReportsDashboardsPluginSetup {
    uiSettingsService.init(core.uiSettings, core.http);
    // Register an application into the side navigation menu
    if (!dataSource) {
      core.application.register({
        id: PLUGIN_ID,
        title: i18n.translate('opensearch.reports.pluginName', {
          defaultMessage: PLUGIN_NAME,
        }),
        category: {
          id: 'explore',
          label: 'Explore',
          order: 100,
          euiIconType: 'search',
        },
        order: 2000,
        async mount(params: AppMountParameters) {
          // Load application bundle
          const { renderApp } = await import('./application');
          // Get start services as specified in opensearch_dashboards.json
          const [coreStart, depsStart] = await core.getStartServices();
          // Render the application
          return renderApp(
            coreStart,
            depsStart as AppPluginStartDependencies,
            params
          );
        },
      });
    }
    registerAllPluginNavGroups(core);
    // Return methods that should be available to other plugins
    return {};
  }

  public start(
    core: CoreStart,
    plugins: ReportsDashboardsPluginStart
  ): ReportsDashboardsPluginStart {
    applicationService.init(core.application);
    pluginsService.init(plugins);
    return {};
  }

  public stop() {}
}
