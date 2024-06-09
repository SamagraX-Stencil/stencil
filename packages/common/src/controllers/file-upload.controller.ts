import {
  Controller,
  Post,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
  Param,
  Get,
  Res,
  Body,
  Query,
} from '@nestjs/common';
import { FastifyFileInterceptor, FastifyFilesInterceptor } from '../interceptors/file-upload.interceptor';
import { MultipartFile } from '../interfaces/file-upload.interface';
import { FileUploadService } from '../services/file-upload.service';
import { FastifyReply } from 'fastify';

interface UploadFilesDto {
  filenames: string[];
}

@Controller('files')
export class FileUploadController {
  constructor(private readonly filesService: FileUploadService) {}

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

  @Post('upload-files')
  @UseInterceptors(FastifyFilesInterceptor('files', 10))
  async uploadMultipleFiles(
    @UploadedFiles() files: MultipartFile[],
    @Query('destination') destination: string,
    @Body() body: UploadFilesDto,
  ): Promise<{
    statusCode?: number;
    message: string;
    files?: { url: any }[] | undefined;
  }> {
    try {
      const { filenames } = body; // Extract filenames from form data
      const directories = await this.filesService.uploadMultiple(
        files,
        destination,
        filenames,
      );
      return {
        message: 'Files uploaded successfully',
        files: directories.map((directory) => ({ url: directory })),
      };
    } catch (error) {
      console.error(`Error uploading files: ${error.message}`);
      return {
        statusCode: 500,
        message: 'Files upload failed',
        files: undefined,
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
