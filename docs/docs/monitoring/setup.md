---
title: Setup
---

<head>
  <title>Stencil Features</title>
</head>

<p>

## Installation

1. Install the `nestjs-monitor` to your NestJS app using
```bash
  npm i @techsavvyash/nestjs-monitor
```

2. Make sure you have properly setup and working instances of `grafana` and `prometheus` with you.

3. Now import the `ResponseTimeInterceptor` from `@techsavvyash/nestjs-monitor` and use it where you'd like to use. 

## Usage

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

An example project can be found at [techsavvyash/nestjs-monitor](https://github.com/techsavvyash/nestjs-monitor)
</p>
