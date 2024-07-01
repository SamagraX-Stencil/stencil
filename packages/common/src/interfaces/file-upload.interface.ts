import { MultipartFields } from 'fastify-multipart';

export enum STORAGE_MODE {
  MINIO = 'minio',
  LOCAL = 'local',
}

export interface MultipartFile {
  toBuffer: () => Promise<Buffer>;
  file: NodeJS.ReadableStream;
  filepath: string;
  fieldname: string;
  filename: string;
  encoding: string;
  mimetype: string;
  fields: MultipartFields;
}