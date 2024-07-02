
export class FileUploadDTO {
    filename: string;
    file: any;
    destination: string;
  }
  
  export class FileDownloadDTO {
    destination: string;
  }

  export class FileUploadMinioDTO {
    filename: string;
    file: any;
  }

  export class FileSaveLocalDTO {
    destination: string;
    filename: string;
    file: any;
  }