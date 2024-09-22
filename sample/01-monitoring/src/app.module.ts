import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrometheusController, MonitoringModule } from '@samagra-x/stencil';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [MonitoringModule,
    ConfigModule.forRoot({
      isGlobal: true
  })],
  controllers: [AppController, PrometheusController],
  providers: [AppService],
})
export class AppModule {}
