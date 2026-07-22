## Version 3.8.0 Release Notes

Compatible with OpenSearch and OpenSearch Dashboards version 3.8.0

### Enhancements

* Onboard new backport-pr reusable GitHub workflow for dashboards-reporting ([#773](https://github.com/opensearch-project/dashboards-reporting/pull/773))

### Bug Fixes

* Fix XLSX report download blocked by CSP connect-src directive by replacing fetch() with direct base64 decoding ([#762](https://github.com/opensearch-project/dashboards-reporting/pull/762))
* Replace showdown with marked to resolve ReDoS vulnerability CVE-2024-1899 ([#777](https://github.com/opensearch-project/dashboards-reporting/pull/777))
* Upgrade json-2-csv to ^5.5.11 to resolve CSV injection vulnerability CVE-2026-9673 ([#780](https://github.com/opensearch-project/dashboards-reporting/pull/780))

### Infrastructure

* Pin GitHub Actions to commit SHAs to prevent supply chain attacks ([#752](https://github.com/opensearch-project/dashboards-reporting/pull/752))
* Adopt ESLint 10 flat config format, replacing legacy .eslintrc.js and .eslintignore ([#784](https://github.com/opensearch-project/dashboards-reporting/pull/784))
* Migrate Jest test suite to Jest 30 and jsdom 26 ([#787](https://github.com/opensearch-project/dashboards-reporting/pull/787))
