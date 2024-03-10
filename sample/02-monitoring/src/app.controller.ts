import { Controller, Get, UseInterceptors } from '@nestjs/common';
import { AppService } from './app.service';
import { ResponseTimeInterceptor } from './response.interceptor';

@Controller()
@UseInterceptors(
  new ResponseTimeInterceptor(
    'app_controller_interceptor',
    'http://localhost:7889',
  ),
)
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
