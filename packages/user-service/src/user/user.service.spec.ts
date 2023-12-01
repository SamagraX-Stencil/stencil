import { Test, TestingModule } from '@nestjs/testing';

import { FusionauthService } from './fusionauth/fusionauth.service';
import { GupshupService } from './sms/gupshup/gupshup.service';
import { OtpService } from './otp/otp.service';
import { UserDBService } from './user-db/user-db.service';
import { UserService } from './user.service';
import got from 'got/dist/source';

describe('UserService', () => {
  let service: UserService;
  let fusionauthService: FusionauthService;
  let userDBService: UserDBService;
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
      providers: [
        FusionauthService,
        UserDBService,
        otpServiceFactory,
        UserService,
      ],
    }).compile();
    fusionauthService = module.get<FusionauthService>(FusionauthService);
    userDBService = module.get<UserDBService>(UserDBService);
    service = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(fusionauthService).toBeDefined();
    expect(userDBService).toBeDefined();
    expect(service).toBeDefined();
  });
});
