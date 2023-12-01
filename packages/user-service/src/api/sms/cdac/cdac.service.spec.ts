import { Test, TestingModule } from '@nestjs/testing';
import { CdacService } from './cdac.service';
import { ConfigService } from '@nestjs/config';
import { OtpService } from '../../otp/otp.service';

const otpServiceFactory = {
  provide: OtpService,
  useFactory: (config: ConfigService) => {
    let factory;
    factory = {
      provide: 'OtpService',
      useFactory: () => {
        return new CdacService(config);
      },
      inject: [],
    }.useFactory();
    return new OtpService(factory);
  },
  inject: [ConfigService],
};

describe('CdacService', () => {
  let service: CdacService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ConfigService, CdacService, otpServiceFactory],
    }).compile();

    service = module.get<CdacService>(CdacService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(service).toBeDefined();
  });
});
