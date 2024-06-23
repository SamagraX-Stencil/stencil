import { GeoIPInterceptor } from '@samagra-x/stencil'
import { ExecutionContext, HttpException, Logger } from '@nestjs/common';
import { Observable, of } from 'rxjs';

describe('GeoIpInterceptor', () => {
  let interceptor: GeoIPInterceptor;
  const logger = new Logger('GeoIpInterceptorTest');

  beforeEach(() => {
    interceptor = new GeoIPInterceptor(['India']);
  });

  it('should allow a request from India', async () => {
    const ip = '115.240.90.163'; // Mock IP from India
    logger.log(`Testing with IP: ${ip}`);
    const executionContext = createMockExecutionContext(ip);
    const callHandler = {
      handle: jest.fn().mockReturnValue(of({})),
    };

    await expect(
      interceptor.intercept(executionContext, callHandler),
    ).resolves.toBeInstanceOf(Observable);
  });

  it('should allow a request from India with IPv6', async () => {
    const ip = '2401:4900:1c70:140b:fd0c:65a1:64e2:81bb'; // Mock IP from India
    logger.log(`Testing with IP: ${ip}`);
    const executionContext = createMockExecutionContext(ip);
    const callHandler = {
      handle: jest.fn().mockReturnValue(of({})),
    };

    await expect(
      interceptor.intercept(executionContext, callHandler),
    ).resolves.toBeInstanceOf(Observable);
  });

  it('should block a request from outside India', async () => {
    const ip = '128.101.101.101'; // Mock IP from outside India
    logger.log(`Testing with IP: ${ip}`);
    const executionContext = createMockExecutionContext(ip);
    const callHandler = {
      handle: jest.fn().mockReturnValue(of({})),
    };

    await expect(
      interceptor.intercept(executionContext, callHandler),
    ).rejects.toThrow(HttpException);
  });

  it('should block a request from machine local IP', async () => {
    const ip = '127.0.0.1'; // Mock IP from outside India
    logger.log(`Testing with IP: ${ip}`);
    const executionContext = createMockExecutionContext(ip);
    const callHandler = {
      handle: jest.fn().mockReturnValue(of({})),
    };

    await expect(
      interceptor.intercept(executionContext, callHandler),
    ).rejects.toThrow(HttpException);
  });

  it('should block a request from a fake spoofed IP', async () => {
    const ip = '1607:e054:4d04:8f9c:6efa:761f:b964:57b6'; // Mock IP from outside India
    logger.log(`Testing with IP: ${ip}`);
    const executionContext = createMockExecutionContext(ip);
    const callHandler = {
      handle: jest.fn().mockReturnValue(of({})),
    };

    await expect(
      interceptor.intercept(executionContext, callHandler),
    ).rejects.toThrow(HttpException);
  });

  it('should block IPv6 addresses outside India', async () => {
    const ip = '2607:f8b0:4005:080a:0000:0000:0000:200e'; // Mock IPv6 address from outside India
    logger.log(`Testing with IP: ${ip}`);
    const executionContext = createMockExecutionContext(ip);
    const callHandler = {
      handle: jest.fn().mockReturnValue(of({})),
    };

    await expect(
      interceptor.intercept(executionContext, callHandler),
    ).rejects.toThrow(HttpException);
  });

  it('should block IPv4 addresses outside India', async () => {
    const ip = '8.8.8.8'; // Mock IPv4 address from outside India
    logger.log(`Testing with IP: ${ip}`);
    const executionContext = createMockExecutionContext(ip);
    const callHandler = {
      handle: jest.fn().mockReturnValue(of({})),
    };

    await expect(
      interceptor.intercept(executionContext, callHandler),
    ).rejects.toThrow(HttpException);
  });

  it('should allow IPv6 addresses within India', async () => {
    const ip = '2405:204:66a7:f4c0:0000:0000:0000:0001'; // Mock IPv6 address from within India
    logger.log(`Testing with IP: ${ip}`);
    const executionContext = createMockExecutionContext(ip);
    const callHandler = {
      handle: jest.fn().mockReturnValue(of({})),
    };

    await expect(
      interceptor.intercept(executionContext, callHandler),
    ).resolves.toBeInstanceOf(Observable);
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
