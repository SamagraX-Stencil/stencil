import { Controller, Get } from '@nestjs/common';
import { HealthCheck, HealthCheckResult, HealthCheckService } from '@nestjs/terminus';
import { HealthService } from './health.service';

import {
  DatabaseConnectionDetails,
  FusionAuthConnectionDetails,
  RedisConnectionDetails,
} from './health.interface';

@Controller('health')
export class HealthController {
  constructor(
    private readonly healthCheckService: HealthCheckService,
    private readonly healthService: HealthService,
  ) {}

  @Get('/')
  @HealthCheck()
  async checkHealth(): Promise<HealthCheckResult> {
    return this.healthCheckService.check([
      async () => this.healthService.checkDatabase({
        name: 'postgres',
        type: 'postgres',
        host: process.env.DATABASE_HOST || 'localhost',
        port: parseInt(process.env.DATABASE_PORT || '5432', 10),
        username: process.env.DATABASE_USERNAME || 'root',
        password: process.env.DATABASE_PASSWORD || 'secret',
        database: process.env.DATABASE_NAME || 'api',
      }),
      async () => this.healthService.checkDatabase({
        name: 'shadow-postgres',
        type: 'postgres',
        host: process.env.SHADOW_DATABASE_HOST || 'localhost',
        port: parseInt(process.env.SHADOW_DATABASE_PORT || '5431', 10),
        username: process.env.SHADOW_DATABASE_USERNAME || 'root',
        password: process.env.SHADOW_DATABASE_PASSWORD || 'secret',
        database: process.env.SHADOW_DATABASE_NAME || 'shadow', 
      }),
      async () => this.healthService.checkFusionAuth({
        healthEndpoint: process.env.FUSIONAUTH_BASE_URL + '/api/status',
      }),
      async () => this.healthService.checkRedis({
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379', 10),
      }),
    ]);
  }
}
