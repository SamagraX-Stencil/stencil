import { Test, TestingModule } from '@nestjs/testing';

import { FusionauthService } from './fusionauth.service';

describe('FusionauthService', () => {
  let service: FusionauthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FusionauthService],
    }).compile();

    service = module.get<FusionauthService>(FusionauthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
