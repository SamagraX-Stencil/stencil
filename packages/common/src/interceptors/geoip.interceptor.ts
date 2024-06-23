import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
  HttpStatus,
  InternalServerErrorException,
  HttpException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Observable } from 'rxjs';
import { HttpService } from '@nestjs/axios';

@Injectable()
export class GeoIPInterceptor implements NestInterceptor {
  private readonly httpService: HttpService;
  private readonly allowedCountries: string[];
  private readonly configService: ConfigService;
  private readonly logger : Logger;
  private readonly accessDeniedMessage: string;
  private readonly accessDeniedStatus: number;
  
  constructor(allowedCountries: string[], accessDeniedStatus: number = HttpStatus.FORBIDDEN) {
    this.logger = new Logger('GeoIPInterceptor');
    this.httpService = new HttpService();
    this.allowedCountries = allowedCountries;
    this.configService = new ConfigService();
    this.accessDeniedMessage = 'Access Denied'; 
    this.accessDeniedStatus = accessDeniedStatus;
  }

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();

    // Log all headers to see what is being received
    this.logger.log('Request Headers:', request.headers);

    // Extract IP address
    const clientIp = request.headers['request.ip'] || request.headers['x-forwarded-for'] || request.ip;
    this.logger.log('Using IP address for geolocation:', clientIp, 'from request:');

    try {
      // Call the geolocation service to get the country from the IP
      const { country, regionName } = await this.getLocation(clientIp);

      if (
        this.allowedCountries.length > 0 &&
        !this.allowedCountries.includes(country)
      ) {
        this.logger.error(
          'Denying request from IP: ' + clientIp + ' country: ' + country,
        );
        throw new HttpException(this.accessDeniedMessage, this.accessDeniedStatus);
      }

      this.logger.log(
        'Allowed request from IP: ' + clientIp + ' region: ' + regionName,
      );
    } catch (err) {
      this.logger.error('Error occurred while reading the geoip database', err);
      throw new InternalServerErrorException(
        'Error occurred while reading the geoip database',
      );
    }

    // Continue handling the request
    return next.handle();
  }

  private async getLocation(ip: string): Promise<any> {
    try {
      const geoIp = this.configService.get<string>('GEO_IP');
      const resp = await this.httpService.axiosRef.get(
        `http://geoip.samagra.io/city/${ip}`
      );
      return { country: resp.data.country, regionName: resp.data.regionName };
    } catch (err) {
      this.logger.error('Error occurred while reading the geoip database', err);
      throw new InternalServerErrorException(
        'Error occurred while reading the geoip database',
      );
    }
  }
}
