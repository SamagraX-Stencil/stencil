<h1 align="center">Stencil</h1>
<h4 align="center">Microservice boilerplate for SamagraX</h4>

<div align="center">

[![Open in Gitpod](https://gitpod.io/button/open-in-gitpod.svg)](https://gitpod.io/#https://github.com/ChakshuGautam/stencil/tree/gitpod)

</div>

![github action status](https://github.com/brocoders/nestjs-boilerplate/actions/workflows/docker-e2e.yml/badge.svg)

## Description

Microservice boilerplate for SamagraX

[Full documentation here](https://github.com/brocoders/nestjs-boilerplate/blob/main/docs/readme.md)

## Table of Contents

- [Features](#features)
- [Quick run](#quick-run)
- [Comfortable development](#comfortable-development)
- [Links](#links)
- [Automatic update of dependencies](#automatic-update-of-dependencies)
- [Database utils](#database-utils)
- [Tests](#tests)

## Features

- [x] Database ([Prisma](https://www.prisma.io/)).
- [x] User-Service integration using npm package. (https://github.com/techsavvyash/user-service).
- [ ] Seeding.
- [x] Config Service ([@nestjs/config](https://www.npmjs.com/package/@nestjs/config)).
- [x] Mailing ([nodemailer](https://www.npmjs.com/package/nodemailer)).
- [x] Sign in and sign up via email.
- [x] Social sign in (Apple, Facebook, Google, Twitter).
- [x] Admin and User roles.
- [x] I18N ([nestjs-i18n](https://www.npmjs.com/package/nestjs-i18n)).
- [x] File uploads. Support local and Amazon S3 drivers.
- [x] Swagger.
- [x] E2E and units tests.
- [x] Docker.
- [x] CI (Github Actions).

## Quick run

```bash
git clone https://github.com/SamagraX-Stencil/stencil.git stencil
cd stencil/sample//01-all-features
cp env/env-example .env
docker compose -f docker-compose/docker-compose.yaml up -d
```

For check status run

```bash
docker compose logs
```

## Comfortable development

```bash
git clone --depth 1 https://github.com/brocoders/nestjs-boilerplate.git my-app
cd my-app/
cp env-example .env
```

Change `DATABASE_HOST=postgres` to `DATABASE_HOST=localhost`

Change `MAIL_HOST=maildev` to `MAIL_HOST=localhost`

Run additional container:

```bash
docker compose up -d postgres adminer maildev
```

```bash
npm install

npm run migration:run

npm run seed:run

npm run start:dev
```

# Dockerized Development with Visual Studio Code

Streamline your development process by running your project inside a Docker container. Follow these steps to get started:

1. **Open the Project in Visual Studio Code**
   - Launch Visual Studio Code and open your project.

2. **Open the Project in a Docker Container**
   - To work within a Docker container, press `Control+P` to bring up the command palette.
   - Type in `> Reopen in container` and select it. This will open your project inside a Docker container.

## Troubleshooting

If you encounter the following error upon starting the project:

```shell
node:internal/modules/cjs/loader:1080
  throw err;
  ^

Error: Cannot find module '/root/.vscode-server/data/User/workspaceStorage/b2d44a48cb3eb862caab3a51d86d99df/ms-vscode.js-debug/bootloader.js'
Require stack:
- internal/preload
```

You can resolve it by following these steps:

1. **Disable Auto Attach in VS Code**
   - Open the command palette in Visual Studio Code.
   - Type > Toggle Auto Attach and set it to "Disabled."

2. **Re-enable Auto Attach**
   - Open the command palette again.
   - Type > Toggle Auto Attach and set it to "Always" or "Smart".

## Links

- Swagger: http://localhost:3000/docs
- Adminer (client for DB): http://localhost:8080
- Maildev: http://localhost:1080

## Automatic update of dependencies

If you want to automatically update dependencies, you can connect [Renovate](https://github.com/marketplace/renovate) for your project.

## Database utils

Generate migration

```bash
npm run migration:generate -- src/database/migrations/CreateNameTable
```

Run migration

```bash
npm run migration:run
```

Revert migration

```bash
npm run migration:revert
```

Drop all tables in database

```bash
npm run schema:drop
```

Run seed

```bash
npm run seed:run
```

## Tests

```bash
# unit tests
npm run test

# e2e tests
npm run test:e2e
```

## Tests in Docker

```bash
docker compose -f docker-compose.ci.yaml --env-file env-example -p ci up --build --exit-code-from api && docker compose -p ci rm -svf
```

## Test benchmarking

```bash
docker run --rm jordi/ab -n 100 -c 100 -T application/json -H "Authorization: Bearer USER_TOKEN" -v 2 http://<server_ip>:3000/api/v1/users
```
