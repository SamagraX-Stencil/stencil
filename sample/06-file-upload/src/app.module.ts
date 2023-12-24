import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { FileUploadModule } from '@samagra-x/stencil';
@Module({
  imports: [FileUploadModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
