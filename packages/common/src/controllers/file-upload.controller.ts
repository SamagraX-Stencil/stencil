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
  Logger,
  ValidationPipe,
  InternalServerErrorException,
} from '@nestjs/common';
import { FastifyFilesInterceptor} from '../interceptors/file-upload.interceptor';
import { MultipartFile } from '../interfaces/file-upload.interface';
import { FileUploadService } from '../services/file-upload.service';
import { FastifyReply } from 'fastify';


interface UploadFilesDto {
 filename: string[];
}

@Controller('files')
export class FileUploadController {
  private readonly logger = new Logger(FileUploadController.name);
  constructor(private readonly filesService: FileUploadService) {}

  @Post('upload-files')
  @UseInterceptors(FastifyFilesInterceptor('file', []))
     async uploadMultipleFiles(
       @UploadedFiles() file: ReadonlyArray<MultipartFile>,
       @Query('destination') destination: string,
       @Body() body: UploadFilesDto,
     ): Promise<{
       statusCode?: number;
       message: string;
       files?: { url: any }[] | undefined;
     }> {
       try {
         const { filename } = body;
         const directories = await this.filesService.uploadMultiple(
           file,
           destination,
           filename,
         );
         return {
           message: 'Files uploaded successfully',
            files: directories.map((directory) => ({ url: directory })),
         };
       } catch (error) {
         this.logger.error(`Error uploading files: ${error.message}`);
         throw new InternalServerErrorException('File upload Failed');
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
      this.logger.error(`Error downloading file: ${error.message}`);
      throw new InternalServerErrorException('Error downloading file');
  }
 }
}
