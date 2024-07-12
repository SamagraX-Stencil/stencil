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
import {
  FastifyFilesInterceptor,
  FastifyFileInterceptor,
} from '../interceptors/file-upload.interceptor';
import { MultipartFile } from '../interfaces/file-upload.interface';
import { FileUploadService } from '../services/file-upload.service';
import { FastifyReply } from 'fastify';
import {
  FileUploadRequestDTO,
  MakeBucketRequestDTO,
} from '../services/dto/file-upload.dto';

interface UploadFilesDto {
  filename: string[];
}

@Controller('files')
export class FileUploadController {
  private readonly logger = new Logger(FileUploadController.name);
  constructor(private readonly filesService: FileUploadService) {}

  @Post('make-bucket')
  async makeBucket(@Body() body: MakeBucketRequestDTO): Promise<string> {
    return await this.filesService.makeBucket(body.destination);
  }

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
      // file.size is an added attribute that comes from MultipartFile Interface defined in file-upload.interface
      if (file.buffer.length === 0) {
        return {
          statusCode: 400,
          message: 'empty file uploads are not allowed'
        }
      }
      const fileUploadRequestDto = new FileUploadRequestDTO();
      fileUploadRequestDto.file = file;
      fileUploadRequestDto.destination = destination;
      fileUploadRequestDto.filename = filename;
      console.log(fileUploadRequestDto);
      const directory = await this.filesService.upload(fileUploadRequestDto);
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

  // @Post('upload-files')
  // @UseInterceptors(FastifyFilesInterceptor('file', []))
  //    async uploadMultipleFiles(
  //      @UploadedFiles() file: ReadonlyArray<MultipartFile>,
  //      @Query('destination') destination: string,
  //      @Body() body: UploadFilesDto,
  //    ): Promise<{
  //      statusCode?: number;
  //      message: string;
  //      files?: { url: any }[] | undefined;
  //    }> {
  //      try {
  //        const { filename } = body;
  //        const directories = await this.filesService.uploadMultiple(
  //          file,
  //          destination,
  //          filename,
  //        );
  //        return {
  //          message: 'Files uploaded successfully',
  //           files: directories.map((directory) => ({ url: directory })),
  //        };
  //      } catch (error) {
  //        this.logger.error(`Error uploading files: ${error.message}`);
  //        throw new InternalServerErrorException('File upload Failed');
  //      }
  //    }

  @Get('download')
  async downloadFile(
    @Query('destination') destination: string,
    @Query('filename') filename: string,
    @Res() res: FastifyReply,
  ): Promise<void> {
    const fileStream = await this.filesService.download(destination, filename);

    res.headers({
      'Content-Type': 'application/octet-stream',
      'Content-Disposition': `attachment; filename=${filename}`,
    });
    fileStream.pipe(res.raw);
  }
}
