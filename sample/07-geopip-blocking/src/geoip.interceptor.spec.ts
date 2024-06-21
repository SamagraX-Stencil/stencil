import { GeoIPInterceptor } from './geoip.interceptor';
import { ExecutionContext, HttpException } from '@nestjs/common';
import { Observable, of } from 'rxjs';

describe('GeoIpInterceptor', () => {
  let interceptor: GeoIPInterceptor;

  beforeEach(() => {
    interceptor = new GeoIPInterceptor(['India']);
  });

  it('should allow a request from India', async () => {
    const executionContext = createMockExecutionContext('115.240.90.163'); // Mock IP from India
    const callHandler = {
      handle: jest.fn().mockReturnValue(of({})),
    };

    await expect(
      interceptor.intercept(executionContext, callHandler),
    ).resolves.toBeInstanceOf(Observable);
  });

  it('should allow a request from India with IPv6', async () => {
    const executionContext = createMockExecutionContext(
      '2401:4900:1c70:140b:fd0c:65a1:64e2:81bb',
    ); // Mock IP from India
    const callHandler = {
      handle: jest.fn().mockReturnValue(of({})),
    };

    await expect(
      interceptor.intercept(executionContext, callHandler),
    ).resolves.toBeInstanceOf(Observable);
  });

  it('should block a request from outside India', async () => {
    const executionContext = createMockExecutionContext('128.101.101.101'); // Mock IP from outside India
    const callHandler = {
      handle: jest.fn().mockReturnValue(of({})),
    };

    await expect(
      interceptor.intercept(executionContext, callHandler),
    ).rejects.toThrow(HttpException);
  });

  it('should block a request from machine local IP', async () => {
    const executionContext = createMockExecutionContext('127.0.0.1'); // Mock IP from outside India
    const callHandler = {
      handle: jest.fn().mockReturnValue(of({})),
    };

    await expect(
      interceptor.intercept(executionContext, callHandler),
    ).rejects.toThrow(HttpException);
  });

  it('should block a request from a fake spoofed IP', async () => {
    const executionContext = createMockExecutionContext(
      '1607:e054:4d04:8f9c:6efa:761f:b964:57b6',
    ); // Mock IP from outside India
    const callHandler = {
      handle: jest.fn().mockReturnValue(of({})),
    };

    await expect(
      interceptor.intercept(executionContext, callHandler),
    ).rejects.toThrow(HttpException);
  });
  // Helper function to create a mock ExecutionContext
  function createMockExecutionContext(ip: string): ExecutionContext {
    return {
      switchToHttp: () => ({
        getRequest: () => ({
          headers: { 'x-forwarded-for': ip },
        }),
      }),
    } as ExecutionContext;
  }
});
