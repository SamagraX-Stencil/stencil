import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { GeoIPInterceptor } from './geoip.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalInterceptors(new GeoIPInterceptor(['India']));

  await app.listen(3000);
}
bootstrap();
