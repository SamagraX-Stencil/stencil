// src/geoip.interceptor.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, HttpStatus } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module'; // Import your AppModule or the module you are testing
import { GeoIPInterceptor } from '@samagra-x/stencil'; // Import the interceptor
import exp from 'constants';

describe('GeoIPInterceptor E2E', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalInterceptors(new GeoIPInterceptor({
      countries: ['India', 'United States'],
      cities: ['Mumbai', 'New York'],
      coordinates: [{ lat: 35.6897, lon: 139.6895 }], // Tokyo
      geofences: [{ lat: 51.5074, lon: -0.1278, radius: 50 }], // London, UK
    }));
    await app.init();
  });

  it('should allow request from allowed country', async () => {
    const response = await request(app.getHttpServer())
      .get('/')
      .set('ip', '115.240.90.163'); // IP from India

    expect(response.status).toBe(HttpStatus.OK);
  });

  it('should allow request from allowed country ipv6', async () => {
    const response = await request(app.getHttpServer())
      .get('/')
      .set('ip', '2401:4900:1c70:140b:fd0c:65a1:64e2:81bb'); // IP from US

    expect(response.status).toBe(HttpStatus.OK);
  });

  it('should deny request from disallowed country', async () => {
    const response = await request(app.getHttpServer())
      .get('/')
      .set('ip', '120.121.121.123'); // IP from a country not in allowed list

    expect(response.statusCode).toBe(HttpStatus.FORBIDDEN);
    expect(response.text).toContain('Access Denied');
  });

  it('should allow request from IP within geofence', async () => {
    const response = await request(app.getHttpServer())
      .get('/')
      .set('ip', '101.36.96.0'); // London, UK within geofence (use coordinates within 50 km of London)

    expect(response.status).toBe(HttpStatus.OK);
  });

  it('should allow request from allowed city', async () => {
    const response = await request(app.getHttpServer())
      .get('/')
      .set('ip', '115.240.90.163'); // IP from Mumbai, India

    expect(response.status).toBe(HttpStatus.OK);
  });

  it('should deny request if IP is not provided', async () => {
    const response = await request(app.getHttpServer())
      .get('/');

    expect(response.statusCode).toBe(HttpStatus.BAD_REQUEST);
    expect(response.text).toContain('No IP address found');
  });

  it('should handle request with malformed IP', async () => {
    const response = await request(app.getHttpServer())
      .get('/')
      .set('ip', 'not_an_ip');

    expect(response.statusCode).toBe(HttpStatus.BAD_REQUEST);
    expect(response.text).toContain('Invalid IP address');
  });

  it('should handle request with empty IP value', async () => {
    const response = await request(app.getHttpServer())
      .get('/')
      .set('ip', '');

    expect(response.statusCode).toBe(HttpStatus.BAD_REQUEST);
    expect(response.text).toContain('Invalid IP address');
  });

  it('should deny request if neither city nor country match allowed values', async () => {
    const response = await request(app.getHttpServer())
      .get('/')
      .set('ip', '203.0.113.0'); // Private IP

    expect(response.statusCode).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
    expect(response.text).toContain('Error occurred while reading the geoip database');
  });


  it('should deny request from IP in a non-allowed country', async () => {
    const response = await request(app.getHttpServer())
      .get('/')
      .set('ip', '200.160.0.8'); // IP from Brazil (not in allowed countries)

    expect(response.statusCode).toBe(HttpStatus.FORBIDDEN);
    expect(response.text).toContain('Access Denied');
  });

  it('should deny request with invalid IP format', async () => {
    const response = await request(app.getHttpServer())
      .get('/')
      .set('ip', '256.256.256.256'); // Invalid IP

    expect(response.statusCode).toBe(HttpStatus.BAD_REQUEST);
    expect(response.text).toContain('Invalid IP address');
  });

  it('should handle request with valid IP from non-specified city but allowed country', async () => {
    const response = await request(app.getHttpServer())
      .get('/')
      .set('ip', '104.244.42.1'); // IP from a city not in allowed list but in allowed country (US)

    expect(response.status).toBe(HttpStatus.OK);
  });

  it('should allow request from allowed IP within allowed coordinates', async () => {
    const response = await request(app.getHttpServer())
      .get('/')
      .set('ip', '118.27.27.9'); // IP from Tokyo (within allowed coordinates)

    expect(response.status).toBe(HttpStatus.OK);
  });

  it('should deny request from IP near the edge of allowed geofence', async () => {
    const response = await request(app.getHttpServer())
      .get('/')
      .set('ip', '81.129.0.0'); // Example IP address near but outside the geofence
  
    expect(response.statusCode).toBe(HttpStatus.FORBIDDEN);
    expect(response.text).toContain('Access Denied');
  });
  
  afterAll(async () => {
    await app.close();
  });
});
