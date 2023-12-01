import { SMS, SMSData, SMSResponse, TrackStatus } from './sms.interface';

import { Injectable } from '@nestjs/common';

@Injectable()
export class SmsService implements SMS {
  send(data: SMSData): Promise<SMSResponse> {
    console.error(data);
    throw new Error('Placeholder:: Method not implemented.');
  }

  track(data: any): Promise<SMSResponse> {
    console.error(data);
    throw new Error('Placeholder:: Method not implemented.');
  }
}
