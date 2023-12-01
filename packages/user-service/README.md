[![Docker](https://github.com/Samagra-Development/esamwad-user-service/actions/workflows/docker.yml/badge.svg)](https://github.com/Samagra-Development/esamwad-user-service/actions/workflows/docker.yml)
[![Node.js CI](https://github.com/Samagra-Development/esamwad-user-service/actions/workflows/ci.yml/badge.svg?branch=master)](https://github.com/Samagra-Development/esamwad-user-service/actions/workflows/ci.yml)
[![Coverage Status](https://coveralls.io/repos/github/Samagra-Development/esamwad-user-service/badge.svg?branch=master)](https://coveralls.io/github/Samagra-Development/esamwad-user-service?branch=master)
[![Code Smells](https://sonarcloud.io/api/project_badges/measure?project=Samagra-Development_esamwad-user-service&metric=code_smells)](https://sonarcloud.io/dashboard?id=Samagra-Development_esamwad-user-service)

[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)

# User Service

An OIDC compliant extensible user authentication and authorization service that includes key features such as passwordless authentication and attribute based access control (ABAC). It is written in [Nest JS](https://github.com/nestjs/nest) & using Fusion Auth as the underlying service for all User Management related tasks.

## Features

- CRUD support for respective Fusion Auth Applications
- Authentication(Username/Password combo) for Fusion Auth Users
- Passwordless (OTP based) authentication
- RBAC support for the applications (Android, React Admin, etc.)
- CRUD supporting creation/updation of records on 3rd party Hasura using Generic Config

## Development

#### Installation

```bash
$ yarn install
```

_Note_: This project is built on VSCode and would be developed only with this IDE in mind. The [.vscode directory](./.vscode) will be kept updated with all the VSCode magic 🧙‍♂️.

#### Running the app

```bash
# development
$ yarn start

# watch mode
$ yarn start:dev

# debug mode
$ yarn start:debug

# production mode
$ yarn start:prod
```

## Deployment

You can use docker image directly for production environment setup. A sample `docker-compose.yml` file should look like:

```
version: "3"

services:
  user-service:
    image: samagragovernance/esamwad-user-service:latest
    env_file:
      - ./.env
    ports:
      - "3000:3000"
    restart: always
```

## Test

```bash
# unit tests
$ yarn test

# e2e tests
$ yarn test:e2e

# test coverage
$ yarn test:cov

# test a single file
$ yarn run test:watch ./src/user/sms/gupshup/gupshup.service.spec.ts
```

## Add a sample service (Generic Config)

```bash
# open .env file
$ vi .env

# add your service info in below format
APP_application_id={"host": "dummy.com", "apiKey": "zse12344@#%ddsr", "encryption": {"enabled": true, "key": "veryhardkey"}, "hasura": {"graphql_url": "https://example.com/graphql", "admin_secret": "xxxx", "mutations": {"some_mutation_key": "mutation query..."}}}
# where apiKey, encryption.key and hasura is not mandatory
# Precedence will be given apiKey sent in Authorization header (Check swagger collection below for references)
# encryption.enabled provides option to encrypt username/password with the provided enrption.key before sending to the FA server.

# restart docker-compose
$ docker-compose down
$ docker-compose up -d --build
```

Note: In variable `APP_application_id`, **"APP\_"** is the prefix and **"application_id"** is the UUID of Fusion Auth application with hyphen("-") replaced with underscore("\_"). E.g. if application id is: `0000-0000-0000-0000` then the variable name must be: `APP_0000_0000_0000_0000`

### JSON config

| Variable              | Description                                                                                                                                                            |
| --------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `host`                | Fusion Auth Host. e.g. http://localhost:9011 or http://example.com                                                                                                     |
| `apiKey`              | Fusion Auth API key to use for the Fusion Auth APIs being access via User Service. This key will be ignored if header `Authorization` header is passed in the request. |
| `encryption.enabled`  | Boolean flag to enabled/disable encryption.                                                                                                                            |
| `encryption.key`      | Encryption key. Must be passed if `encryption.enabled` is `true`.                                                                                                      |
| `hasura.graphql_url`  | Hasura Graphql URL for custom mutation calls to be made on hit of certain APIs.                                                                                        |
| `hasura.admin_secret` | Hasura Admin Secret.                                                                                                                                                   |
| `hasura.mutations`    | A JSON object containing `key: value`; where `key` is the name of mutation & `value` contains the query/mutation for the Graphql call.                                 |

## User-Service as a Package (USaaP)

This fork of user-service has been modified to act as a npm package which can then be used in other nestJS projects directly, something similar to [willsoto/nestjs-prometheus](https://github.com/willsoto/nestjs-prometheus).

To use this package you can follow the following steps:

1. Install the package using `npm install @techsavvyash/user-service` or `yarn add @techsavvyash/user-service` or `pnpm install @techsavvyash/user-service`.
2. Import the required module from the package. The below sample enables the `dst` and `user` login APIs is shown below:

```ts
import { Module } from '@nestjs/common';
import { dst, user } from '@techsavvyash/user-service';

@Module({
  imports: [dst.DstModule, user.UserModule],
})
export class AppModule {}
```

Note: Due to the great architecture of NestJS[https://github.com/nestjs] this package does not need any specific cofiguration package to be passed to the modules, instead all the required the environment variables can be added to the `.env` file of the using package.

## Postman Collection

Find [here](https://www.getpostman.com/collections/273dc33e3e37977a22b5)

## License

Nest is [MIT licensed](LICENSE).

## Support

This project was bootstrapped using Nest. Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).
