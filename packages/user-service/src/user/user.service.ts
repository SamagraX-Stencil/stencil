import * as addressSchema from './schema/address.json';
import * as educationSchema from './schema/education.json';
import * as userSchema from './schema/user.json';
import {
  AccountStatus,
  ResponseCode,
  ResponseStatus,
  SignupResponse,
} from './user.interface';
import Ajv, { ErrorObject } from 'ajv';
import { FAStatus, FusionauthService } from './fusionauth/fusionauth.service';
import { LoginResponse, User, UUID } from '@fusionauth/typescript-client';

import { ChangePasswordDTO } from './dto/changePassword.dto';
import ClientResponse from '@fusionauth/typescript-client/build/src/ClientResponse';
import { Injectable } from '@nestjs/common';
import { OtpService } from './otp/otp.service';
import { SMSResponseStatus } from './sms/sms.interface';
import { UserDBService } from './user-db/user-db.service';
import { v4 as uuidv4 } from 'uuid';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const CryptoJS = require('crypto-js');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const AES = require('crypto-js/aes');

CryptoJS.lib.WordArray.words;

const encodedBase64Key = process.env.ENCRYPTION_KEY;
const parsedBase64Key =
  encodedBase64Key === undefined
    ? 'bla'
    : CryptoJS.enc.Base64.parse(encodedBase64Key);

// ajv.addSchema(educationSchema, 'education');
// ajv.addSchema(userSchema, 'user');

@Injectable()
export class UserService {
  ajv;

  createCopy = (obj) => JSON.parse(JSON.stringify(obj));
  dbKeys = [
    'userID',
    'school',
    'subjects',
    'employment',
    'joiningData',
    'approved',
    'cadre',
    'designation',
  ];

  constructor(
    private readonly userDBService: UserDBService,
    private readonly fusionAuthService: FusionauthService,
    private readonly otpService: OtpService,
  ) {
    this.ajv = new Ajv({ strict: false });
    this.ajv.addSchema(addressSchema, 'address');
    this.ajv.addSchema(educationSchema, 'education');
    this.ajv.addSchema(userSchema, 'user');
  }

  verifyUserObject(userData: any): {
    isValid: boolean;
    errors: null | ErrorObject[];
  } {
    const validate = this.ajv.compile(userSchema);
    const isValid = validate(userData);
    return { isValid, errors: validate.errors };
  }

  async signup(user: any): Promise<SignupResponse> {
    // Verify user
    const { isValid, errors } = this.verifyUserObject(user);
    const response: SignupResponse = new SignupResponse().init(uuidv4());

    const udise: string = user.request.school + '';
    const schoolValidity = await this.userDBService.getSchool(
      user.request.school,
    );

    if (!schoolValidity.status) {
      response.responseCode = ResponseCode.FAILURE;
      response.params.err = 'SIGNUP_DB_FAIL';
      response.params.errMsg = 'School does not exist';
      response.params.status = ResponseStatus.failure;
      return response;
    } else {
      user.request.school = schoolValidity.id;
    }

    if (isValid) {
      // Add teacher to FusionAuth
      const authObj = this.getAuthParams(user);
      authObj.school = user.request.school;
      authObj.udise = udise;
      const { statusFA, userId }: { statusFA: FAStatus; userId: UUID } =
        await this.fusionAuthService.persist(authObj);

      if (statusFA === FAStatus.USER_EXISTS) {
        response.responseCode = ResponseCode.FAILURE;
        response.params.err = 'SIGNUP_FA_FAIL';
        response.params.errMsg =
          'Seems like a user with the same username exists. Please try to log in if you have already account approved or try to create an account with your phone number as the username.';
        response.params.status = ResponseStatus.failure;
      } else {
        // Add teacher to DB
        const dbObj: any = this.getDBParams(user);
        dbObj.user_id = userId;

        //TODO: Remove hacks
        delete dbObj.userId;
        delete dbObj.approved;
        dbObj.joining_date = dbObj.joiningData;
        dbObj.role =
          user.request.role.indexOf('Principal') > -1 ? 'PRINCIPAL' : 'TEACHER';
        delete dbObj.joiningData;
        const d = await this.userDBService.persist(dbObj);
        const status: boolean = d.status;
        const errors: string = d.errors;

        if (status && statusFA === FAStatus.SUCCESS) {
          console.log('All good');
          // Update response with correct status - SUCCESS.
          response.result = {
            responseMsg: 'User Saved Successfully',
            accountStatus: AccountStatus.PENDING,
            data: {
              userId: userId,
            },
          };
        } else {
          await this.fusionAuthService.delete(userId);
          // Update response with correct status - ERROR.
          response.responseCode = ResponseCode.FAILURE;
          if (!status) {
            response.params.err = 'SIGNUP_DB_FAIL';
            response.params.errMsg = 'Something when wrong';
            response.params.status = ResponseStatus.failure;
            response.params.customMsg = errors;
          } else {
            response.params.err = 'SIGNUP_FA_FAIL';
            response.params.errMsg = 'Could not save in FusionAuth';
            response.params.status = ResponseStatus.failure;
          }
        }
      }
    } else {
      console.log(errors);
      response.responseCode = ResponseCode.FAILURE;
      response.params.err = 'INVALID_SCHEMA';
      response.params.errMsg =
        'Invalid Request :: ' + errors.map((err) => err.message).join(' \n ');
      response.params.status = ResponseStatus.failure;
    }
    return response;
  }

  async update(user: any): Promise<SignupResponse> {
    // Verify user
    const { isValid, errors } = this.verifyUserObject(user);
    const response: SignupResponse = new SignupResponse().init(uuidv4());
    const udise: string = user.request.school + '';

    delete user.request.password;
    const userID = user.request.userID;

    const schoolValidity = await this.userDBService.getSchool(
      user.request.school,
    );

    if (!schoolValidity.status) {
      response.responseCode = ResponseCode.FAILURE;
      response.params.err = 'UPDATE_DB_FAIL';
      response.params.errMsg = 'School does not exist';
      response.params.status = ResponseStatus.failure;
      return response;
    } else {
      user.request.school = schoolValidity.id;
    }

    if (isValid) {
      // Add teacher to FusionAuth
      const authObj = this.getAuthParams(user);
      authObj.school = user.request.school;
      authObj.udise = udise;
      const {
        statusFA,
        userId,
        fusionAuthUser,
      }: { statusFA: FAStatus; userId: UUID; fusionAuthUser: User } =
        await this.fusionAuthService.update(userID, authObj);

      if (UserService.isOldSchoolUser(fusionAuthUser)) {
        response.result = {
          responseMsg: 'User Updated Successfully',
          accountStatus: null,
          data: {
            user: {
              user: fusionAuthUser,
            },
            schoolResponse: null,
          },
        };
      } else {
        // Add teacher to DB
        const dbObj: any = this.getDBParams(user);
        dbObj.role =
          user.request.role.indexOf('Principal') > -1 ? 'PRINCIPAL' : 'TEACHER';
        dbObj.user_id = userId;

        //TODO: Remove hacks
        delete dbObj.userId;
        delete dbObj.approved;
        dbObj.joining_date = dbObj.joiningData;
        delete dbObj.joiningData;
        const d = await this.userDBService.update(dbObj);
        const status: boolean = d.status;
        const errors: string = d.errors;
        const userDBResponse: any = d.userDB;

        if (status && statusFA === FAStatus.SUCCESS) {
          console.log('All good');
          // Update response with correct status - SUCCESS.
          response.result = {
            responseMsg: 'User Updated Successfully',
            accountStatus: AccountStatus[userDBResponse.account_status],
            data: {
              user: {
                user: fusionAuthUser,
              },
              schoolResponse: JSON.parse(userDBResponse),
            },
          };
        } else {
          // Update response with correct status - ERROR.
          response.responseCode = ResponseCode.FAILURE;
          if (!status) {
            response.params.err = 'SIGNUP_DB_FAIL';
            response.params.errMsg = 'Something when wrong';
            response.params.status = ResponseStatus.failure;
            response.params.customMsg = errors;
          } else {
            response.params.err = 'SIGNUP_FA_FAIL';
            response.params.errMsg = 'Could not save in FusionAuth';
            response.params.status = ResponseStatus.failure;
          }
        }
      }
    } else {
      console.log(errors);
      response.responseCode = ResponseCode.FAILURE;
      response.params.err = 'INVALID_SCHEMA';
      response.params.errMsg =
        'Invalid Request :: ' + errors.map((err) => err.message).join(' \n ');
      response.params.status = ResponseStatus.failure;
    }
    return response;
  }

  async login(user: any): Promise<SignupResponse> {
    return this.fusionAuthService
      .login(user)
      .then(async (resp: ClientResponse<LoginResponse>) => {
        let fusionAuthUser: any = resp.response;
        if (fusionAuthUser.user === undefined) {
          fusionAuthUser = fusionAuthUser.loginResponse.successResponse;
        }
        if (
          fusionAuthUser.user.registrations.filter((registration) => {
            return registration.applicationId == user.applicationId;
          }).length == 0
        ) {
          // User is not registered in the requested application. Let's throw error.
          const response: SignupResponse = new SignupResponse().init(uuidv4());
          response.responseCode = ResponseCode.FAILURE;
          response.params.err = 'INVALID_REGISTRATION';
          response.params.errMsg =
            'User registration not found in the given application.';
          response.params.status = ResponseStatus.failure;
          return response;
        }
        if (fusionAuthUser?.user?.data?.accountName === undefined) {
          if (fusionAuthUser?.user?.fullName == undefined) {
            if (fusionAuthUser?.user?.firstName === undefined) {
              if (!fusionAuthUser.user.data) {
                fusionAuthUser.user.data = {};
              }
              fusionAuthUser['user']['data']['accountName'] = this.decrypt(
                user.loginId,
              );
            } else {
              if (!fusionAuthUser.user.data) {
                fusionAuthUser.user.data = {};
              }
              fusionAuthUser['user']['data']['accountName'] =
                fusionAuthUser.user.firstName;
            }
          } else {
            if (!fusionAuthUser.user.data) {
              fusionAuthUser.user.data = {};
            }
            fusionAuthUser['user']['data']['accountName'] =
              fusionAuthUser.user.fullName;
          }
        }
        if (UserService.isOldSchoolUser(fusionAuthUser.user)) {
          //updateUserData with school and udise
          fusionAuthUser.user.data = {};
          const udise = fusionAuthUser.user.username;
          fusionAuthUser.user.data.udise = udise;
          const schoolId = await this.userDBService.getSchool(udise);
          fusionAuthUser.user.data.school = schoolId.id;
          await this.fusionAuthService.update(
            fusionAuthUser.user.id,
            fusionAuthUser.user,
            true,
          );

          //login again to get new JWT
          fusionAuthUser = (await this.fusionAuthService.login(user)).response;
          if (fusionAuthUser.user === undefined) {
            fusionAuthUser = fusionAuthUser.loginResponse.successResponse;
          }
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
        } else {
          return this.userDBService
            .getUserById(fusionAuthUser.user.id)
            .then((userDBResponse) => userDBResponse.results[0])
            .then((userDBResponse): SignupResponse => {
              if (!userDBResponse) {
                //Admin User
                const response: SignupResponse = new SignupResponse().init(
                  uuidv4(),
                );
                response.responseCode = ResponseCode.OK;
                response.result = {
                  responseMsg: 'Successful Logged In',
                  accountStatus: AccountStatus.ACTIVE,
                  data: {
                    user: fusionAuthUser,
                  },
                };
                return response;
              } else {
                const response: SignupResponse = new SignupResponse().init(
                  uuidv4(),
                );
                if (userDBResponse.account_status !== 'ACTIVE') {
                  delete fusionAuthUser.refreshToken;
                  delete fusionAuthUser.token;
                  response.responseCode = ResponseCode.OK;
                  response.result = {
                    responseMsg: 'Successful Logged In',
                    accountStatus:
                      AccountStatus[userDBResponse?.account_status],
                    data: {
                      user: fusionAuthUser,
                      schoolResponse: userDBResponse,
                    },
                  };
                } else {
                  response.responseCode = ResponseCode.OK;
                  response.result = {
                    responseMsg: 'Successful Logged In',
                    accountStatus:
                      AccountStatus[userDBResponse?.account_status],
                    data: {
                      user: fusionAuthUser,
                      schoolResponse: userDBResponse,
                    },
                  };
                }
                return response;
              }
            })
            .catch((e: ClientResponse<LoginResponse>): SignupResponse => {
              console.log(e);
              const response: SignupResponse = new SignupResponse().init(
                uuidv4(),
              );
              response.responseCode = ResponseCode.FAILURE;
              response.params.err = 'UNCAUGHT_EXCEPTION';
              response.params.errMsg = 'Server Failure';
              response.params.status = ResponseStatus.failure;
              return response;
            });
        }
      })
      .catch((errorResponse: ClientResponse<LoginResponse>): SignupResponse => {
        console.log(errorResponse);
        const response: SignupResponse = new SignupResponse().init(uuidv4());
        if (errorResponse.statusCode === 404) {
          response.responseCode = ResponseCode.FAILURE;
          response.params.err = 'INVALID_USERNAME_PASSWORD';
          response.params.errMsg = 'Invalid Username/Password';
          response.params.status = ResponseStatus.failure;
        } else {
          response.responseCode = ResponseCode.FAILURE;
          response.params.err = 'UNCAUGHT_EXCEPTION';
          response.params.errMsg = 'Server Failure';
          response.params.status = ResponseStatus.failure;
        }
        return response;
      });
  }

  async changePassword(data: ChangePasswordDTO): Promise<SignupResponse> {
    // Verify OTP
    const {
      statusFA,
      userId,
      user,
    }: { statusFA: FAStatus; userId: UUID; user: User } =
      await this.fusionAuthService.getUser(data.username);
    const response: SignupResponse = new SignupResponse().init(uuidv4());
    if (statusFA === FAStatus.USER_EXISTS) {
      const verifyOTPResult = await this.otpService.verifyOTP({
        phone: user.mobilePhone,
        otp: data.OTP,
      });

      if (verifyOTPResult.status === SMSResponseStatus.success) {
        const result = await this.fusionAuthService.updatePassword(
          userId,
          data.password,
        );

        if (result.statusFA == FAStatus.SUCCESS) {
          response.result = {
            responseMsg: 'Password updated successfully',
          };
          response.responseCode = ResponseCode.OK;
          response.params.status = ResponseStatus.success;
        } else {
          response.responseCode = ResponseCode.FAILURE;
          response.params.err = 'UNCAUGHT_EXCEPTION';
          response.params.errMsg = 'Server Error';
          response.params.status = ResponseStatus.failure;
        }
      } else {
        response.responseCode = ResponseCode.FAILURE;
        response.params.err = 'INVALID_OTP_USERNAME_PAIR';
        response.params.errMsg = 'OTP and Username did not match.';
        response.params.status = ResponseStatus.failure;
      }
    } else {
      response.responseCode = ResponseCode.FAILURE;
      response.params.err = 'INVALID_USERNAME';
      response.params.errMsg = 'No user with this Username exists';
      response.params.status = ResponseStatus.failure;
    }
    return response;
  }

  async changePasswordOTP(username: string): Promise<SignupResponse> {
    // Get Phone No from username
    const {
      statusFA,
      userId,
      user,
    }: { statusFA: FAStatus; userId: UUID; user: User } =
      await this.fusionAuthService.getUser(username);
    const response: SignupResponse = new SignupResponse().init(uuidv4());
    // If phone number is valid => Send OTP
    if (statusFA === FAStatus.USER_EXISTS) {
      const re = /^[6-9]{1}[0-9]{9}$/;
      if (re.test(user.mobilePhone)) {
        const result = await this.otpService.sendOTP(user.mobilePhone);
        response.result = {
          data: result,
          responseMsg: `OTP has been sent to ${user.mobilePhone}.`,
        };
        response.responseCode = ResponseCode.OK;
        response.params.status = ResponseStatus.success;
      } else {
        response.responseCode = ResponseCode.FAILURE;
        response.params.err = 'INVALID_PHONE_NUMBER';
        response.params.errMsg = 'Invalid Phone number';
        response.params.status = ResponseStatus.failure;
      }
    } else {
      response.responseCode = ResponseCode.FAILURE;
      response.params.err = 'INVALID_USERNAME';
      response.params.errMsg = 'No user with this Username exists';
      response.params.status = ResponseStatus.failure;
    }
    return response;
  }

  private static isOldSchoolUser(fusionAuthUser: User) {
    let registration = null;
    for (const r of fusionAuthUser.registrations) {
      // we'll check and only proceed if the user belongs to respective application
      if (r.applicationId == process.env.FUSIONAUTH_APPLICATION_ID) {
        registration = r
        break;
      }
    }

    return (registration &&
      registration.roles === undefined ||
      (registration &&
        registration.roles?.length === 1 &&
        registration.roles.indexOf('school') > -1)
    );
  }

  getAuthParams(user: any) {
    const userCopy = this.createCopy(user).request;
    for (let i = 0; i < this.dbKeys.length; i++) {
      delete userCopy[this.dbKeys[i]];
    }
    return userCopy;
  }

  getDBParams(user: any): any {
    const userCopy = {};
    for (let i = 0; i < this.dbKeys.length; i++) {
      userCopy[this.dbKeys[i]] = user.request[this.dbKeys[i]];
    }
    return userCopy;
  }

  encrypt(plainString: any): any {
    return AES.encrypt(plainString, parsedBase64Key, {
      mode: CryptoJS.mode.ECB,
    }).toString();
  }

  decrypt(encryptedString: any): any {
    return AES.decrypt(encryptedString, parsedBase64Key, {
      mode: CryptoJS.mode.ECB,
    }).toString(CryptoJS.enc.Utf8);
  }
}
