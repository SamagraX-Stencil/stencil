import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrometheusController, MonitoringModule } from '@samagra-x/stencil';

@Module({
  imports: [MonitoringModule],
  controllers: [AppController, PrometheusController],
  providers: [AppService],
})
export class AppModule {}
