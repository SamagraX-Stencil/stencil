import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpStatus,
  InternalServerErrorException,
  HttpException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { HttpService } from '@nestjs/axios';
import { StencilLogger } from '../services/logger.service';

@Injectable()
export class GeoIPInterceptor implements NestInterceptor {
  private logger: StencilLogger;
  private readonly httpService: HttpService;

  constructor() {
    this.logger = new StencilLogger('GeoIPInterceptor');
    this.httpService = new HttpService();
  }

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();
    const clientIp = request.headers['x-forwarded-for'] || request.ip; // Get client IP address

    // Call the geolocation service to get the country from the IP
    const { country, regionName } = await this.getLocation(clientIp);

    if (country !== 'India') {
      this.logger.verbose(
        'Denying request from ip: ' + clientIp + ' country: ' + country,
      );
      throw new HttpException('Access Denied', HttpStatus.FORBIDDEN);
    }

    this.logger.verbose(
      'Allowed request from ip: ' + clientIp + ' region: ' + regionName,
    );
    return next.handle();
  }

  private async getLocation(ip: any): Promise<any> {
    try {
      const resp = await this.httpService.axiosRef.get(
        `https://geoip.samagra.io/city/${ip}`,
      );
      return { country: resp.data.country, regionName: resp.data.regionName };
    } catch (err) {
      this.logger.error('Error occured while reading the geoip database', err);
      throw new InternalServerErrorException(
        'Error occured while reading the geoip database',
      );
    }
  }
}
