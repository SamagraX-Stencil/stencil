import { Test, TestingModule } from '@nestjs/testing';
import { CdacService } from './cdac.service';

describe('CdacService', () => {
  let service: CdacService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CdacService],
    }).compile();

    service = module.get<CdacService>(CdacService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
