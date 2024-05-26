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
import { Observable } from 'rxjs';
import { HttpService } from '@nestjs/axios';

@Injectable()
export class GeoIPInterceptor implements NestInterceptor {
  private readonly httpService: HttpService;
  private readonly allowedCountries: string[];

  constructor(allowedCountries: string[]) {
    this.httpService = new HttpService();
    this.allowedCountries = allowedCountries;
  }

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();
    const clientIp = request.headers['x-forwarded-for'] || request.ip; // Get client IP address

    // Call the geolocation service to get the country from the IP
    const { country, regionName } = await this.getLocation(clientIp);

    if (
      this.allowedCountries.length > 0 &&
      !this.allowedCountries.includes(country)
    ) {
      console.log(
        'Denying request from ip: ' + clientIp + ' country: ' + country,
      );
      throw new HttpException('Access Denied', HttpStatus.FORBIDDEN);
    }

    console.log(
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
      console.error('Error occured while reading the geoip database', err);
      throw new InternalServerErrorException(
        'Error occured while reading the geoip database',
      );
    }
  }
}
