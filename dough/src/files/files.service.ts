import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AllConfigType } from '../config/config.type';

@Injectable()
export class FilesService {
  constructor(private readonly configService: ConfigService<AllConfigType>) {}

  async uploadFile(
    file: Express.Multer.File | Express.MulterS3.File,
  ): Promise<any> {
    // TODO: Make this function configurable to work with different providers like:
    // 1. S3
    // 2. Minio (make this default)
    // 3. Local on-disk storage

    if (!file) {
      throw new HttpException(
        {
          status: HttpStatus.UNPROCESSABLE_ENTITY,
          errors: {
            file: 'selectFile',
          },
        },
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }

    // const path = {
    //   local: `/${this.configService.get('app.apiPrefix', { infer: true })}/v1/${file.path
    //     }`,
    //   s3: (file as Express.MulterS3.File).location,
    // };

    return await new Promise((resolve, reject) => {
      try {
        return resolve('file uploaded successfully!');
      } catch (error) {
        return reject(error);
      }
    });
  }
}
