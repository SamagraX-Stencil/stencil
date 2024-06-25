import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('geoip/India')
  getHelloIndia(): string {
    return 'Hello India!';
  }

  @Get('geoip/USA')
  getHelloUSA(): string {
    return 'Hello USA!';
  }
}
