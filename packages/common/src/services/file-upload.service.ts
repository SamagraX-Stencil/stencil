import { FastifyInstance } from 'fastify';
import * as fs from 'fs';
import * as path from 'path';
import * as fastify from 'fastify';
import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { Client } from 'minio';
import { STORAGE_MODE } from '../interfaces/file-upload.interface';
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

  async uploadToMinio(filename: string, file: any): Promise<string> {
    const metaData = {
      'Content-Type': file.mimetype,
    };
    return new Promise((resolve, reject) => {
      this.storage.putObject(
        this.bucketName,
        filename,
        file.buffer,
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

  async saveLocalFile(destination: string, filename: string, file: any): Promise<string> {
    const uploadsDir = path.join(process.cwd(), destination);
    const localFilePath = path.join(uploadsDir, filename);
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
    fs.writeFileSync(localFilePath, file.buffer);
    return destination;
  }

  async upload(file: any, destination: string, filename: string): Promise<string> {
    try {
      if (this.useService) {
        this.logger.log('Using Minio for file upload');
        return await this.uploadToMinio(filename, file);
      } else {
        this.logger.log('Saving file locally');
        return await this.saveLocalFile(destination, filename, file);
      }
    } catch (error) {
      this.logger.error(`Error uploading file: ${error.message}`);
      throw new InternalServerErrorException('File upload failed');
    }
  }

  async download(destination: string): Promise<any> {
    try {
      if (this.useService) {
        const fileStream = await this.storage.getObject(this.bucketName, destination);
        return fileStream;
      } else {
        const localFilePath = path.join(process.cwd(), 'uploads', destination);
        if (fs.existsSync(localFilePath)) {
          const fileStream = fs.createReadStream(localFilePath);
          return fileStream;
        } else {
          this.logger.error('File does not exist');
          throw new InternalServerErrorException('File does not exist');
        }
      }
    } catch (error) {
      this.logger.error(`Error downloading file: ${error.message}`);
      throw new InternalServerErrorException('File download failed');
    }
  }
}