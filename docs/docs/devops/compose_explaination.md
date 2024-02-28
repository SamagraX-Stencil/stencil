---
title: The Docker Compose
---
import DocsCard from '@components/global/DocsCard';
import DocsCards from '@components/global/DocsCards';

<head>
  <title>Stencil Devops</title>
</head>
<p>

The Docker Compose configuration sets up a Stencil DevOps environment with FusionAuth, PostgreSQL, API, and ELK stack components. Here's a breakdown of each service:

## Overview

This guide introduces you to the Docker Compose configuration for a Stencil DevOps environment. The setup includes services for FusionAuth, PostgreSQL, API, and the ELK stack. Let's understand each service:

### FusionAuth

FusionAuth is an identity management platform that simplifies authentication and authorization. In this setup, it's configured with PostgreSQL as its database.

```yaml
  fusionauth:
    image: fusionauth/fusionauth-app:latest
    depends_on:
      postgres:
        condition: service_healthy
    environment:
      DATABASE_URL: jdbc:postgresql://postgres:5432/fusionauth
      DATABASE_ROOT_USERNAME: ${POSTGRES_USER}
      DATABASE_ROOT_PASSWORD: ${POSTGRES_PASSWORD}
      DATABASE_USERNAME: ${DATABASE_USERNAME}
      DATABASE_PASSWORD: ${DATABASE_PASSWORD}
      FUSIONAUTH_APP_MEMORY: ${FUSIONAUTH_APP_MEMORY}
      FUSIONAUTH_APP_RUNTIME_MODE: ${FUSIONAUTH_APP_RUNTIME_MODE}
      FUSIONAUTH_APP_URL: http://fusionauth:9011
      FUSIONAUTH_APP_KICKSTART_FILE: /usr/local/fusionauth/kickstarts/kickstart.json
    env_file:
      - ./env-example
    volumes:
      - fa-config:/usr/local/fusionauth/config
      - ./kickstart:/usr/local/fusionauth/kickstarts
    networks:
      - default
    restart: unless-stopped
    ports:
      - 9011:9011
```

### PostgreSQL

PostgreSQL is a powerful open-source relational database. In this configuration, there are two instances: one for the primary application and another for shadowing.

```yaml
  postgres:
    image: postgres:15.3-alpine
    ports:
      - ${DATABASE_PORT}:5432
    volumes:
      - ./.data/db:/var/lib/postgresql/data
    environment:
      POSTGRES_USER: ${DATABASE_USERNAME}
      POSTGRES_PASSWORD: ${DATABASE_PASSWORD}
      POSTGRES_DB: ${DATABASE_NAME}
    healthcheck:
      test: ['CMD-SHELL', 'pg_isready -U postgres']
      interval: 5s
      timeout: 5s
      retries: 5
```

### API

The API service represents the main application. It is built from the provided Dockerfile and runs on a specified port.

```yaml
  api:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - ${APP_PORT}:${APP_PORT}
    logging:
      driver: syslog
      options:
        syslog-address: "tcp://host.docker.internal:50000"
        tag: "{{.ImageName}}/{{.Name}}/{{.ID}}"
    depends_on:
      - logstash
```

### ELK Stack

The ELK (Elasticsearch, Logstash, Kibana) stack is used for centralized log management. It includes Elasticsearch for data storage, Logstash for log processing, and Kibana for log visualization.

```yaml
  setup:
      profiles:
        - setup
      build:
        context: logging/setup/
        args:
          ELASTIC_VERSION: ${ELASTIC_VERSION}
      init: true
      volumes:
        - ./logging/setup/entrypoint.sh:/entrypoint.sh:ro,Z
        - ./logging/setup/lib.sh:/lib.sh:ro,Z
        - ./logging/setup/roles:/roles:ro,Z
      environment:
        ELASTIC_PASSWORD: ${ELASTIC_PASSWORD:-}
        LOGSTASH_INTERNAL_PASSWORD: ${LOGSTASH_INTERNAL_PASSWORD:-}
        KIBANA_SYSTEM_PASSWORD: ${KIBANA_SYSTEM_PASSWORD:-}
        METRICBEAT_INTERNAL_PASSWORD: ${METRICBEAT_INTERNAL_PASSWORD:-}
        FILEBEAT_INTERNAL_PASSWORD: ${FILEBEAT_INTERNAL_PASSWORD:-}
        HEARTBEAT_INTERNAL_PASSWORD: ${HEARTBEAT_INTERNAL_PASSWORD:-}
        MONITORING_INTERNAL_PASSWORD: ${MONITORING_INTERNAL_PASSWORD:-}
        BEATS_SYSTEM_PASSWORD: ${BEATS_SYSTEM_PASSWORD:-}
      networks:
        - elk
      depends_on:
        - elasticsearch

  elasticsearch:
    build:
      context: logging/elasticsearch/
      args:
        ELASTIC_VERSION: ${ELASTIC_VERSION}
    volumes:
      - ./logging/elasticsearch/config/elasticsearch.yml:/usr/share/elasticsearch/config/elasticsearch.yml:ro,Z
      - elasticsearch:/usr/share/elasticsearch/data:Z
    ports:
      - 9200:9200
      - 9300:9300
    environment:
      node.name: elasticsearch
      ES_JAVA_OPTS: -Xms512m -Xmx512m
      ELASTIC_PASSWORD: ${ELASTIC_PASSWORD:-}
      discovery.type: single-node
    networks:
      - elk
    restart: unless-stopped

  logstash:
    build:
      context: logging/logstash/
      args:
        ELASTIC_VERSION: ${ELASTIC_VERSION}
    volumes:
      - ./logging/logstash/config/logstash.yml:/usr/share/logstash/config/logstash.yml:ro,Z
      - ./logging/logstash/pipeline/logstash.conf:/usr/share/logstash/pipeline/logstash.conf:ro,Z
    ports:
      - 5044:5044
      - 50000:50000/tcp
      - 50000:50000/udp
      - 9600:9600
    environment:
      LS_JAVA_OPTS: -Xms256m -Xmx256m
      LOGSTASH_INTERNAL_PASSWORD: ${LOGSTASH_INTERNAL_PASSWORD:-}
    networks:
      - elk
    depends_on:
      - elasticsearch
    restart: unless-stopped

  kibana:
    build:
      context: logging/kibana/
      args:
        ELASTIC_VERSION: ${ELASTIC_VERSION}
    volumes:
      - ./logging/kibana/config/kibana.yml:/usr/share/kibana/config/kibana.yml:ro,Z
    ports:
      - 5601:5601
    environment:
      KIBANA_SYSTEM_PASSWORD: ${KIBANA_SYSTEM_PASSWORD:-}
    networks:
      - elk
    depends_on:
      - elasticsearch
    restart: unless-stopped

  logstash-axiom:
    image: opensearchproject/logstash-oss-with-opensearch-output-plugin:7.16.2
    ports:
      - "12201:12201/udp"
    volumes:
      - ./logging/logstash/pipeline/axiom.conf:/usr/share/logstash/pipeline/logstash.conf
    command: logstash -f /usr/share/logstash/pipeline/
```

## Usage

1. Copy the provided `env-example` file and customize it with your environment variables.
2. Run `docker-compose up setup` to make the roles for ELK stack.
3. Run `docker-compose up -d` to start the entire Stencil DevOps stack.

## Where to send the logs?

In order to monitor logs with Kibana, we need to send the logs to Logstash. In order to do that, just add the below logging config to the service whose logs you want to include in the monitoring:

```yaml
    logging:
      driver: syslog
      options:
        syslog-address: "tcp://host.docker.internal:50000"
        tag: "{{.ImageName}}/{{.Name}}/{{.ID}}"
```

</p>