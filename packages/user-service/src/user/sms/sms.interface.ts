export enum TrackStatus {
  enqueued = 'enqueued',
  sent = 'send',
  delivered = 'delivered',
  error = 'error',
}

export enum SMSType {
  otp = 'otp',
  hsm = 'hsm',
}

export enum SMSResponseStatus {
  success = 'success',
  failure = 'failure',
}

export enum SMSProvider {
  gupshup = 'Gupshup',
  cdac = 'CDAC',
}

export type SMSError = {
  errorText: string;
  errorCode: string;
};

export type SMSData = {
  phone: string;
  template: any;
  params: any;
  type: SMSType;
};

export interface SMS {
  send(data: SMSData): Promise<SMSResponse>;
  track(data: SMSData): Promise<SMSResponse>;
}

/**
 * SMSResponse is the base generic response which can be extended to get OTPResponse, 2WayCommunication etc.
 * @interface SMSResponse
 */
export interface SMSResponse {
  /** @messageID {string} ID which can be used as a trackingID */
  messageID: string; //ProviderID

  /** @phone {string} Phone number to which the SMS was sent */
  phone: string;
  networkResponseCode: number;
  providerResponseCode: string;
  providerSuccessResponse: string;
  provider: SMSProvider;
  status: SMSResponseStatus;
  error: SMSError;
}

export interface OTPResponse extends SMSResponse {
  test: string;
}

export interface TrackResponse extends SMSResponse {
  test: string;
}
