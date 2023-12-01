import { HttpModule, HttpService } from '@nestjs/axios';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthModule } from '../auth/auth.module';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { FusionauthService } from './fusionauth/fusionauth.service';
import { QueryGeneratorService } from './query-generator/query-generator.service';
import { ConfigModule } from '@nestjs/config';
import { ApiModule } from '../api/api.module';
import { ConfigResolverService } from '../api/config.resolver.service';
import { HasuraService } from './hasura/hasura.service';

describe('AdminController', () => {
  let controller: AdminController;
  let fusionauthService: FusionauthService;
  let service: AdminService;
  let configResolverService: ConfigResolverService;
  let httpService: HttpService;
  let hasuraService: HasuraService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminController],
      imports: [AuthModule, HttpModule, ConfigModule, ApiModule],
      providers: [
        FusionauthService,
        AdminService,
        QueryGeneratorService,
        ConfigResolverService,
        HasuraService,
      ],
    }).compile();

    controller = module.get<AdminController>(AdminController);
    fusionauthService = module.get<FusionauthService>(FusionauthService);
    configResolverService = module.get<ConfigResolverService>(ConfigResolverService);
    httpService = module.get<HttpService>(HttpService);
    hasuraService = module.get<HasuraService>(HasuraService);
    service = module.get<AdminService>(AdminService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
    expect(fusionauthService).toBeDefined();
    expect(configResolverService).toBeDefined();
    expect(httpService).toBeDefined();
    expect(hasuraService).toBeDefined();
    expect(service).toBeDefined();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
