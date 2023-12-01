import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ApiController } from './api.controller';
import { ApiService } from './api.service';
import { ConfigResolverService } from './config.resolver.service';
import { FusionauthService } from './fusionauth/fusionauth.service';
import { QueryGeneratorService } from './fusionauth/query-generator/query-generator.service';
import { OtpService } from './otp/otp.service';
import { GupshupService } from './sms/gupshup/gupshup.service';
import { SmsService } from './sms/sms.service';
import got from 'got/dist/source';
import { CdacService } from './sms/cdac/cdac.service';

const otpServiceFactory = {
  provide: OtpService,
  useFactory: (config: ConfigService) => {
    let factory;
    if (config.get<string>('SMS_ADAPTER_TYPE') == 'CDAC') {
      factory = {
        provide: 'OtpService',
        useFactory: () => {
          return new CdacService(config);
        },
        inject: [],
      }.useFactory();
    } else {
      factory = {
        provide: 'OtpService',
        useFactory: (username, password, baseUrl) => {
          return new GupshupService(
            username,
            password,
            baseUrl,
            got,
          );
        },
        inject: [],
      }.useFactory(config.get('GUPSHUP_USERNAME'), config.get('GUPSHUP_PASSWORD'), config.get('GUPSHUP_BASEURL'));
    }
    return new OtpService(factory);
  },
  inject: [ConfigService],
};

@Module({
  imports: [HttpModule, ConfigModule],
  controllers: [ApiController],
  providers: [
    ApiService,
    FusionauthService,
    SmsService,
    otpServiceFactory,
    QueryGeneratorService,
    ConfigResolverService,
  ],
})
export class ApiModule {
}
