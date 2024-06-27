import { FastifyInstance } from 'fastify';
import * as fs from 'fs';
import * as path from 'path';
import * as fastify from 'fastify';
import { InternalServerErrorException, Logger } from '@nestjs/common';
import { Client } from 'minio';
import { STORAGE_MODE } from '../interfaces/file-upload.interface';

export class FileUploadService {
  private readonly storage: any;
  private readonly useMinio: boolean = process.env.STORAGE_MODE?.toLowerCase() === STORAGE_MODE.MINIO;
  private readonly fastifyInstance: FastifyInstance;
  private logger: Logger;

  constructor() {
    this.logger = new Logger('FileUploadService');
    
    switch (process.env.STORAGE_MODE?.toLowerCase()) {
      case STORAGE_MODE.MINIO:
        this.storage = new Client({
          endPoint: process.env.STORAGE_ENDPOINT,
          port: parseInt(process.env.STORAGE_PORT),
          useSSL:
            process.env.CLIENT_USE_SSL.toLocaleLowerCase() === 'true'
              ? true
              : false,
          accessKey: process.env.STORAGE_ACCESS_KEY,
          secretKey: process.env.STORAGE_SECRET_KEY,
        });
        break;
      default:
        this.fastifyInstance = fastify();
    }
  }

  async uploadToMinio(filename: string, file: any): Promise<string> {
    const metaData = {
      'Content-Type': file.mimetype,
    };
    return new Promise((resolve, reject) => {
      this.storage.putObject(
        process.env.MINIO_BUCKETNAME,
        filename,
        file.buffer,
        metaData,
        function (err) {
          if (err) {
            console.log('err: ', err);
            reject(err);
          }
          resolve(
            `${
              process.env.STORAGE_USE_SSL?.toLocaleLowerCase() === 'true'
                ? 'https'
                : 'http'
            }://${process.env.STORAGE_ENDPOINT}:${process.env.STORAGE_PORT}/${
              process.env.MINIO_BUCKETNAME
            }/${filename}`,
          );
        },
      );
    });
  }

  async saveLocalFile(
    destination: string,
    filename: string,
    file: any,
  ): Promise<string> {
    const uploadsDir = path.join(process.cwd(), destination);
    const localFilePath = path.join(uploadsDir, filename);
    if (!fs.existsSync(uploadsDir)) {
      try {
        // Create the directory
        fs.mkdirSync(uploadsDir, { recursive: true });
        this.logger.log(`Directory created at ${uploadsDir}`);
      } catch (err) {
        this.logger.error(`Error creating directory: ${err.message}`);
      }
    } else {
      this.logger.log(`Directory already exists at ${uploadsDir}`);
    }
    fs.writeFileSync(localFilePath, file.buffer);
    return destination;
  }

  async upload(
    file: any,
    destination: string,
    filename: string,
  ): Promise<string> {
    try {
      switch (process.env.STORAGE_MODE?.toLowerCase()) {
        case STORAGE_MODE.MINIO:  
          this.logger.log('using minio');
          return await this.uploadToMinio(filename, file);
        default:
          this.logger.log('writing to storage');
          return await this.saveLocalFile(destination, filename, file);
      }
    } catch (error) {
      this.logger.error(`Error uploading file: ${error}`);
      throw new InternalServerErrorException('File upload failed');
    }
  }

  async download(destination: string): Promise<any> {
    try {
      if (this.useMinio) {
        const fileStream = await this.storage.getObject(
          process.env.STORAGE_CONTAINER_NAME,
          destination,
        );
        return fileStream;
      } else {
        const localFilePath = path.join(process.cwd(), 'uploads', destination); // don't use __dirname here that'll point to the dist folder and not the top level folder containing the project (and the uploads folder)
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
