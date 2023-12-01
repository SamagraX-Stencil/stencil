import { RegistrationRequest, User, UUID } from '@fusionauth/typescript-client';
import { SignupResult } from 'src/user/user.interface';
import { v4 as uuidv4 } from 'uuid';

export interface ApiConfig {
    host: string;
    apiKey?: string;
    encryption?: {
        enabled: boolean;
        key?: string;
    }
}

export enum ResponseStatus {
  success = 'Success',
  failure = 'Failure',
}

export enum ResponseCode {
  OK = 'OK',
  FAILURE = 'FAILURE',
}

/*
    Pending
*/
export enum AccountStatus {
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  DEACTIVATED = 'DEACTIVATED',
  REJECTED = 'REJECTED',
}

export interface ResponseParams {
  responseMsgId: UUID;
  msgId: UUID;
  err: string;
  status: ResponseStatus;
  errMsg: string;
  customMsg?: string;
}

export interface IGenericResponse {
  id: string;
  ver: string;
  ts: Date;
  params: ResponseParams;
  responseCode: ResponseCode;

  init(msgId: UUID): any;

  getSuccess(): any;
  getFailure(): any;
}

export interface Admin {
    responseMsg?: string;
    accountStatus?: AccountStatus;
    data?: any;
  }

  export interface UsersResult {
    total?: number;
    users?: Array<User>;
  }

  export class SignupResponse implements IGenericResponse {
    id: string;
    ver: string;
    ts: Date;
    params: ResponseParams;
    responseCode: ResponseCode;
    result: any;

    init(msgId: UUID): SignupResponse {
      this.responseCode = ResponseCode.OK;
      this.params = {
        responseMsgId: uuidv4(),
        msgId: msgId,
        err: '',
        status: ResponseStatus.success,
        errMsg: '',
      };
      this.ts = new Date();
      this.id = uuidv4();
      this.result = null;
      return this;
    }

    getSuccess() {
      throw new Error('Method not implemented.');
    }
    getFailure() {
      throw new Error('Method not implemented.');
    }
  }

  export class UsersResponse implements IGenericResponse {
    id: string;
    ver: string;
    ts: Date;
    params: ResponseParams;
    responseCode: ResponseCode;
    result: UsersResult | RefreshTokenResult;

    init(msgId: UUID): UsersResponse {
      this.responseCode = ResponseCode.OK;
      this.params = {
        responseMsgId: uuidv4(),
        msgId: msgId,
        err: '',
        status: ResponseStatus.success,
        errMsg: '',
      };
      this.ts = new Date();
      this.id = uuidv4();
      this.result = null;
      return this;
    }

    getSuccess() {
      throw new Error('Method not implemented.');
    }
    getFailure() {
      throw new Error('Method not implemented.');
    }
  }

export interface RefreshTokenResult {
  user: {
    token: string | null;
    refreshToken: string | null;
    tokenExpirationInstant?: number | null;
  };
}

export type UserRegistration = RegistrationRequest;
