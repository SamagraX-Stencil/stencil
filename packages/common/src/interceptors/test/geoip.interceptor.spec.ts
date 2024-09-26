import { GeoIPInterceptor } from '../geoip.interceptor';
import { lastValueFrom } from 'rxjs';
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
          useFactory: () =>
            new GeoIPInterceptor({
              countries: ['India', 'United States'],
              cities: ['Mumbai', 'New York'],
              coordinates: [{ lat: 35.6897, lon: 139.6895 }], 
              geofences: [{ lat: 51.5074, lon: -0.1278, radius: 50 }],
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
    ).rejects.toThrow(HttpException);
  });

  it('should validate a correct IP address', () => {
    const validIp = '104.166.80.160';
    expect(geoIPInterceptor.isValidIp(validIp)).toBe(true);
  });

  it('should invalidate an incorrect IP address', () => {
    const invalidIp = '999.999.999.999';
    expect(geoIPInterceptor.isValidIp(invalidIp)).toBe(false);
    
  });

  it('should handle request with malformed IP', async () => {  
    const statusMock = jest.fn();
    const jsonMock = jest.fn();
  
    const context = {
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: () => ({ headers: { ip: 'not_an_ip' } }),
  
        getResponse: () => ({
          status: statusMock.mockReturnThis(), 
          json: jsonMock,
        }),
      }),
    };
  
  
    const next: CallHandler = {
      handle: jest.fn().mockReturnValue(of('allowed')),
    };
  
   await lastValueFrom(
      await geoIPInterceptor.intercept(context as unknown as ExecutionContext, next)
    )      
    expect(statusMock).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    expect(jsonMock).toHaveBeenCalledWith({
      statusCode: HttpStatus.BAD_REQUEST,
      message: 'Invalid IP address',
    });

  });

  it('should allow requests from allowed countries', async () => {
    const geoData = { country: 'India', regionName: 'Maharashtra' };
    (httpService.axiosRef.get as jest.Mock).mockResolvedValueOnce({
      data: geoData,
    });
    const statusMock = jest.fn();
    const jsonMock = jest.fn();


    const context = {
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: () => ({
          headers: { ip: '203.194.97.144' },
        }),
        getResponse: () => ({
          status: statusMock.mockReturnThis(), 
          json: jsonMock,
          }),
      }),
    };
  
    const next: CallHandler = {
      handle: jest.fn().mockReturnValue(of('allowed')),
    };
  
    const result = await lastValueFrom(
      await geoIPInterceptor.intercept(context as unknown as ExecutionContext, next)
    );
    expect(result).toEqual('allowed');
    expect(statusMock).toHaveBeenCalledWith(HttpStatus.OK);
    expect(jsonMock).toHaveBeenCalledWith({
      statusCode: HttpStatus.OK,
      message: 'Allowed request from IP: 203.194.97.144, Country: India, City: Mumbai',
    });
    expect(next.handle).toHaveBeenCalled();
  });
  

  it('should deny requests from disallowed countries', async () => {
    const geoData = { country: 'Canada', regionName: 'Ontario' };
    (httpService.axiosRef.get as jest.Mock).mockResolvedValueOnce({
      data: geoData,
    });
    const statusMock = jest.fn();
    const jsonMock = jest.fn();

  const context = {
    switchToHttp: jest.fn().mockReturnValue({
      getRequest: () => ({
        headers: { ip: '99.244.45.45' }, 
      }),
      getResponse: () => ({
        status: statusMock.mockReturnThis(), 
        json: jsonMock,
      }),
    }),
  };

  const next: CallHandler = {
    handle: jest.fn().mockReturnValue(of(null)), 
  };

   await lastValueFrom(
    await geoIPInterceptor.intercept(context as unknown as ExecutionContext, next)
  );  
    expect(statusMock).toHaveBeenCalledWith(HttpStatus.FORBIDDEN);
    expect(jsonMock).toHaveBeenCalledWith({
      statusCode: HttpStatus.FORBIDDEN,
      message: 'Access Denied',
    });

    });
  


  it('should allow requests from within the geofence', async () => {
    const geoData = { country: 'United Kingdom', city: 'London', lat: 51.5074, lon: -0.1278 };
  
    (httpService.axiosRef.get as jest.Mock).mockResolvedValueOnce({
      data: geoData,
    });
  
    const context = {
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: () => ({
          headers: { ip: '101.36.96.0' }, 
        }),
        getResponse: () => ({
          status: jest.fn().mockReturnThis(),
          json: jest.fn(),
        }),
      }),
    };

    const next: CallHandler = {
      handle: jest.fn().mockReturnValue(of('allowed')),
    };
    
    const result = await lastValueFrom(
      await geoIPInterceptor.intercept(context as unknown as ExecutionContext, next)
    );

    expect(result).toEqual('allowed');
    expect(next.handle).toHaveBeenCalled();

  });
  

  it('should deny requests from outside the geofence', async () => {
  
    const statusMock = jest.fn();
    const jsonMock = jest.fn();
  
    const context = {
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: () => ({ headers: { ip: '213.80.35.66' } }),
  
        getResponse: () => ({
          status: statusMock.mockReturnThis(), 
          json: jsonMock,
        }),
      }),
    };
  
    const next: CallHandler = {
      handle: jest.fn().mockReturnValue(of(null)), 
    };

     await lastValueFrom(
      await geoIPInterceptor.intercept(context as unknown as ExecutionContext, next)
    );  
      expect(statusMock).toHaveBeenCalledWith(HttpStatus.FORBIDDEN);
      expect(jsonMock).toHaveBeenCalledWith({
        statusCode: HttpStatus.FORBIDDEN,
        message: 'Access Denied',
      });
  });

  it('should log and handle unexpected errors without throwing', async () => {
  
    const statusMock = jest.fn();
    const jsonMock = jest.fn();
  
    const context = {
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: () => ({ headers: { ip: '203.0.113.0' } }),
  
        getResponse: () => ({
          status: statusMock.mockReturnThis(), 
          json: jsonMock,
        }),
      }),
    };
  
    const next: CallHandler = {
      handle: jest.fn().mockReturnValue(of(null)), 
    };

     await lastValueFrom(
      await geoIPInterceptor.intercept(context as unknown as ExecutionContext, next)
    );  
      expect(statusMock).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
      expect(jsonMock).toHaveBeenCalledWith({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Error occurred while reading the geoip database',
        });
    expect(next.handle).not.toHaveBeenCalled();
  });
  });
