import {
  Controller,
  Post,
  UploadedFiles,
  UseInterceptors,
  Headers,
} from '@nestjs/common';
import { FastifyFilesInterceptor } from '../interceptors/file-upload.interceptor';
import { MultipartFile } from '../interfaces/file-upload.interface';
import { PdfService } from '../services/pdf.service';

@Controller('pdf')
export class PdfController {
  constructor(private readonly pdfService: PdfService) {}

  @Post('generate')
  @UseInterceptors(FastifyFilesInterceptor([
    { name: 'file' },
    { name: 'template' },
    { name: 'assets', maxCount: 1 }, 
  ]))
  async generateCertificates(
    @UploadedFiles() files: { file?: MultipartFile[]; template?: MultipartFile[]; assets?: MultipartFile[] },
    @Headers('output-path') outputPath?: string,  
  ): Promise<{ statusCode?: number; message: string; errors?: any }> {
    try {
      const csvFile = files.file?.[0];
      const templateFile = files.template?.[0];
      const assetsFile = files.assets?.[0];

      if (!csvFile || !templateFile) {
        throw new Error('Missing file or template');
      }

      console.time('Execution Time');
      await this.pdfService.generateCertificates(csvFile, templateFile, assetsFile, outputPath);  
      console.timeEnd('Execution Time');
      return { message: 'Certificates generated successfully' };
    } catch (error) {
      console.error(`Error generating certificates: ${error.message}`);
      console.timeEnd('Execution Time');
      return {
        statusCode: 500,
        message: 'Certificate generation failed',
        errors: error.message,
      };
    }
  }
}
