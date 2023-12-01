import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotImplementedException,
} from '@nestjs/common';
import { ConfigResolverService } from '../../api/config.resolver.service';
import { UUID } from '@fusionauth/typescript-client';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom, map } from 'rxjs';

@Injectable()
export class HasuraService {
  protected readonly logger = new Logger(HasuraService.name); // logger instance

  constructor(
    private readonly configResolverService: ConfigResolverService,
    private readonly httpService: HttpService,
  ) {}

  // eslint-disable-next-line @typescript-eslint/ban-types
  async query(applicationId: UUID, mutationKey: string, payload: object) {
    const hasuraConfig = this.configResolverService.getHasura(applicationId);
    if (!hasuraConfig) {
      throw new NotImplementedException(
        `Hasura config not supported/implemented for application: ${applicationId}.`,
      );
    }

    const mutations = hasuraConfig.mutations;
    const mutation = mutations[mutationKey] || undefined;
    if (!mutation) {
      throw new NotImplementedException('Mutation not supported.');
    }
    this.logger.debug(
      `Running mutation for:-\n - mutationKey: ${mutationKey} \n - mutation: ${mutation} \n - payload: ${JSON.stringify(
        payload,
      )}`,
    );

    // we'll check all the keys in the payload; if there are any which aren't variables in mutation, we'll remove them
    for (const key in payload) {
      if (payload.hasOwnProperty(key) && !mutation.includes(`$${key}`)) {
        this.logger.debug(
          `Removing key $${key} as it is not there in the mutation.`,
        );
        delete payload[key];
      }
    }
    const data = {
      query: `${mutation}`,
      variables: payload,
    };

    const url = hasuraConfig.graphql_url;
    const headers = {
      'x-hasura-admin-secret': hasuraConfig.admin_secret,
      'Content-Type': 'application/json',
    };
    return await lastValueFrom(
      this.httpService
        .post(url, data, {
          headers: headers,
        })
        .pipe(
          map((res) => {
            if (res?.data?.errors) {
              // log the error globally & throw 500
              this.logger.error('GraphQl Errors:', JSON.stringify(res));
              throw new InternalServerErrorException(
                null,
                'Mutations failed to execute.',
              );
            }
            const response = res.status == 200 ? res.data : null;
            this.logger.verbose(`Mutation result: ${JSON.stringify(response)}`);
            return response;
          }),
        ),
    );
  }
}
