<p align="left">
  <a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
  <a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@samagra-x/stencil.svg" alt="NPM Downloads" /></a>
</p>
<p align="left">Stencil is an opinionated <a href="http://nodejs.org" target="_blank">Node.js</a> framework to bootstrap efficient and scalable server-side applications <em>fast</em>. Stencil uses <a href="https://nestjs.com" target="_blank"> NestJS</a> at its core.</p>

## Description

[Stencil](https://github.com/SamagraX-stencil/stencil) framework TypeScript sample app depicting how to setup and use the `FileUploadModule` .

## Installation

```bash
$ yarn install
```

## Setup dependent services

This examples depends on minio as a S3 based storage engine to store the uploaded files. A `docker-compose.yml` file has been provided at the root of this project which sets up a minio instance for your use. You can start the instance by running

```bash
$ docker-compose up -d
```

## Setting up the environment

```bash
$ cp env-example .env
```

## Setting up file-upload

> Manually

To manually setup the `file-upload` functionality you need to register the `FileUploadModule` module in your module which can be imported from the `@samagra-x/stencil` package.

For example: 
```typescript
// other imports 
import { FileUploadModule } from '@samagra-x/stencil';

@Module({
  imports: [FileUploadModule],
  // other configs
})
export class AppModule {}
```

> Via the [CLI](https://github.com/SamagraX-stencil/stencil-cli)

To setup `file-upload` functionality automatically via the CLI simply run the following command:
```bash
$ stencil add service-file-upload 
```

## Running the app

```bash
# development
$ yarn run start

# watch mode
$ yarn run start:dev

# production mode
$ yarn run start:prod
```

## Test

```bash
# unit tests
$ yarn run test

# e2e tests
$ yarn run test:e2e

# test coverage
$ yarn run test:cov
```

## Steps To Upload Multiple Files

Send a POST request in the given route: /files/upload-files

The destination should be passed along with the post request as query parameter.

The files should be added in the request body (as form-data) with field-name(key) as 'files'

The filenames should be added in the request body (as form-data) with field-name(key) as 'filenames'

The files and and the filenames should be passed in form of arrays.

Note: The number of files and filenames must be same and also in the correct order.

API POST Request:
/files/upload-files?destination=uploads

## Stay in touch

- Author - [Yash Mittal](https://techsavvyash.dev) and [Team SamagraX](https://github.com/Samagra-Development)
- Website - [https://stencil.samagra.io](https://stencil.samagra.io/)

## License

Stencil and Nest are [MIT licensed](LICENSE).

## Acknowledgements

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).