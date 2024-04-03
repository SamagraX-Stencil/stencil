import { ExecutionContext } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { of, throwError } from 'rxjs';
import { FastifyFileInterceptor } from '../src/interceptors/file-upload.interceptor';

describe('FastifyFileInterceptor', () => {
  let interceptor: any;
  let file: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: 'MULTER_MODULE_OPTIONS', // Provide the Multer options if needed
          useValue: {}, // Example value, adjust as necessary
        },
        {
          provide: FastifyFileInterceptor, // Provide FastifyFileInterceptor
          useFactory: () => FastifyFileInterceptor('fieldName', { /* localOptions */ }),
        },
      ],
    }).compile();
    file = { /* mock file object */ };
    interceptor = module.get(FastifyFileInterceptor);
  });

  it('should be defined', () => {
    expect(interceptor).toBeDefined();
  });

  it('should handle file upload', async () => {
    const context = createContext({ file });
    const nextHandler = createNextHandler();

    await interceptor.intercept(context, nextHandler);

    expectAllCalled(context, nextHandler);
  });

  it('should handle getting an uploaded file', async () => {
    const context = createContext({ file });
    const nextHandler = createNextHandler();

    await interceptor.intercept(context, nextHandler);

    expectAllCalled(context, nextHandler);
    expect(nextHandler.handle).toHaveBeenCalledWith(file);
  });

  it('should handle errors', async () => {
    const context = createContext({ file });
    const nextHandler = createNextHandler();
    const errorMessage = 'File upload failed';

    nextHandler.handle.mockReturnValueOnce(throwError(errorMessage));

    await expect(interceptor.intercept(context, nextHandler)).rejects.toThrow(errorMessage);

    expectAllCalled(context, nextHandler);
  });

  it('should handle getting an uploaded file when file is not present', async () => {
    const context = createContext({ file: undefined });
    const nextHandler = createNextHandler();

    await interceptor.intercept(context, nextHandler);

    expectAllCalled(context, nextHandler);
    expect(nextHandler.handle).not.toHaveBeenCalled();
  });

  it('should handle getting an uploaded file when file is null', async () => {
    const context = createContext({ file: null });
    const nextHandler = createNextHandler();

    await interceptor.intercept(context, nextHandler);

    expectAllCalled(context, nextHandler);
    expect(nextHandler.handle).not.toHaveBeenCalled();
  });
  it('should handle an invalid file format', async () => {
    const context = createContext({ file: { originalname: 'file.doc', mimetype: 'application/msword' } }); // Invalid file format
    const nextHandler = createNextHandler();
  
    await interceptor.intercept(context, nextHandler);
  
    expectAllCalled(context, nextHandler);
  });
  

  function createContext({ file }: { file: any }): ExecutionContext {
    return {
      switchToHttp: () => ({
        getRequest: () => ({ file }),
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
  }

  function createNextHandler(): any {
    return {
      handle: jest.fn(() => of('')),
    };
  }

  function expectAllCalled(context: ExecutionContext, nextHandler: any): void {
    expect(context.switchToHttp().getRequest).toHaveBeenCalled();
    expect(context.switchToHttp().getResponse).toHaveBeenCalled();
    expect(nextHandler.handle).toHaveBeenCalled();
  }
});
