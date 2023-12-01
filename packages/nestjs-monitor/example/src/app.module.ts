import {
  CacheModule,
  MiddlewareConsumer,
  Module,
  NestModule,
} from '@nestjs/common';
import { PrometheusModule } from '@willsoto/nestjs-prometheus';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MonitoringModule } from './monitoring/monitoring.module';
import { MonitoringService } from './monitoring/monitoring.service';
import { ResponseTimeInterceptor } from './interceptors/response-time.interceptor';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    MonitoringModule,
    ConfigModule.forRoot(),
    PrometheusModule.register({
      defaultMetrics: {
        enabled: false,
      },
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class MonitorModule {}
