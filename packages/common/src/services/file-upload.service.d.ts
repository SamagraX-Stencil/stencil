import { Client } from 'minio';
import { MultipartFile, STORAGE_MODE } from '../interfaces/file-upload.interface';

declare class FileUploadService {
    private readonly storage: Client;

    uploadToMinio(filename: string, file: MultipartFile): Promise<string>;
  
    saveLocalFile(destination: string, filename: string, file: MultipartFile): Promise<string>;
  
    upload(file: MultipartFile, destination: string, filename: string): Promise<{
      statusCode?: number;
      message: string;
      file?: { url: string } | undefined;
    }>;
  
    download(destination: string): Promise<NodeJS.ReadableStream | null>;
  }

  export default FileUploadService;