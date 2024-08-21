import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { GeoIPInterceptor } from '@samagra-x/stencil';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalInterceptors(new GeoIPInterceptor({
    countries: ['India', 'United States'],
    cities: ['Mumbai', 'New York'],
    coordinates: [{ lat: 35.6897, lon: 139.6895 }], // Tokyo
    geofences: [{ lat: 51.5074, lon: -0.1278, radius: 50 }], // London, UK
  }));

  await app.listen(3000);
}
bootstrap();
