# Wazuh development with Wazuh Stack

## Requirements

- vm.max_map_count=262144

  To modify the vm.max_map_count, you can run this command:
  `sudo sysctl -w vm.max_map_count=262144`

- jq

  To install jq, you can run this command:

  - In Debian/Ubuntu os:
    `sudo apt-get install jq`
  - In RedHat/CentOS:
    `sudo yum install jq`
  - In Arch:
    `sudo pacman -Sy --noconfirm jq`
  - In MAC:
    `brew install jq`

- Wazuh Indexer Reporting Plugin

  You need to have the Wazuh Indexer reporting plugin package in a `wazuh-indexer` folder. This plugin is required for the reporting functionality to work properly with the Wazuh Indexer.

## Usage

Use always the provided script to bring up or down the development
environment. For example:

```bash
./dev.sh [-o 1.2.4] [-d 1.2.0] $WZ_HOME up [saml]
```

The script will ask you all the required parameters to bring up the
environment, including the version of the elastic stack you want to
develop for, and the source code folder where the wazuh-dashboard-plugins is
located.

Use the `saml` flag to bring up KeyCloak IDP. **Add idp to your hosts and start
the server using the `--no-base-path`**.

```apacheconf
# Linux systems: /etc/hosts
# Windows systems: C:\Windows\System32\drivers\etc\hosts
127.0.0.1 idp
```

**The script will not select the appropriate version of the
wazuh-dashboard-plugins to use, so be sure to check out the appropriate version
before bringing up the environment!**

### UI Credentials

The default user and password to access the UI at https://0.0.0.0:5601/ are:

```
admin:admin
```

## Notes

`Wazuh Indexer` and `Wazuh Dashboard` are both a redistribution of a
version of the OpenSearch Stack. We will only create environments for
the versions of OpenSearch which will be included into a Wazuh
version.

We must use official `Wazuh Indexer` and `Wazuh Dashboard` images for
testing!

This environment will start a working deployment with:

- Imposter - a mock server.
- Elasticsearch-exporter - Elasticsearch metrics to Prometheus adapter.
- OpenSearch single-node cluster.
- OpenSearch Dashboards development environment.
- Mailpit - SMTP server for testing email notifications.

The OpenSearch Dashboards development environment includes an already
bootstrapped Kibana, with all the node modules precompiled and ready to
use in a development session.

## Email Notifications Configuration

### Mailpit Setup

The development environment includes **Mailpit**, a development SMTP server that captures and displays emails sent from the application without actually sending them.

#### Configuring the Notifications Sender

To configure the notifications sender to use Mailpit:

1. **Access notification settings** in Wazuh Dashboard:
   - Go to the `Notifications` section

2. **Configure the sender with these settings**:
   ```
   SMTP Host: mailpit
   SMTP Port: 1025
   Security: None (No SSL/TLS)
   From Email: noreply@wazuh.local
   ```

  **Note**: The recipient email address doesn't matter when using Mailpit. All emails will be captured and displayed in the Mailpit interface regardless of the recipient address, and no actual emails will be delivered to real email accounts.

3. **Access Mailpit web interface**:
   - URL: http://localhost:8025
   - Here you can view all captured emails during development

#### Testing the Configuration

To verify that notifications are working correctly:

1. Set up a notification rule in Wazuh Dashboard
2. Generate an event that triggers the notification
3. Check that the email appears in the Mailpit interface (http://localhost:8025)

**Note**: Mailpit is only available in the development environment and should not be used in production.

