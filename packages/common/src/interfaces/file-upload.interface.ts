import * as fastifyMutipart from 'fastify-multipart';

export enum STORAGE_MODE {
  MINIO = 'minio',
  LOCAL = 'local',
}

export interface MultipartFile {
  buffer(buffer: any): unknown;
  toBuffer: () => Promise<Buffer>;
  file: NodeJS.ReadableStream;
  filepath: string;
  fieldname: string;
  filename: string;
  encoding: string;
  mimetype: string;
  fields: fastifyMutipart.MultipartFields;
}
