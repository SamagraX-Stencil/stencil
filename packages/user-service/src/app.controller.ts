import { Controller, Get } from '@nestjs/common';

import { AppService } from './app.service';
import {
  HealthCheck,
  HealthCheckService,
  HttpHealthIndicator,
} from '@nestjs/terminus';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private configService: ConfigService,
    private http: HttpHealthIndicator,
    private healthCheckService: HealthCheckService,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('/health')
  @HealthCheck()
  @ApiOperation({ summary: 'Get Health Check Status' })
  @ApiResponse({
    status: 200,
    description: 'Result Report for All the Health Check Services',
  })
  async checkHealth() {
    return this.healthCheckService.check([
      async () =>
        this.http.pingCheck(
          'Fusion Auth (Old)',
          this.configService.get<string>('FUSIONAUTH_OLD_BASE_URL'),
        ),
      async () =>
        this.http.pingCheck(
          'Fusion Auth (New)',
          this.configService.get<string>('FUSIONAUTH_BASE_URL'),
        ),
      /*async () =>
        this.http.pingCheck(
          'E-Samwad',
          this.configService.get<string>('ESAMWAD_BACKEND_BASE_URL'),
        ),*/
    ]);
  }
}
