import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrometheusController } from '@samagra-x/stencil';

@Module({
  imports: [],
  controllers: [AppController, PrometheusController],
  providers: [AppService],
})
export class AppModule {}
