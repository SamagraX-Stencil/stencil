import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ResponseFormatInterceptor } from '@samagra-x/stencil';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalInterceptors(new ResponseFormatInterceptor());
  app.useGlobalPipes(new ValidationPipe());
  await app.listen(3001);
}
bootstrap();
