/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { ResponseError } from '@opensearch-project/opensearch/lib/errors';
import { schema } from '@osd/config-schema';
import fs from 'fs';
import { createWorker } from 'tesseract.js';
import {
  IOpenSearchDashboardsResponse,
  IRouter,
} from '../../../../src/core/server';
import { API_PREFIX } from '../../common';
import { checkErrorType, errorResponse } from './utils/helpers';
import { addToMetric } from './utils/metricHelper';

export default function (router: IRouter) {
  router.post(
    {
      path: `${API_PREFIX}/ocrReport`,
      validate: {
        body: schema.any(),
      },
    },
    async (
      context,
      request,
      response
    ): Promise<IOpenSearchDashboardsResponse<any | ResponseError>> => {
      //@ts-ignore
      const logger: Logger = context.reporting_plugin.logger;
      console.log('❗logger:', request);
      logger.warn('request len', request.body.data.length)

      try {
        const worker = await createWorker();
        await worker.loadLanguage('eng');
        await worker.initialize('eng');
        const {
          data: { text, pdf },
        } = await worker.recognize(
          request.body.data,
          { pdfTitle: 'Example PDF' },
          { pdf: true }
        );
        await worker.terminate();
        const data = Buffer.from(pdf).toString('base64');
        logger.warn('response len', data.length)
        fs.writeFileSync('tesseract-ocr-result.pdf', Buffer.from(pdf));

        return response.ok({
          body: {
            data,
          },
        });
      } catch (error) {
        // TODO: better error handling for delivery and stages in generating report, pass logger to deeper level
        logger.error(`Failed to generate report: ${error}`);
        logger.error(error);
        addToMetric('report', 'create', checkErrorType(error));
        return errorResponse(response, error);
      }
    }
  );
}
