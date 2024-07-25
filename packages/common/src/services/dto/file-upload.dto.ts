import { MultipartFile } from 'src/interfaces';

export class UploadToMinioRequestDTO {
  filename: string;
  destination: string;
  file: MultipartFile;
}

export class SaveToLocaleRequestDTO {
  destination: string;
  filename: string;
  file: MultipartFile;
}

export class FileUploadRequestDTO {
  file: MultipartFile;
  destination: string;
  filename: string;
}

export class FileUploadResponseDTO {
  statusCode?: number;
  message: string;
  file?: { url: string } | undefined;
}

export class FileDownloadRequestDTO {
  destination: string;
}

export class FileDownloadResponseDTO {
  stream: NodeJS.ReadableStream;
}

export class MakeBucketRequestDTO {
  destination: string;
}
