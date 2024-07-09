<p align="left">
  <a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
  <a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@samagra-x/stencil.svg" alt="NPM Downloads" /></a>
</p>
<p align="left">Stencil is an opinionated <a href="http://nodejs.org" target="_blank">Node.js</a> framework to bootstrap efficient and scalable server-side applications <em>fast</em>. Stencil uses <a href="https://nestjs.com" target="_blank"> NestJS</a> at its core.</p>

## Description

[Stencil](https://github.com/SamagraX-stencil/stencil) framework TypeScript sample app depicting how to setup and use monitoring in your app.

## Installation

```bash
$ yarn install
```

## Setup dependent services

The `ResponseTimeInterceptor` examples depends on prometheus and grafana. A `docker-compose.yml` file has been provided in the `monitor` folder at the root of this project which sets up these services for usage in this example. Run the instances using the following command

```bash
$ cd monitor && docker-compose up -d
```

You can use the following command to create the monitor folder with the prometheus and grafana services if required
```bash
$ stencil add monitor
```

## Setting up monitoring

1. Inject the `MonitoringModule` and `PrometheusController` in your `app.module.ts`.
```typescript
/// app.module.ts
import { Module } from '@nestjs/common';
import { PrometheusController, MonitoringModule } from '@samagra-x/stencil';

@Module({
  imports: [MonitoringModule],
  controllers: [PrometheusController],
  providers: [],
})
export class AppModule {}
```

2. Register the `ResponseTimeInterceptor` module in your module which can be imported from the `@samagra-x/stencil` package.

For example to setup the interceptor globally you can do it as follows: 
```typescript
// main.ts
// ** other imports **
import { ResponseTimeInterceptor } from '@samagra-x/stencil';

async function bootstrap() {
  // other functional statements
  app.useGlobalInterceptors(
    new ResponseTimeInterceptor(
      'test_global_interceptor',
      'monitor/grafana/provisioning/dashboards/response_times.json',
    ),
  );

  // ... rest of the function
}
bootstrap();
```

Registering the interceptor as described above would create the `response-times.json` file in your grafana's dashboards folder which would show the response times.

> NOTE: The update for shifting from direct file creation to using Grafana API will be pushed in the next release.

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

## Stay in touch

- Author - [Yash Mittal](https://techsavvyash.dev) and [Team SamagraX](https://github.com/Samagra-Development)
- Website - [https://stencil.samagra.io](https://stencil.samagra.io/)

## License

Stencil and Nest are [MIT licensed](LICENSE).

## Acknowledgements

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).