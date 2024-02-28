---
title: ELK Setup
---
import DocsCard from '@components/global/DocsCard';
import DocsCards from '@components/global/DocsCards';

<head>
  <title>Stencil Features</title>
</head>
<p>

# ELK Setup with Stencil

Stencil comes with an out-of-the-box ELK (Elasticsearch, Logstash, and Kibana) setup, facilitating efficient log management and analysis for your services. The ELK stack is a robust solution for centralized logging, and Stencil streamlines the setup process.

## Prerequisites

Before setting up ELK with Stencil, ensure you have Docker and Docker Compose installed on your system.

## Setup Process

Stencil's ELK setup involves the following Docker Compose services:

- **setup**: Creates necessary roles and configurations for ELK containers.
- **elasticsearch**: Elasticsearch service for storing log data.
- **logstash**: Logstash service for processing and forwarding logs.
- **kibana**: Kibana service for visualizing and querying log data.
- **logstash-axiom**: Logstash service specifically configured for Axiom, Stencil's internal logging service.

### Steps:

1. **Run Setup Container**

   ```bash
   docker-compose up setup
   ```
2. **Bring up the ELK stack**

   ```bash
   docker-compose up -d
   ```

   This command brings up the entire ELK stack, including Elasticsearch, Logstash, Kibana, and the Axiom-specific Logstash container.

3. **Configure Additional Containers**

   When adding a new container, include the following logging configuration in the Docker Compose file to ensure that logs are sent to Logstash:

   ```bash
      services:
   your_service:
      # Your service configuration here

      logging:
         driver: syslog
         options:
         syslog-address: "tcp://host.docker.internal:50000"
         tag: "{{.ImageName}}/{{.Name}}/{{.ID}}"
   ```
# Container Details

## Elasticsearch (`elasticsearch`):

- **Port:** 9200 (HTTP), 9300 (Transport)
- **Configuration:** Elasticsearch configuration is provided through `./logging/elasticsearch/config/elasticsearch.yml`.

## Logstash (`logstash`):

- **Ports:** 5044 (Beats input), 50000 (TCP input), 50000 (UDP input), 9600 (Logstash monitoring)
- **Configuration:** Logstash configuration is provided through `./logging/logstash/config/logstash.yml`.
- **Pipeline Configuration:** Logstash pipeline configuration is specified in `./logging/logstash/pipeline/logstash.conf`.

## Kibana (`kibana`):

- **Port:** 5601 (Kibana UI)
- **Configuration:** Kibana configuration is provided through `./logging/kibana/config/kibana.yml`.

## Logstash-Axiom (`logstash-axiom`):

- **Port:** 12201 (UDP)
- **Configuration:** Logstash configuration specifically tailored for Axiom is provided in `./logging/logstash/pipeline/axiom.conf`.

# Usage Tips:

- **Check Container Logs:**
  - View the logs of individual containers using `docker-compose logs [container_name]`.

- **Access Kibana UI:**
  - Access Kibana's web interface by navigating to [http://localhost:5601](http://localhost:5601) in your web browser.

- **Integrate Axiom:**
  - The `logstash-axiom` container is configured for Axiom. Integrate Stencil's internal logging service, Axiom, by sending logs to the configured UDP port (12201).

With this setup, Stencil provides a seamless integration of the ELK stack, offering a powerful solution for log management and analysis across your services. Ensure to include the logging configuration when adding new containers to maintain centralized log management.

</p>
