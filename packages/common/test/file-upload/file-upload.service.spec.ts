import { FileUploadService } from '../../src/services/file-upload.service';
import { InternalServerErrorException, Logger } from '@nestjs/common';
import { Client } from 'minio';
import * as fs from 'fs';
import * as path from 'path';
import { ConfigService } from '@nestjs/config';

jest.mock('minio');
jest.mock('fs');
jest.mock('path');

describe('FileUploadService', () => {
  let service: FileUploadService;
  const mockMinioClient = {
    putObject: jest.fn(),
    getObject: jest.fn(),
  };
  const mockLogger = {
    log: jest.fn(),
    error: jest.fn(),
  };
  const mockConfigService = {
    get: jest.fn((key: string) => {
      const config = {
        STORAGE_MODE: 'MINIO',
        STORAGE_ENDPOINT: process.env.STORAGE_ENDPOINT || 'localhost',
        STORAGE_PORT:'9000',
        STORAGE_ACCESS_KEY: process.env.STORAGE_ACCESS_KEY,
        STORAGE_SECRET_KEY: process.env.STORAGE_SECRET_KEY,
        MINIO_BUCKETNAME: process.env.MINIO_BUCKETNAME,
      };
      return config[key];
    }),
  };

  beforeEach(() => {
    (Client as jest.Mock).mockImplementation(() => mockMinioClient);
    jest.spyOn(Logger.prototype, 'log').mockImplementation(mockLogger.log);
    jest.spyOn(Logger.prototype, 'error').mockImplementation(mockLogger.error);

    service = new FileUploadService(mockConfigService as unknown as ConfigService);
    // Remove the assignment to 'useSSL'

    (path.join as jest.Mock).mockImplementation((...paths) => paths.join('/'));
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('saveLocalFile', () => {
    const mockFile = {
      buffer: Buffer.from('test file'),
    };
    const mockDestination = 'uploads';
    const mockFilename = 'test.txt';

    beforeEach(() => {
      (fs.existsSync as jest.Mock).mockReturnValue(false);
      (fs.mkdirSync as jest.Mock).mockImplementation(() => {});
      (fs.writeFileSync as jest.Mock).mockImplementation(() => {});
    });

    it('should save a file locally', async () => {
      const result = await service.saveLocalFile(mockDestination, mockFilename, mockFile);
      expect(result).toEqual(mockDestination);
      expect(fs.existsSync).toHaveBeenCalledWith(expect.stringContaining(mockDestination));
      expect(fs.mkdirSync).toHaveBeenCalledWith(expect.stringContaining(mockDestination), { recursive: true });
      expect(fs.writeFileSync).toHaveBeenCalledWith(expect.stringContaining(`${mockDestination}/${mockFilename}`), mockFile.buffer);
    });

    it('should handle directory creation errors', async () => {
      (fs.mkdirSync as jest.Mock).mockImplementation(() => {
        throw new Error('Directory creation error');
      });

      await expect(service.saveLocalFile(mockDestination, mockFilename, mockFile)).rejects.toThrow(InternalServerErrorException);
      expect(mockLogger.error).toHaveBeenCalledWith('Error creating directory: Directory creation error');
    });
  });

  describe('upload', () => {
    it('should upload a file to Minio if STORAGE_MODE is minio', async () => {
      const file = {
        buffer: Buffer.from('test file'),
        mimetype: 'text/plain',
      };
      const filename = 'test.txt';
      const destination = 'uploads';
      const expectedUrl = `http://${mockConfigService.get('STORAGE_ENDPOINT')}:${mockConfigService.get('STORAGE_PORT')}/${mockConfigService.get('MINIO_BUCKETNAME')}/${filename}`;

      jest.spyOn(service as any, 'uploadToMinio').mockResolvedValue(expectedUrl);

      const result = await service.upload(file, destination, filename);
      expect(result).toEqual(expectedUrl);
      expect(service.uploadToMinio).toHaveBeenCalledWith(filename, file);
    });
    
  });
});