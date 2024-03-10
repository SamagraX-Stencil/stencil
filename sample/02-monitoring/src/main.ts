import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ResponseTimeInterceptor } from './response.interceptor';
// import { ResponseTimeInterceptor } from '@samagra-x/stencil';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalInterceptors(
    new ResponseTimeInterceptor(
      'test_global_interceptor',
      'http://localhost:7889',
    ),
  );
  await app.listen(3000);
}
bootstrap();
