#!/bin/bash

# Check if the plugin exists before removing it
if /usr/share/opensearch/bin/opensearch-plugin list | grep -q opensearch-reports-scheduler; then
    echo "Removing opensearch-reports-scheduler plugin..."
    /usr/share/opensearch/bin/opensearch-plugin remove opensearch-reports-scheduler --purge
else
    echo "opensearch-reports-scheduler plugin is not installed"
fi


if /usr/share/opensearch/bin/opensearch-plugin list | grep -q wazuh-indexer-reports-scheduler; then
    echo "Plugin wazuh-indexer-reports-scheduler is already installed"
else
    echo "Installing plugin wazuh-indexer-reports-scheduler..."
    # Check if the plugin file exists before installing it
    PLUGIN_FILE=$(ls /tmp/wazuh-indexer | grep "wazuh-indexer-reports-scheduler-.*\.zip" | head -1)
    if [ -n "$PLUGIN_FILE" ] && [ -f "/tmp/wazuh-indexer/$PLUGIN_FILE" ]; then
        echo "Installing plugin: $PLUGIN_FILE"
        /usr/share/opensearch/bin/opensearch-plugin install -b "file:///tmp/wazuh-indexer/$PLUGIN_FILE"
    else
        echo "Error: Plugin file not found"
        exit 1
    fi
fi


echo "Starting OpenSearch..."
/usr/share/opensearch/opensearch-docker-entrypoint.sh opensearch