<h1 align="center">NestJS Monitor</h1>

<div align="center">

[![Open in Gitpod](https://gitpod.io/button/open-in-gitpod.svg)](https://gitpod.io/#https://github.com/ChakshuGautam/nestjs-monitor)

An opinionated nestjs monitoring setup with Prometheus and Grafana.
This project aims to create a `NestJS` interceptor to monitor the `response times` of different APIs in your `NestJS` app. Along with support for dynamic creation of Grafana Panels for each instance of the interceptor used in your app.
</div>

## Usage

The usage of this interceptor needs you to have a the following services running:
  1. Redis
  2. Prometheus
  3. Grafana

A sample `docker-compose.yml` is present in the `monitoring/` folder for your reference.

### At a method/endpoint level

```ts
@Get()
  @UseInterceptors(new ResponseTimeInterceptor('monitoring_response_time', 'path/to/your/grafana/config/folder')) // <<-- focus on this line
  getMonitoringHell(): string {
    return 'Hello from monitoring controller!';
  }
```

### At a class/controller level
Add the following code in your `<NAME>.controller.ts` file.
```ts
@Controller()
@UseInterceptors(new ResponseTimeInterceptor('class_response_time', 'path/to/your/grafana/config/folder'))// <<-- focus on this line
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly monitoringService: MonitoringService,
  ) {}

  @Get()
  getHello(): string {
    this.monitoringService.incrementRequestCounter();
    return this.appService.getHello();
  }

  @Get('/route')
  async randomRoute(@Query('delay') delay: number): Promise<string> {
    await new Promise((resolve) => setTimeout(resolve, delay));
    return 'Hello from random route!';
  }
}
```

### At global level
Add the following code in your `main.ts` file for nestJS.
```ts
async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );

  app.useGlobalInterceptors(new ResponseTimeInterceptor('global_interceptor', 'path/to/your/grafana/config/folder')); //<<-- focus on this line
}
```
