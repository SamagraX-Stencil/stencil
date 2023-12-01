import FusionAuthClient, {
  LoginRequest,
  LoginResponse,
  RegistrationRequest,
  RegistrationResponse,
  SearchResponse,
  Sort,
  UUID,
  User,
  UserRequest,
  UserResponse,
  Error,
  JWTRefreshResponse,
} from '@fusionauth/typescript-client';

import ClientResponse from '@fusionauth/typescript-client/build/src/ClientResponse';
import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { catchError, map } from 'rxjs';
import { QueryGeneratorService } from './query-generator/query-generator.service';
import { ConfigResolverService } from '../config.resolver.service';
import { RefreshRequest } from '@fusionauth/typescript-client/build/src/FusionAuthClient';
import { RefreshTokenResult } from '../api.interface';
import { FusionAuthUserRegistration } from '../../admin/admin.interface';
import * as Sentry from '@sentry/node';

export enum FAStatus {
  SUCCESS = 'SUCCESS',
  USER_EXISTS = 'USER_EXISTS',
  ERROR = 'ERROR',
}

@Injectable()
export class FusionauthService {
  fusionauthClient: FusionAuthClient;
  protected readonly logger = new Logger(FusionauthService.name); // logger instance

  constructor(
    private readonly httpService: HttpService,
    private readonly queryGenService: QueryGeneratorService,
    private configResolverService: ConfigResolverService,
  ) {
    this.fusionauthClient = new FusionAuthClient(
      process.env.FUSIONAUTH_API_KEY,
      process.env.FUSIONAUTH_BASE_URL,
    );
  }

  getClient(apiKey: string, host: string): FusionAuthClient {
    return new FusionAuthClient(apiKey, host);
  }

  /**
   * Returns the FA client for the given applicationId &/or authHeader
   * @param applicationId
   * @param authHeader
   */
  getClientForApplicationId(
    applicationId: UUID,
    authHeader: null | string,
  ): FusionAuthClient {
    let apiKey = this.configResolverService.getApiKey(applicationId);
    if (authHeader != null) {
      apiKey = authHeader;
    }
    const host = this.configResolverService.getHost(applicationId);
    return this.getClient(apiKey, host);
  }

  getUser(
    username: string,
    applicationId: UUID,
    authHeader: null | string,
  ): Promise<{ statusFA: FAStatus; userId: UUID; user: User }> {
    return this.getClientForApplicationId(applicationId, authHeader)
      .retrieveUserByUsername(username)
      .then(
        (
          response: ClientResponse<UserResponse>,
        ): { statusFA: FAStatus; userId: UUID; user: User } => {
          console.log('Found user');
          return {
            statusFA: FAStatus.USER_EXISTS,
            userId: response.response.user.id,
            user: response.response.user,
          };
        },
      )
      .catch((e): { statusFA: FAStatus; userId: UUID; user: User } => {
        Sentry.captureException(e, {
          user: {
            username: username,
            applicationId: applicationId,
          }
        });
        console.log(
          `Could not fetch user with username ${username}`,
          JSON.stringify(e),
        );
        return {
          statusFA: FAStatus.ERROR,
          userId: null,
          user: null,
        };
      });
  }

  getUsers(
    applicationId: string,
    startRow: number,
    numberOfResults: number,
    authHeader: string,
  ): Promise<{ total: number; users: Array<User> }> {
    const searchRequest = {
      search: {
        numberOfResults: numberOfResults,
        query: this.queryGenService.queryUsersByApplicationId(applicationId),
        sortFields: [
          {
            missing: 'username',
            name: 'fullName',
            order: Sort.asc,
          },
        ],
        startRow: startRow,
      },
    };
    let apiKey = this.configResolverService.getApiKey(applicationId);
    if (authHeader != null) {
      apiKey = authHeader;
    }
    const host = this.configResolverService.getHost(applicationId);
    const fusionauthClient = this.getClient(apiKey, host);
    return fusionauthClient
      .searchUsersByQuery(searchRequest)
      .then(
        (
          response: ClientResponse<SearchResponse>,
        ): { total: number; users: Array<User> } => {
          console.log('Found users');
          return {
            total: response.response.total,
            users: response.response.users,
          };
        },
      )
      .catch((e): { total: number; users: Array<User> } => {
        Sentry.captureException(e, {
          user: {
            applicationId: applicationId
          }
        });
        console.log(
          `Could not fetch users for applicationId ${applicationId}`,
          JSON.stringify(e),
        );
        return {
          total: 0,
          users: null,
        };
      });
  }

  getUsersByString(
    queryString: string,
    startRow: number,
    numberOfResults: number,
    applicationId: string,
    authHeader?: string,
  ): Promise<{ total: number; users: Array<User> }> {
    const searchRequest = {
      search: {
        numberOfResults: numberOfResults,
        query: this.queryGenService.queryUsersByApplicationIdAndQueryString(
          [applicationId],
          queryString,
        ),
        sortFields: [
          {
            missing: 'username',
            name: 'fullName',
            order: Sort.asc,
          },
        ],
        startRow: startRow,
      },
    };
    let apiKey = this.configResolverService.getApiKey(applicationId);
    if (authHeader != null) {
      apiKey = authHeader;
    }
    const host = this.configResolverService.getHost(applicationId);
    const fusionauthClient = this.getClient(apiKey, host);
    return fusionauthClient
      .searchUsersByQuery(searchRequest)
      .then(
        (
          response: ClientResponse<SearchResponse>,
        ): { total: number; users: Array<User> } => {
          console.log('Found users');
          return {
            total: response.response.total,
            users: response.response.users,
          };
        },
      )
      .catch((e): { total: number; users: Array<User> } => {
        Sentry.captureException(e, {
          user: {
            applicationId: applicationId
          }
        });
        console.log(`Could not fetch users`, JSON.stringify(e));
        return {
          total: 0,
          users: null,
        };
      });
  }

  login(
    user: LoginRequest,
    authHeader: string,
  ): Promise<ClientResponse<LoginResponse>> {
    let apiKey = this.configResolverService.getApiKey(user.applicationId);
    if (authHeader != null) {
      apiKey = authHeader;
    }
    const host = this.configResolverService.getHost(user.applicationId);
    const fusionauthClient = this.getClient(apiKey, host);
    return fusionauthClient
      .login(user)
      .then((response: ClientResponse<LoginResponse>): any => {
        return response;
      })
      .catch((e) => {
        throw e;
      });
  }

  async createAndRegisterUser(
    user: RegistrationRequest,
    applicationId: string,
    authHeader: string,
  ): Promise<{ userId: UUID; user: User; err: Error }> {
    let apiKey = this.configResolverService.getApiKey(applicationId);
    if (authHeader != null) {
      apiKey = authHeader;
    }
    const host = this.configResolverService.getHost(applicationId);
    const fusionauthClient = this.getClient(apiKey, host);
    return fusionauthClient
      .register(null, user)
      .then(
        (
          response: ClientResponse<RegistrationResponse>,
        ): { userId: UUID; user: User; err: Error } => {
          console.log('Found user');
          return {
            userId: response.response.user.id,
            user: response.response.user,
            err: null,
          };
        },
      )
      .catch((e): { userId: UUID; user: User; err: Error } => {
        Sentry.captureException(e, {
          user: {
            applicationId: applicationId,
            username: user.user.username,
            user: user
          }
        });
        console.log(`Could not create user ${user}`, JSON.stringify(e));
        return {
          userId: null,
          user: null,
          err: e,
        };
      });
  }

  async updateUser(
    userId: string,
    user: UserRequest,
    applicationId: string,
    authHeader?: string,
  ): Promise<{ _userId: UUID; user: User; err: Error }> {
    let apiKey = this.configResolverService.getApiKey(applicationId);
    if (authHeader != null) {
      apiKey = authHeader;
    }
    const host = this.configResolverService.getHost(applicationId);
    const fusionauthClient = this.getClient(apiKey, host);
    return fusionauthClient
      .patchUser(userId, user)
      .then(
        (
          response: ClientResponse<UserResponse>,
        ): { _userId: UUID; user: User; err: Error } => {
          console.log('Found user');
          return {
            _userId: response.response.user.id,
            user: response.response.user,
            err: null,
          };
        },
      )
      .catch((e): { _userId: UUID; user: User; err: Error } => {
        Sentry.captureException(e, {
          user: {
            id: userId,
            applicationId: applicationId,
            user: user,
            username: user.user.username,
          }
        });
        console.log(`Could not update user ${user.user.id}`, JSON.stringify(e));
        return {
          _userId: null,
          user: null,
          err: e,
        };
      });
  }

  async updatePasswordWithLoginId(
    data: { loginId: string; password: string },
    applicationId: string,
    authHeader?: string,
  ): Promise<any> {
    let apiKey = this.configResolverService.getApiKey(applicationId);
    if (authHeader != null) {
      apiKey = authHeader;
    }
    const host = this.configResolverService.getHost(applicationId);
    return this.httpService
      .post(
        host + '/api/user/change-password',
        {
          loginId: data.loginId,
          password: data.password,
        },
        {
          headers: {
            Authorization: apiKey,
            'Content-Type': 'application/json',
          },
        },
      )
      .pipe(
        map((response) =>
          response.status === 200
            ? { msg: 'Password changed successfully' }
            : { msg: 'Password cannot be changed' },
        ),
        catchError((e) => {
          throw new HttpException(
            { error: e.response.data },
            HttpStatus.BAD_REQUEST,
          );
        }),
      );
  }

  async refreshToken(
    applicationId: string,
    refreshRequest: RefreshRequest,
    authHeader?: string,
  ): Promise<RefreshTokenResult> {
    let apiKey = this.configResolverService.getApiKey(applicationId);
    if (authHeader != null) {
      apiKey = authHeader;
    }
    const host = this.configResolverService.getHost(applicationId);
    const fusionauthClient = this.getClient(apiKey, host);
    return fusionauthClient
      .exchangeRefreshTokenForJWT(refreshRequest)
      .then((response: ClientResponse<JWTRefreshResponse>) => {
        const token: string = response.response.token;
        const decodedToken = JSON.parse(
          Buffer.from(token.split('.')[1], 'base64').toString(),
        );
        return {
          user: {
            token: token,
            refreshToken: response.response.refreshToken,
            tokenExpirationInstant: decodedToken.exp * 1000, // convert to milli second same as login api
          },
        };
      })
      .catch((e): RefreshTokenResult => {
        Sentry.captureException(e, {
          user: {
            applicationId: applicationId
          }
        });
        console.log(`Could not update token`, JSON.stringify(e));
        return {
          user: {
            token: null,
            refreshToken: null,
            tokenExpirationInstant: null,
          },
        };
      });
  }

  async getUserById(
    userId: UUID,
    applicationId,
    authHeader?: string,
  ): Promise<{ statusFA: FAStatus; userId: UUID; user: User }> {
    let apiKey = this.configResolverService.getApiKey(applicationId);
    if (authHeader != null) {
      apiKey = authHeader;
    }
    const host = this.configResolverService.getHost(applicationId);
    const fusionauthClient = this.getClient(apiKey, host);
    return fusionauthClient
      .retrieveUser(userId)
      .then(
        (
          response: ClientResponse<UserResponse>,
        ): { statusFA: FAStatus; userId: UUID; user: User } => {
          this.logger.log('Found user');
          return {
            statusFA: FAStatus.USER_EXISTS,
            userId: response.response.user.id,
            user: response.response.user,
          };
        },
      )
      .catch((e): { statusFA: FAStatus; userId: UUID; user: User } => {
        Sentry.captureException(e, {
          user: {
            id: userId,
            applicationId: applicationId
          }
        });
        this.logger.error(
          `Could not fetch user with user id ${userId}`,
          JSON.stringify(e),
        );
        return {
          statusFA: FAStatus.ERROR,
          userId: null,
          user: null,
        };
      });
  }

  async deactivateUserById(
    userId: string,
    hardDelete: boolean,
    applicationId,
    authHeader?: string,
  ): Promise<{ userId: UUID; err: Error }> {
    let apiKey = this.configResolverService.getApiKey(applicationId);
    if (authHeader != null) {
      apiKey = authHeader;
    }
    const host = this.configResolverService.getHost(applicationId);
    const fusionauthClient = this.getClient(apiKey, host);
    if (hardDelete) {
      return fusionauthClient
        .deleteUser(userId)
        .then(
          (response: ClientResponse<void>): { userId: UUID; err: Error } => {
            this.logger.log(response);
            return { userId: userId, err: null };
          },
        )
        .catch((e): { userId: UUID; err: Error } => {
          Sentry.captureException(e, {
            user: {
              id: userId,
              applicationId: applicationId
            }
          });
          this.logger.error(
            `Could not update user ${userId}`,
            JSON.stringify(e),
          );
          return {
            userId: null,
            err: e,
          };
        });
    }
    return fusionauthClient
      .deactivateUser(userId)
      .then((response: ClientResponse<void>): { userId: UUID; err: Error } => {
        this.logger.log(response);
        return { userId: userId, err: null };
      })
      .catch((e): { userId: UUID; err: Error } => {
        Sentry.captureException(e, {
          user: {
            id: userId,
            applicationId: applicationId
          }
        });
        this.logger.error(`Could not update user ${userId}`, JSON.stringify(e));
        return {
          userId: null,
          err: e,
        };
      });
  }

  async activateUserById(
    userId: string,
    applicationId,
    authHeader?: string,
  ): Promise<{ userId: UUID; err: Error }> {
    let apiKey = this.configResolverService.getApiKey(applicationId);
    if (authHeader != null) {
      apiKey = authHeader;
    }
    const host = this.configResolverService.getHost(applicationId);
    const fusionauthClient = this.getClient(apiKey, host);
    return fusionauthClient
      .reactivateUser(userId)
      .then(
        (
          response: ClientResponse<UserResponse>,
        ): { userId: UUID; err: Error } => {
          this.logger.log(response);
          return { userId: userId, err: null };
        },
      )
      .catch((e): { userId: UUID; err: Error } => {
        Sentry.captureException(e, {
          user: {
            id: userId,
            applicationId: applicationId
          }
        });
        this.logger.error(`Could not update user ${userId}`, JSON.stringify(e));
        return {
          userId: null,
          err: e,
        };
      });
  }

  updatePassword(
    userId: UUID,
    password: string,
    applicationId,
    authHeader?: null | string,
  ): Promise<{ statusFA: FAStatus; userId: UUID }> {
    return this.getClientForApplicationId(applicationId, authHeader)
      .patchUser(userId, {
        user: {
          password: password,
        },
      })
      .then((response) => {
        return {
          statusFA: FAStatus.SUCCESS,
          userId: response.response.user.id,
        };
      })
      .catch((response) => {
        Sentry.captureException(response, {
          user: {
            id: userId,
            applicationId: applicationId
          }
        });
        console.log(JSON.stringify(response));
        return {
          statusFA: FAStatus.ERROR,
          userId: null,
        };
      });
  }

  async updateUserRegistration(
    applicationId: UUID,
    authHeader: null | string,
    userId: UUID,
    registration: FusionAuthUserRegistration,
  ): Promise<{
    _userId: UUID;
    registration: FusionAuthUserRegistration;
    err: Error;
  }> {
    const client = this.getClientForApplicationId(applicationId, authHeader);
    let callback;
    if (registration['id'] === null) {
      callback = client.register(userId, { registration: registration });
    } else {
      callback = client.patchRegistration(userId, { registration: registration });
    }
    return callback
      .then(
        (
          response: ClientResponse<RegistrationResponse>,
        ): {
          _userId: UUID;
          registration: FusionAuthUserRegistration;
          err: Error;
        } => {
          this.logger.log('Found user');
          this.logger.log(JSON.stringify(response));
          return {
            _userId: userId,
            registration: response.response.registration,
            err: null,
          };
        },
      )
      .catch(
        (
          e,
        ): {
          _userId: UUID;
          registration: FusionAuthUserRegistration;
          err: Error;
        } => {
          Sentry.captureException(e, {
            user: {
              id: userId,
              applicationId: applicationId,
              registration: registration
            }
          });
          this.logger.error(
            `Could not update user ${userId}`,
            JSON.stringify(e),
          );
          return {
            _userId: null,
            registration: null,
            err: e,
          };
        },
      );
  }
}
