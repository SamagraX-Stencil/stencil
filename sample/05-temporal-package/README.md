<p align="left">
  <a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
  <a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@samagra-x/stencil.svg" alt="NPM Downloads" /></a>
</p>
<p align="left">Stencil is an opinionated <a href="http://nodejs.org" target="_blank">Node.js</a> framework to bootstrap efficient and scalable server-side applications <em>fast</em>. Stencil uses <a href="https://nestjs.com" target="_blank"> NestJS</a> at its core.</p>

## Description

[Stencil](https://github.com/SamagraX-stencil/stencil) framework TypeScript sample app demonstrating how to use [temporal](https://temporal.io) in your stencil app.

## Installation

```bash
$ yarn install
```

## Setup dependent services

This examples requires a running temporal server to work. A `docker-compose.yml` file has been provided in the `docker-compose` folder which has been taking from the official docker-compose repository from temporal's github.

Change the current directory to docker-compose

```bash
cd docker-compose 
```

## Setting up the environment

```bash
cp .env.example .env
```
## Run the below command from the root of the project to start a temporal instance locally to be used in this example.

```bash
  docker-compose up -d
```
## Setting up temporal

> Manually

To manually setup the temporal in your stencil app follow the following steps. 

1. Create two folders named `temporal/actitives` and `temporal/workflows` at the root of your project. These folders will server as the home for your activities and workflows.

```bash
mkdir -p temporal/actitives temporal/workflow
```

2. For this example we are adding the following sample activity and workflow

```typescript
// temporal/activities/example.activity.ts
export async function exampleActivity(name: string): Promise<string> {
  // Implement the activity logic here
  return await `Hello, ${name}!`;
}
```

```typescript
// temporal/workflows/example.workflow.ts
import { proxyActivities, sleep } from '@temporalio/workflow';

// Your activities interface here
interface Activities {
  // Define activity function signatures here
  exampleActivity(name: string): Promise<string>;
}

const activities = proxyActivities<Activities>({
  startToCloseTimeout: '1 minute',
});

export async function exampleWorkflow(name: string): Promise<string> {
  await sleep(100000);
  return await activities.exampleActivity(name);
}
```

3. Install the `nestjs-temporal` package
```bash
yarn add nestjs-temporal
```

4. Register the temporal worker, client, `TemporalWorkflowService` and your activities in the module file as follows:

```typescript
// other imports 
import { TemporalModule } from 'nestjs-temporal';
import * as activities from './temporal/activities';
import { TemporalWorkflowService } from '@samagra-x/stencil';

@Module({
  imports: [
    TemporalModule.registerWorker({
      workerOptions: {
        namespace: 'default',
        taskQueue: 'default',
        workflowsPath: require.resolve('./temporal/workflows/example.workflow'),
        activities: {
          activities,
        },
      },
    }),
    TemporalModule.registerClient(),
  ],
  controllers: [],
  providers: [TemporalWorkflowService],
})
export class AppModule {}
```

5. Dependency inject the `TemporalWorkflowService` whereever your want to use your workflows in the app. For example we have modified the `app.controller.ts`'s `getHello` function as follows:

```typescript
@Get()
async getHello() {
  try {
    const result = await this.temporalWorkflowService.startWorkflow(
      exampleWorkflow,
      'default',
      ['temporal-package-test-controller'],
      'temporal-package-test-workflow-id' + Date.now(),
    );
    return `Workflow started, result: ${result}`;
  } catch (error) {
    console.error('Error starting workflow', error);
    throw error;
  }
}
```


##  Setup temporal package  via Stencil [CLI](https://github.com/SamagraX-stencil/stencil-cli):
1.   Run the folowing command to install `stencil cli` globally
```bash
npm i -g @samagra-x/stencil-cli
```
2.  To start using `temporal service` run the following command
```bash
stencil add service-temporal 
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