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

## Grafana API setup

As per [Grafana API Documentation](https://grafana.com/docs/grafana/latest/developers/http_api/dashboard/), this is the method used to create a dashboard in Grafana using the Grafana API.

### Create a Dashboard

**POST** `/api/dashboards/db`

**Headers:**
```
Accept: application/json
Content-Type: application/json
Authorization: Bearer eyJrIjoiT0tTcG1pUlY2RnVKZTFVaDFsNFZXdE9ZWmNrMkZYbk
```

**Body:**
```json
{
  "dashboard": {
    "id": null,
    "uid": null,
    "title": "Production Overview",
    "tags": ["templated"],
    "timezone": "browser",
    "schemaVersion": 16,
    "refresh": "25s"
  },
  "folderUid": "l3KqBxCMz",
  "message": "Made changes to xyz",
  "overwrite": false
}
```

### API Response

When you attach the JSON alongside the Bearer key, this JSON can be imported via the Grafana Dashboard Page but won't work if you try to send it using the API directly.

### Steps to Get a JSON Accepted by the API

1. **Create a dashboard in Grafana UI using your desired JSON**: It is always better to have a JSON which consists of panels and a datasource.
2. **Get your Dashboard's UID**: After creating a dashboard using the Grafana UI, you can simply use this endpoint:
   - `GET /api/search` 
   > Gives you the **Uid** of your desired Dashboard. 
3. **Get the Grafana API JSON**: After you have the UID, use this endpoint:
   - `GET /api/dashboards/uid/{your_uid}`
   >Gives you the updated json which can be used via Grafana API.
4. **Send the Updated JSON via the Grafana API**: Use this endpoint:
   - `POST /api/dashboards/db`
   > To create your dashboard via Grafana API.

For more details, you can refer to the [forum link](https://community.grafana.com/t/post-request-to-generate-a-new-dashboard-400-bad-data/125321/19).


**Note:** Incase you are unable to find the Updated Json add this over your existing Json file.
```sh
meta: {                                                       
      type: "db",
      canSave: true,
      canEdit: true,
      canAdmin: true,
      canStar: true,
      canDelete: true,
      slug: histogramTitle,
      url: `/d/ec1b884b/${histogramTitle}`,
      expires: "0001-01-01T00:00:00Z",
      created: "2024-07-03T04:01:29Z",
      updated: "2024-07-03T04:01:29Z",
      updatedBy: "admin",
      createdBy: "admin",
      version: 1,
      hasAcl: false,
      isFolder: false,
      folderId: 0,
      folderUid: "",
      folderTitle: "General",
      folderUrl: "",
      provisioned: false,
      provisionedExternalId: "",
      annotationsPermissions: {
        dashboard: {
          canAdd: true,
          canEdit: true,
          canDelete: true,
        },
        organization: {
          canAdd: true,
          canEdit: true,
          canDelete: true,
        },
      },
    },
    dashboard: {  #Your Dashboard Code
    };
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
## 

## Stay in touch

- Author - [Yash Mittal](https://techsavvyash.dev) and [Team SamagraX](https://github.com/Samagra-Development)
- Website - [https://stencil.samagra.io](https://stencil.samagra.io/)

## License

Stencil and Nest are [MIT licensed](LICENSE).

## Acknowledgements

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).