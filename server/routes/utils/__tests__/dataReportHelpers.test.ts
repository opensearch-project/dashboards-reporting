/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

// Mock the ExcelBuilder to avoid ES module issues
jest.mock('../excelBuilder', () => ({
  ExcelBuilder: jest.fn().mockImplementation(() => ({
    addHeaders: jest.fn().mockReturnThis(),
    addRows: jest.fn().mockReturnThis(),
    updateColumnWidths: jest.fn().mockReturnThis(),
    applyHeaderStyles: jest.fn().mockReturnThis(),
    applyAutoFilter: jest.fn().mockReturnThis(),
    applyFreeze: jest.fn().mockReturnThis(),
    getWorkbookAsBase64: jest.fn().mockResolvedValue('mock-base64-data')
  }))
}));

import { getOpenSearchData } from '../dataReportHelpers';

function hit(sourceKv: any, fieldsKv = {}) {
  return {
    _source: sourceKv,
    fields: fieldsKv,
  };
}

describe('test getOpenSearchData with null datetime fields', () => {
  test('should not throw error with null datetime fields', () => {
    const arrayHits = [
      {
        hits: [
          hit(
            {
              time: '2025-10-16T09:30:00Z',
              attributes: {
                time: null,
                logtime: '2025-10-16T09:30:00.123Z'
              },
              timefield: null
            },
            {
              time: ['2025-10-16T09:30:00Z'],
              'attributes.time': null,
              'attributes.logtime': ['2025-10-16T09:30:00.123Z'],
              timefield: null
            }
          )
        ]
      }
    ];

    const report = {
      _source: {
        dateFields: ['time', 'attributes.time', 'attributes.logtime', 'timefield'],
        fields_exist: false,
        selectedFields: ['_source']
      }
    };

    const params = {
      excel: false,
      limit: 1000
    };

    const dateFormat = 'MM/DD/YYYY h:mm:ss.SSS a';
    const timezone = 'UTC';

    expect(() => {
      getOpenSearchData(arrayHits, report, params, dateFormat, timezone);
    }).not.toThrow();

    // Verify it returns valid data
    const result = getOpenSearchData(arrayHits, report, params, dateFormat, timezone);
    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(1);
  });

  test('should not throw error with undefined datetime fields', () => {
    // Test data with missing datetime fields
    const arrayHits = [
      {
        hits: [
          hit(
            {
              time: '2025-10-16T09:30:00Z',
              attributes: {
                environment: 'production'
              }
            },
            {
              time: ['2025-10-16T09:30:00Z']
            }
          )
        ]
      }
    ];

    const report = {
      _source: {
        dateFields: ['time', 'attributes.time', 'timefield'],
        fields_exist: false,
        selectedFields: ['_source']
      }
    };

    const params = {
      excel: false,
      limit: 1000
    };

    const dateFormat = 'MM/DD/YYYY h:mm:ss.SSS a';
    const timezone = 'UTC';

    expect(() => {
      getOpenSearchData(arrayHits, report, params, dateFormat, timezone);
    }).not.toThrow();

    const result = getOpenSearchData(arrayHits, report, params, dateFormat, timezone);
    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(1);
  });
});