import { ExecutionContext, NestInterceptor } from '@nestjs/common';
import { of, throwError } from 'rxjs';
import { FastifyFilesInterceptor, FastifyFileInterceptor } from '../../src/interceptors/file-upload.interceptor';

describe('FastifyFileInterceptor & FastifyFilesInterceptor', () => {
  let fileInterceptor: NestInterceptor;
  let filesInterceptor: NestInterceptor;

  beforeEach(async () => {
    const fileInterceptorClass = FastifyFileInterceptor('file', {});
    const filesInterceptorClass = FastifyFilesInterceptor('files', []);

    fileInterceptor = new fileInterceptorClass();
    filesInterceptor = new filesInterceptorClass();
  });

  describe('FastifyFileInterceptor', () => {
    it('should be defined', () => {
      expect(fileInterceptor).toBeDefined();
    });

    it('should handle single file upload', async () => {
      const file = { originalname: 'test.jpg', mimetype: 'image/jpeg' };
      const context = createMockContext(file);
      const nextHandler = createMockNextHandler();

      await fileInterceptor.intercept(context, nextHandler);

      expect(context.switchToHttp().getRequest().file).toEqual(file);
      expect(nextHandler.handle).toHaveBeenCalled();
    });

    it('should handle file upload without file extension', async () => {
      const file = { originalname: 'test', mimetype: 'application/octet-stream' };
      const context = createMockContext(file);
      const nextHandler = createMockNextHandler();

      await fileInterceptor.intercept(context, nextHandler);

      expect(context.switchToHttp().getRequest().file).toEqual(file);
      expect(nextHandler.handle).toHaveBeenCalled();
    });

    it('should throw an error for unsupported file types', async () => {
      const file = { originalname: 'test.exe', mimetype: 'application/x-msdownload' };
      const context = createMockContext(file);
      const nextHandler = createMockNextHandler();

      jest.spyOn(fileInterceptor['multer'], 'single').mockImplementation(() => {
        return (req, res, callback) => {
          callback(new Error('Unsupported file type'));
        };
      });

      await expect(fileInterceptor.intercept(context, nextHandler)).rejects.toThrow('Unsupported file type');
    });

    it('should handle empty file', async () => {
      const file = { originalname: 'empty.txt', mimetype: 'text/plain', size: 0 };
      const context = createMockContext(file);
      const nextHandler = createMockNextHandler();

      await fileInterceptor.intercept(context, nextHandler);

      expect(context.switchToHttp().getRequest().file).toEqual(file);
      expect(nextHandler.handle).toHaveBeenCalled();
    });

    it('should handle large file upload', async () => {
      const file = { originalname: 'large.mp4', mimetype: 'video/mp4', size: 1000000000 };
      const context = createMockContext(file);
      const nextHandler = createMockNextHandler();

      await fileInterceptor.intercept(context, nextHandler);

      expect(context.switchToHttp().getRequest().file).toEqual(file);
      expect(nextHandler.handle).toHaveBeenCalled();
    });
  });

  describe('FastifyFilesInterceptor', () => {
    it('should be defined', () => {
      expect(filesInterceptor).toBeDefined();
    });

    it('should handle multiple file uploads', async () => {
      const files = [
        { originalname: 'test1.jpg', mimetype: 'image/jpeg' },
        { originalname: 'test2.jpg', mimetype: 'image/jpeg' }
      ];
      const context = createMockContext(files);
      const nextHandler = createMockNextHandler();

      await filesInterceptor.intercept(context, nextHandler);

      expect(context.switchToHttp().getRequest().files).toEqual(files);
      expect(nextHandler.handle).toHaveBeenCalled();
    });

    it('should handle an empty list of files', async () => {
      const context = createMockContext([]);
      const nextHandler = createMockNextHandler();

      await filesInterceptor.intercept(context, nextHandler);

      expect(context.switchToHttp().getRequest().files).toEqual([]);
      expect(nextHandler.handle).toHaveBeenCalled();
    });

    it('should throw an error when too many files are uploaded', async () => {
      const files = [
        { originalname: 'test1.jpg', mimetype: 'image/jpeg' },
        { originalname: 'test2.jpg', mimetype: 'image/jpeg' },
        { originalname: 'test3.jpg', mimetype: 'image/jpeg' }
      ];
      const context = createMockContext(files);
      const nextHandler = createMockNextHandler();

      jest.spyOn(filesInterceptor['multer'], 'array').mockImplementation(() => {
        return (req, res, callback) => {
          callback(new Error('Too many files'));
        };
      });

      await expect(filesInterceptor.intercept(context, nextHandler)).rejects.toThrow('Too many files');
    });

    it('should handle mix of file types', async () => {
      const files = [
        { originalname: 'test1.jpg', mimetype: 'image/jpeg' },
        { originalname: 'test2.pdf', mimetype: 'application/pdf' }
      ];
      const context = createMockContext(files);
      const nextHandler = createMockNextHandler();

      await filesInterceptor.intercept(context, nextHandler);

      expect(context.switchToHttp().getRequest().files).toEqual(files);
      expect(nextHandler.handle).toHaveBeenCalled();
    });

    it('should handle error when one of the files fails to upload', async () => {
      const files = [
        { originalname: 'test1.jpg', mimetype: 'image/jpeg' },
        { originalname: 'test2.pdf', mimetype: 'application/pdf' }
      ];
      const context = createMockContext(files);
      const nextHandler = createMockNextHandler();

      jest.spyOn(filesInterceptor['multer'], 'array').mockImplementation(() => {
        return (req, res, callback) => {
          callback(new Error('File upload failed for test2.pdf'));
        };
      });

      await expect(filesInterceptor.intercept(context, nextHandler)).rejects.toThrow('File upload failed for test2.pdf');
    });
  });
});

function createMockContext(fileOrFiles: any): ExecutionContext {
  const mockHttpContext = {
    getRequest: jest.fn().mockReturnValue({
      raw: { headers: { 'content-type': 'multipart/form-data' } },
      file: Array.isArray(fileOrFiles) ? undefined : fileOrFiles,
      files: Array.isArray(fileOrFiles) ? fileOrFiles : undefined
    }),
    getResponse: jest.fn().mockReturnValue({}),
  };
  return { switchToHttp: jest.fn().mockReturnValue(mockHttpContext) } as unknown as ExecutionContext;
}

function createMockNextHandler(response: any = of({})): { handle: jest.Mock } {
  return { handle: jest.fn().mockReturnValue(response) };
}