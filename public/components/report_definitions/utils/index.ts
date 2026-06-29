/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { marked } from 'marked';

export const converter = {
  makeHtml: (text: string) => marked(text, { gfm: true }) as string,
};
