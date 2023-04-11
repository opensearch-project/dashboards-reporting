/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import createDOMPurify from 'dompurify';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { createWorker } from 'tesseract.js';
import { v1 as uuidv1 } from 'uuid';
import { ReportSchemaType } from '../../../server/model';
import { uiSettingsService } from '../utils/settings_service';
import { reportingStyle } from './assets/report_styles';
import {
  converter,
  DEFAULT_REPORT_HEADER,
  SELECTOR,
  VISUAL_REPORT_TYPE,
} from './constants';

const waitForSelector = (selector: string, timeout = 30000) => {
  return Promise.race([
    new Promise((resolve) => {
      if (document.querySelector(selector)) {
        return resolve(document.querySelector(selector));
      }
      const observer = new MutationObserver((mutations) => {
        if (document.querySelector(selector)) {
          resolve(document.querySelector(selector));
          observer.disconnect();
        }
      });
      observer.observe(document.body, {
        childList: true,
        subtree: true,
      });
    }),
    new Promise((resolve, reject) =>
      setTimeout(
        () =>
          reject(
            'Timed out waiting for selector ' +
              selector +
              ' while generating report.'
          ),
        timeout
      )
    ),
  ]);
};

const timeout = (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

const removeNonReportElements = (
  doc: Document,
  reportSource: VISUAL_REPORT_TYPE
) => {
  // remove buttons
  doc
    .querySelectorAll("button[class^='euiButton']:not(.visLegend__button)")
    .forEach((e) => e.remove());
  // remove top navBar
  doc.querySelectorAll("[class^='euiHeader']").forEach((e) => e.remove());
  // remove visualization editor
  if (reportSource === VISUAL_REPORT_TYPE.visualization) {
    doc.querySelector('[data-test-subj="splitPanelResizer"]')?.remove();
    doc.querySelector('.visEditor__collapsibleSidebar')?.remove();
  }
};

const addReportHeader = (doc: Document, header: string) => {
  const headerHtml = `<div id="reportingHeader">
    <div class="mde-preview" data-testid="mde-preview">
      <div class="mde-preview-content">${header}</div>
    </div>
  </div>`;
  const headerContainer = document.createElement('div');
  headerContainer.className = 'reportWrapper';
  headerContainer.innerHTML = headerHtml;
  const body = doc.getElementsByTagName('body')[0];
  body.insertBefore(headerContainer, body.children[0]);
};

const addReportFooter = (doc: Document, footer: string) => {
  const footerHtml = `<div id="reportingFooter">
    <div class="mde-preview" data-testid="mde-preview">
      <div class="mde-preview-content">${footer}</div>
    </div>
  </div>`;
  const footerContainer = document.createElement('div');
  footerContainer.className = 'reportWrapper';
  footerContainer.innerHTML = footerHtml;
  const body = doc.getElementsByTagName('body')[0];
  body.appendChild(footerContainer);
};

const addReportStyle = (doc: Document, style: string) => {
  const styleElement = document.createElement('style');
  styleElement.className = 'reportInjectedStyles';
  styleElement.innerHTML = style;
  doc.getElementsByTagName('head')[0].appendChild(styleElement);
  doc.body.style.paddingTop = '0px';
};

const computeHeight = (height: number, header: string, footer: string) => {
  let computedHeight = height;
  const headerLines = header.split('\n').length;
  const footerLines = footer.split('\n').length;
  if (headerLines) {
    computedHeight += 24 * headerLines;
  }
  if (footerLines) {
    computedHeight += 50 + 24 * footerLines;
  }
  return computedHeight;
};

export const generateReport = async (id: string, forceDelay = 15000) => {
  const http = uiSettingsService.getHttpClient();
  const useForeignObjectRendering = uiSettingsService.get('reporting:useFOR');
  const DOMPurify = createDOMPurify(window);

  const report = await http.get<ReportSchemaType>(
    '../api/reporting/reports/' + id
  );
  const format =
    report.report_definition.report_params.core_params.report_format;
  const reportSource = report.report_definition.report_params
    .report_source as unknown as VISUAL_REPORT_TYPE;
  const headerInput = report.report_definition.report_params.core_params.header;
  const footerInput = report.report_definition.report_params.core_params.footer;
  const header = headerInput
    ? DOMPurify.sanitize(converter.makeHtml(headerInput))
    : DEFAULT_REPORT_HEADER;
  const footer = footerInput
    ? DOMPurify.sanitize(converter.makeHtml(footerInput))
    : '';
  const fileName =
    report.report_definition.report_params.report_name +
    `_${new Date().toISOString()}_${uuidv1()}.${format}`;

  await timeout(1000);
  switch (reportSource) {
    case VISUAL_REPORT_TYPE.dashboard:
      await waitForSelector(SELECTOR.dashboard);
      break;
    case VISUAL_REPORT_TYPE.visualization:
      await waitForSelector(SELECTOR.visualization);
      break;
    case VISUAL_REPORT_TYPE.notebook:
      await waitForSelector(SELECTOR.notebook);
      break;
    default:
      throw Error(
        `report source can only be one of [Dashboard, Visualization, Notebook]`
      );
  }
  await timeout(forceDelay);

  // Style changes onclone does not work with foreign object rendering enabled.
  // Additionally increase span width to prevent text being truncated
  if (useForeignObjectRendering) {
    document
      .querySelectorAll<HTMLSpanElement>('span:not([data-html2canvas-ignore])')
      .forEach((el) => {
        if (!el.closest('.globalFilterItem'))
          el.style.width = el.offsetWidth + 30 + 'px';
      });
    document
      .querySelectorAll<HTMLSpanElement>(
        'span.globalFilterItem:not([data-html2canvas-ignore])'
      )
      .forEach((el) => (el.style.width = el.offsetWidth + 5 + 'px'));
    addReportHeader(document, header);
    addReportFooter(document, footer);
    addReportStyle(document, reportingStyle);
    await timeout(1000);
  }

  const width = document.documentElement.scrollWidth;
  const height = computeHeight(
    document.documentElement.scrollHeight,
    header,
    footer
  );
  return html2canvas(document.body, {
    scrollX: 0,
    scrollY: 0,
    windowWidth: width,
    windowHeight: height,
    width,
    height,
    imageTimeout: 30000,
    useCORS: true,
    removeContainer: false,
    allowTaint: true,
    foreignObjectRendering: useForeignObjectRendering,
    onclone: function (documentClone) {
      removeNonReportElements(documentClone, reportSource);
      if (!useForeignObjectRendering) {
        addReportHeader(documentClone, header);
        addReportFooter(documentClone, footer);
        addReportStyle(documentClone, reportingStyle);
      }
    },
  })
    .then(async function (canvas) {
      // TODO remove this and 'removeContainer: false' when https://github.com/niklasvh/html2canvas/pull/2949 is merged
      document
        .querySelectorAll<HTMLIFrameElement>('.html2canvas-container')
        .forEach((e) => {
          const iframe = e.contentWindow;
          if (e) {
            e.src = 'about:blank';
            if (iframe) {
              iframe.document.write('');
              iframe.document.clear();
              iframe.close();
            }
            e.remove();
          }
        });

      if (format === 'png') {
        const link = document.createElement('a');
        link.download = fileName;
        link.href = canvas.toDataURL();
        link.click();
      } else if (uiSettingsService.get('reporting:useOcr')) {
        const worker = await createWorker({
          workerPath: '../api/reporting/tesseract.js/dist/worker.min.js',
          langPath: '../api/reporting/tesseract-lang-data',
          corePath: '../api/reporting/tesseract.js-core/tesseract-core.wasm.js',
        });
        await worker.loadLanguage('eng');
        await worker.initialize('eng');
        const {
          data: { text, pdf },
        } = await worker
          .recognize(canvas.toDataURL(), { pdfTitle: fileName }, { pdf: true })
          .catch((e) => console.error('recognize', e));
        await worker.terminate();

        const blob = new Blob([new Uint8Array(pdf)], {
          type: 'application/pdf',
        });
        const link = document.createElement('a');
        if (link.download !== undefined) {
          const url = URL.createObjectURL(blob);
          link.setAttribute('href', url);
          link.setAttribute('download', fileName);
          link.style.visibility = 'hidden';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }
      } else {
        const orient = canvas.width > canvas.height ? 'landscape' : 'portrait';
        const pdf = new jsPDF(orient, 'px', [canvas.width, canvas.height]);
        pdf.addImage(canvas, 'JPEG', 0, 0, canvas.width, canvas.height);
        pdf.save(fileName);
      }
      return true;
    })
    .finally(() => {
      if (useForeignObjectRendering) {
        document
          .querySelectorAll<HTMLSpanElement>(
            'span:not(.data-html2canvas-ignore)'
          )
          .forEach((el) => (el.style.width = ''));
        document.querySelectorAll('.reportWrapper').forEach((e) => e.remove());
        document
          .querySelectorAll('.reportInjectedStyles')
          .forEach((e) => e.remove());
        document.body.style.paddingTop = '';
      }
    });
};
