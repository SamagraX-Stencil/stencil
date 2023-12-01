import { Module, OnModuleInit, Global, DynamicModule } from '@nestjs/common';
import { MonitoringService } from './monitoring.service';
import { CacheModule } from '@nestjs/cache-manager';
import * as redisStore from 'cache-manager-redis-store';

@Global()
@Module({
  imports: [
    CacheModule.register({
      isGlobal: true,
      store: redisStore as any,
      host: 'localhost',
      port: 6379,
    }),
  ],
  providers: [MonitoringService],
  exports: [MonitoringService],
})
export class MonitoringModule implements OnModuleInit {
  constructor(private readonly monitoringService: MonitoringService) {}

  async onModuleInit() {
    await this.monitoringService.initializeAsync();
  }

  static forRoot(options?: any): DynamicModule {
    return {
      module: MonitoringModule,
      providers: [
        {
          provide: 'CONFIG_OPTIONS',
          useValue: options,
        },
      ],
      exports: [MonitoringService],
    };
  }
}
