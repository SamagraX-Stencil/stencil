import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  Param,
  Get,
  Res,
  Query,
} from '@nestjs/common';
import { FastifyFileInterceptor } from '../interceptors/file-upload.interceptor';
import { MultipartFile } from '../interfaces/file-upload.interface';
import { FileUploadService } from '../services/file-upload.service';
import { FastifyReply } from 'fastify';

@Controller('files')
export class FileUploadController {
  constructor(private readonly filesService: FileUploadService) { }

  @Post('upload-file')
  @UseInterceptors(FastifyFileInterceptor('file', {}))
  async uploadFile(
    @UploadedFile() file: MultipartFile,
    @Query('destination') destination: string,
    @Query('filename') filename: string,
  ): Promise<{
    statusCode?: number;
    message: string;
    file?: { url: string } | undefined;
  }> {
    try {
      // file.size comes from MultiPartFile Interface defined in file-upload.interface
      if (file.size === 0) {
        return {
          statusCode: 400,
          message: 'empty file uploads are not allowed'
        }
      }
      const directory = await this.filesService.upload(
        file,
        destination,
        filename,
      );
      return {
        message: 'File uploaded successfully',
        file: { url: directory },
      };
    } catch (error) {
      console.error(`Error uploading file: ${error.message}`);
      return {
        statusCode: 500,
        message: 'File upload failed',
        file: undefined,
      };
    }
  }

  @Get('download/:destination')
  async downloadFile(
    @Param('destination') destination: string,
    @Res() res: FastifyReply,
  ): Promise<void> {
    try {
      const fileStream = await this.filesService.download(destination);
      res.headers({
        'Content-Type': 'application/octet-stream',
        'Content-Disposition': `attachment; filename=${destination}`,
      });
      fileStream.pipe(res.raw);
    } catch (error) {
      console.log('error: ', error);
      console.error(`Error downloading file: ${error.message}`);
      res.status(500).send('File download failed');
    }
  }
}
