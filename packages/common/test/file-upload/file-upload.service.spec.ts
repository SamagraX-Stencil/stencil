import { FileUploadService } from '../../src/services/file-upload.service';
import { InternalServerErrorException, Logger } from '@nestjs/common';
import { Client } from 'minio';
import * as fs from 'fs';
import * as path from 'path';
import { FileUploadRequestDTO, SaveToLocaleRequestDTO } from 'src/services/dto/file-upload.dto';
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

  beforeEach(() => {
    process.env.STORAGE_MODE = 'minio';
    process.env.STORAGE_ENDPOINT = 'localhost';
    process.env.STORAGE_PORT = '9000';
    process.env.STORAGE_ACCESS_KEY = 'access-key';
    process.env.STORAGE_SECRET_KEY = 'secret-key';
    process.env.MINIO_BUCKETNAME = 'bucket';

    (Client as jest.Mock).mockImplementation(() => mockMinioClient);
    jest.spyOn(Logger.prototype, 'log').mockImplementation(mockLogger.log);
    jest.spyOn(Logger.prototype, 'error').mockImplementation(mockLogger.error);

    service = new FileUploadService();
    service['useSSL'] = false;

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
    const mockFile  = {
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
      const saveToLocaleRequestDto : SaveToLocaleRequestDTO = {
        destination: mockDestination,
        filename: mockFilename,
        file: mockFile,
      };
      const result = await service.saveLocalFile(saveToLocaleRequestDto);
      expect(result).toEqual(mockDestination);
      expect(fs.existsSync).toHaveBeenCalledWith(expect.stringContaining(mockDestination));
      expect(fs.mkdirSync).toHaveBeenCalledWith(expect.stringContaining(mockDestination), { recursive: true });
      expect(fs.writeFileSync).toHaveBeenCalledWith(expect.stringContaining(`${mockDestination}/${mockFilename}`), mockFile.buffer);
    });

    it('should handle directory creation errors', async () => {
      (fs.mkdirSync as jest.Mock).mockImplementation(() => {
        throw new Error('Directory creation error');
      });
      const saveToLocaleRequestDto: SaveToLocaleRequestDTO= {
        destination: mockDestination,
        filename: mockFilename,
        file: mockFile,
      };
      await service.saveLocalFile(saveToLocaleRequestDto);
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
      const expectedUrl = `http://${process.env.STORAGE_ENDPOINT}:${process.env.STORAGE_PORT}/${process.env.MINIO_BUCKETNAME}/${filename}`;

      jest.spyOn(service as any, 'uploadToMinio').mockResolvedValue(expectedUrl);
      const fileUploadDTO: FileUploadRequestDTO = {
        destination,
        filename,
        file,
      };

      const result = await service.upload(fileUploadDTO);
      expect(result).toEqual(expectedUrl);
      expect(service.uploadToMinio).toHaveBeenCalledWith(fileUploadDTO);
    });

    it('should save a file locally if STORAGE_MODE is not minio', async () => {
      process.env.STORAGE_MODE = 'local';

      const file = {
        buffer: Buffer.from('test file'),
        mimetype: 'text/plain',
      };
      const filename = 'test.txt';
      const destination = 'uploads';
      const expectedDestination = 'uploads';

      jest.spyOn(service as any, 'saveLocalFile').mockResolvedValue(expectedDestination);
      
      const saveToLocaleRequestDto: SaveToLocaleRequestDTO = {
        destination: destination,
        filename: filename,
        file: file,
      };

      const result = await service.upload(saveToLocaleRequestDto);
      expect(result).toEqual(expectedDestination);
      expect(service.saveLocalFile).toHaveBeenCalledWith(saveToLocaleRequestDto);
    });

    it('should handle upload errors', async () => {
      const file = {
        buffer: Buffer.from('test file'),
        mimetype: 'text/plain',
      };
      const filename = 'test.txt';
      const destination = 'uploads';

      jest.spyOn(service as any, 'uploadToMinio').mockRejectedValue(new Error('Upload error'));

      const fileUploadDTO: FileUploadRequestDTO = {
        destination: destination,
        filename: filename,
        file: file,
      };

      await expect(service.upload(fileUploadDTO)).rejects.toThrow(InternalServerErrorException);
      expect(mockLogger.error).toHaveBeenCalledWith('Error uploading file: Error: Upload error');
    });
  });
});