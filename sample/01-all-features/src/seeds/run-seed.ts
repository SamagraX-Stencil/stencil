import { NestFactory } from '@nestjs/core';
import { SeedModule } from './seed.module';

const runSeed = async () => {
  const app = await NestFactory.create(SeedModule);

  // TODO: Modify it as per stencil need

  await app.close();
};

void runSeed();
