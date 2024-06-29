import { FastifyInstance } from 'fastify';
import * as fs from 'fs';
import * as path from 'path';
import * as fastify from 'fastify';
import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { Client } from 'minio';
import { STORAGE_MODE } from '../interfaces/file-upload.interface';
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
  private readonly useService: boolean = this.configService.get<string>('STORAGE_MODE')?.toLowerCase() === this.configService.get<string>('STORAGE_MODE.MINIO');
  private readonly fastifyInstance: FastifyInstance;
  private logger: Logger;
  
  constructor(private readonly configService: ConfigService) {
    this.logger = new Logger('FileUploadService');

    switch (this.configService.get<string>('STORAGE_MODE')?.toLowerCase()) {
      case this.configService.get<string>('STORAGE_MODE.MINIO'): 
        this.storage = new Client({
          endPoint: this.configService.get<string>('STORAGE_ENDPOINT'),     
          port: parseInt(this.configService.get('STORAGE_PORT')),
          useSSL:
            this.configService.get<string>('CLIENT_USE_SSL').toLocaleLowerCase() === 'true'
              ? true
              : false,
          accessKey: this.configService.get('STORAGE_ACCESS_KEY'),
          secretKey: this.configService.get('STORAGE_SECRET_KEY'),
        });
        break;

      default:
        this.fastifyInstance = fastify();
    }
  }

  

  async uploadToMinio(
    uploadToMinioRequestDto: UploadToMinioRequestDTO,
  ): Promise<string> {
    const metaData = {
      'Content-Type': uploadToMinioRequestDto.file.mimetype,
    };
    return new Promise((resolve, reject) => {
      this.storage.putObject(
         this.configService.get<string>('MINIO_BUCKETNAME'), //
        uploadToMinioRequestDto.filename,
        uploadToMinioRequestDto.file.buffer,
        metaData,
        function (err) {
          if (err) {
            console.log('err: ', err);
            reject(err);
          }
          resolve(
            `${
              this.configService.get('STORAGE_USE_SSL')?.toLocaleLowerCase() === 'true'
                ? 'https'
                : 'http'
            }://${this.configService.get('STORAGE_ENDPOINT')}:${this.configService.get('STORAGE_PORT')}/${
               this.configService.get('MINIO_BUCKETNAME')       
            }/${filename}`,
          );
        },
      );
    });
  }

  async saveLocalFile(
    saveToLocalRequestDto: SaveToLocaleRequestDTO,
  ): Promise<string> {
    const uploadsDir = path.join(
      process.cwd(),
      saveToLocalRequestDto.destination,
    );
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

  async upload(fileUploadRequestDto: FileUploadRequestDTO): Promise<string> {
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
      this.logger.error(`Error uploading file: ${error}`);
      throw new InternalServerErrorException('File upload failed');
    }
  }

  async download(fileDownloadRequestDto: FileDownloadRequestDTO): Promise<any> {
    try {
      if (this.useService) {
        const fileStream = await this.storage.getObject(
          this.configService.get<string>('STORAGE_CONTAINER_NAME'),
          fileDownloadRequestDto.destination,
        );
        return fileStream;
      } else {
        const localFilePath = path.join(
          process.cwd(),
          'uploads',
          fileDownloadRequestDto.destination,
        ); // don't use __dirname here that'll point to the dist folder and not the top level folder containing the project (and the uploads folder)
        const fileStream = fs.createReadStream(localFilePath);
        return fileStream;
      }
    } catch (error) {
      this.logger.error(`Error downloading file: ${error.message}`);
      throw new InternalServerErrorException('File download failed');
    }
  }
}
