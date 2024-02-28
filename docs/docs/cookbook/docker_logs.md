---
title: Sending Docker Logs to Axiom
---
import DocsCard from '@components/global/DocsCard';
import DocsCards from '@components/global/DocsCards';

<head>
  <title>Sending Docker logs to Axiom</title>
</head>
<p>

To set up sending Docker logs to Axiom using the provided Docker Compose file, daemon.json, and logstash.config, follow these step-by-step instructions.

### Note: 
It is recommended to utilize Docker Compose version 1.29 or higher due to a change in logging behavior. In earlier versions of Docker Compose, logs were exclusively sent to syslog and not to stdout. However, this limitation has been addressed in Docker Compose 1.29 and onwards, allowing logs to be appropriately directed to stdout.

Step 1: Create a directory for your project and navigate into it:

```
mkdir docker-logs-to-axiom
cd docker-logs-to-axiom
```

Step 2: Create a file named docker-compose.yml and open it for editing:

```
nano docker-compose.yml
```

Step 3: Copy and paste the following content into the docker-compose.yml file:

```
version: '3'
services:
  logstash:
    image: opensearchproject/logstash-oss-with-opensearch-output-plugin:7.16.2
    ports:
      - "12201:12201/udp"
    volumes:
      - ./pipeline:/usr/share/logstash/pipeline
    command: logstash -f /usr/share/logstash/pipeline/
    restart:always

  plop:
    image: alpine
    command: /bin/sh -c "while true; do echo My Message; sleep 1; done;"
```

Let's break down the Docker Compose configuration step by step for a beginner:

- `version: '3'`: This line specifies the version of the Docker Compose file format being used. In this case, it's version 3.

- `services`: This section defines the individual services or containers that make up your application.

- `logstash`: This is the first service defined. It is using an existing Docker image called opensearchproject/logstash-oss-with-opensearch-output-plugin:7.16.2. This image contains Logstash, a popular open-source log processing and shipping tool.

- `ports: "12201:12201/udp"`: This line maps the container's UDP port 12201 to the host's UDP port 12201. It allows external systems to send log messages to Logstash.

- `volumes: -./pipeline:/usr/share/logstash/pipeline`: This line mounts the ./pipeline directory from the host machine into the container at the path /usr/share/logstash/pipeline. It enables you to provide Logstash configuration files.

- `command`: logstash -f /usr/share/logstash/pipeline/: This command is executed when the container starts. It runs Logstash and specifies the Logstash configuration file to be used (/usr/share/logstash/pipeline/).

- `plop`: This is the second service defined. It uses the Alpine Linux base image, which is a lightweight distribution commonly used in Docker containers. Its inclusion in this tutorial serves the purpose of generating sample logs, although it is entirely optional in practice.

- `command: /bin/sh -c "while true; do echo My Message; sleep 1; done;"`: This command is executed when the container starts. It runs an infinite loop that prints the message "My Message" every second.

Step 4: Save and close the docker-compose.yml file (Ctrl + X, Y, Enter).

Step 5: Create a directory named pipeline:

```
mkdir pipeline
```

Step 6: Create a file named logstash.config inside the pipeline directory and open it for editing:

```
nano pipeline/logstash.config
```

Step 7: Copy and paste the following content into the logstash.config file:

```
input {
  udp {
    port => 12201
    codec => "plain"
  }
}

output {
  opensearch {
    hosts => "https://cloud.axiom.co:443/api/v1/datasets/$DATASET_NAME/elastic"
    user => "Username"
    password => "auth-token"
  }
}
```

Let's break down the Logstash configuration file provided:

- `input`: This section defines the input plugin(s) for Logstash, specifying how it should receive data.

- `udp`: This input plugin is used to receive data via the UDP protocol. It listens on a specific port and expects data to be sent in UDP packets.

- `port: 12201`: This line specifies the UDP port number (12201) that Logstash should listen on to receive incoming log data.

- `codec: "plain"`: This line specifies the codec for parsing the incoming log data. In this case, it's set to "plain", indicating that the log data is expected to be in plain text format.

This input configuration tells Logstash to listen for log data arriving via UDP on port 12201, with the expectation that the logs will be in plain text format.Now let's move on to the output configuration:

- `output`: This section defines the output plugin(s) for Logstash, specifying where the processed log data should be sent.

- `opensearch`: This output plugin is used to send the processed log data to an OpenSearch (formerly known as Elasticsearch) cluster.

- `hosts`: "https://cloud.axiom.co:443/api/v1/datasets/$DATASET_NAME/elastic": This line specifies the URL or addresses of the OpenSearch cluster where the log data should be sent. In this example, the logs are being sent to "https://cloud.axiom.co:443/api/v1/datasets/$DATASET_NAME/elastic".

- `user: "Username" and password => "auth-token"`: These lines specify the username and password credentials to authenticate with the OpenSearch cluster. In this case, the username is "Username" and the password is "auth-token".

Step 8: Save and close the logstash.config file (Ctrl + X, Y, Enter).

Step 9: Start the Docker containers using Docker Compose:

```
docker-compose up -d
```

At this point, your setup should be complete. The Docker logs from the plop service will be sent to Logstash running in the logstash service, and then forwarded to Axiom using the provided configuration.

Make sure you have the necessary credentials (Axiom username and password) and adjust the Axiom endpoint (hosts value) and dataset path accordingly in the logstash.config file.

You can monitor the logs by accessing Axiom or by checking the Logstash container logs using the command:

```
docker-compose logs -f logstash
```

Step 10: Create a file named daemon.json at `/etc/docker` and open it for editing:

```
sudo nano /etc/docker/daemon.json
```

Step 11: Copy and paste the following content into the daemon.json file:
```
{
  "log-driver": "syslog",
  "log-opts": {
    "syslog-address": "udp://localhost:12201",
    "tag": "{{.ImageName}}/{{.Name}}/{{.ID}}"
  }
}
```

Let's break down the daemon.json configuration for a beginner:

- `log-driver: "syslog"`: This line specifies the logging driver that Docker should use to handle container logs. In this case, it's set to syslog, which means Docker will send logs to a syslog server for processing.

- `log-opts: { ... }`: This section allows you to specify additional options for the syslog logging driver.

- `syslog-address: "udp://localhost:12201"`: This line defines the address where the syslog server is located. In this example, it is set to localhost:12201, indicating that the syslog server is running on the local machine and listening on UDP port 514.

- `{{.ImageName}}/{{.Name}}/{{.ID}}"`: The tag option allows you to specify a tag or identifier for the logs. In this case, the tag is set to "{{.ImageName}}/{{.Name}}/{{.ID}}", which sends the image name, container name and container ID to logstash. It helps in easy sorting and management of logs.

Step 12: Save and close the daemon.json file (Ctrl + X, Y, Enter).

Step 13: Restart the docker daemon in order for the changes in `daemon.json` to take effect.

```
sudo systemctl restart docker
```

That's it! Your Docker logs should now be sent to Axiom for further analysis and monitoring.

### Note

- After restarting Docker, it is important to recreate the containers using the --force-recreate option when running docker-compose up. This ensures that any changes or updates take effect properly.

- For optimal utilization of Axiom's free tier, it is advisable to create a new email address that can be shared among multiple users. This approach ensures efficient management and coordination within the free tier of Axiom's services.

- Additional Refrences: https://axiom.co/blog/monitor-logstash-pipeline-with-axiom

</p>
