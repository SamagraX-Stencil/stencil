import { SMS, SMSResponse } from '../sms.interface';

import { Injectable } from '@nestjs/common';
import { SmsService } from '../sms.service';
import fetch from 'node-fetch';

@Injectable()
export class CdacService extends SmsService implements SMS {
  send(id: any): Promise<SMSResponse> {
    console.log(id);
    throw new Error('Method not implemented.');
  }

  track(id: any): Promise<SMSResponse> {
    console.log(id);
    throw new Error('Method not implemented.');
  }

  convertFromUnicodeToText = (message) => {
    let finalMessage = '';
    console.log(message);
    for (let i = 0; i < message.length; i++) {
      const ch = message.charCodeAt(i);
      const j = ch;
      const sss = '&#' + j + ';';
      finalMessage = finalMessage + sss;
    }
    return finalMessage;
  };

  sendSingleSMS = async (params) => {
    const url = `https://msdgweb.mgov.gov.in/esms/sendsmsrequest?`;
    const esc = encodeURIComponent;
    const query = Object.keys(params)
      .map((k) => esc(k) + '=' + esc(params[k]))
      .join('&');

    // console.log('Sending SMS now');
    // console.log(query);
    return fetch(url + query, {
      method: 'POST',
      timeout: 15000,
    })
      .then((r) => {
        // console.log('Request finished for: ');
        const text = r.text();
        return text;
      })
      .catch((e) => {
        console.log(e);
        return '498, ';
      });
  };

  parseSMSResponse = (response) => {
    // console.log(response);
    let s;
    // Case for error => 'ERROR : 406 Invalid mobile number\r\n'
    try {
      s = response.split(':');
      return {
        responseCode: parseInt(s[1].trim().split(' ')[0]),
        messageID: undefined,
      };
    } catch (e) {}

    // Case for normal response => '402,MsgID = 070820191565174573847hpgovt-hpssa\r\n'
    s = response.split(',');
    try {
      const messageID = s[1].split('=')[1].trim();
      return {
        responseCode: parseInt(s[0]),
        messageID: messageID,
      };
    } catch (e) {
      return {
        responseCode: parseInt(s[0]),
        messageID: undefined,
      };
    }
  };
}
