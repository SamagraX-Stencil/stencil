import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import { Observable, of } from 'rxjs';
import { HttpService } from '@nestjs/axios';
import { getDistance } from 'geolib';

interface GeoIPOptions {
  countries?: string[];
  cities?: string[];
  coordinates?: { lat: number; lon: number }[];
  geofences?: { lat: number; lon: number; radius: number }[];
  accessDeniedMessage?: string;
  accessDeniedStatus?: number;
}

@Injectable()
export class GeoIPInterceptor implements NestInterceptor {
  private readonly httpService: HttpService;
  private readonly logger: Logger;
  private readonly allowedCountries: string[];
  private readonly allowedCities: string[];
  private readonly allowedCoordinates: { lat: number; lon: number }[];
  private readonly allowedGeofences: { lat: number; lon: number; radius: number }[];
  private readonly accessDeniedMessage: string;
  private readonly accessDeniedStatus: number;

  constructor({
    countries = ['India'],
    cities = [],
    coordinates = [],
    geofences = [],
    accessDeniedMessage = 'Access Denied',
    accessDeniedStatus = HttpStatus.FORBIDDEN,
  }: GeoIPOptions) {
    this.logger = new Logger('GeoIPInterceptor');
    this.httpService = new HttpService();
    this.allowedCountries = countries;
    this.allowedCities = cities;
    this.allowedCoordinates = coordinates;
    this.allowedGeofences = geofences;
    this.accessDeniedMessage = accessDeniedMessage;
    this.accessDeniedStatus = accessDeniedStatus;
  }

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    const clientIp = request.headers['ip'];
    if(clientIp === undefined) {
      response.status(HttpStatus.BAD_REQUEST).json({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'No IP address found',
      });
      throw new Error('No IP address found');
    }
    if (!this.isValidIp(clientIp.trim())) {
      response.status(HttpStatus.BAD_REQUEST).json({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Invalid IP address',
      });
      throw new Error('Invalid IP address');
    }
    this.logger.verbose(`Using IP address for geolocation: ${clientIp}`);

    try {
      const location = await this.getLocation(clientIp);
      const { country, city, lat, lon } = location;
      const isAllowedCountry = this.allowedCountries.length === 0 || this.allowedCountries.includes(country);
      const isAllowedCity = this.allowedCities.length === 0 || this.allowedCities.includes(city);
      const isAllowedCoordinate = this.allowedCoordinates.length === 0 || this.allowedCoordinates.some(coord => coord.lat === lat && coord.lon === lon);
      const isAllowedGeofence = this.allowedGeofences.length === 0 || this.isInGeofence(lat, lon);

      if (isAllowedCountry || isAllowedCity || isAllowedCoordinate || isAllowedGeofence) {
        this.logger.log(`Allowed request from IP: ${clientIp}, Country: ${country}, City: ${city}`);
        if (request.path === '/') {
          response.status(HttpStatus.OK).json({
            statusCode: HttpStatus.OK,
            message: `Allowed request from IP: ${clientIp}, Country: ${country}, City: ${city}`,
          });
          return of(null);
        }
        return next.handle(); 
      } else {
        this.logger.error(`Denying request from IP: ${clientIp}, Country: ${country}, City: ${city}`);
        response.status(this.accessDeniedStatus).json({
          statusCode: this.accessDeniedStatus,
          message: this.accessDeniedMessage,
        });
        return of(null); 
      }
    } catch (err) {
      this.handleError(err, response);
    }
  }

  private handleError(err: any, response: any): void {
    if (err instanceof HttpException) {
      this.logger.error(`HttpException: ${err.message} with status code: ${err.getStatus()}`);
      response.status(err.getStatus()).json({
        statusCode: err.getStatus(),
        message: err.message,
      });
    } else {
      this.logger.error(`Unexpected error: ${err.message}`);
      response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Error occurred while processing the request',
      });
    }
  }

  private isInGeofence(lat: number, lon: number): boolean {
    return this.allowedGeofences.some(geofence => {
      const distance = getDistance(
        { latitude: lat, longitude: lon },
        { latitude: geofence.lat, longitude: geofence.lon },
      );
      return distance <= geofence.radius * 1000;
    });
  }

   async getLocation(ip: string): Promise<any> {
    try {
      const response = await this.httpService.axiosRef.get(`http://geoip.samagra.io/city/${ip}`);
      return response.data;
    } catch (err) {
      this.logger.error(`Error occurred while reading the geoip database: ${err.message}`);
      throw new HttpException(
        'Error occurred while reading the geoip database',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  private isValidIp(ip: string): boolean {
    const ipv4Regex = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    const ipv6Regex = /^([0-9a-fA-F]{1,4}:){7}([0-9a-fA-F]{1,4}|:)$/;

    return ipv4Regex.test(ip) || ipv6Regex.test(ip);
  }
  
}
