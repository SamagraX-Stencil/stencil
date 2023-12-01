import {
  SMSData,
  SMSResponse,
  SMSType,
  TrackStatus,
} from '../sms/sms.interface';

import { Injectable } from '@nestjs/common';
import { SmsService } from '../sms/sms.service';

@Injectable()
export class OtpService {
  expiry: number = parseInt(process.env.OTP_EXPIRY);

  constructor(private readonly smsService: SmsService) {}

  verifyOTP({ phone, otp }): Promise<SMSResponse> {
    const smsData: SMSData = {
      phone,
      template: null,
      type: SMSType.otp,
      params: {
        otp,
        expiry: this.expiry,
      },
    };
    return this.smsService.track(smsData);
  }

  sendOTP(phone): Promise<SMSResponse> {
    const smsData: SMSData = {
      phone,
      template: null,
      type: SMSType.otp,
      params: {
        expiry: this.expiry,
      },
    };
    return this.smsService.send(smsData);
  }

  static generateOtp() {
    return Math.floor(1000 + Math.random() * 9000);
  }
}
