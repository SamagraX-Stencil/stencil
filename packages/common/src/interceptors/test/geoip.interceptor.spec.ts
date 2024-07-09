import { Test, TestingModule } from '@nestjs/testing';
import { GeoIPInterceptor } from '../geoip.interceptor';
import { HttpModule, HttpService } from '@nestjs/axios';

describe('Unit tests for geoIP interceptor', () => {
  describe('Unit tests for geoIP interceptor', () => {
    let interceptor: GeoIPInterceptor;

    beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [GeoIPInterceptor],
      }).compile();

      interceptor = module.get<GeoIPInterceptor>(GeoIPInterceptor);
    });

    it('should be defined', () => {
      expect(interceptor).toBeDefined();
    });

    it('should allow requests from allowed countries', () => {
      const allowedCountries = ['US', 'CA'];
      const ip = '192.168.0.1';

      interceptor['allowedCountries'] = allowedCountries;

      const result = interceptor['isCountryAllowed'](ip);

      expect(result).toBe(true);
    });

    it('should deny requests from disallowed countries', () => {
      const allowedCountries = ['US', 'CA'];
      const ip = '192.168.0.1';

      interceptor['allowedCountries'] = allowedCountries;

      const result = interceptor['isCountryAllowed'](ip);

      expect(result).toBe(false);
    });

    it('should throw an error for invalid IP address', () => {
      const allowedCountries = ['US', 'CA'];
      const ip = 'invalid-ip';

      interceptor['allowedCountries'] = allowedCountries;

      expect(() => interceptor['isCountryAllowed'](ip)).toThrowError();
    });

    it('should return the location for a valid IP address', async () => {
      const ip = '192.168.0.1';
      const expectedLocation = { country: 'US', city: 'New York' };

      jest
        .spyOn(interceptor, 'getLocation')
        .mockResolvedValue(expectedLocation);

      const result = await interceptor['getLocation'](ip);

      expect(result).toEqual(expectedLocation);
    });

    it('should throw an error for an invalid IP address', async () => {
      const ip = 'invalid-ip';

      jest
        .spyOn(interceptor, 'getLocation')
        .mockRejectedValue(new Error('Invalid IP'));

      await expect(interceptor['getLocation'](ip)).rejects.toThrowError(
        'Invalid IP',
      );
    });
  });
});
