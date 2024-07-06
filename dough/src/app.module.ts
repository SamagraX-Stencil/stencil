import { Module } from '@nestjs/common';
import { FilesModule } from './files/files.module';
import databaseConfig from './config/database.config';
import authConfig from './config/auth.config';
import appConfig from './config/app.config';
import mailConfig from './config/mail.config';
import fileConfig from './config/file.config';
import facebookConfig from './config/facebook.config';
import googleConfig from './config/google.config';
import twitterConfig from './config/twitter.config';
import appleConfig from './config/apple.config';
import path from 'path';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { I18nModule } from 'nestjs-i18n/dist/i18n.module';
import { HeaderResolver } from 'nestjs-i18n';
import { MailModule } from './mail/mail.module';
import { HomeModule } from './home/home.module';
import { AllConfigType } from './config/config.type';
import { MailerModule } from './mailer/mailer.module';
import { PrismaService } from './prisma/prisma.service';
import { user } from '@techsavvyash/user-service';
import { HealthModule } from './health/health.module';
import {
  POSTGRES_SERVICE,
  SHADOWPOSTGRES_SERVICE,
  FUSIONAUTH_SERVICE,
  REDIS_SERVICE,
} from './health/health.constants';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [
        databaseConfig,
        authConfig,
        appConfig,
        mailConfig,
        fileConfig,
        facebookConfig,
        googleConfig,
        twitterConfig,
        appleConfig,
      ],
      envFilePath: ['.env'],
    }),
    I18nModule.forRootAsync({
      useFactory: (configService: ConfigService<AllConfigType>) => ({
        fallbackLanguage: configService.getOrThrow('app.fallbackLanguage', {
          infer: true,
        }),
        loaderOptions: { path: path.join(__dirname, '/i18n/'), watch: true },
      }),
      resolvers: [
        {
          use: HeaderResolver,
          useFactory: (configService: ConfigService<AllConfigType>) => {
            return [
              configService.get('app.headerLanguage', {
                infer: true,
              }),
            ];
          },
          inject: [ConfigService],
        },
      ],
      imports: [ConfigModule],
      inject: [ConfigService],
    }),
    FilesModule,
    MailModule,
    MailerModule,
    HomeModule,
    user.UserModule,
    HealthModule.forRoot([POSTGRES_SERVICE, SHADOWPOSTGRES_SERVICE, FUSIONAUTH_SERVICE, REDIS_SERVICE]),
  ],
  providers: [PrismaService],
})
export class AppModule {}
