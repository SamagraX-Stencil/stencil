import { HttpService } from '@nestjs/axios';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ResponseCode, ResponseStatus, SignupResponse } from './dst.interface';
import { FAStatus, FusionauthService } from './fusionauth/fusionauth.service';
import { v4 as uuidv4 } from 'uuid';
import { firstValueFrom, map } from 'rxjs';
import { SMSResponse, SMSResponseStatus } from './sms/sms.interface';
import { UsersResponse } from 'src/user/user.interface';
import { User, UUID } from '@fusionauth/typescript-client';

@Injectable()
export class DstService {
  expiry: number = parseInt(process.env.OTP_EXPIRY);
  constructor(
    private readonly fusionAuthService: FusionauthService,
    private readonly httpService: HttpService,
  ) {}

  async createUser(data: any): Promise<any> {
    const url = process.env.FUSIONAUTH_OLD_BASE_URL + '/api/user/registration';
    return firstValueFrom(
      this.httpService
        .post(url, data, {
          headers: {
            Authorization: process.env.FUSIONAUTH_OLD_API_KEY,
            'Content-Type': 'application/json',
          },
        })
        .pipe(map((response) => response.data)),
    );
  }

  async updatePassword(data: any): Promise<any> {
    return firstValueFrom(
      this.httpService
        .post(
          process.env.FUSIONAUTH_OLD_BASE_URL + '/api/user/change-password',
          {
            loginId: data.loginId,
            password: data.password,
          },
          {
            headers: {
              Authorization: process.env.FUSIONAUTH_OLD_API_KEY,
              'Content-Type': 'application/json',
            },
          },
        )
        .pipe(map((response) => (response.status === 200 ? true : false))),
    );
  }

  async login(user: any): Promise<SignupResponse> {
    let fusionAuthUser = (await this.fusionAuthService.login(user)).response;
    // if (fusionAuthUser.user === undefined) {
    //     console.log("Here")
    //     fusionAuthUser = fusionAuthUser.loginResponse.successResponse;
    // }
    const response: SignupResponse = new SignupResponse().init(uuidv4());
    response.responseCode = ResponseCode.OK;
    response.result = {
      responseMsg: 'Successful Logged In',
      accountStatus: null,
      data: {
        user: fusionAuthUser,
        schoolResponse: null,
      },
    };
    return response;
  }

  async verifyAndLoginOTP({ phone, status, role }): Promise<SignupResponse> {
    const response: SignupResponse = new SignupResponse().init(uuidv4());
    if (status === SMSResponseStatus.success || status === SMSResponseStatus.failure) {
      const url = process.env.FUSIONAUTH_OLD_BASE_URL + '/api/user';
      const { statusFA, userId, user }: { statusFA: FAStatus; userId: UUID; user: User } = await this.fusionAuthService.getUser(phone);
      if (statusFA === FAStatus.ERROR) {
        throw new HttpException(
          `Error loggin in: ${phone} is not a valid user.`,
          HttpStatus.BAD_REQUEST,
        );
      } else {
        const userRoles: string[] =
          user.registrations[0].roles;
        if (userRoles.indexOf(role) > -1) {
          let password = uuidv4();
          const passwordStatus = await this.updatePassword({
            loginId: phone,
            password: password,
          }).catch((e) => {
            console.log(e.response.data);
            response.params.err = 'ERROR_PASSWORD_RESET';
            response.params.errMsg =
              'Error Logging In. Please try again later.';
            response.params.status = ResponseStatus.failure;
          });
          if (passwordStatus) {
            const loginResponse: SignupResponse = await this.login({
              loginId: phone,
              password: password,
              applicationId: process.env.FUSIONAUTH_DST_APPLICATION_ID,
            });
            const loginRole: string[] =
              loginResponse.result.data.user.user.registrations[0].roles;
            if (loginRole.indexOf(role) > -1) {
              return loginResponse;
            } else {
              throw new HttpException(
                `Error in logging in: Role Mismatch`,
                HttpStatus.BAD_REQUEST,
              );
            }
          } else {
            response.params.err = 'INVALID_LOGIN';
            response.params.errMsg =
              'Error Logging In. Please try again later.';
            response.params.status = ResponseStatus.failure;
          }
        } else {
          throw new HttpException(
            `Error in logging in: Role Mismatch`,
            HttpStatus.BAD_REQUEST,
          );
        }
      }
    } else {
      response.params.err = 'INVALID_OTP_ERROR';
      response.params.errMsg = 'OTP incorrect';
      response.params.status = ResponseStatus.failure;
    }
    return response;
  }

  async transformOtpResponse(status: SMSResponse): Promise<SignupResponse> {
    console.log({ status });

    const response: SignupResponse = new SignupResponse().init(uuidv4());
    response.responseCode = ResponseCode.OK;
    response.params.status =
      status.status === SMSResponseStatus.failure
        ? ResponseStatus.failure
        : ResponseStatus.success;
    response.params.errMsg = status.error == null ? '' : status.error.errorText;
    response.params.err = status.error == null ? '' : status.error.errorCode;
    const result = {
      responseMsg: status.status,
      accountStatus: null,
      data: {
        phone: status.phone,
        networkResponseCode: status.networkResponseCode,
        providerResponseCode: status.providerResponseCode,
        provider: status.provider,
      },
    };
    response.result = result;
    return response;
  }

  async loginTrainee({ id, dob, role }): Promise<SignupResponse> {
    const response: SignupResponse = new SignupResponse().init(uuidv4());
    let password = uuidv4();
    const data = {
      registration: {
        applicationId: process.env.FUSIONAUTH_DST_APPLICATION_ID,
        preferredLanguages: ['en'],
        roles: [role],
        timezone: 'Asia/Kolkata',
        username: id,
        usernameStatus: 'ACTIVE',
      },
      user: {
        birthDate: dob,
        preferredLanguages: ['en'],
        timezone: 'Asia/Kolkata',
        usernameStatus: 'ACTIVE',
        username: id,
        password: password,
      },
    };
    const { statusFA, userId, user }: { statusFA: FAStatus; userId: UUID; user: User } = await this.fusionAuthService.getUser(id);
    if (statusFA === FAStatus.ERROR) {
      const userDb: string[] = await this.checkUserInDb(id);
      if (userDb.length > 0) {
        if (userDb[0]['DOB'] === dob) {
          const trainee = await this.createUser(data).catch((e) => {
            console.log(e.response.data);
            return e.response.data.fieldErrors['user.username']['code'];
          });
          return this.login({
            loginId: id,
            password: password,
            applicationId: process.env.FUSIONAUTH_DST_APPLICATION_ID,
          });
        } else {
          throw new HttpException(
            `Error loggin in: dob mismatch for ${id}`,
            HttpStatus.BAD_REQUEST,
          );
        }
      } else {
        throw new HttpException(
          `Error loggin in: ${id} not found. Please verify again`,
          HttpStatus.BAD_REQUEST,
        );
      }
    } else {
      const birthDate = user.birthDate;
      const userRoles = user.registrations[0].roles;
      if(birthDate === dob && (userRoles).indexOf(role)> -1){
        
      }
      else{
        throw new HttpException(birthDate===dob?"Error in logging in: Role Mismatch":((userRoles).indexOf(role)> -1?"Error in logging in: DOB Mismatch":"Error logging in: Role and DOB Mismatch"), HttpStatus.BAD_REQUEST);
      }
      const passwordStatus = await this.updatePassword({
        loginId: id,
        password: password,
      }).catch((e) => {
        console.log(e.response.data);
        response.params.err = 'ERROR_PASSWORD_RESET';
        response.params.errMsg = 'Error Logging In. Please try again later.';
        response.params.status = ResponseStatus.failure;
      });
      if (passwordStatus) {
        const loginResponse: SignupResponse = await this.login({
          loginId: id,
          password: password,
          applicationId: process.env.FUSIONAUTH_DST_APPLICATION_ID,
        });
        const loginRole: string[] =
          loginResponse.result.data.user.user.registrations[0].roles;
        if (loginRole.indexOf(role) > -1) {
          return loginResponse;
        } else {
          throw new HttpException(
            `Error in logging in: Role Mismatch`,
            HttpStatus.BAD_REQUEST,
          );
        }
      } else {
        response.params.err = 'INVALID_LOGIN';
        response.params.errMsg = 'Error Logging In. Please try again later.';
        response.params.status = ResponseStatus.failure;
      }
    }
    return response;
  }

  async checkUserInDb(id: number): Promise<any> {
    const url = process.env.DST_HASURA_HOST;
    let body = `query MyQuery {
      trainee(where: {registrationNumber: {_eq: ${id}}}){
        DOB
      }
    }`;
    return firstValueFrom(
      this.httpService
        .post(url, JSON.stringify({ query: body }), {
          headers: {
            'x-hasura-admin-secret': process.env.DST_HASURA_SECRET,
            'Content-Type': 'application/json',
          },
        })
        .pipe(map((response) => response.data.data.trainee)),
    );
  }
}
