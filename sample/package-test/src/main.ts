import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
// import { ResponseTimeInterceptor } from '@samagra-x/stencil';
import { ResponseTimeInterceptor } from '@techsavvyash/nestjs-monitor';
import { NewIntercept } from './newintercept.interceptor';
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalInterceptors(
    new ResponseTimeInterceptor(
      'global',
      'monitor/grafana/provisioning/dashboards/response_times.json',
    ),
  );

  app.useGlobalInterceptors(
    new NewIntercept(
      'new_intercept',
      'monitor/grafana/provisioning/dashboards/response_times.json',
    ),
  );

  await app.listen(3000);
}
bootstrap();
