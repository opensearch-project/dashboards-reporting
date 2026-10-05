/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

jest.mock('../settings_service', () => ({
  uiSettingsService: { getHttpClient: jest.fn() },
}));

import {
  getResourceSharingAvailableTypes,
  REPORT_DEFINITION_RESOURCE_TYPE,
  REPORT_INSTANCE_RESOURCE_TYPE,
} from '../resource_sharing_service';
import { uiSettingsService } from '../settings_service';

const mockGetHttpClient = uiSettingsService.getHttpClient as jest.Mock;

const withHttpResponses = (
  dashboardsInfo: unknown,
  resourceTypes?: unknown
): jest.Mock => {
  const get = jest.fn((path: string) => {
    if (path === '/api/v1/auth/resource_sharing_enabled') {
      return Promise.resolve(dashboardsInfo);
    }
    if (path === '/api/resource/types') {
      return Promise.resolve(resourceTypes);
    }
    return Promise.reject(new Error(`unexpected path ${path}`));
  });
  mockGetHttpClient.mockReturnValue({ get });
  return get;
};

describe('getResourceSharingAvailableTypes', () => {
  afterEach(() => mockGetHttpClient.mockReset());

  it('returns [] when the http client has not been initialized', async () => {
    mockGetHttpClient.mockReturnValue(undefined);
    await expect(getResourceSharingAvailableTypes()).resolves.toEqual([]);
  });

  it('returns [] when resource sharing is disabled on the source', async () => {
    withHttpResponses({ enabled: false });
    await expect(getResourceSharingAvailableTypes()).resolves.toEqual([]);
  });

  it('returns [] when the resource_sharing_enabled request fails', async () => {
    mockGetHttpClient.mockReturnValue({
      get: jest.fn().mockRejectedValue(new Error('boom')),
    });
    await expect(getResourceSharingAvailableTypes()).resolves.toEqual([]);
  });

  it('returns the registered types when resource sharing is enabled', async () => {
    withHttpResponses(
      { enabled: true },
      {
        types: [
          { type: REPORT_DEFINITION_RESOURCE_TYPE },
          { type: REPORT_INSTANCE_RESOURCE_TYPE },
        ],
      }
    );
    await expect(getResourceSharingAvailableTypes()).resolves.toEqual([
      'report-definition',
      'report-instance',
    ]);
  });

  it('supports a bare-array types response and drops malformed entries', async () => {
    withHttpResponses({ enabled: true }, [
      { type: REPORT_DEFINITION_RESOURCE_TYPE },
      {},
    ]);
    await expect(getResourceSharingAvailableTypes()).resolves.toEqual([
      'report-definition',
    ]);
  });

  it('forwards the selected data source id to both routes', async () => {
    const get = withHttpResponses({ enabled: true }, { types: [] });
    await getResourceSharingAvailableTypes('ds-1');
    expect(get).toHaveBeenCalledWith('/api/v1/auth/resource_sharing_enabled', {
      query: { dataSourceId: 'ds-1' },
    });
    expect(get).toHaveBeenCalledWith('/api/resource/types', {
      query: { dataSourceId: 'ds-1' },
    });
  });

  it('sends an empty query when no data source id is given', async () => {
    const get = withHttpResponses({ enabled: true }, { types: [] });
    await getResourceSharingAvailableTypes();
    expect(get).toHaveBeenCalledWith('/api/v1/auth/resource_sharing_enabled', {
      query: {},
    });
  });
});
