import { Controller, Get, Inject } from '@nestjs/common';
import { HealthCheck, HealthCheckResult, HealthCheckService } from '@nestjs/terminus';
import { HealthService } from './health.service';

@Controller('health')
export class HealthController {
  constructor(
    private readonly healthCheckService: HealthCheckService,
    private readonly healthService: HealthService,
    @Inject('HEALTH_CHECK_SERVICES') private readonly services: string[],
  ) {}

  @Get('/')
  @HealthCheck()
  async checkHealth(): Promise<HealthCheckResult> {
    return this.healthCheckService.check([
      async () => this.healthService.combineHealthChecks(this.services),
    ]);
  }
}
