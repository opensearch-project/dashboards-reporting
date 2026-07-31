/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { applicationService } from './application_service';

/**
 * Resource type registered by the reports-scheduler backend plugin with the
 * security plugin's resource-sharing framework.
 */
export const REPORT_DEFINITION_RESOURCE_TYPE = 'report-definition';

/**
 * Whether resource sharing is available for report definitions, via the core
 * capability registered by security-dashboards-plugin. False when that plugin
 * is not installed, the feature is disabled, or the report-definition type is
 * not registered — no plugin dependency involved.
 */
export function isResourceSharingAvailable(): boolean {
  try {
    const caps = (applicationService.getApplication()?.capabilities as any)
      ?.resourceSharing;
    if (!caps?.enabled) return false;
    const types: string = caps.availableTypes ?? '';
    return types.split(',').includes(REPORT_DEFINITION_RESOURCE_TYPE);
  } catch (e) {
    return false;
  }
}
