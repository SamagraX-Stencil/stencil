// Import necessary modules and dependencies
import { FastifyFileInterceptor } from '../../src/interceptors/file-upload.interceptor';
import { CallHandler, ExecutionContext } from '@nestjs/common';
import { of } from 'rxjs';

// Mock the module
jest.mock('fastify-multer', () => {
  const mockMulter = jest.fn().mockImplementation(() => ({
    single: jest.fn().mockImplementation((fieldName: string) => {
      return (req: any, res: any, cb: any) => cb(null);
    }),
  }));

  return {
    __esModule: true,
    default: mockMulter,
  };
});

describe('FastifyFileInterceptor', () => {
  let InterceptorClass: ReturnType<typeof FastifyFileInterceptor>;
  let interceptor: any;
  let mockContext: ExecutionContext;
  let mockCallHandler: CallHandler;

  beforeEach(() => {
    InterceptorClass = FastifyFileInterceptor('file', {});
    interceptor = new InterceptorClass();
    mockContext = {
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn(),
        getResponse: jest.fn(),
      }),
    } as unknown as ExecutionContext;
    mockCallHandler = {
      handle: jest.fn().mockReturnValue(of('test')),
    };
  });

  it('should be defined', () => {
    expect(interceptor).toBeDefined();
  });

  it('should handle file upload without error', async () => {
    await expect(interceptor.intercept(mockContext, mockCallHandler)).resolves.not.toThrow();
  });


  it('should handle errors thrown by multer', async () => {
    const error = new Error('Test Error');
    const singleMock = jest.fn().mockImplementation((fieldName: string) => {
      return (req: any, res: any, cb: any) => cb(error);
    });
    interceptor.multer = { single: singleMock }; // Assign the mock directly to the interceptor
    await expect(interceptor.intercept(mockContext, mockCallHandler)).rejects.toThrow('Test Error');
  });
});
