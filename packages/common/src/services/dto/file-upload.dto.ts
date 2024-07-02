import { MultipartFile } from "src/interfaces";

export class UploadToMinioRequestDTO {
    filename: string;
    file: MultipartFile;
}

export class SaveToLocaleRequestDTO {
    destination: string;
    filename: string;
    file: MultipartFile; 
}

export class FileUploadRequestDTO { 
    file: MultipartFile
    destination: string;
    filename: string;
}

export class FileUploadResponseDTO {
  statusCode?: number;
  message: string;
  file?: {url: string} | undefined;
}

export class FileDownloadRequestDTO {
  stream: NodeJS.ReadableStream | null;
}

export class FileDownloadResponseDTO{
  stream: NodeJS.ReadableStream;
  }
