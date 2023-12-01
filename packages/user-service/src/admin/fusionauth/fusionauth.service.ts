import FusionAuthClient, {
  LoginRequest,
  LoginResponse,
  RegistrationRequest,
  RegistrationResponse,
  SearchRequest,
  SearchResponse,
  Sort,
  UUID,
  User,
  UserRegistration,
  UserRequest,
  UserResponse,
  Error,
} from '@fusionauth/typescript-client';

import ClientResponse from '@fusionauth/typescript-client/build/src/ClientResponse';
import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { catchError, map } from 'rxjs';
import { QueryGeneratorService } from '../query-generator/query-generator.service';
import { FusionAuthUserRegistration } from '../admin.interface';

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
  ) {
    this.fusionauthClient = new FusionAuthClient(
      process.env.FUSIONAUTH_API_KEY,
      process.env.FUSIONAUTH_BASE_URL,
    );
  }

  getUser(
    username: string,
  ): Promise<{ statusFA: FAStatus; userId: UUID; user: User }> {
    return this.fusionauthClient
      .retrieveUserByUsername(username)
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
        this.logger.error(
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
    return this.fusionauthClient
      .searchUsersByQuery(searchRequest)
      .then(
        (
          response: ClientResponse<SearchResponse>,
        ): { total: number; users: Array<User> } => {
          this.logger.log('Found users');
          return {
            total: response.response.total,
            users: response.response.users,
          };
        },
      )
      .catch((e): { total: number; users: Array<User> } => {
        this.logger.error(
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
  ): Promise<{ total: number; users: Array<User> }> {
    let allowedApplicationIds: Array<string> = [
      process.env.FUSIONAUTH_APPLICATION_ID,
      process.env.FUSIONAUTH_SHIKSHA_SATHI_HP_APPLICATION_ID,
    ];
    if (
      process.env.FUSIONAUTH_ADMIN_SEARCH_APPLICATION_IDS &&
      JSON.parse(process.env.FUSIONAUTH_ADMIN_SEARCH_APPLICATION_IDS)
    ) {
      // if env has configured the variable FUSIONAUTH_ADMIN_SEARCH_APPLICATION_IDS & it's a valid JSON, we use the new list of search
      console.log('Dynamic search list found:');
      allowedApplicationIds = JSON.parse(
        process.env.FUSIONAUTH_ADMIN_SEARCH_APPLICATION_IDS,
      );
    }
    const searchRequest = {
      search: {
        numberOfResults: numberOfResults,
        query: this.queryGenService.queryUsersByApplicationIdAndQueryString(
          allowedApplicationIds,
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
    return this.fusionauthClient
      .searchUsersByQuery(searchRequest)
      .then(
        (
          response: ClientResponse<SearchResponse>,
        ): { total: number; users: Array<User> } => {
          this.logger.log('Found users');
          return {
            total: response.response.total,
            users: response.response.users,
          };
        },
      )
      .catch((e): { total: number; users: Array<User> } => {
        this.logger.error(`Could not fetch users`, JSON.stringify(e));
        return {
          total: 0,
          users: null,
        };
      });
  }

  updatePasswordWithUserId(
    userId: UUID,
    password: string,
  ): Promise<{ statusFA: FAStatus; userId: UUID }> {
    return this.fusionauthClient
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
        this.logger.error(JSON.stringify(response));
        return {
          statusFA: FAStatus.ERROR,
          userId: null,
        };
      });
  }

  delete(userId: UUID): Promise<any> {
    return this.fusionauthClient
      .deleteUser(userId)
      .then((response) => {
        this.logger.log(JSON.stringify(response));
      })
      .catch((e) => {
        this.logger.error(e);
      });
  }

  persist(authObj: any): Promise<{ statusFA: FAStatus; userId: UUID }> {
    this.logger.log(JSON.stringify(authObj));
    let resp;
    const registrations: Array<UserRegistration> = [];
    const currentRegistration: UserRegistration = {
      username: authObj.username,
      applicationId: process.env.FUSIONAUTH_APPLICATION_ID,
      roles: authObj.role,
    };
    const currentRegistration_samarth_hp: UserRegistration = {
      username: authObj.username,
      applicationId: process.env.FUSIONAUTH_SAMARTH_HP_APPLICATION_ID,
      roles: authObj.role,
    };
    registrations.push(currentRegistration);
    const userRequest: RegistrationRequest = {
      user: {
        active: true,
        data: {
          school: authObj.school,
          education: authObj.education,
          address: authObj.address,
          gender: authObj.gender,
          dateOfRetirement: authObj.dateOfRetirement,
          phoneVerified: false,
          udise: authObj.udise,
        },
        email: authObj.email,
        firstName: authObj.firstName,
        lastName: authObj.lastName,
        username: authObj.username,
        password: authObj.password,
        imageUrl: authObj.avatar,
        mobilePhone: authObj.phone,
      },
      registration: currentRegistration,
    };
    const userRequest_samarth_hp: RegistrationRequest = {
      registration: currentRegistration_samarth_hp,
    };
    resp = this.fusionauthClient
      .register(undefined, userRequest)
      .then(
        (
          response: ClientResponse<RegistrationResponse>,
        ): { statusFA: FAStatus; userId: UUID } => {
          this.fusionauthClient
            .register(response.response.user.id, userRequest_samarth_hp)
            .then((res: ClientResponse<RegistrationResponse>): any => {
              this.logger.log(JSON.stringify({ res }));
            })
            .catch((e): Promise<{ statusFA: FAStatus; userId: UUID }> => {
              this.logger.error(
                'Could not create a user in',
                JSON.stringify(e),
              );
              this.logger.error('Trying to fetch an existing user in');
              return this.fusionauthClient
                .retrieveUserByUsername(authObj.username)
                .then((response: ClientResponse<UserResponse>): any => {
                  this.logger.log('Found user in');
                })
                .catch((e): any => {
                  this.logger.error(
                    `Could not fetch user with username in ${authObj.username}`,
                    JSON.stringify(e),
                  );
                });
            });
          return {
            statusFA: FAStatus.SUCCESS,
            userId: response.response.user.id,
          };
        },
      )
      .catch((e): Promise<{ statusFA: FAStatus; userId: UUID }> => {
        this.logger.error('Could not create a user', JSON.stringify(e));
        this.logger.error('Trying to fetch an existing user');
        return this.fusionauthClient
          .retrieveUserByUsername(authObj.username)
          .then(
            (
              response: ClientResponse<UserResponse>,
            ): { statusFA: FAStatus; userId: UUID } => {
              this.logger.log('Found user');
              return {
                statusFA: FAStatus.USER_EXISTS,
                userId: response.response.user.id,
              };
            },
          )
          .catch((e): { statusFA: FAStatus; userId: UUID } => {
            this.logger.error(
              `Could not fetch user with username ${authObj.username}`,
              JSON.stringify(e),
            );
            return {
              statusFA: FAStatus.ERROR,
              userId: null,
            };
          });
      });
    return resp;
  }

  login(user: LoginRequest): Promise<ClientResponse<LoginResponse>> {
    this.logger.log(JSON.stringify(user));
    return this.fusionauthClient
      .login(user)
      .then((response: ClientResponse<LoginResponse>): any => {
        return response;
      })
      .catch((e) => {
        throw e;
      });
  }

  update(
    userID: UUID,
    authObj: any,
    isSimpleUpdate = false,
  ): Promise<{ statusFA: FAStatus; userId: UUID; fusionAuthUser: User }> {
    let userRequest: UserRequest;
    if (!isSimpleUpdate) {
      const registrations: Array<UserRegistration> = [];
      const currentRegistration: UserRegistration = {
        username: authObj.username,
        applicationId: process.env.FUSIONAUTH_APPLICATION_ID,
        roles: authObj.role,
      };
      registrations.push(currentRegistration);

      userRequest = {
        user: {
          active: true,
          data: {
            school: authObj.school,
            education: authObj.education,
            address: authObj.address,
            gender: authObj.gender,
            dateOfRetirement: authObj.dateOfRetirement,
            phoneVerified: false,
            udise: authObj.udise,
            phone: authObj.phone,
            accountName: authObj.firstName,
          },
          email: authObj.email,
          firstName: authObj.firstName,
          lastName: authObj.lastName,
          fullName: authObj.fullName,
          username: authObj.username,
          password: authObj.password,
          imageUrl: authObj.avatar,
          mobilePhone: authObj.phone,
        },
      };
    } else {
      userRequest = {
        user: authObj,
      };
    }

    return this.fusionauthClient
      .patchUser(userID, userRequest)
      .then(
        (
          response: ClientResponse<UserResponse>,
        ): { statusFA: FAStatus; userId: UUID; fusionAuthUser: User } => {
          this.logger.log(JSON.stringify({ response }));
          return {
            statusFA: FAStatus.SUCCESS,
            userId: response.response.user.id,
            fusionAuthUser: response.response.user,
          };
        },
      )
      .catch(
        (e): { statusFA: FAStatus; userId: UUID; fusionAuthUser: User } => {
          this.logger.error('Unable to update user', JSON.stringify(e));
          return {
            statusFA: FAStatus.ERROR,
            userId: null,
            fusionAuthUser: null,
          };
        },
      );
  }

  verifyUsernamePhoneCombination(): Promise<boolean> {
    return Promise.resolve(true);
  }

  //One time Task
  async updateAllEmptyRolesToSchool(): Promise<any> {
    let allDone = false;
    const searchRequest: SearchRequest = {
      search: {
        numberOfResults: 15,
        startRow: 0,
        sortFields: [
          {
            missing: '_first',
            name: 'id',
            order: Sort.asc,
          },
        ],
        query:
          '{"bool":{"must":[{"nested":{"path":"registrations","query":{"bool":{"must":[{"match":{"registrations.applicationId":"f0ddb3f6-091b-45e4-8c0f-889f89d4f5da"}}],"must_not":[{"match":{"registrations.roles":"school"}}]}}}}]}}',
      },
    };
    let iteration = 0;
    let invalidUsersCount = 0;
    while (!allDone) {
      iteration += 1;
      searchRequest.search.startRow = invalidUsersCount;
      const resp: ClientResponse<SearchResponse> =
        await this.fusionauthClient.searchUsersByQuery(searchRequest);
      const total = resp.response.total;
      if (total === 0) allDone = true;
      else {
        const users: Array<User> = resp.response.users;
        for (const user of users) {
          if (user.registrations[0].roles === undefined) {
            user.registrations[0].roles = ['school'];
            await this.fusionauthClient
              .updateRegistration(user.id, {
                registration: user.registrations[0],
              })
              .then((resp) => {
                this.logger.log('response', JSON.stringify(resp));
              })
              .catch((e) => {
                this.logger.error('error', JSON.stringify(e));
              });
          } else {
            this.logger.log('Invalid User', user.id);
            invalidUsersCount += 1;
          }
        }
      }
    }
  }

  async createAndRegisterUser(
    user: RegistrationRequest,
  ): Promise<{ userId: UUID; user: User; err: Error }> {
    return this.fusionauthClient
      .register(null, user)
      .then(
        (
          response: ClientResponse<RegistrationResponse>,
        ): { userId: UUID; user: User; err: Error } => {
          this.logger.log('Found user');
          return {
            userId: response.response.user.id,
            user: response.response.user,
            err: null,
          };
        },
      )
      .catch((e): { userId: UUID; user: User; err: Error } => {
        this.logger.error(`Could not create user ${user}`, JSON.stringify(e));
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
  ): Promise<{ _userId: UUID; user: User; err: Error }> {
    return this.fusionauthClient
      .patchUser(userId, user)
      .then(
        (
          response: ClientResponse<UserResponse>,
        ): { _userId: UUID; user: User; err: Error } => {
          this.logger.log('Found user');
          return {
            _userId: response.response.user.id,
            user: response.response.user,
            err: null,
          };
        },
      )
      .catch((e): { _userId: UUID; user: User; err: Error } => {
        this.logger.error(
          `Could not update user ${user.user.id}`,
          JSON.stringify(e),
        );
        return {
          _userId: null,
          user: null,
          err: e,
        };
      });
  }

  async upddatePasswordWithLoginId(data: {
    loginId: string;
    password: string;
  }): Promise<any> {
    return this.httpService
      .post(
        process.env.FUSIONAUTH_BASE_URL + '/api/user/change-password',
        {
          loginId: data.loginId,
          password: data.password,
        },
        {
          headers: {
            Authorization: process.env.FUSIONAUTH_API_KEY,
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

  async updateUserRegistration(
    userId: UUID,
    registration: FusionAuthUserRegistration,
  ): Promise<{
    _userId: UUID;
    registration: FusionAuthUserRegistration;
    err: Error;
  }> {
    return this.fusionauthClient
      .patchRegistration(userId, { registration: registration })
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

  async getUserById(
    userId: UUID,
  ): Promise<{ statusFA: FAStatus; userId: UUID; user: User }> {
    return this.fusionauthClient
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
  ): Promise<{ userId: UUID; err: Error }> {
    if (hardDelete) {
      return this.fusionauthClient
        .deleteUser(userId)
        .then(
          (response: ClientResponse<void>): { userId: UUID; err: Error } => {
            this.logger.log(response);
            return { userId: userId, err: null };
          },
        )
        .catch((e): { userId: UUID; err: Error } => {
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
    return this.fusionauthClient
      .deactivateUser(userId)
      .then((response: ClientResponse<void>): { userId: UUID; err: Error } => {
        this.logger.log(response);
        return { userId: userId, err: null };
      })
      .catch((e): { userId: UUID; err: Error } => {
        this.logger.error(`Could not update user ${userId}`, JSON.stringify(e));
        return {
          userId: null,
          err: e,
        };
      });
  }

  async activateUserById(
    userId: string,
  ): Promise<{ userId: UUID; err: Error }> {
    return this.fusionauthClient
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
        this.logger.error(`Could not update user ${userId}`, JSON.stringify(e));
        return {
          userId: null,
          err: e,
        };
      });
  }
}
