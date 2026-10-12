/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

module.exports = function extractZip(zipPath, opts) {
  var dir = opts && opts.dir;
  return import('@electron-internal/extract-zip').then(function (mod) {
    return mod.extract(zipPath, { dir: dir });
  });
};
