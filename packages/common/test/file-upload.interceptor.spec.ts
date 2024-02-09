import { ExecutionContext } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Observable } from 'rxjs';
import { FastifyFileInterceptor } from '../src/interceptors/file-upload.interceptor'

describe('FastifyFileInterceptor', () => {
  let interceptor: FastifyFileInterceptor;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FastifyFileInterceptor],
    }).compile();

    interceptor = module.get<FastifyFileInterceptor>(FastifyFileInterceptor);
  });

  it('should be defined', () => {
    expect(interceptor).toBeDefined();
  });

  it('should handle file upload', async () => {
    const context: ExecutionContext = {
      switchToHttp: jest.fn(() => ({
        getRequest: jest.fn(() => ({
          file: {}, 
        })),
        getResponse: jest.fn(),
      })),
      switchToRpc: jest.fn(),
      switchToWs: jest.fn(),
    };


    const nextHandler = {
      handle: jest.fn(() => Observable.of('')),
    };

    await interceptor.intercept(context, nextHandler);

    expect(context.switchToHttp().getRequest).toHaveBeenCalled();
    expect(context.switchToHttp().getResponse).toHaveBeenCalled();

    expect(nextHandler.handle).toHaveBeenCalled();
  });
});
