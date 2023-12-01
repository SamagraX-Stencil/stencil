import { HttpModule, HttpService } from '@nestjs/axios';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthModule } from '../auth/auth.module';
import { AdminService } from './admin.service';
import { FusionauthService } from './fusionauth/fusionauth.service';
import { QueryGeneratorService } from './query-generator/query-generator.service';
import { ConfigResolverService } from '../api/config.resolver.service';
import { ApiModule } from '../api/api.module';
import { ConfigModule } from '@nestjs/config';
import { HasuraService } from './hasura/hasura.service';

describe('AdminService', () => {
  let service: AdminService;
  let fusionauthService: FusionauthService;
  let configResolverService: ConfigResolverService;
  let httpService: HttpService;
  let hasuraService: HasuraService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [HttpModule, AuthModule, ConfigModule, ApiModule],
      providers: [
        FusionauthService,
        AdminService,
        QueryGeneratorService,
        ConfigResolverService,
        HasuraService,
      ],
    }).compile();
    fusionauthService = module.get<FusionauthService>(FusionauthService);
    configResolverService = module.get<ConfigResolverService>(ConfigResolverService);
    httpService = module.get<HttpService>(HttpService);
    hasuraService = module.get<HasuraService>(HasuraService);
    service = module.get<AdminService>(AdminService);
  });

  it('should be defined', () => {
    expect(fusionauthService).toBeDefined();
    expect(configResolverService).toBeDefined();
    expect(httpService).toBeDefined();
    expect(hasuraService).toBeDefined();
    expect(service).toBeDefined();
  });
});
