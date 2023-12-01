import { Module } from '@nestjs/common';
import { DstController } from './dst.controller';
import { DstService } from './dst.service';
import { FusionauthService } from './fusionauth/fusionauth.service';
import { OtpService } from './otp/otp.service';
import { GupshupService } from './sms/gupshup/gupshup.service';
import got from 'got/dist/source';
import { HttpModule } from '@nestjs/axios';
import { AuthModule } from 'src/auth/auth.module';

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
  imports: [HttpModule],
  controllers: [DstController],
  providers: [
    DstService,
    FusionauthService,
    otpServiceFactory,
  ]
})
export class DstModule {}
