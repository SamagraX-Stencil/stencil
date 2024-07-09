import { Test, TestingModule } from '@nestjs/testing';
import { ResponseFormatInterceptor } from '..';
import {
  ExecutionContext,
  CallHandler,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { firstValueFrom, of, throwError } from 'rxjs';

describe('ResponseFormatInterceptor', () => {
  let interceptor: ResponseFormatInterceptor;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ResponseFormatInterceptor],
    }).compile();

    interceptor = module.get<ResponseFormatInterceptor>(
      ResponseFormatInterceptor,
    );
  });

  it('should be defined', () => {
    expect(interceptor).toBeDefined();
  });

  it('should format successful response as object correctly', async () => {
    const context: ExecutionContext = {
      switchToHttp: () => ({
        getResponse: () => ({ statusCode: 200 }),
        getRequest: () => ({ method: 'GET' }),
      }),
    } as any;
    const responseObject = {
      dummy: 'test data',
      key: {
        key: {
          foo: ['i am an array', 'i am cool'],
          bar: {
            baz: 'i am a string',
            qux: 12345,
          },
        },
      },
    };

    const callHandler: CallHandler = {
      handle: () => of(responseObject),
    } as any;

    const result = await firstValueFrom(
      interceptor.intercept(context, callHandler),
    );

    expect(result).toEqual({
      success: true,
      statusCode: 200,
      data: responseObject,
      error: null,
    });
  });

  it('should format successful response as array correctly', async () => {
    const context: ExecutionContext = {
      switchToHttp: () => ({
        getResponse: () => ({ statusCode: 200 }),
        getRequest: () => ({ method: 'GET' }),
      }),
    } as any;

    const callHandler: CallHandler = {
      handle: () => of(['test data']),
    } as any;

    const result = await firstValueFrom(
      interceptor.intercept(context, callHandler),
    );

    expect(result).toEqual({
      success: true,
      statusCode: 200,
      data: ['test data'],
      error: null,
    });
  });

  it('should format successful response as string correctly', async () => {
    const context: ExecutionContext = {
      switchToHttp: () => ({
        getResponse: () => ({ statusCode: 200 }),
        getRequest: () => ({ method: 'GET' }),
      }),
    } as any;

    const callHandler: CallHandler = {
      handle: () => of('test data'),
    } as any;

    const result = await firstValueFrom(
      interceptor.intercept(context, callHandler),
    );

    expect(result).toEqual({
      success: true,
      statusCode: 200,
      data: 'test data',
      error: null,
    });
  });

  it('should format error string correctly', async () => {
    const context: ExecutionContext = {
      switchToHttp: () => ({
        getResponse: () => ({ statusCode: 500 }),
        getRequest: () => ({ method: 'GET' }),
      }),
    } as any;

    const callHandler: CallHandler = {
      handle: () =>
        throwError(
          () => new HttpException('Test error', HttpStatus.BAD_REQUEST),
        ),
    } as any;

    const result = await firstValueFrom(
      interceptor.intercept(context, callHandler),
    );

    expect(result).toEqual({
      success: false,
      statusCode: HttpStatus.BAD_REQUEST,
      data: null,
      error: ['Test error'],
    });
  });

  it('should format error object correctly', async () => {
    const context: ExecutionContext = {
      switchToHttp: () => ({
        getResponse: () => ({ statusCode: 500 }),
        getRequest: () => ({ method: 'GET' }),
      }),
    } as any;

    const callHandler: CallHandler = {
      handle: () =>
        throwError(
          () =>
            new HttpException(
              JSON.stringify({ dummy: 'Test error' }),
              HttpStatus.BAD_REQUEST,
            ),
        ),
    } as any;

    const result = await firstValueFrom(
      interceptor.intercept(context, callHandler),
    );
    expect(result).toEqual({
      success: false,
      statusCode: HttpStatus.BAD_REQUEST,
      data: null,
      error: [{ dummy: 'Test error' }],
    });
  });
});
