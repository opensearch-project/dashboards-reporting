/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import esb, { Sort } from 'elastic-builder';
import { json2csv } from 'json-2-csv';
import _ from 'lodash';
import moment from 'moment-timezone';
import {
  buildOpenSearchQuery,
  Filter,
  Query,
  OpenSearchQueryConfig,
} from '../../../../../src/plugins/data/common';
import { ExcelBuilder } from './excelBuilder';

export const metaData = {
  saved_search_id: null as string,
  report_format: null as string,
  start: null as string,
  end: null as string,
  fields: null as string,
  type: null as string,
  timeFieldName: null as string,
  sorting: null as string,
  fields_exist: false as boolean,
  selectedFields: [] as any[],
  paternName: null as string,
  searchSourceJSON: [] as any[],
  dateFields: [] as any[],
};

// Get the selected columns by the user.
export const getSelectedFields = async (columns, timeFieldName?: string) => {
  const selectedFields = [];
  let fieldsExist = false;
  for (const column of columns) {
    if (column !== '_source') {
      fieldsExist = true;
      selectedFields.push(column);
    } else {
      fieldsExist = false;
      selectedFields.push('_source');
    }
  }
  // Automatically add timeFieldName to selected fields if it exists and user has selected specific fields
  if (fieldsExist && timeFieldName && !selectedFields.includes(timeFieldName)) {
    selectedFields.unshift(timeFieldName);
  }
  metaData.fields_exist = fieldsExist;
  metaData.selectedFields = selectedFields;
};

// Build the OpenSearch query from the meta data
// is_count is set to 1 if we building the count query but 0 if we building the fetch data query
export const buildRequestBody = (
  report: any,
  allowLeadingWildcards: boolean,
  isCount: number
) => {
  const esbBoolQuery = esb.boolQuery();
  const searchSourceJSON = report._source.searchSourceJSON;
  const savedObjectQuery: Query = JSON.parse(searchSourceJSON).query;
  const savedObjectFilter: Filter = JSON.parse(searchSourceJSON).filter;
  const savedObjectConfig: OpenSearchQueryConfig = {
    allowLeadingWildcards,
    queryStringOptions: {},
    ignoreFilterIfFieldNotInIndex: false,
  };
  const QueryFromSavedObject = buildOpenSearchQuery(
    undefined,
    savedObjectQuery,
    savedObjectFilter,
    savedObjectConfig
  );
  // Add time range
  if (report._source.timeFieldName && report._source.timeFieldName.length > 0) {
    esbBoolQuery.must(
      esb
        .rangeQuery(report._source.timeFieldName)
        .format('epoch_millis')
        .gte(report._source.start - 1)
        .lte(report._source.end + 1)
    );
  }
  if (isCount) {
    return esb.requestBodySearch().query(esbBoolQuery);
  }

  // Add sorting to the query
  const esbSearchQuery = esb
    .requestBodySearch()
    .query(esbBoolQuery)
    .version(true);

  let sorting: string[][] = report._source.sorting;

  // We expect a list of [field, order] pairs for sorting. In some migration paths, though it's not
  // clear why, this list can get unnested in the case of one sort, [["field", "asc"]] becomes
  // ["field", "asc"]. The true root cause remains a mystery, so we work around it.
  // See: https://github.com/opensearch-project/dashboards-reporting/issues/371
  if (sorting.length > 0 && typeof sorting[0] === 'string') {
    sorting = [(sorting as unknown) as string[]];
  }

  if (sorting.length > 0) {
    const sorts: Sort[] = sorting.map((element: string[]) => {
      return esb.sort(element[0], element[1]).unmappedType('date');
    });
    esbSearchQuery.sorts(sorts);
  }

  // add selected fields to query
  if (report._source.fields_exist) {
    esbSearchQuery.source({ includes: report._source.selectedFields });
  }
  // Add a customizer to merge queries to generate request body
  let requestBody = _.mergeWith(
    { query: QueryFromSavedObject },
    esbSearchQuery.toJSON(),
    (objValue, srcValue) => {
      if (_.isArray(objValue)) {
        return objValue.concat(srcValue);
      }
    }
  );

  requestBody = addDocValueFields(report, requestBody);
  return requestBody;
};

// Fetch the data from OpenSearch
export const getOpenSearchData = (
  arrayHits: any,
  report: { _source: any },
  params: { excel: any; limit: number },
  dateFormat: string,
  timezone: string
) => {
  const hits: any = [];
  for (const valueRes of arrayHits) {
    for (const data of valueRes.hits) {
      const fields = data.fields;
      // get all the fields of type date and format them to excel format
      const tempKeyElement: string[] = [];
      for (const dateField of report._source.dateFields) {
        const keys = dateField.split('.');
        const dateValue = data._source[dateField];
        const fieldDateValue = fields?.[dateField];
        const isDateFieldPresent = isKeyPresent(data._source, dateField);

        if (isDateFieldPresent) {
          // if its not a nested date field
          if (keys.length === 1) {
            // if conditions to determine if the date field's value is an array or a string
            if (typeof dateValue === 'string') {
              data._source[keys] = moment
                .utc(dateValue)
                .tz(timezone)
                .format(dateFormat);
            } else if (dateValue?.length !== 0 && dateValue instanceof Array) {
              fieldDateValue?.forEach((element, index) => {
                data._source[keys][index] = moment
                  .utc(element)
                  .tz(timezone)
                  .format(dateFormat);
              });
            } else {
              data._source[keys] = [];
            }
            // else to cover cases with nested date fields
          } else {
            const keyElement = keys.shift();
            // if conditions to determine if the date field's value is an array or a string
            if (fieldDateValue && typeof fieldDateValue === 'string') {
              keys.push(
                moment.utc(fieldDateValue).tz(timezone).format(dateFormat)
              );
            } else if (dateValue?.length !== 0 && dateValue instanceof Array) {
              const tempArray: string[] = [];
              fieldDateValue?.forEach((index) => {
                tempArray.push(
                  moment.utc(index).tz(timezone).format(dateFormat)
                );
              });
              keys.push(tempArray);
            } else {
              keys.push([]);
            }
            const nestedJSON = arrayToNestedJSON(keys);
            const keyLength = Object.keys(data._source);
            // to check if the nested field have anyother keys apart from date field
            if (tempKeyElement.includes(keyElement) || keyLength.length > 1) {
              data._source[keyElement] = {
                ...data._source[keyElement],
                ...nestedJSON,
              };
            } else {
              data._source[keyElement] = nestedJSON;
              tempKeyElement.push(keyElement);
            }
          }
        }
      }
      delete data.fields;
      if (report._source.fields_exist === true) {
        const result = traverse(data, report._source.selectedFields);
        hits.push(params.excel ? sanitize(result) : result);
      } else {
        const result = flattenHits(data);
        hits.push(params.excel ? sanitize(result) : result);
      }
      // Truncate to expected limit size
      if (hits.length >= params.limit) {
        return hits;
      }
    }
  }
  return hits;
};

// Convert the data to Csv format
export const convertToCSV = (dataset, csvSeparator) => {
  const options = {
    delimiter: { field: csvSeparator, eol: '\n' },
    emptyFieldValue: ' ',
  };
  return json2csv(dataset[0], options);
};

function flattenHits(
  input: any,
  result: { [key: string]: any } = {},
  prefix = ''
): { [key: string]: any } {
  for (const [key, value] of Object.entries(input)) {
    const newPrefix = `${prefix}${key}.`;

    if (value === null || typeof value !== 'object' || value instanceof Date) {
      result[prefix.replace(/^_source\./, '') + key] = value;
    } else if (Array.isArray(value)) {
      if (
        value.every(
          (v) => typeof v === 'object' && v !== null && !Array.isArray(v)
        )
      ) {
        const grouped: { [field: string]: any[] } = {};

        for (const obj of value) {
          const flat = flattenHits(obj, {}, '');
          for (const [subKey, subVal] of Object.entries(flat)) {
            if (!grouped[`${key}.${subKey}`]) {
              grouped[`${key}.${subKey}`] = [];
            }
            grouped[`${key}.${subKey}`].push(subVal);
          }
        }

        for (const [flatKey, flatVals] of Object.entries(grouped)) {
          result[prefix.replace(/^_source\./, '') + flatKey] = flatVals.join(
            ','
          );
        }
      } else {
        result[prefix.replace(/^_source\./, '') + key] = value.join(',');
      }
    } else {
      flattenHits(value, result, newPrefix);
    }
  }

  return result;
}

function flattenObject(obj = {}, parentKey = '', result: any = {}) {
  for (const [key, value] of Object.entries(obj)) {
    const newKey = parentKey ? `${parentKey}.${key}` : key;

    if (
      typeof value === 'object' &&
      value !== null &&
      !Array.isArray(value) &&
      Object.keys(value).length > 0
    ) {
      flattenObject(value, newKey, result);
    } else if (Array.isArray(value)) {
      result[newKey] = JSON.stringify(value);
    } else {
      result[newKey] = value;
    }
  }

  return result;
}

function flattenArray(array = []) {
  return array.map((item) => flattenObject(item));
}

export const convertToExcel = async (dataset: any) => {
  const flatDataset = flattenArray(dataset[0]);

  const excelBuilder = new ExcelBuilder();
  const base64 = await excelBuilder
    .addHeaders(flatDataset)
    .addRows(flatDataset)
    .updateColumnWidths()
    .applyHeaderStyles()
    .applyAutoFilter()
    .applyFreeze()
    .getWorkbookAsBase64();

  return (
    'data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,' +
    base64
  );
};

// Return only the selected fields
function traverse(
  data: any,
  keys: string[],
  result: { [key: string]: any } = {}
): { [key: string]: any } {
  const flatData = flattenHits(data);
  for (const key of keys) {
    if (flatData[key] !== undefined) {
      result[key] = flatData[key];
      continue;
    }

    const matchingKeys = Object.keys(flatData).filter(
      (flatKey) => flatKey === key || flatKey.startsWith(key + '.')
    );

    matchingKeys.sort();

    matchingKeys.forEach((matchingKey) => {
      result[matchingKey] = flatData[matchingKey];
    });
  }
  return result;
}

/**
 * Escape special characters if field value prefixed with.
 * This is intend to avoid CSV injection in Microsoft Excel.
 * @param doc   document
 */
function sanitize(doc: any) {
  for (const field in doc) {
    if (doc[field] == null) continue;
    if (
      doc[field].toString().startsWith('+') ||
      (doc[field].toString().startsWith('-') &&
        typeof doc[field] !== 'number') ||
      doc[field].toString().startsWith('=') ||
      doc[field].toString().startsWith('@')
    ) {
      doc[field] = "'" + doc[field];
    }
  }
  return doc;
}

function arrayToNestedJSON(arr: string[]) {
  if (arr.length === 0) {
    return null;
  } else if (arr.length === 1) {
    return arr[0];
  } else {
    const key = arr[0];
    const rest = arr.slice(1);
    return { [key]: arrayToNestedJSON(rest) };
  }
}

function isKeyPresent(data: any, key: string): boolean {
  if (typeof data === 'object' && data !== null) {
    if (key in data) {
      return true;
    }
    for (const value of Object.values(data)) {
      if (isKeyPresent(value, key)) {
        return true;
      }
    }
  }
  return false;
}

const addDocValueFields = (report: any, requestBody: any) => {
  const docValues = [];
  for (const dateType of report._source.dateFields) {
    docValues.push({
      field: dateType,
      format: 'date_hour_minute_second_fraction',
    });
  }
  // elastic-builder doesn't provide function to build docvalue_fields with format,
  // this is a workaround which appends docvalues field to the request body.
  requestBody = {
    ...requestBody,
    docvalue_fields: docValues,
  };
  return requestBody;
};
