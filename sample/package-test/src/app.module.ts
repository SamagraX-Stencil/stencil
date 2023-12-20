import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MonitoringModule } from '@samagra-x/stencil';
import { PrometheusModule } from '@willsoto/nestjs-prometheus';

@Module({
  imports: [
    MonitoringModule,
    PrometheusModule.register({
      defaultMetrics: {
        enabled: false,
      },
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
