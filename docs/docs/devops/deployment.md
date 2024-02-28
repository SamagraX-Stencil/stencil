---
title: Deployment Script
---
import DocsCard from '@components/global/DocsCard';
import DocsCards from '@components/global/DocsCards';

<head>
  <title>Stencil Devops</title>
</head>
<p>

## Prerequisites

Before using this deployment script, ensure the following prerequisites are met:

- Docker is installed on the target machine.
- Git is installed on the target machine (for remote deployments).
- The necessary dependencies specified in the project's Docker Compose file are available.

## Local Deployment

### Steps:

1. **Environment Configuration:**
   - The script copies the `env-example` file to a `.env` file, which serves as the configuration for the local environment.

2. **Docker Compose:**
   - The script executes the command `docker compose up -d` to start the Docker containers in detached mode.

3. **Completion:**
   - The script prints a message indicating the completion of the local deployment.

## Remote Deployment

### Steps:

1. **SSH Configuration:**
   - The script prompts the user for the following remote server details:
     - IP or domain of the remote host.
     - SSH port (default is 22).
     - SSH username.
     - Path to the private key file.

2. **Private Key Password:**
   - If the private key is password-protected, the script prompts the user for the password.

3. **SSH Connection:**
   - The script establishes an SSH connection to the remote server using the provided details.

4. **Git Repository Check:**
   - It checks if the Git repository already exists on the remote server. If not, it clones the repository from [https://github.com/ChakshuGautam/stencil](https://github.com/ChakshuGautam/stencil) and copies the `env-example` file to `.env`.

5. **Docker Compose:**
   - The script executes the command `docker compose up -d` on the remote server to start the Docker containers in detached mode.

6. **Completion:**
   - The script prints a message indicating the completion of the remote deployment.

## Usage

1. Run the script by executing the Python file containing the deployment script.

```bash
python deployment_script.py
```

2. Choose the deployment option:

1. Enter `1` for local deployment (development).
2. Enter `2` for remote deployment on a server.

3. Follow the prompts to provide the necessary information.

4. After the deployment is complete, the script prints a message indicating the successful deployment.

**Note:** 
- Ensure that the necessary permissions are granted for SSH access and Docker commands on the remote server.
- This documentation assumes that the user has a basic understanding of Docker, Git, and SSH concepts.


</p>
