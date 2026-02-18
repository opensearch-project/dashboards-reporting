/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { getOpenSearchData } from '../dataReportHelpers';

jest.mock('../excelBuilder', () => ({
  ExcelBuilder: jest.fn().mockImplementation(() => ({
    addHeaders: jest.fn().mockReturnThis(),
    addRows: jest.fn().mockReturnThis(),
    updateColumnWidths: jest.fn().mockReturnThis(),
    applyHeaderStyles: jest.fn().mockReturnThis(),
    applyAutoFilter: jest.fn().mockReturnThis(),
    applyFreeze: jest.fn().mockReturnThis(),
    getWorkbookAsBase64: jest.fn().mockResolvedValue('mock-base64-data'),
  })),
}));

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
                logtime: '2025-10-16T09:30:00.123Z',
              },
              timefield: null,
            },
            {
              time: ['2025-10-16T09:30:00Z'],
              'attributes.time': null,
              'attributes.logtime': ['2025-10-16T09:30:00.123Z'],
              timefield: null,
            }
          ),
        ],
      },
    ];

    const report = {
      _source: {
        dateFields: [
          'time',
          'attributes.time',
          'attributes.logtime',
          'timefield',
        ],
        fields_exist: false,
        selectedFields: ['_source'],
      },
    };

    const params = {
      excel: false,
      limit: 1000,
    };

    const dateFormat = 'MM/DD/YYYY h:mm:ss.SSS a';
    const timezone = 'UTC';

    expect(() => {
      getOpenSearchData(arrayHits, report, params, dateFormat, timezone);
    }).not.toThrow();

    const result = getOpenSearchData(
      arrayHits,
      report,
      params,
      dateFormat,
      timezone
    );

    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(1);

    const processedData = result[0];
    expect(processedData).toBeDefined();

    expect(processedData.time).toBe('10/16/2025 9:30:00.000 am');
    expect(processedData['attributes.logtime']).toBe(
      '2025-10-16T09:30:00.123Z'
    );

    expect(processedData.timefield).toBeUndefined();
    expect(processedData['attributes.time']).toBeNull();
  });

  test('should not throw error with undefined datetime fields', () => {
    const arrayHits = [
      {
        hits: [
          hit(
            {
              time: '2025-10-16T09:30:00Z',
              attributes: {
                environment: 'production',
              },
            },
            {
              time: ['2025-10-16T09:30:00Z'],
            }
          ),
        ],
      },
    ];

    const report = {
      _source: {
        dateFields: ['time', 'attributes.time', 'timefield'],
        fields_exist: false,
        selectedFields: ['_source'],
      },
    };

    const params = {
      excel: false,
      limit: 1000,
    };

    const dateFormat = 'MM/DD/YYYY h:mm:ss.SSS a';
    const timezone = 'UTC';

    expect(() => {
      getOpenSearchData(arrayHits, report, params, dateFormat, timezone);
    }).not.toThrow();

    const result = getOpenSearchData(
      arrayHits,
      report,
      params,
      dateFormat,
      timezone
    );

    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(1);

    const processedData = result[0];
    expect(processedData).toBeDefined();

    expect(processedData.time).toBe('10/16/2025 9:30:00.000 am');

    expect(processedData['attributes.environment']).toBe('production');

    expect(processedData.timefield).toBeUndefined();
    expect(processedData['attributes.time']).toBeUndefined();
  });
});

describe('test traverse preserves selected field order', () => {
  test('should preserve exact field order from selectedFields', () => {
    const arrayHits = [
      {
        hits: [
          hit({
            customer_first_name: 'John',
            customer_last_name: 'Doe',
            category: 'Electronics',
            price: 100,
          }),
        ],
      },
    ];

    const report = {
      _source: {
        dateFields: [],
        fields_exist: true,
        selectedFields: [
          'customer_last_name',
          'category',
          'customer_first_name',
          'price',
        ],
      },
    };

    const params = { excel: false, limit: 1000 };
    const result = getOpenSearchData(
      arrayHits,
      report,
      params,
      'MM/DD/YYYY',
      'UTC'
    );

    expect(result).toBeDefined();
    expect(result.length).toBe(1);

    const keys = Object.keys(result[0]);
    expect(keys).toEqual([
      'customer_last_name',
      'category',
      'customer_first_name',
      'price',
    ]);
  });

  test('should expand nested fields in order after parent field', () => {
    const arrayHits = [
      {
        hits: [
          hit({
            customer_name: 'John',
            geoip: {
              city_name: 'Seattle',
              country_iso_code: 'US',
              location: { lon: -122.33, lat: 47.61 },
            },
            category: 'Books',
          }),
        ],
      },
    ];

    const report = {
      _source: {
        dateFields: [],
        fields_exist: true,
        selectedFields: [
          'customer_name',
          'geoip.location',
          'category',
          'geoip.city_name',
        ],
      },
    };

    const params = { excel: false, limit: 1000 };
    const result = getOpenSearchData(
      arrayHits,
      report,
      params,
      'MM/DD/YYYY',
      'UTC'
    );

    expect(result).toBeDefined();
    expect(result.length).toBe(1);

    const keys = Object.keys(result[0]);
    // geoip.location should expand to lat, lon alphabetically, then category, then city_name
    expect(keys).toEqual([
      'customer_name',
      'geoip.location.lat',
      'geoip.location.lon',
      'category',
      'geoip.city_name',
    ]);
  });

  test('should handle array fields and preserve order', () => {
    const arrayHits = [
      {
        hits: [
          hit({
            customer_id: '123',
            products: [
              { price: 50, category: 'Books' },
              { price: 100, category: 'Electronics' },
            ],
            total: 150,
          }),
        ],
      },
    ];

    const report = {
      _source: {
        dateFields: [],
        fields_exist: true,
        selectedFields: [
          'customer_id',
          'products.category',
          'total',
          'products.price',
        ],
      },
    };

    const params = { excel: false, limit: 1000 };
    const result = getOpenSearchData(
      arrayHits,
      report,
      params,
      'MM/DD/YYYY',
      'UTC'
    );

    expect(result).toBeDefined();
    expect(result.length).toBe(1);

    const keys = Object.keys(result[0]);
    expect(keys).toEqual([
      'customer_id',
      'products.category',
      'total',
      'products.price',
    ]);
    expect(result[0]['products.category']).toBe('Books,Electronics');
    expect(result[0]['products.price']).toBe('50,100');
  });

  test('should maintain order across multiple rows', () => {
    const arrayHits = [
      {
        hits: [
          hit({
            field_a: 'A1',
            field_c: 'C1',
            field_b: 'B1',
          }),
          hit({
            field_b: 'B2',
            field_a: 'A2',
            field_c: 'C2',
          }),
        ],
      },
    ];

    const report = {
      _source: {
        dateFields: [],
        fields_exist: true,
        selectedFields: ['field_b', 'field_a', 'field_c'],
      },
    };

    const params = { excel: false, limit: 1000 };
    const result = getOpenSearchData(
      arrayHits,
      report,
      params,
      'MM/DD/YYYY',
      'UTC'
    );

    expect(result).toBeDefined();
    expect(result.length).toBe(2);

    // Check both rows have same key order
    const keys1 = Object.keys(result[0]);
    const keys2 = Object.keys(result[1]);

    expect(keys1).toEqual(['field_b', 'field_a', 'field_c']);
    expect(keys2).toEqual(['field_b', 'field_a', 'field_c']);
  });
});
