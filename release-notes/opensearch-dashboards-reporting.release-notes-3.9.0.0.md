## Version 3.9.0 Release Notes

Compatible with OpenSearch and OpenSearch Dashboards version 3.9.0

### Features

* Integrate centralized resource-sharing share button for report definitions ([#792](https://github.com/opensearch-project/dashboards-reporting/pull/792))

### Bug Fixes

* Guard the Access column against a data-source staleness race during data-source switches ([#808](https://github.com/opensearch-project/dashboards-reporting/pull/808))

### Infrastructure

* Install a locked pre-16 Cypress in the FTR e2e workflow to fix `Cypress.env() was removed` failure ([#800](https://github.com/opensearch-project/dashboards-reporting/pull/800))
* Install the Cypress binary in the cypress-e2e workflow to unblock E2E checks ([#802](https://github.com/opensearch-project/dashboards-reporting/pull/802))

### Maintenance

* Clean up dependency resolutions and address CVEs in brace-expansion and dompurify ([#793](https://github.com/opensearch-project/dashboards-reporting/pull/793))
