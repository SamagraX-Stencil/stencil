import { HttpModule } from '@nestjs/axios';
import { Test, TestingModule } from '@nestjs/testing';
import got from 'got/dist/source';
import { AuthModule } from '../auth/auth.module';
import { DstController } from './dst.controller';
import { DstService } from './dst.service';
import { FusionauthService } from './fusionauth/fusionauth.service';
import { OtpService } from './otp/otp.service';
import { GupshupService } from './sms/gupshup/gupshup.service';
import { SmsService } from './sms/sms.service';

describe('DstController', () => {
  let controller: DstController;
  let fusionauthService: FusionauthService;
  let otpService: OtpService;
  let smsService: SmsService;
  let dstService: DstService;

  beforeEach(async () => {
    const gupshupFactory = {
      provide: 'OtpService',
      useFactory: () => {
        return new GupshupService(
          "testUsername",
          "testPassword",
          "testBaseUrl",
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

    const module: TestingModule = await Test.createTestingModule({
      controllers: [DstController],
      imports: [HttpModule, AuthModule],
      providers: [
        FusionauthService,
        otpServiceFactory,
        SmsService,
        DstService,
      ],
    }).compile();

    controller = module.get<DstController>(DstController);
    fusionauthService = module.get<FusionauthService>(FusionauthService);
    otpService = module.get<OtpService>(OtpService);
    smsService = module.get<SmsService>(SmsService);
    otpService = module.get<OtpService>(OtpService);
    dstService = module.get<DstService>(DstService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
    // expect(controller.sendOTP("")).toBeDefined();
    // expect(controller.loginOrRegister("", "", "", "", "")).toBeDefined();
  });
  
});

