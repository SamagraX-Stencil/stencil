---
title: Containerized Development
---
import DocsCard from '@components/global/DocsCard';
import DocsCards from '@components/global/DocsCards';

<head>
  <title>Stencil Devops</title>
</head>
<p>

## Developing Inside a Container with Devcontainer

## Overview

Container-based development takes a step further with the concept of a development container (devcontainer). A devcontainer encapsulates the development environment, tools, and dependencies necessary for a project. This approach ensures a consistent and reproducible environment across different developers and systems.

## Devcontainer Configuration

In your project, the `devcontainer.json` file defines the configuration for your development container. Below is a breakdown of the configuration in your `devcontainer.json` file:

```json
{
  "build": { "dockerfile": "../Dockerfile.devcontainer" },

  "customizations": {
    "vscode": {
      "extensions": ["dbaeumer.vscode-eslint"]
    }
  },
  "forwardPorts": [3000]
}
```

# Devcontainer Build Configuration

## Build Path (`"build"`):

The `"build"` section specifies the Dockerfile to use for building the development container. In this case, it points to `"../Dockerfile.devcontainer"`, indicating that the Dockerfile for the development container is located in the parent directory.

## VSCode Customizations

### VSCode Extensions (`"customizations"`):

The `"customizations"` section is used to customize the Visual Studio Code (VSCode) environment within the devcontainer. In this example, it installs the "dbaeumer.vscode-eslint" extension, which is an extension for ESLint integration in VSCode.

## Port Forwarding

### Forwarded Ports (`"forwardPorts"`):

The `"forwardPorts"` array specifies the ports to forward from the development container to the host machine. In this case, port `3000` is forwarded, allowing you to access services running on this port within the development container.

## Developing Inside the Devcontainer

1. **Install Visual Studio Code:**

   - Ensure that Visual Studio Code is installed on your local machine.

2. **Open the Project in VSCode:**

   - Open the project folder in VSCode.

3. **Install VSCode Remote - Containers Extension:**

   - Install the "Remote - Containers" extension in VSCode.

4. **Open the Devcontainer:**

   - Click on the green icon in the bottom-left corner of VSCode (or use the "Remote Explorer" pane) to open the devcontainer.

5. **Develop Inside the Devcontainer:**

   - Once the devcontainer is open, you can develop directly inside it. All tools, dependencies, and extensions specified in the `devcontainer.json` file are available within this environment.

## Benefits of Devcontainers

- **Consistency:**
  - Ensures a consistent development environment across different machines.

- **Isolation:**
  - Isolates project dependencies within the container, avoiding conflicts with the host system.

- **Reproducibility:**
  - Allows for easy reproduction of the development environment by sharing the `devcontainer.json` file.

- **Collaboration:**
  - Simplifies collaboration by providing a standardized environment for all developers.

By using a devcontainer, you can enhance the development experience, making it easier to manage dependencies, maintain consistency, and collaborate effectively on your project.

</p>
