<img src="https://opensearch.org/assets/img/opensearch-logo-themed.svg" height="64px">

- [OpenSearch Dashboards Reports](#opensearch-dashboards-reports)
- [Code Summary](#code-summary)
- [Documentation](#documentation)
- [Contributing](#contributing)
- [Setup](#setup-&-build)
- [Notifications Integration](#notifications-integration)
- [Code of Conduct](#code-of-conduct)
- [Security](#security)
- [License](#license)
- [Copyright](#copyright)

# OpenSearch Dashboards Reports

OpenSearch Dashboards Reports allows ‘Report Owner’ (engineers, including but not limited to developers, DevOps, IT Engineer, and IT admin) export and share reports from OpenSearch Dashboards dashboards, saved search, alerts and visualizations. It helps automate the process of scheduling reports on an on-demand or a periodical basis (on cron schedules as well). Further, it also automates the process of exporting and sharing reports triggered for various alerts. The feature is present in the Dashboard, Discover, and Visualization tabs. We are currently working on integrating Dashboards Reports with Notifications to enable sharing functionality. After the support is introduced, scheduled reports can be sent to (shared with) self or various stakeholders within the organization. These stakeholders include but are not limited to, executives, managers, engineers (developers, DevOps, IT Engineer) in the form of pdf, hyperlinks, csv, excel via various channels such as email, Slack, and Amazon Chime. However, in order to export, schedule and share reports, report owners should have the necessary permissions as defined under Roles and Privileges.

## Contributing

We welcome you to get involved in development, documentation, testing the OpenSearch Dashboards reports plugin. See our [CONTRIBUTING.md](./CONTRIBUTING.md) and join in.

## Setup & Build

Complete OpenSearch Dashboards Report feature is composed of 2 plugins.

- [OpenSearch Dashboards reports plugin](./dashboards-reports/README.md)
- OpenSearch Reports scheduler plugin

## Notifications Integration

OpenSearch Dashboards Reports integration with [Notifications](https://github.com/opensearch-project/notifications) is currently in progress. Tracking [here](https://github.com/opensearch-project/dashboards-reports/issues/72)

## Code of Conduct

This project has adopted the [Amazon Open Source Code of Conduct](../CODE_OF_CONDUCT.md). For more information see the [Code of Conduct FAQ](https://aws.github.io/code-of-conduct-faq), or contact [opensource-codeofconduct@amazon.com](mailto:opensource-codeofconduct@amazon.com) with any additional questions or comments.

## Security

If you discover a potential security issue in this project we ask that you notify AWS/Amazon Security via our [vulnerability reporting page](http://aws.amazon.com/security/vulnerability-reporting/). Please do **not** create a public GitHub issue.

## License

See the [LICENSE](../LICENSE) file for our project's licensing. We will ask you to confirm the licensing of your contribution.

## Copyright

Copyright 2020-2021 Amazon.com, Inc. or its affiliates. All Rights Reserved.
