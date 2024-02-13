import { Module, DynamicModule } from '@nestjs/common';
import { HealthController } from './health.controller';
import { TerminusModule } from '@nestjs/terminus';
import { HealthService } from './health.service';

@Module({
  imports: [TerminusModule],
  controllers: [HealthController],
  providers: [HealthService],
})
export class HealthModule {
  static forRoot(services: string[]): DynamicModule {
    return {
      module: HealthModule,
      providers: [{ provide: 'HEALTH_CHECK_SERVICES', useValue: services }],
      exports: [HealthService],
    };
  }
}