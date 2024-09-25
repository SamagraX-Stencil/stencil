import { FileUploadService } from '../../src/services/file-upload.service';
import {
  BadRequestException,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Client } from 'minio';
import * as fs from 'fs';
import * as path from 'path';
import {
  FileUploadRequestDTO,
  SaveToLocaleRequestDTO,
  UploadToMinioRequestDTO,
} from 'src/services/dto/file-upload.dto';
import { ConfigService } from '@nestjs/config';
import { MultipartFile } from 'src';

jest.mock('minio');
jest.mock('fs');
jest.mock('path');

describe('FileUploadService', () => {
  let service: FileUploadService;
  const mockMinioClient = {
    putObject: jest.fn(),
    getObject: jest.fn(),
    bucketExists: jest.fn(),
    makeBucket: jest.fn(),
  };
  const mockLogger = {
    log: jest.fn(),
    error: jest.fn(),
    verbose: jest.fn(),
  };
  const mockConfigService = {
    get: jest.fn().mockImplementation((key: string) => {
      switch (key) {
        case 'STORAGE_MODE':
          return 'MINIO';
        case 'STORAGE_USE_SSL':
          return 'true';
        case 'STORAGE_ENDPOINT':
          return 'localhost';
        case 'STORAGE_PORT':
          return '9000';
        case 'STORAGE_ACCESS_KEY':
          return 'accessKey';
        case 'STORAGE_SECRET_KEY':
          return 'secretKey';
        default:
          return null;
      }
    }),
  };

  beforeEach(() => {
    service = new FileUploadService(mockConfigService as unknown as ConfigService);
    (service as any).storage = mockMinioClient; 
    jest.clearAllMocks();
  });

  describe('uploadToMinio', () => {
    it('should upload file to Minio and return URL', async () => {
      const uploadDto: UploadToMinioRequestDTO = {
        destination: 'test-bucket',
        filename: 'test-file.txt',
        file: { buffer: Buffer.from('test content'), mimetype: 'text/plain' },
      };

      mockMinioClient.bucketExists.mockResolvedValue(true);
      mockMinioClient.putObject.mockImplementation((dest, file, buf, meta, cb) => {
        cb(null); 
      });

      const result = await service.uploadToMinio(uploadDto);
      expect(result).toContain('https://localhost:9000/test-bucket/test-file.txt');
      expect(mockMinioClient.putObject).toHaveBeenCalledWith(
        uploadDto.destination,
        uploadDto.filename,
        uploadDto.file.buffer,
        { 'Content-Type': uploadDto.file.mimetype },
        expect.any(Function),
      );
    });

    it('should throw BadRequestException if bucket does not exist', async () => {
      const uploadDto: UploadToMinioRequestDTO = {
        destination: 'test-bucket',
        filename: 'test-file.txt',
        file: { buffer: Buffer.from('test content'), mimetype: 'text/plain' },
      };

      mockMinioClient.bucketExists.mockResolvedValue(false);

      await expect(service.uploadToMinio(uploadDto)).rejects.toThrow(BadRequestException);
    });

    it('should log error and reject on upload error', async () => {
      const uploadDto: UploadToMinioRequestDTO = {
        destination: 'test-bucket',
        filename: 'test-file.txt',
        file: { buffer: Buffer.from('test content'), mimetype: 'text/plain' },
      };

      mockMinioClient.bucketExists.mockResolvedValue(true);
      mockMinioClient.putObject.mockImplementation((dest, file, buf, meta, cb) => {
        cb(new Error('Upload error')); 
      });

      await expect(service.uploadToMinio(uploadDto)).rejects.toThrow(Error);
    });
  });

  describe('saveLocalFile', () => {
    it('should save file locally and return file path', async () => {
      const saveDto: SaveToLocaleRequestDTO = {
        destination: 'uploads',
        filename: 'local-file.txt',
        file: { buffer: Buffer.from('local content') },
      };
      
      jest.spyOn(fs, 'existsSync').mockReturnValue(true); 

      const result = await service.saveLocalFile(saveDto);
      expect(result).toBe('uploads/local-file.txt');
    });

    it('should throw BadRequestException for invalid destination path', async () => {
      const saveDto: SaveToLocaleRequestDTO = {
        destination: 'invalid.path',
        filename: 'local-file.txt',
        file: { buffer: Buffer.from('local content') },
      };

      await expect(service.saveLocalFile(saveDto)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for invalid filename', async () => {
      const saveDto: SaveToLocaleRequestDTO = {
        destination: 'uploads',
        filename: 'invalid*file.txt',
        file: { buffer: Buffer.from('local content') },
      };

      jest.spyOn(fs, 'existsSync').mockReturnValue(true); 

      await expect(service.saveLocalFile(saveDto)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if destination directory does not exist', async () => {
      const saveDto: SaveToLocaleRequestDTO = {
        destination: 'uploads',
        filename: 'local-file.txt',
        file: { buffer: Buffer.from('local content') },
      };

      jest.spyOn(fs, 'existsSync').mockReturnValue(false); 

      await expect(service.saveLocalFile(saveDto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('upload', () => {
    it('should call uploadToMinio for Minio storage mode', async () => {
      const uploadDto: FileUploadRequestDTO = {
        destination: 'test-bucket',
        filename: 'test-file.txt',
        file: { buffer: Buffer.from('test content'), mimetype: 'text/plain' },
      };

      mockMinioClient.bucketExists.mockResolvedValue(true);
      mockMinioClient.putObject.mockImplementation((dest, file, buf, meta, cb) => {
        cb(null); 
      });

      const result = await service.upload(uploadDto);
      expect(result).toContain('https://localhost:9000/test-bucket/test-file.txt');
    });

    it('should call saveLocalFile for local storage mode', async () => {
      (service as any).storageMode = 'local'; 
      const saveDto: FileUploadRequestDTO = {
        destination: 'uploads',
        filename: 'local-file.txt',
        file: { buffer: Buffer.from('local content'), mimetype: 'text/plain' },
      };

      jest.spyOn(service, 'saveLocalFile').mockResolvedValue('uploads/local-file.txt');
      const result = await service.upload(saveDto);
      expect(result).toBe('uploads/local-file.txt');
    });

    it('should throw InternalServerErrorException for invalid storage mode', async () => {
      (service as any).storageMode = 'INVALID_MODE'; 
      await expect(service.upload({} as FileUploadRequestDTO)).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('download', () => {    
    it('should return a stream from local storage', async () => {
      (service as any).storageMode = 'local'; 
      const filename = 'local-file.txt';
      const destination = 'uploads';
      const mockReadStream = 'mock stream' as any; 

      jest.spyOn(fs, 'existsSync').mockReturnValue(true); 
      jest.spyOn(fs, 'createReadStream').mockReturnValue(mockReadStream);

      const result = await service.download(destination, filename);

      expect(result).toBe(mockReadStream);
  });
      
    it('should download from Minio storage', async () => {
      const filename = 'test-file.txt';
      const destination = 'test-bucket';
      const mockObject = 'mock object' as any;

      mockMinioClient.getObject.mockResolvedValue(mockObject); 

      const result = await service.download(destination, filename);
      expect(result).toBe(mockObject);
    });

    it('should throw InternalServerErrorException on Minio download error', async () => {
      const filename = 'test-file.txt';
      const destination = 'test-bucket';

      mockMinioClient.getObject.mockImplementation(() => {
        throw new Error('Download error');
      });

      await expect(service.download(destination, filename)).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('makeBucket', () => {
    it('should create a new bucket if it does not exist', async () => {
      const bucketName = 'new-bucket';

      mockMinioClient.bucketExists.mockResolvedValue(false); 
      mockMinioClient.makeBucket.mockResolvedValue(undefined); 

      await service.makeBucket(bucketName);
      expect(mockMinioClient.makeBucket).toHaveBeenCalledWith(bucketName);
    });

    it('should throw InternalServerErrorException if bucket creation fails', async () => {
      const bucketName = 'new-bucket';

      mockMinioClient.bucketExists.mockResolvedValue(false);
      mockMinioClient.makeBucket.mockImplementation(() => {
        throw new Error('Creation error');
      });

      await expect(service.makeBucket(bucketName)).rejects.toThrow(InternalServerErrorException);
    });

    it('should throw an error if the bucket already exists', async () => {
      const bucketName = 'existing-bucket';

      mockMinioClient.bucketExists.mockResolvedValue(true); 

      await expect(service.makeBucket(bucketName)).rejects.toThrow(InternalServerErrorException);
    });
  });
  it('should create a directory for local storage', async () => {
    (service as any).storageMode = 'local'; 
    (service as any).storageEndpoint = 'uploads'; 
    
    const destination = 'local-destination';
    const mockUploadsDir = path.join(service['storageEndpoint'], destination);

    const mkdirSpy = jest.spyOn(fs, 'mkdirSync').mockImplementation(() => ''); 

    await service.makeBucket(destination);

    expect(mkdirSpy).toHaveBeenCalledWith(mockUploadsDir, { recursive: true });
});

describe('upload Mutiple', () => {
  it('should throw an error if files are missing', async () => {
    await expect(
      service.uploadMultiple(null, 'uploads', ['file1.txt']),
    ).rejects.toThrow(
      new InternalServerErrorException('File upload failed: files field missing'),
    );
  });

  it('should throw an error if filenames are missing', async () => {
    const mockFiles: MultipartFile[] = [{ filename: 'file1.txt' } as any]; 

    await expect(service.uploadMultiple(mockFiles, 'uploads', null)).rejects.toThrow(
      new InternalServerErrorException('File upload failed: filenames field missing'),
    );
  });

  it('should not throw an error if filenames is not an array but can be converted to one', async () => {
    const mockFiles: MultipartFile[] = [{ filename: 'file1.txt' } as any]; 
  
    const mockUploadFn = jest.spyOn(service, 'upload').mockResolvedValue('https://localhost:9000/uploads/file1.txt');
  
    const result = await service.uploadMultiple(mockFiles, 'uploads', ['file1.txt']);
  
    expect(mockUploadFn).toHaveBeenCalledTimes(1);
    expect(result).toEqual(['https://localhost:9000/uploads/file1.txt']);
  });
  
  it('should throw an error if filenames and files count do not match', async () => {
    const mockFiles: MultipartFile[] = [
      { filename: 'file1.txt' } as any,
      { filename: 'file2.txt' } as any,
    ]; 

    await expect(
      service.uploadMultiple(mockFiles, 'uploads', ['file1.txt']),
    ).rejects.toThrow(
      new InternalServerErrorException(
        'File upload failed: Number of files is not equal to number of filenames',
      ),
    );
  });

  it('should successfully upload multiple files', async () => {
    const mockFiles: MultipartFile[] = [
      { filename: 'file1.txt' } as any,
      { filename: 'file2.txt' } as any,
    ]; 

    const filenames = ['file1.txt', 'file2.txt'];

    const mockUploadFn = jest.spyOn(service, 'upload').mockResolvedValue('mock-directory');

    const directories = await service.uploadMultiple(mockFiles, 'uploads', filenames);

    expect(mockUploadFn).toHaveBeenCalledTimes(mockFiles.length);
    expect(directories.length).toBe(mockFiles.length);
    expect(directories).toEqual(['mock-directory', 'mock-directory']);
  });

  it('should throw an error if any file upload fails', async () => {
    const mockFiles: MultipartFile[] = [
      { filename: 'file1.txt' } as any,
      { filename: 'file2.txt' } as any,
    ]; 

    const filenames = ['file1.txt', 'file2.txt'];

    jest.spyOn(service, 'upload')
      .mockResolvedValueOnce('mock-directory') 
      .mockRejectedValueOnce(new Error('Upload failed')); 

    await expect(
      service.uploadMultiple(mockFiles, 'uploads', filenames),
    ).rejects.toThrow(new InternalServerErrorException('File upload failed'));
  });

})

});
