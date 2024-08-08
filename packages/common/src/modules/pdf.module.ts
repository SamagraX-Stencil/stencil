import { Module } from '@nestjs/common';
import { PdfController } from '../controllers/pdf.controller';
import { PdfService } from '../services/pdf.service';

@Module({
  imports: [],
  controllers: [PdfController],
  providers: [PdfService],
})
export class PdfModule {}
