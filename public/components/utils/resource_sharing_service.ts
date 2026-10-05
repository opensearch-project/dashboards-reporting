/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { uiSettingsService } from './settings_service';

/**
 * Resource types registered by the reports-scheduler backend plugin with the
 * security plugin's resource-sharing framework.
 */
export const REPORT_DEFINITION_RESOURCE_TYPE = 'report-definition';
export const REPORT_INSTANCE_RESOURCE_TYPE = 'report-instance';

/**
 * Resource-sharing types available on the given data source (feature flag +
 * per-type list). Returns [] when disabled or on error.
 */
export const getResourceSharingAvailableTypes = async (
  resourceDataSourceId?: string
): Promise<string[]> => {
  try {
    const http = uiSettingsService.getHttpClient();
    const query = resourceDataSourceId
      ? { dataSourceId: resourceDataSourceId }
      : {};
    // Global gate: resource sharing must be enabled on the selected data source.
    const info: any = await http.get('/api/v1/auth/resource_sharing_enabled', {
      query,
    });
    if (!info?.enabled) return [];
    // Per-type gate: the registered/protected shareable types on that source.
    const typesResp: any = await http.get('/api/resource/types', { query });
    const rawTypes = Array.isArray(typesResp)
      ? typesResp
      : (typesResp?.types ?? []);
    return rawTypes
      .map((entry: { type: string }) => entry?.type)
      .filter((type: string | undefined): type is string => Boolean(type));
  } catch (e) {
    return [];
  }
};
