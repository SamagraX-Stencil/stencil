import { Test, TestingModule } from '@nestjs/testing';

import { FusionauthService } from './fusionauth/fusionauth.service';
import { GupshupService } from './sms/gupshup/gupshup.service';
import { OtpService } from './otp/otp.service';
import { SmsService } from './sms/sms.service';
import { UserController } from './user.controller';
import { UserDBService } from './user-db/user-db.service';
import { UserService } from './user.service';
import got from 'got/dist/source';

describe('UserController', () => {
  let controller: UserController;
  let fusionauthService: FusionauthService;
  let otpService: OtpService;
  let smsService: SmsService;
  let userService: UserService;

  beforeEach(async () => {
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

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        UserDBService,
        FusionauthService,
        otpServiceFactory,
        SmsService,
        UserService,
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
    fusionauthService = module.get<FusionauthService>(FusionauthService);
    otpService = module.get<OtpService>(OtpService);
    smsService = module.get<SmsService>(SmsService);
    otpService = module.get<OtpService>(OtpService);
    userService = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
    expect(fusionauthService).toBeDefined();
    expect(otpService).toBeDefined();
    expect(smsService).toBeDefined();
    expect(userService).toBeDefined();
  });

  it('should verify username phone number combinations', async () => {
    const result = false;
    jest
      .spyOn(fusionauthService, 'verifyUsernamePhoneCombination')
      .mockImplementation(() => Promise.resolve(result));

    expect(await controller.verifyUsernamePhoneCombination()).toStrictEqual({
      status: result,
    });
  });
});
