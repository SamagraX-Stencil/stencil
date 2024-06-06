import { FastifyInstance } from 'fastify';
import * as fs from 'fs';
import * as path from 'path';
import * as fastify from 'fastify';
import { InternalServerErrorException, Logger } from '@nestjs/common';
import { Client } from 'minio';
import { STORAGE_MODE } from '../interfaces/file-upload.interface';
import { FileDownloadRequestDTO, FileUploadRequestDTO, SaveToLocaleRequestDTO, UploadToMinioRequestDTO } from './dto/file-upload.dto';

export class FileUploadService {
  private readonly storage: any;
  private readonly useMinio: boolean;
  private readonly fastifyInstance: FastifyInstance;
  private logger: Logger;
  private useSSL = false;

  constructor() {
    this.logger = new Logger('FileUploadService');
    this.useMinio = process.env.STORAGE_MODE?.toLowerCase() === 'minio';
    this.useSSL = !process.env.STORAGE_USE_SSL
      ? false
      : process.env.STORAGE_USE_SSL?.toLocaleLowerCase() === 'true';

    switch (process.env.STORAGE_MODE?.toLowerCase()) {
      case STORAGE_MODE.MINIO:
        this.storage = new Client({
          endPoint: process.env.STORAGE_ENDPOINT,
          port: parseInt(process.env.STORAGE_PORT),
          useSSL: this.useSSL,
          accessKey: process.env.STORAGE_ACCESS_KEY,
          secretKey: process.env.STORAGE_SECRET_KEY,
        });
        break;
      default:
        this.fastifyInstance = fastify();
    }
  }

  async uploadToMinio(uploadToMinioRequestDto: UploadToMinioRequestDTO): Promise<string> {
    const metaData = {
      'Content-Type': uploadToMinioRequestDto.file.mimetype,
    };
    return new Promise((resolve, reject) => {
      this.storage.putObject(
        process.env.MINIO_BUCKETNAME,
        uploadToMinioRequestDto.filename,
        uploadToMinioRequestDto.file.buffer,
        metaData,
        function (err) {
          if (err) {
            console.log('err: ', err);
            reject(err);
          }
          resolve(
            `${this.useSSL ? 'https' : 'http'}://${process.env.STORAGE_ENDPOINT
            }:${process.env.STORAGE_PORT}/${process.env.MINIO_BUCKETNAME
            }/${uploadToMinioRequestDto.filename}`,
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
        // Create the directory
        fs.mkdirSync(uploadsDir, { recursive: true });
        this.logger.log(`Directory created at ${uploadsDir}`);
      } catch (err) {
        this.logger.error(`Error creating directory: ${err.message}`);
      }
    } else {
      this.logger.log(`Directory already exists at ${uploadsDir}`);
    }
    fs.writeFileSync(localFilePath, saveToLocalRequestDto.file.buffer);
    return saveToLocalRequestDto.destination;
  }

  async upload(fileUploadRequestDto : FileUploadRequestDTO): Promise<string> {
    try {
      switch (process.env.STORAGE_MODE?.toLowerCase()) {
        case STORAGE_MODE.MINIO:
          this.logger.log('using minio');
          return await this.uploadToMinio(fileUploadRequestDto);
        default:
          this.logger.log('writing to storage');
          return await this.saveLocalFile(fileUploadRequestDto);
      }
    } catch (error) {
      this.logger.error(`Error uploading file: ${error}`);
      throw new InternalServerErrorException('File upload failed');
    }
  }

  async download(fileDownloadRequestDto : FileDownloadRequestDTO): Promise<any> {
    try {
      if (this.useMinio) {
        const fileStream = await this.storage.getObject(
          process.env.STORAGE_CONTAINER_NAME,
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
