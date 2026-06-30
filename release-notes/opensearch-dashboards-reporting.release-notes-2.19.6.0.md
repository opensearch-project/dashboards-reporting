## Version 2.19.6 Release Notes

Compatible with OpenSearch and OpenSearch Dashboards version 2.19.6

### Bug Fixes

* Resolve critical, high, and moderate CVEs by upgrading jspdf, updating dependency resolutions, and pinning GitHub Actions to commit SHAs ([#770](https://github.com/opensearch-project/dashboards-reporting/pull/770))
* Replace showdown with marked to resolve CVE-2024-1899 ReDoS vulnerability in markdown-to-HTML conversion ([#776](https://github.com/opensearch-project/dashboards-reporting/pull/776))
* Restore uuid package and revert crypto.randomUUID changes to fix webpack compatibility issues in non-secure HTTP contexts ([#775](https://github.com/opensearch-project/dashboards-reporting/pull/775))

### Maintenance

* Bump lodash from 4.17.21 to 4.17.23 ([#672](https://github.com/opensearch-project/dashboards-reporting/pull/672))
