import {
  Controller,
  Get,
  NotFoundException,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import { AppService } from './app.service';
import { MonitoringService } from './monitoring/monitoring.service';
import { ResponseTimeInterceptor } from './interceptors/response-time.interceptor';

@Controller()
@UseInterceptors(
  new ResponseTimeInterceptor(
    'class',
    '../monitor/grafana/provisioning/dashboards/response_times.json',
  ),
)
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly monitoringService: MonitoringService,
  ) {}

  @Get()
  async getHello(): Promise<string> {
    await this.monitoringService.incrementRequestCounter();
    return this.appService.getHello();
  }

  @Get('/route')
  async randomRoute(@Query('delay') delay: number): Promise<string> {
    await new Promise((resolve) => setTimeout(resolve, delay));
    return 'Hello from random route!';
  }

  @Get('/error')
  getError(): string {
    throw new NotFoundException('Error from monitoring controller!');
    return;
  }
}
