import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { AppModule } from './app.module';
import { NestFactory } from '@nestjs/core';
import * as Sentry from '@sentry/node';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.getHttpAdapter().getInstance().set('etag', false);

  const config = new DocumentBuilder()
    .setTitle('e-Samwad User Service')
    .setDescription('User Service APIs')
    .setVersion('1.0')
    .addTag('cats')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('swagger', app, document);
  // add security headers
  app.use(helmet());

  // enable cors
  app.enableCors({
    origin: process.env.CORS_ALLOWED_ORIGINS?.split(/\s*,\s*/) ?? '*',
    credentials: true,
    methods: process.env.CORS_ALLOWED_METHODS?.split(/\s*,\s*/) ?? ['GET', 'PUT', 'POST', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: process.env.CORS_ALLOWED_HEADERS?.split(/\s*,\s*/) ?? ['Content-Type', 'Authorization', 'x-application-id'],
  });

  Sentry.init({
    dsn: process.env.SENTRY_DSN,

    // Set tracesSampleRate to 1.0 to capture 100%
    // of transactions for performance monitoring.
    // We recommend adjusting this value in production
    tracesSampleRate: 1.0,
  });

  await app.listen(3000);
}
bootstrap();
