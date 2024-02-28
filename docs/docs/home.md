---
title: Stencil
sidebar_label: Overview
slug: /
hide_table_of_contents: true
---
import DocsCard from '@components/global/DocsCard';
import DocsCards from '@components/global/DocsCards';

<head>
  <title>Stencil Docs</title>
</head>
<p>

Welcome to the Stencil Microservice Boilerplate Documentation!

Stencil is a versatile microservice boilerplate designed for use with SamagraX. It streamlines the development process by providing a foundation with essential features, allowing you to focus on building your microservices efficiently.

## Key Features

Stencil comes with a set of key features to empower your microservice development:

- **Database Integration:** Utilize Prisma for seamless database interactions.
- **User-Service Integration:** Incorporate user services via the npm package ([User Service](https://github.com/techsavvyash/user-service)).
- **Config Service:** Leverage the power of @nestjs/config for configuration management.
- **Mailing Capabilities:** Integrate nodemailer for efficient mailing functionality.
- **Authentication:** Enable sign-in and sign-up via email, along with social sign-in options (Apple, Facebook, Google, Twitter).
- **Role Management:** Implement admin and user roles to control access.
- **Localization Support:** Benefit from I18N support through nestjs-i18n.
- **File Uploads:** Support local and Amazon S3 drivers for file uploads.
- **Documentation and Testing:** Stencil is equipped with Swagger for API documentation and supports both E2E and unit tests.

## Getting Started

To quickly get started with Stencil, follow these simple steps:

1. Clone the Stencil repository:

    ```bash
    git clone --depth 1 https://github.com/ChakshuGautam/stencil.git my-app
    ```

2. Navigate to the project directory:

    ```bash
    cd my-app/
    ```

3. Copy the example environment file:

    ```bash
    cp env-example .env
    ```

4. Set up the environment:

    ```bash
    docker compose up setup
    docker compose up -d
    ```

5. Check the status of containers:

    ```bash
    docker compose logs
    ```

For detailed information on features, development setup, and testing procedures, refer to the comprehensive documentation.

Explore Stencil and enjoy a simplified microservice development experience!

**Looking for logging documentation? Check out the [Logging Section](/logging/overview).**
</p>
