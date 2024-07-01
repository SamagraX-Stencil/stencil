declare module 'fastify-multipart' {
    interface ParsedPart {
      fieldname: string;
      value: string;
      fieldnameTruncated: boolean;
      valueTruncated: boolean;
      mimetype: string;
      encoding: string;
      filename: string;
      limit: boolean;
    }
  
    interface MultipartFields {
      [key: string]: ParsedPart | ParsedPart[];
    }
  }
  