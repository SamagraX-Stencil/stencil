import { Test, TestingModule } from '@nestjs/testing';
import { DstService } from './dst.service';
import { FusionauthService } from './fusionauth/fusionauth.service';
import { OtpService } from './otp/otp.service';
import { GupshupService } from './sms/gupshup/gupshup.service';
import got from 'got/dist/source';
import { HttpModule } from '@nestjs/axios';
import { AuthModule } from '../auth/auth.module';

describe('DstService', () => {
  let service: DstService;
  let fusionauthService: FusionauthService;
  let otpService: OtpService;

  const gupshupFactory = {
    provide: 'OtpService',
    useFactory: () => {
      return new GupshupService(
        process.env.GUPSHUP_USERNAME,
        process.env.GUPSHUP_PASSWORD,
        process.env.GUPSHUP_BASEURL,
        got,
      );
    },
    inject: [],
  };

  const otpServiceFactory = {
    provide: OtpService,
    useFactory: () => {
      return new OtpService(gupshupFactory.useFactory());
    },
    inject: [],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [HttpModule, AuthModule],
      providers: [
        FusionauthService,
        otpServiceFactory,
        DstService,
      ],
    }).compile();
    fusionauthService = module.get<FusionauthService>(FusionauthService);
    service = module.get<DstService>(DstService);
  });

  it('should be defined', () => {
    expect(fusionauthService).toBeDefined();
    expect(service).toBeDefined();
  });
});