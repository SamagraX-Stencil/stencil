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

## About GeoIP Interceptor
The GeoIPInterceptor restricts or grants access to API endpoints based on the geographic location of incoming requests, using IP-based geolocation data. It leverages the [Geoquery](https://github.com/ChakshuGautam/geoquery.in) API to verify locations and allows configuration of permitted countries, cities, coordinates, and geofences to control access effectively.

## Setting up GeoIP Interceptor

1. Register the `GeoIPInterceptor` module in your module which can be imported from the `@samagra-x/stencil` package.

For example to setup the interceptor globally you can do it as follows: 
```typescript
// main.ts
// ** other imports **
import { GeoIPInterceptor } from '@samagra-x/stencil';

async function bootstrap() {
  // other functional statements
  app.useGlobalInterceptors(new GeoIPInterceptor({
    countries: ['India', 'United States'],
    cities: ['Mumbai', 'New York'],
    coordinates: [{ lat: 35.6897, lon: 139.6895 }], // Tokyo
    geofences: [{ lat: 51.5074, lon: -0.1278, radius: 50 }], // London, UK // radius is in km
  }));

  // ... rest of the function
}
bootstrap();
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

## Stay in touch

- Author - [Yash Mittal](https://techsavvyash.dev) and [Team SamagraX](https://github.com/Samagra-Development)
- Website - [https://stencil.samagra.io](https://stencil.samagra.io/)

## License

Stencil and Nest are [MIT licensed](LICENSE).

## Acknowledgements

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).