export type FileUploadDTO {
  statusCode?: number;
  message: string;
  file?: { url: string } | undefined;
};
