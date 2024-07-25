import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrometheusController, MonitoringModule } from '@samagra-x/stencil';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [MonitoringModule,ConfigModule.forRoot()],
  controllers: [AppController, PrometheusController],
  providers: [AppService],
})
export class AppModule {}
