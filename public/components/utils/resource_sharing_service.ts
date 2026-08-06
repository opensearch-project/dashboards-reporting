/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { applicationService } from './application_service';

/**
 * Resource types registered by the reports-scheduler backend plugin with the
 * security plugin's resource-sharing framework.
 */
export const REPORT_DEFINITION_RESOURCE_TYPE = 'report-definition';
export const REPORT_INSTANCE_RESOURCE_TYPE = 'report-instance';

/**
 * Whether resource sharing is available for the given reporting resource
 * type, via the core capability registered by security-dashboards-plugin.
 * False when that plugin is not installed, the feature is disabled, or the
 * type is not registered — no plugin dependency involved.
 */
export function isResourceSharingAvailable(
  resourceType: string = REPORT_DEFINITION_RESOURCE_TYPE
): boolean {
  try {
    const caps = (applicationService.getApplication()?.capabilities as any)
      ?.resourceSharing;
    if (!caps?.enabled) return false;
    const types: string = caps.availableTypes ?? '';
    return types.split(',').includes(resourceType);
  } catch (e) {
    return false;
  }
}
