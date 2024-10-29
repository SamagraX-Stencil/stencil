import { Controller, Get, UseInterceptors } from '@nestjs/common';
import { AppService } from './app.service';
import { ResponseTimeInterceptor } from '../../../packages/common/src/interceptors/response-time.interceptor'; 

@Controller()
@UseInterceptors(
  new ResponseTimeInterceptor(
    'controller',
    'http://localhost:7889',
    'GRAFANA_API_TOKEN'
  ),
)
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
