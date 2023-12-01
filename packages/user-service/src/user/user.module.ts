import { FusionauthService } from './fusionauth/fusionauth.service';
import { GupshupService } from './sms/gupshup/gupshup.service';
import { Module } from '@nestjs/common';
import { OtpService } from './otp/otp.service';
import { SmsService } from './sms/sms.service';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import got from 'got/dist/source';
import { UserDBService } from './user-db/user-db.service';

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

@Module({
  providers: [
    UserDBService,
    FusionauthService,
    otpServiceFactory,
    SmsService,
    UserService,
  ],
  controllers: [UserController],
})
export class UserModule {}
