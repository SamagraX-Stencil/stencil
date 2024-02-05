<p align="left">
  <a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
  <a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@samagra-x/stencil.svg" alt="NPM Downloads" /></a>
</p>
<p align="left">Stencil is an opinionated <a href="http://nodejs.org" target="_blank">Node.js</a> framework to bootstrap efficient and scalable server-side applications <em>fast</em>. Stencil uses <a href="https://nestjs.com" target="_blank"> NestJS</a> at its core.</p>

## Description

[Stencil](https://github.com/SamagraX-stencil/stencil) framework TypeScript sample app depicting how to setup and use the `response-formatting` interceptor.

## Installation

```bash
$ yarn install
```

## Setting up file-upload

> Manually

To setup response formatting you can register the `ResponseFormatInterceptor` interceptor wherever required. `ResponseFormatInterceptor` imported from the `@samagra-x/stencil` package.

For example registering the formatting interceptor at a global level in `main.ts`: 
```typescript
// main.ts 
// ** other imports **
import { ResponseFormatInterceptor } from '@samagra-x/stencil';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalInterceptors(new ResponseFormatInterceptor()); // REGISTER THE INTERCEPTOR
  await app.listen(3000);
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