import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';

import { FusionauthService } from './fusionauth/fusionauth.service';
import { HttpModule } from '@nestjs/axios';
import { AuthModule } from '../auth/auth.module';
import { QueryGeneratorService } from './query-generator/query-generator.service';
import { ConfigModule } from '@nestjs/config';
import { ConfigResolverService } from '../api/config.resolver.service';
import { HasuraService } from './hasura/hasura.service';

@Module({
  imports: [HttpModule, AuthModule, ConfigModule],
  providers: [
    AdminService,
    FusionauthService,
    QueryGeneratorService,
    ConfigResolverService,
    HasuraService,
  ],
  controllers: [AdminController],
})
export class AdminModule {}
