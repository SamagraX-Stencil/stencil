import { ExecutionContext } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { of, throwError } from 'rxjs';
import { FastifyFileInterceptor } from '../src/interceptors/file-upload.interceptor';

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
      switchToHttp: () => ({
        getRequest: () => ({
          file: {},
        }),
        getResponse: jest.fn(),
      }) as any,
      switchToRpc: jest.fn(),
      switchToWs: jest.fn(),
      getClass: jest.fn(),
      getHandler: jest.fn(),
      getArgs: jest.fn(),
      getArgByIndex: jest.fn(),
      getType: jest.fn(),
    };

    const nextHandler = {
      handle: jest.fn(() => of('')),
    };

    await interceptor.intercept(context, nextHandler);

    expect(context.switchToHttp().getRequest).toHaveBeenCalled();
    expect(context.switchToHttp().getResponse).toHaveBeenCalled();
    expect(nextHandler.handle).toHaveBeenCalled();
  });

  it('should handle getting an uploaded file', async () => {
    const file = { /* mock file object */ };
    const context: ExecutionContext = {
      switchToHttp: () => ({
        getRequest: () => ({
          file: file,
        }),
        getResponse: jest.fn(),
      }) as any,
      switchToRpc: jest.fn(),
      switchToWs: jest.fn(),
      getClass: jest.fn(),
      getHandler: jest.fn(),
      getArgs: jest.fn(),
      getArgByIndex: jest.fn(),
      getType: jest.fn(),
    };

    const nextHandler = {
      handle: jest.fn(() => of('')),
    };

    await interceptor.intercept(context, nextHandler);

    expect(context.switchToHttp().getRequest).toHaveBeenCalled();
    expect(context.switchToHttp().getResponse).toHaveBeenCalled();
    expect(nextHandler.handle).toHaveBeenCalledWith(file);
  });

  it('should handle errors', async () => {
    const context: ExecutionContext = {
      switchToHttp: () => ({
        getRequest: () => ({
          file: {},
        }),
        getResponse: jest.fn(),
      }) as any,
      switchToRpc: jest.fn(),
      switchToWs: jest.fn(),
      getClass: jest.fn(),
      getHandler: jest.fn(),
      getArgs: jest.fn(),
      getArgByIndex: jest.fn(),
      getType: jest.fn(),
    };

    const errorMessage = 'File upload failed';
    const nextHandler = {
      handle: jest.fn(() => throwError(errorMessage)),
    };

    await expect(interceptor.intercept(context, nextHandler)).rejects.toThrow(errorMessage);

    expect(context.switchToHttp().getRequest).toHaveBeenCalled();
    expect(context.switchToHttp().getResponse).toHaveBeenCalled();
    expect(nextHandler.handle).toHaveBeenCalled();
  });
});
