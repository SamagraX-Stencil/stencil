import { GeoIPInterceptor } from '../geoip.interceptor';
import {
  ExecutionContext,
  HttpStatus,
  CallHandler,
  HttpException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { Test, TestingModule } from '@nestjs/testing';
import { Observable, of } from 'rxjs';

describe('GeoIPInterceptor', () => {
  let geoIPInterceptor: GeoIPInterceptor;
  let httpService: HttpService;
  let logger: Logger;

  beforeEach(async () => {
    
    const allowedCountries = ['India'];
    const allowedCities = ['Mumbai'];
    const allowedCoordinates = [{ lat: 19.0760, lon: 72.8777 }];
    const allowedGeofences = [{ lat: 19.0760, lon: 72.8777, radius: 100 }];
    const mockHttpService = {
      axiosRef: {
        get: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: HttpService,
          useValue: mockHttpService,
        },
        ConfigService,
        {
          provide: Logger,
          useValue: {
            verbose: jest.fn(),
            error: jest.fn(),
            log: jest.fn(),
          },
        },
        {
          provide: GeoIPInterceptor,
          useFactory: () => new GeoIPInterceptor({
            countries: ['India', 'United States'],
            cities: ['Mumbai', 'New York'],
            coordinates: [{ lat: 35.6897, lon: 139.6895 }], // Tokyo
            geofences: [{ lat: 51.5074, lon: -0.1278, radius: 50 }], // London, UK
          }),
        },
      ],
    }).compile();

    geoIPInterceptor = module.get<GeoIPInterceptor>(GeoIPInterceptor);
    httpService = module.get<HttpService>(HttpService);
    logger = module.get<Logger>(Logger);
  });

  it('should be defined', () => {
    expect(geoIPInterceptor).toBeDefined();
  });

    it('should return the location data from the API for India', async () => {
      const geoData = { country: 'India', regionName: 'Maharashtra' };
      (httpService.axiosRef.get as jest.Mock).mockResolvedValueOnce({
        data: geoData,
      });

      const result = await geoIPInterceptor.getLocation('203.194.97.144');
      expect(result.country).toEqual(geoData.country);
      expect(result.regionName).toEqual(geoData.regionName);
    });

    it('should return the location data from the API for USA', async () => {
      const geoData = { country: 'United States', regionName: 'California' };
      (httpService.axiosRef.get as jest.Mock).mockResolvedValueOnce({
        data: geoData,
      });

      const result = await geoIPInterceptor.getLocation('104.166.80.160');
      expect(result.country).toEqual(geoData.country);
      expect(result.regionName).toEqual(geoData.regionName);
    });

    it('should throw an error if the API call fails', async () => {
      (httpService.axiosRef.get as jest.Mock).mockRejectedValueOnce(new Error());

      await expect(
        geoIPInterceptor.getLocation('127.0.0.1'),
      ).rejects.toThrow(InternalServerErrorException);
    });
});
