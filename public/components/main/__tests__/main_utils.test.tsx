/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  humanReadableDate,
  extractFilename,
  extractFileFormat,
  getFileFormatPrefix,
  addReportsTableContent,
  addReportDefinitionsTableContent,
  removeDuplicatePdfFileFormat,
  readStreamToFile,
  generateReportFromDefinitionId,
  generateReportById,
} from '../main_utils';
import {
  reportDefinitionsTableMockResponse,
  mockReportsTableItems,
  reportTableMockResponse,
  reportDefinitionsTableMockContent,
} from './__utils__/main_utils_test_utils';
import sinon from 'sinon';
import httpClientMock from '../../../../test/httpMockClient';

describe('main_utils tests', () => {
  global.URL.createObjectURL = jest.fn();
  const mockElement = document.createElement('a');
  mockElement.download = 'string';
  mockElement.click = function name() {};
  sinon.stub(document, 'createElement').returns(mockElement);

  test('humanReadableDate', () => {
    const readableDate = new Date(2018, 11, 24, 10, 33, 30);
    const humanReadable = humanReadableDate(readableDate);

    expect(humanReadable).toBe('Mon Dec 24 2018 @ 10:33:30 AM');
  });

  test('extractFileName', () => {
    const fullFile = 'test_file_name_extracted_correctly.pdf';
    const fileName = extractFilename(fullFile);

    expect(fileName).toBe('test_file_name_extracted_correctly');
  });

  test('extractFileFormat', () => {
    const fullFile = 'test_file_format_extracted_correctly.png';
    const fileFormat = extractFileFormat(fullFile);

    expect(fileFormat).toBe('png');
  });

  test('getFileFormatPrefix', () => {
    const fileFormat = 'pdf';
    const fileFormatPrefix = getFileFormatPrefix(fileFormat);

    expect(fileFormatPrefix).toBe('data:pdf;base64,');
  });

  test('addReportsTableContent', () => {
    const reportsTableItems = addReportsTableContent(reportTableMockResponse);

    expect(reportsTableItems).toStrictEqual(mockReportsTableItems);
  });

  test('addReportDefinitionsTableContent', () => {
    const reportDefinitionsTableItems = addReportDefinitionsTableContent(
      reportDefinitionsTableMockResponse
    );

    expect(reportDefinitionsTableItems).toStrictEqual(
      reportDefinitionsTableMockContent
    );
  });

  test('removeDuplicatePdfFileFormat', () => {
    const duplicateFormat = 'test_duplicate_remove.pdf.pdf';
    const duplicateRemoved = removeDuplicatePdfFileFormat(duplicateFormat);

    expect(duplicateRemoved).toBe('test_duplicate_remove.pdf');
  });

  test('readStreamToFile csv', () => {
    const stream =
      'category,customer_gender\n' +
      'c1,Male\n' +
      'c2,Male\n' +
      'c3,Male\n' +
      'c4,Male\n' +
      'c5,Male';

    const fileFormat = 'csv';
    const fileName = 'test_data_report.csv';
    readStreamToFile(stream, fileFormat, fileName);
    expect(global.URL.createObjectURL).toHaveBeenCalled();
  });

  test('readStreamToFile xlsx creates blob URL without fetch', async () => {
    const mockCreateObjectURL = jest.fn().mockReturnValue('blob:mock-url');
    global.URL.createObjectURL = mockCreateObjectURL;

    const stream =
      'data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,dGVzdA==';
    const fileFormat = 'xlsx';
    const fileName = 'test_data_report.xlsx';

    await readStreamToFile(stream, fileFormat, fileName);

    expect(mockCreateObjectURL).toHaveBeenCalled();
    const blob = mockCreateObjectURL.mock.calls[0][0];
    expect(blob).toBeInstanceOf(Blob);
    expect(blob.type).toBe(
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    expect(blob.size).toBe(4);
  });

  test('readStreamToFile pdf', () => {
    const stream = 'data:pdf;base64,zxvniaorbguw40absdoanlsdf';
    const fileFormat = 'pdf';
    const fileName = 'test_pdf_report.pdf';
    readStreamToFile(stream, fileFormat, fileName);
    expect(global.URL.createObjectURL).not.toHaveBeenCalled();
  });

  test('generateReportFromDefinitionId', () => {
    const reportDefinitionId = '1';
    expect(
      generateReportFromDefinitionId(reportDefinitionId, httpClientMock)
    ).toBeDefined();
  });

  test('generateReportById', () => {
    const reportId = '1';
    const handleSuccessToast = jest.fn();
    const handleErrorToast = jest.fn();
    expect(
      generateReportById(
        reportId,
        httpClientMock,
        handleSuccessToast,
        handleErrorToast
      )
    ).toBeDefined();
  });

  test('generateReportById timeout error handling', async () => {
    expect.assertions(1);
    const reportId = '1';
    const handleSuccessToast = jest.fn();
    const handleErrorToast = jest.fn();
    const handlePermissionsMissingToast = jest.fn();

    httpClientMock.get.mockReturnValue(
      Promise.reject({ body: { statusCode: 503 } })
    );

    await generateReportById(
      reportId,
      httpClientMock,
      handleSuccessToast,
      handleErrorToast,
      handlePermissionsMissingToast
    );
    expect(handleErrorToast).toHaveBeenCalledWith(
      'Error generating report.',
      'Timed out generating report ID 1. Try again later.'
    );
  });
});
