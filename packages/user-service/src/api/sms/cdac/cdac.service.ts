import {
  OTPResponse,
  SMS,
  SMSData,
  SMSError,
  SMSProvider,
  SMSResponse,
  SMSResponseStatus,
  SMSType,
  TrackResponse,
} from '../sms.interface';

import { HttpException, Injectable } from '@nestjs/common';
import { SmsService } from '../sms.service';
import { ConfigService } from '@nestjs/config';
import got, {Got} from 'got';
import * as speakeasy from 'speakeasy';
import * as Sentry from '@sentry/node';

@Injectable()
export class CdacService extends SmsService implements SMS {
  baseURL: string;
  path = '';
  data: SMSData;
  httpClient: Got;

  constructor(
    private configService: ConfigService,
  ) {
    super();
    this.baseURL = configService.get<string>('CDAC_SERVICE_URL');
    this.httpClient = got;
  }

  send(data: SMSData): Promise<SMSResponse> {
    if (!data) {
      throw new Error('Data cannot be empty');
    }
    this.data = data;
    if (this.data.type === SMSType.otp) return this.doOTPRequest(data);
    else return this.doRequest();
  }

  track(data: SMSData): Promise<SMSResponse> {
    if (!data) {
      throw new Error('Data cannot be null');
    }
    this.data = data;
    if (this.data.type === SMSType.otp) return this.verifyOTP(data);
    else return this.doRequest();
  }

  private getTotpSecret(phone): string {
    return `${this.configService.get<string>('SMS_TOTP_SECRET')}${phone}`
  }

  private doOTPRequest(data: SMSData): Promise<any> {
    let otp = '';
    try {
      otp = speakeasy.totp({
        secret: this.getTotpSecret(data.phone),
        encoding: 'base32',
        step: this.configService.get<string>('SMS_TOTP_EXPIRY'),
      });
    } catch (error) {
      Sentry.captureException(error, {
        user: {
          username: data.phone
        }
      });
      throw new HttpException('TOTP generation failed!', 500);
    }

    const payload = this.configService.get<string>('CDAC_OTP_TEMPLATE')
      .replace('%phone%', data.phone)
      .replace('%code%', otp + '');
    const params = new URLSearchParams({
      message: payload,
      mobileNumber: data.phone,
      templateid: this.configService.get<string>('CDAC_OTP_TEMPLATE_ID'),
    });
    this.path = '/api/send_otp_sms'
    const url = `${this.baseURL}${this.path}?${params.toString()}`;

    const status: OTPResponse = {} as OTPResponse;
    status.provider = SMSProvider.cdac;
    status.phone = data.phone;

    // noinspection DuplicatedCode
    return this.httpClient.get(url, {})
      .then((response): OTPResponse => {
        status.networkResponseCode = 200;
        const r = this.parseResponse(response.body);
        status.messageID = r.messageID;
        status.error = r.error;
        status.providerResponseCode = r.providerResponseCode;
        status.providerSuccessResponse = r.providerSuccessResponse;
        status.status = r.status;
        return status;
      })
      .catch((e: Error): OTPResponse => {
        Sentry.captureException(e, {
          user: {
            username: data.phone
          }
        });
        const error: SMSError = {
          errorText: `Uncaught Exception :: ${e.message}`,
          errorCode: 'CUSTOM ERROR',
        };
        status.networkResponseCode = 200;
        status.messageID = null;
        status.error = error;
        status.providerResponseCode = null;
        status.providerSuccessResponse = null;
        status.status = SMSResponseStatus.failure;
        return status;
      });
  }

  doRequest(): Promise<SMSResponse> {
    throw new Error('Method not implemented.');
  }

  parseResponse(response: string) {
    try {
      const responseCode: string = response.slice(0, 3);
      if (responseCode === '402') {
        return {
          providerResponseCode: null,
          status: SMSResponseStatus.success,
          messageID: response.slice(12, -1),
          error: null,
          providerSuccessResponse: null,
        };
      } else {
        const error: SMSError = {
          errorText: 'CDAC Error',
          errorCode: responseCode,
        };
        return {
          providerResponseCode: responseCode,
          status: SMSResponseStatus.failure,
          messageID: null,
          error,
          providerSuccessResponse: null,
        };
      }
    } catch (e) {
      Sentry.captureException(e);
      const error: SMSError = {
        errorText: `CDAC response could not be parsed :: ${e.message}; Provider Response - ${response}`,
        errorCode: 'CUSTOM ERROR',
      };
      return {
        providerResponseCode: null,
        status: SMSResponseStatus.failure,
        messageID: null,
        error,
        providerSuccessResponse: null,
      };
    }
  }

  verifyOTP(data: SMSData): Promise<TrackResponse> {
    if(
      process.env.ALLOW_DEFAULT_OTP === 'true' &&
      process.env.DEFAULT_OTP_USERS
    ){
      if(JSON.parse(process.env.DEFAULT_OTP_USERS).indexOf(data.phone)!=-1){
        if(data.params.otp == process.env.DEFAULT_OTP) {
          return new Promise(resolve => {
            const status: TrackResponse = {} as TrackResponse;
            status.provider = SMSProvider.cdac;
            status.phone = data.phone;
            status.networkResponseCode = 200;
            status.messageID = Date.now() + '';
            status.error = null;
            status.providerResponseCode = null;
            status.providerSuccessResponse = 'OTP matched.';
            status.status = SMSResponseStatus.success;
            resolve(status);
          });
        }
      }
    }

    let verified = false;
    try {
      verified = speakeasy.totp.verify({
        secret: this.getTotpSecret(data.phone),
        encoding: 'base32',
        token: data.params.otp,
        step: this.configService.get<string>('SMS_TOTP_EXPIRY'),
      });
      if (verified) {
        return new Promise(resolve => {
          const status: TrackResponse = {} as TrackResponse;
          status.provider = SMSProvider.cdac;
          status.phone = data.phone;
          status.messageID = '';
          status.error = null;
          status.providerResponseCode = null;
          status.providerSuccessResponse = null;
          status.status = SMSResponseStatus.success;
          resolve(status);
        });
      } else {
        return new Promise(resolve => {
          const status: TrackResponse = {} as TrackResponse;
          status.provider = SMSProvider.cdac;
          status.phone = data.phone;
          status.networkResponseCode = 200;
          status.messageID = '';
          status.error = {
            errorText: 'Invalid or expired OTP.',
            errorCode: '400'
          };
          status.providerResponseCode = '400';
          status.providerSuccessResponse = null;
          status.status = SMSResponseStatus.failure;
          resolve(status);
        });
      }
    } catch(error) {
      throw new HttpException(error, 500);
    }
  }
}
