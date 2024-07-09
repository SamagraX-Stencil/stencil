import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ResponseTimeInterceptor } from '@samagra-x/stencil';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalInterceptors(
    new ResponseTimeInterceptor(
      'test_global_interceptor',
      'monitor/grafana/provisioning/dashboards/response_times.json',
    ),
  );
  await app.listen(3000);
}
bootstrap();
