import { HttpModule } from '@nestjs/axios';
import { Test, TestingModule } from '@nestjs/testing';
import { QueryGeneratorService } from '../query-generator/query-generator.service';

import { FusionauthService } from './fusionauth.service';

describe('FusionauthService', () => {
  let service: FusionauthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [HttpModule, QueryGeneratorService],
      providers: [FusionauthService, QueryGeneratorService],
    }).compile();

    service = module.get<FusionauthService>(FusionauthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
