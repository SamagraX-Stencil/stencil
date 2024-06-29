import { Module } from '@nestjs/common';
import { FileUploadController } from '../controllers/file-upload.controller';
import { FileUploadService } from '../services/file-upload.service';
import { ConfigModule } from '@nestjs/config';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  ],
  controllers: [FileUploadController],
  providers: [FileUploadService],
})
export class FileUploadModule {}
