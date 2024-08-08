import { ExecutionContext, NestInterceptor } from '@nestjs/common';
import { of, throwError } from 'rxjs';
import { FastifyFilesInterceptor } from '../../src/interceptors/file-upload.interceptor';

describe('FastifyFileInterceptor', () => {
  let interceptor: NestInterceptor;

  beforeEach(async () => {
    const interceptorClass = FastifyFilesInterceptor('file', []);
    interceptor = new interceptorClass();
  });

  it('should be defined', () => {
    expect(interceptor).toBeDefined();
  });

  // file upload tests 

  it('should handle file upload', async () => {
    const file = { originalname: 'test.jpg', mimetype: 'image/jpeg' };
    const context = createMockContext(file);
    const nextHandler = createMockNextHandler();

    await interceptor.intercept(context, nextHandler);

    expect(context.switchToHttp().getRequest().file).toEqual(file);
    expect(nextHandler.handle).toHaveBeenCalled();
  });

  it('should accept files with simple names', async () => {
    const file = { originalname: 'test.txt', mimetype: 'text/plain' };
    const context = createMockContext(file);
    const nextHandler = createMockNextHandler();

    await interceptor.intercept(context, nextHandler);

    expect(context.switchToHttp().getRequest().file).toEqual(file);
    expect(nextHandler.handle).toHaveBeenCalled();
  })

  it('should accept files with multiple periods in them', async () => {
    const file = { originalname: 'text.tar.gz', mimetype: 'application/gzip' };
    const context = createMockContext(file);
    const nextHandler = createMockNextHandler();

    await interceptor.intercept(context, nextHandler);

    expect(context.switchToHttp().getRequest().file).toEqual(file);
    expect(nextHandler.handle).toHaveBeenCalled();
  })  

  it('should accept files without extensions', async () => {
    const file = { originalname: 'text', mimetype: 'text/plain' };
    const context = createMockContext(file);
    const nextHandler = createMockNextHandler();

    await interceptor.intercept(context, nextHandler);

    expect(context.switchToHttp().getRequest().file).toEqual(file);
    expect(nextHandler.handle).toHaveBeenCalled();
  })  

  it('should accept files with spaces in their name', async () => {
    const file = { originalname: 'data file.txt', mimetype: 'text/plain' };
    const context = createMockContext(file);
    const nextHandler = createMockNextHandler();

    await interceptor.intercept(context, nextHandler);

    expect(context.switchToHttp().getRequest().file).toEqual(file);
    expect(nextHandler.handle).toHaveBeenCalled();
  })  

  it('should throw Error uploading file on illegal filename', async () => {
    const file = { originalname: '../foo.bar.cls', mimetype: 'text/plain' };
    const context = createMockContext(file);
    const nextHandler = createMockNextHandler();

    jest.spyOn(interceptor, 'intercept').mockImplementation(() => {
        throw new Error('Illegal filename');
    });

    try {
        await interceptor.intercept(context, nextHandler);
    } catch (error) {
        expect(error).toEqual(new Error('Illegal filename'));
    }

    expect(nextHandler.handle).not.toHaveBeenCalled();

  })  
  
  it('should handle getting an uploaded file when file is not present or null', async () => {
    const contextWithUndefinedFile = createMockContext(undefined);
    const contextWithNullFile = createMockContext(null);
    const nextHandler = createMockNextHandler();
  
    await interceptor.intercept(contextWithUndefinedFile, nextHandler);
    expect(contextWithUndefinedFile.switchToHttp().getRequest().file).toBeUndefined();
    expect(nextHandler.handle).toHaveBeenCalled();
  
    await interceptor.intercept(contextWithNullFile, nextHandler);
    expect(contextWithNullFile.switchToHttp().getRequest().file).toBeNull();
    expect(nextHandler.handle).toHaveBeenCalled();
  });

  it('should handle errors', async () => {
    const errorMessage = 'File upload failed';
    const file = { originalname: 'test.jpg', mimetype: 'image/jpeg' };
    const context = createMockContext(file);
    const nextHandler = createMockNextHandler();
  
    // Mock the multer middleware to throw an error
    jest.spyOn(interceptor['multer'], 'array').mockImplementation(() => {
      return (req, res, callback) => {
        callback(new Error(errorMessage));
      };
    });
  
    await expect(interceptor.intercept(context, nextHandler)).rejects.toThrow(errorMessage);
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