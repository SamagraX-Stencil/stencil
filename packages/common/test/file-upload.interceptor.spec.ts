import { ExecutionContext, NestInterceptor } from '@nestjs/common';
import { of, throwError } from 'rxjs';
import { FastifyFileInterceptor } from '../src/interceptors/file-upload.interceptor';

describe('FastifyFileInterceptor', () => {
  let interceptor: NestInterceptor;

  beforeEach(async () => {
    const interceptorClass = FastifyFileInterceptor('file', {});
    interceptor = new interceptorClass();
  });

  it('should be defined', () => {
    expect(interceptor).toBeDefined();
  });

  it('should handle file upload', async () => {
    const file = { originalname: 'test.jpg', mimetype: 'image/jpeg' };
    const context = createMockContext(file);
    const nextHandler = createMockNextHandler();

    await interceptor.intercept(context, nextHandler);

    expect(context.switchToHttp().getRequest().file).toEqual(file);
    expect(nextHandler.handle).toHaveBeenCalled();
  });

  it('should handle getting an uploaded file', async () => {
    const file = { originalname: 'test.jpg', mimetype: 'image/jpeg' };
    const context = createMockContext(file);
    const nextHandler = createMockNextHandler();

    await interceptor.intercept(context, nextHandler);

    expect(context.switchToHttp().getRequest().file).toEqual(file);
    expect(nextHandler.handle).toHaveBeenCalled();
  });

  it('should handle errors', async () => {
    const errorMessage = 'File upload failed';
    const file = { originalname: 'test.jpg', mimetype: 'image/jpeg' };
    const context = createMockContext(file);
    const nextHandler = createMockNextHandler();
  
    // Mock the multer middleware to throw an error
    jest.spyOn(interceptor['multer'], 'single').mockImplementation(() => {
      return (req, res, callback) => {
        callback(new Error(errorMessage));
      };
    });
  
    await expect(interceptor.intercept(context, nextHandler)).rejects.toThrow(errorMessage);
  });

  it('should handle getting an uploaded file when file is not present', async () => {
    const context = createMockContext(undefined);
    const nextHandler = createMockNextHandler();

    await interceptor.intercept(context, nextHandler);

    expect(context.switchToHttp().getRequest().file).toBeUndefined();
    expect(nextHandler.handle).toHaveBeenCalled();
  });

  it('should handle getting an uploaded file when file is null', async () => {
    const context = createMockContext(null);
    const nextHandler = createMockNextHandler();

    await interceptor.intercept(context, nextHandler);

    expect(context.switchToHttp().getRequest().file).toBeNull();
    expect(nextHandler.handle).toHaveBeenCalled();
  });

  it('should handle an invalid file format', async () => {
    const file = { originalname: 'test.txt', mimetype: 'text/plain' };
    const context = createMockContext(file);
    const nextHandler = createMockNextHandler();
  
    await expect(interceptor.intercept(context, nextHandler)).rejects.toThrow('Invalid file format');
  });
});
function createMockContext(file: any): ExecutionContext {
  const mockHttpContext = {
    getRequest: jest.fn().mockReturnValue({ raw: { headers: { 'content-type': 'multipart/form-data' } }, file }),
    getResponse: jest.fn().mockReturnValue({}),
  };
  return { switchToHttp: jest.fn().mockReturnValue(mockHttpContext) } as unknown as ExecutionContext;
}

function createMockNextHandler(response: any = of({})): { handle: jest.Mock } {
  return { handle: jest.fn().mockReturnValue(response) };
}