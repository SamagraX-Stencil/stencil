import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PdfModule } from '@samagra-x/stencil';
@Module({
  imports: [PdfModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
