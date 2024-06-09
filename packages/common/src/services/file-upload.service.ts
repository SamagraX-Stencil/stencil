import * as fs from 'fs';
import * as path from 'path';
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Client } from 'minio';
import { encode } from 'urlencode';
import {
  MultipartFile,
  STORAGE_MODE,
} from '../interfaces/file-upload.interface';
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
  private readonly storageMode: string;
  private readonly useSSL: boolean;
  private readonly storageEndpoint: string;
  private readonly storagePort: number;
  private logger: Logger;

  constructor(private readonly configService: ConfigService) {
    this.logger = new Logger(FileUploadService.name);
    this.storageMode = this.configService
      .get<string>('STORAGE_MODE')
      ?.toLowerCase();
    this.useSSL = this.configService.get<string>('STORAGE_USE_SSL') === 'true';
    this.storageEndpoint = this.configService.get<string>('STORAGE_ENDPOINT');
    this.storagePort = parseInt(this.configService.get('STORAGE_PORT'), 10);

    switch (this.storageMode) {
      case STORAGE_MODE.MINIO:
        this.logger.verbose('using minio');
        this.storage = new Client({
          endPoint: this.storageEndpoint,
          port: this.storagePort,
          useSSL: this.useSSL,
          accessKey: this.configService.get('STORAGE_ACCESS_KEY'),
          secretKey: this.configService.get('STORAGE_SECRET_KEY'),
        });
        break;
      case STORAGE_MODE.LOCAL:
        this.logger.verbose('using local storage.');
        if (!fs.existsSync(this.storageEndpoint)) {
          throw new InternalServerErrorException(
            'Storage location does not exist. Make sure this location is present and accessible by the application.',
          );
        }
      default:
        break;
    }
  }

  private buildURL(destination: string, filename: string): string {
    const localhostRegex = /localhost/;
    const ipv4Regex =
      /\b((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])\.){3}(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])\b/;
    const ipv6Regex =
      /\b((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])\.){3}(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])\b|\b(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]|)[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]|)[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]|)[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]|)[0-9]))\b/;
    if (
      localhostRegex.test(this.storageEndpoint) ||
      ipv4Regex.test(this.storageEndpoint) ||
      ipv6Regex.test(this.storageEndpoint)
    ) {
      return `${this.useSSL ? 'https' : 'http'}://${this.storageEndpoint}:${this.storagePort}/${destination}/${encode(filename)}`;
    } else {
      return `${this.useSSL ? 'https' : 'http'}://${this.storageEndpoint}/${destination}/${encode(filename)}`;
    }
  }

  

  async uploadToMinio(uploadToMinioRequestDto: UploadToMinioRequestDTO): Promise<string> {
    const metaData = {
      'Content-Type': uploadToMinioRequestDto.file.mimetype,
    };
    const { destination, filename } = uploadToMinioRequestDto;
    let exists = false;
    try {
      exists = await this.storage.bucketExists(destination);
    } catch (err) {
      this.logger.error(`Error checking bucket presence: ${err.message}`);
    }

    if (!exists) {
      throw new BadRequestException('Bucket does not exist please create one.');
    }

    return new Promise((resolve, reject) => {
      this.storage.putObject(
        destination,
        filename,
        uploadToMinioRequestDto.file.buffer,
        metaData,
        (err) => {
          if (err) {
            this.logger.error(`Error uploading to Minio: ${err.message}`);
            reject(err);
          }
          resolve(this.buildURL(destination, filename));
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
      throw new BadRequestException(
        'Given destination path does not exist. Please create one.',
      );
    }
  }

  async upload(fileUploadRequestDto : FileUploadRequestDTO): Promise<string> {
    try {
      switch (this.storageMode) {
        case STORAGE_MODE.MINIO:
          this.logger.log('using minio');
          return await this.uploadToMinio(fileUploadRequestDto);
        case STORAGE_MODE.LOCAL:
          this.logger.log('writing to storage');
          return await this.saveLocalFile(fileUploadRequestDto);
        default:
          this.logger.error('Invalid storage mode');
          throw new InternalServerErrorException('Invalid storage mode');
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
        const fileUploadRequestDto: FileUploadRequestDTO = new FileUploadRequestDTO();
        fileUploadRequestDto.file = file;
        fileUploadRequestDto.destination = destination;
        fileUploadRequestDto.filename = filenames[c];
        const directory = await this.upload(fileUploadRequestDto);
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
        destination,
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