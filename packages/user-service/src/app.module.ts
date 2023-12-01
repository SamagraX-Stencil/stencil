import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';

import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CdacService } from './user/sms/cdac/cdac.service';
import { ConfigModule } from '@nestjs/config';
import { FusionauthService } from './user/fusionauth/fusionauth.service';
import { GupshupService } from './user/sms/gupshup/gupshup.service';
import { Module } from '@nestjs/common';
import { OtpService } from './user/otp/otp.service';
import { UserDBService } from './user/user-db/user-db.service';
import { UserModule } from './user/user.module';
import { AdminModule } from './admin/admin.module';
import { DstModule } from './dst/dst.module';
import { AuthModule } from './auth/auth.module';
import { ApiModule } from './api/api.module';
import got from 'got/dist/source';
import { TerminusModule } from '@nestjs/terminus';

const gupshupFactory = {
  provide: 'GupshupService',
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
  provide: 'OtpService',
  useFactory: () => {
    return new OtpService(gupshupFactory.useFactory());
  },
  inject: [],
};

@Module({
  imports: [
    ConfigModule.forRoot(),
    UserModule,
    ThrottlerModule.forRoot({
      ttl: parseInt(process.env.RATE_LIMIT_TTL), //Seconds
      limit: parseInt(process.env.RATE_LIMIT), //Number of requests per TTL from a single IP
    }),
    AdminModule,
    DstModule,
    AuthModule,
    ApiModule,
    TerminusModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    FusionauthService,
    gupshupFactory,
    otpServiceFactory,
    {
      provide: 'SmsService',
      useClass: CdacService,
    },
    UserDBService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
