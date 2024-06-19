import { FastifyInstance } from 'fastify';
import * as fs from 'fs';
import * as path from 'path';
import * as fastify from 'fastify';
import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { Client } from 'minio';
import { MultipartFile, STORAGE_MODE } from '../interfaces/file-upload.interface';
import {
  FileDownloadRequestDTO,
  FileUploadRequestDTO,
  SaveToLocaleRequestDTO,
  UploadToMinioRequestDTO,
} from './dto/file-upload.dto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class FileUploadService {
  private readonly storage: any;
  private readonly useService: boolean;
  private readonly fastifyInstance: FastifyInstance;
  private readonly useSSL: boolean;
  private readonly storageEndpoint: string;
  private readonly storagePort: number;
  private readonly bucketName: string;
  private logger: Logger;

  constructor(private readonly configService: ConfigService) {
    this.logger = new Logger('FileUploadService');
    this.useService = this.configService.get<string>('STORAGE_MODE')?.toLowerCase() === STORAGE_MODE.MINIO;
    this.useSSL = this.configService.get<string>('STORAGE_USE_SSL') === 'true';
    this.storageEndpoint = this.configService.get<string>('STORAGE_ENDPOINT');
    this.storagePort = parseInt(this.configService.get('STORAGE_PORT'), 10);
    this.bucketName = this.configService.get<string>('MINIO_BUCKETNAME');

    if (this.useService) {
      this.storage = new Client({
        endPoint: this.storageEndpoint,
        port: this.storagePort,
        useSSL: this.useSSL,
        accessKey: this.configService.get('STORAGE_ACCESS_KEY'),
        secretKey: this.configService.get('STORAGE_SECRET_KEY'),
      });
    } else {
      this.fastifyInstance = fastify();
    }
  }

  async uploadToMinio(uploadToMinioRequestDto: UploadToMinioRequestDTO): Promise<string> {
    const metaData = {
      'Content-Type': uploadToMinioRequestDto.file.mimetype,
    };
    return new Promise((resolve, reject) => {
      this.storage.putObject(
         this.configService.get<string>('MINIO_BUCKETNAME'), //
        uploadToMinioRequestDto.filename,
        uploadToMinioRequestDto.file.buffer,
        metaData,
        (err) => {
          if (err) {
            this.logger.error(`Error uploading to Minio: ${err.message}`);
            reject(err);
          }
          resolve(
            `${this.useSSL ? 'https' : 'http'}://${this.storageEndpoint}:${this.storagePort}/${this.bucketName}/${filename}`,
          );
        },
      );
    });
  }

  async saveLocalFile(saveToLocalRequestDto : SaveToLocaleRequestDTO): Promise<string> {
    const uploadsDir = path.join(process.cwd(), saveToLocalRequestDto.destination);
    const localFilePath = path.join(uploadsDir, saveToLocalRequestDto.filename);
    if (!fs.existsSync(uploadsDir)) {
      try {
        fs.mkdirSync(uploadsDir, { recursive: true });
        this.logger.log(`Directory created at ${uploadsDir}`);
      } catch (err) {
        this.logger.error(`Error creating directory: ${err.message}`);
        throw new InternalServerErrorException('File upload failed: directory creation error');
      }
    } else {
      this.logger.log(`Directory already exists at ${uploadsDir}`);
    }
    fs.writeFileSync(localFilePath, saveToLocalRequestDto.file.buffer);
    return saveToLocalRequestDto.destination;
  }

  async upload(fileUploadRequestDto : FileUploadRequestDTO): Promise<string> {
    try {
      switch (this.configService.get<string>('STORAGE_MODE')?.toLowerCase()) {
        case this.configService.get<string>('STORAGE_MODE.MINIO'):  
          this.logger.log('using minio');
          return await this.uploadToMinio(fileUploadRequestDto);
        default:
          this.logger.log('writing to storage');
          return await this.saveLocalFile(fileUploadRequestDto);
      }
    } catch (error) {
      this.logger.error(`Error uploading file: ${error.message}`);
      throw new InternalServerErrorException('File upload failed');
    }
  }

  async uploadMultiple(
    files: ReadonlyArray<MultipartFile>,
    destination: string,
    filenames: string[],
  ): Promise<string[]> {
    const directories: string[] = [];

    if(!files || files.length == 0) {
      this.logger.error(`Error uploading file: : 'files' field missing`);
      throw new InternalServerErrorException('File upload failed: files field missing');
    }
    if(!filenames) {
      this.logger.error(`Error uploading file: : 'filenames' field missing`);
      throw new InternalServerErrorException('File upload failed: filenames field missing');
    }
    if(!Array.isArray(filenames)) {
      filenames = [filenames];
    }
    if (filenames.length != files.length) {
      this.logger.error(`Error uploading file: Number of files is not equal to number of filenames`);
      throw new InternalServerErrorException('File upload failed: Number of files is not equal to number of filenames');  
    }
    let c:number = 0;
    for (const file of files) {
      try {
        const directory = await this.upload(file, destination, filenames[c]);
        directories.push(directory);
      } catch (error) {
        this.logger.error(`Error uploading file: ${error}`);
        throw new InternalServerErrorException('File upload failed');
      }
        c++;
      }
    return directories;
  }

  async download(fileDownloadRequestDto : FileDownloadRequestDTO): Promise<any> {
    try {
      if (this.useMinio) {
        const fileStream = await this.storage.getObject(
          this.configService.get<string>('STORAGE_CONTAINER_NAME'),
          fileDownloadRequestDto.destination,
        );
        return fileStream;
      } else {
        const localFilePath = path.join(process.cwd(), 'uploads', fileDownloadRequestDto.destination); // don't use __dirname here that'll point to the dist folder and not the top level folder containing the project (and the uploads folder)
        if (fs.existsSync(localFilePath)) {
            const fileStream = fs.createReadStream(localFilePath);
            return fileStream;
        }
        else{
            this.logger.error(`Error downloading file: File does not exist`);
            return null;
        }
      }
    } catch (error) {
      this.logger.error(`Error downloading file: ${error.message}`);
      throw new InternalServerErrorException('File download failed');
    }
  }
}