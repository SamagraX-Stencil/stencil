import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ResponseTimeInterceptor } from '@samagra-x/stencil';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const grafanaBaseURL = configService.get<string>('GRAFANA_BASE_URL');
  const apiToken = configService.get<string>('GRAFANA_API_TOKEN');

  app.useGlobalInterceptors(
    new ResponseTimeInterceptor(
      'Response_Times',
      grafanaBaseURL,
      apiToken,
    ),
  );
  await app.listen(3000);
}
bootstrap();

