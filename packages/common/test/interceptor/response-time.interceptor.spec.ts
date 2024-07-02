import { Test, TestingModule } from '@nestjs/testing';
import { ResponseFormatInterceptor } from '../../src/interceptors';
import { ExecutionContext, CallHandler, HttpException, HttpStatus } from '@nestjs/common';
import { of, throwError } from 'rxjs';

describe('ResponseFormatInterceptor', () => {
  let interceptor: ResponseFormatInterceptor;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ResponseFormatInterceptor],
    }).compile();

    interceptor = module.get<ResponseFormatInterceptor>(ResponseFormatInterceptor);
  });

  it('should be defined', () => {
    expect(interceptor).toBeDefined();
  });

  it('should format successful response correctly', done => {
    const context: ExecutionContext = {
      switchToHttp: () => ({
        getResponse: () => ({ statusCode: 200 }),
        getRequest: () => ({ method: 'GET' }),
      }),
    } as any;

    const callHandler: CallHandler = {
      handle: () => of({ data: 'test data' }),
    } as any;

    interceptor.intercept(context, callHandler).subscribe(result => {
      expect(result).toEqual({
        success: true,
        statusCode: 200,
        message: 'Success',
        data: { data: 'test data' },
        error: {},
      });
      done();
    });
  });

  it('should format error response correctly', done => {
    const context: ExecutionContext = {
      switchToHttp: () => ({
        getResponse: () => ({ statusCode: 500 }),
        getRequest: () => ({ method: 'GET' }),
      }),
    } as any;

    const callHandler: CallHandler = {
      handle: () => throwError(new HttpException('Test error', HttpStatus.BAD_REQUEST)),
    } as any;

    interceptor.intercept(context, callHandler).subscribe(result => {
      expect(result).toEqual({
        success: false,
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Test error',
        data: null,
        error: {
          code: HttpStatus.BAD_REQUEST,
          message: 'Test error',
        },
      });
      done();
    });
  });
});
