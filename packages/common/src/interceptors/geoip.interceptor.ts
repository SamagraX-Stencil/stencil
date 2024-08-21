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
import axios from 'axios';
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
  private readonly configService: ConfigService;
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
    this.configService = new ConfigService();
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
  
    const clientIp =
      request.headers['ip'] ||
      request.ip ||
      request.headers['x-forwarded-for'];
  
    this.logger.verbose('Using IP address for geolocation:', clientIp);
  
    try {
      const location = await this.getLocation(clientIp);
      const { country, city, lat, lon } = location;
      console.log(country, city, lat, lon);
      console.log("a ");
      const isAllowedCountry = this.allowedCountries.length === 0 || this.allowedCountries.includes(country);
      const isAllowedCity = this.allowedCities.length === 0 || this.allowedCities.includes(city);
      const isAllowedCoordinate = this.allowedCoordinates.length === 0 || this.allowedCoordinates.some(coord => coord.lat === lat && coord.lon === lon);
      const isAllowedGeofence = this.allowedGeofences.length === 0 || this.isInGeofence(lat, lon);
      console.log(isAllowedCountry, isAllowedCity, isAllowedCoordinate, isAllowedGeofence);
      if (isAllowedCountry || isAllowedCity || isAllowedCoordinate || isAllowedGeofence) {
        this.logger.log(`Allowed request from IP: ${clientIp}, Country: ${country}, City: ${city}`);
      } else {
        this.denyRequest(clientIp, country, city);
      }
  
    } catch (err) {
      this.handleError(err);
    }
    return next.handle();
  }
  

  private denyRequest(ip: string, country: string, city: string): void {
    this.logger.error(
      `Denying request from IP: ${ip} country: ${country} city: ${city}`,
    );
    throw new HttpException(
      this.accessDeniedMessage,
      this.accessDeniedStatus,
    );
  }

  private handleError(err: any): void {
    if (err instanceof HttpException) {
      this.logger.error(
        `HttpException: ${err.message} with status code: ${err.getStatus()}`
      );
    } else {
      this.logger.error('Unexpected error: ', err.message);
      throw new InternalServerErrorException(
        'Error occurred while reading the geoip database',
      );
    }
  }

  private isInGeofence(lat: number, lon: number): boolean {
    return this.allowedGeofences.some(geofence => {
      const distance = getDistance(
        { latitude: lat, longitude: lon },
        { latitude: geofence.lat, longitude: geofence.lon }
      );
      return distance <= geofence.radius*1000;
    });
  }
  async getLocation(ip: string): Promise<any> {
    try {
      const response = await this.httpService.axiosRef.get(
        `http://geoip.samagra.io/city/${ip}`,
      );
      return response.data; 
    } catch (err) {
      throw new InternalServerErrorException(
        'Error occurred while reading the geoip database',
      );
    }
  }
}
