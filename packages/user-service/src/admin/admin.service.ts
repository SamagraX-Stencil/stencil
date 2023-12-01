import { Error, User, UUID } from '@fusionauth/typescript-client';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import {
  FusionAuthUserRegistration,
  ResponseCode,
  ResponseStatus,
  SignupResponse,
  UserRegistration,
  UsersResponse,
} from './admin.interface';
import { FusionauthService } from './fusionauth/fusionauth.service';
import { v4 as uuidv4 } from 'uuid';
import { HasuraService } from './hasura/hasura.service';
import { ConfigResolverService } from '../api/config.resolver.service';
import { HttpService } from '@nestjs/axios';

@Injectable()
export class AdminService {
  constructor(
      private readonly fusionAuthService: FusionauthService,
      private readonly configResolverService: ConfigResolverService,
      private readonly httpService: HttpService,
      private readonly hasuraService: HasuraService,
  ) {}

  async fetchUsers(req: any): Promise<UsersResponse> {
    const { total, users }: { total: number; users: Array<User> } =
        await this.fusionAuthService.getUsers(
            req.applicationId,
            req.startRow,
            req.numberOfResults,
        );
    const response: UsersResponse = new UsersResponse().init(uuidv4());
    if (users != null) {
      response.responseCode = ResponseCode.OK;
      response.params.status = ResponseStatus.success;
      response.result = { total, users };
    } else {
      response.responseCode = ResponseCode.FAILURE;
      response.params.status = ResponseStatus.failure;
      response.params.errMsg = 'No users found';
      response.params.err = 'NO_USERS_FOUND';
    }
    return response;
  }

  async fetchUsersByString(
      queryString: string,
      startRow: number,
      numberOfResults: number,
  ): Promise<UsersResponse> {
    const { total, users }: { total: number; users: Array<User> } =
        await this.fusionAuthService.getUsersByString(
            queryString,
            startRow,
            numberOfResults,
        );
    const response: UsersResponse = new UsersResponse().init(uuidv4());
    if (users != null) {
      response.responseCode = ResponseCode.OK;
      response.params.status = ResponseStatus.success;
      response.result = { total, users };
    } else {
      response.responseCode = ResponseCode.FAILURE;
      response.params.status = ResponseStatus.failure;
      response.params.errMsg = 'No users found';
      response.params.err = 'NO_USERS_FOUND';
    }
    return response;
  }

  async updatePassword(data: {loginId: string, password: string}): Promise<any> {
    return this.fusionAuthService.upddatePasswordWithLoginId(data);
  }

  async createUser(data: UserRegistration): Promise<SignupResponse> {
    const hasuraMutations: Array<{
      applicationId: UUID;
      mutation: string;
      // eslint-disable-next-line @typescript-eslint/ban-types
      payload: object;
    }> = data['hasuraMutations'] || [];
    delete data['hasuraMutations']; // delete the hasuraMutations key

    const { userId, user, err }: { userId: UUID; user: User; err: Error } =
      await this.fusionAuthService.createAndRegisterUser(data);
    if (userId == null || user == null) {
      throw new HttpException(err, HttpStatus.BAD_REQUEST);
    }

    // if there are hasuraMutations Array, we'll call Hasura APIs based on mapping
    for (const mutation of hasuraMutations) {
      // we'll add user_id to payload
      mutation.payload['user_id'] = userId;
      await this.hasuraService.query(
        mutation.applicationId,
        mutation.mutation,
        mutation.payload,
      );
    }

    const response: SignupResponse = new SignupResponse().init(uuidv4());
    response.result = user;
    return response;
  }

  async updateUser(userId: string, data: User): Promise<any> {
    const registrations: Array<FusionAuthUserRegistration> = data?.registrations
      ? data.registrations
      : [];
    delete data.registrations; // delete the registrations key

    const hasuraMutations: Array<{
      applicationId: UUID;
      mutation: string;
      // eslint-disable-next-line @typescript-eslint/ban-types
      payload: object;
    }> = data['hasuraMutations'] || [];
    delete data['hasuraMutations']; // delete the hasuraMutations key

    const { _userId, user, err }: { _userId: UUID; user: User; err: Error } =
      await this.fusionAuthService.updateUser(userId, { user: data });
    if (_userId == null || user == null) {
      throw new HttpException(err, HttpStatus.BAD_REQUEST);
    }

    // if there are registrations Array, we'll update the registrations too
    for (const registration of registrations) {
      await this.updateUserRegistration(userId, registration); // calling patch registration API
    }

    // if there are hasuraMutations Array, we'll call Hasura APIs based on mapping
    for (const mutation of hasuraMutations) {
      await this.hasuraService.query(
        mutation.applicationId,
        mutation.mutation,
        mutation.payload,
      );
    }

    // fetch the latest user info now & respond
    const userResponse = await this.fusionAuthService.getUserById(userId);
    const response: SignupResponse = new SignupResponse().init(uuidv4());
    response.result = userResponse.user;
    return response;
  }

  async updateUserRegistration(
    userId: UUID,
    data: FusionAuthUserRegistration,
  ): Promise<any> {
    const {
      _userId,
      registration,
      err,
    }: { _userId: UUID; registration: FusionAuthUserRegistration; err: Error } =
      await this.fusionAuthService.updateUserRegistration(userId, data);

    if (_userId == null || registration == null) {
      throw new HttpException(err, HttpStatus.BAD_REQUEST);
    }
    return registration;
  }

  async deactivateUserById(userId: string, hardDelete: boolean): Promise<any> {
    const activationResponse: { userId: UUID; err: Error } =
      await this.fusionAuthService.deactivateUserById(userId, hardDelete);
    if (activationResponse.userId == null) {
      throw new HttpException(activationResponse.err, HttpStatus.BAD_REQUEST);
    }

    // fetch the latest user info now & respond
    const userResponse = await this.fusionAuthService.getUserById(userId);
    const response: SignupResponse = new SignupResponse().init(uuidv4());
    response.result = userResponse.user;
    return response;
  }

  async activateUserById(userId: string): Promise<any> {
    const activationResponse: { userId: UUID; err: Error } =
      await this.fusionAuthService.activateUserById(userId);
    if (activationResponse.userId == null) {
      throw new HttpException(activationResponse.err, HttpStatus.BAD_REQUEST);
    }

    // fetch the latest user info now & respond
    const userResponse = await this.fusionAuthService.getUserById(userId);
    const response: SignupResponse = new SignupResponse().init(uuidv4());
    response.result = userResponse.user;
    return response;
  }
}
