import { Test, TestingModule } from '@nestjs/testing';
import { HasuraService } from './hasura.service';
import { UUID } from '@fusionauth/typescript-client';
import { randomUUID } from 'crypto';
import { ConfigModule } from '@nestjs/config';
import { ApiModule } from '../../api/api.module';
import { ConfigResolverService } from '../../api/config.resolver.service';
import { HttpModule, HttpService } from '@nestjs/axios';
import { AuthModule } from '../../auth/auth.module';
import { FusionauthService } from '../fusionauth/fusionauth.service';
import { AdminService } from '../admin.service';
import { QueryGeneratorService } from '../query-generator/query-generator.service';
import { AdminModule } from '../admin.module';
import { NotImplementedException } from '@nestjs/common';

describe('HasuraService', () => {
  let service: HasuraService;
  let applicationId: UUID;
  let configResolverService: ConfigResolverService;
  let httpService: HttpService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [HttpModule, ConfigModule, ApiModule, AdminModule],
      providers: [
        String,
        ConfigResolverService,
        HasuraService,
      ],
    }).compile();

    configResolverService = module.get<ConfigResolverService>(ConfigResolverService);
    httpService = module.get<HttpService>(HttpService);
    service = module.get<HasuraService>(HasuraService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
