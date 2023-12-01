import { User, UUID } from '@fusionauth/typescript-client';
import { v4 as uuidv4 } from 'uuid';

export enum ResponseStatus {
    success = 'Success',
    failure = 'Failure',
  }
  
export enum ResponseCode {
    OK = 'OK',
    FAILURE = 'FAILURE',
}

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

export interface SignupResult {
    responseMsg?: string;
    accountStatus?: AccountStatus;
    data?: any;
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

export class SignupResponse implements IGenericResponse {
    id: string;
    ver: string;
    ts: Date;
    params: ResponseParams;
    responseCode: ResponseCode;
    result: SignupResult;

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
