import {
  CallHandler,
  ExecutionContext,
  Inject,
  mixin,
  Logger,
  NestInterceptor,
  Optional,
  Type,
  HttpCode,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import FastifyMulter from 'fastify-multer';
import { Options, Multer } from 'multer';
import { InterceptResponseDTO } from './dto/file-upload.dto';

type MulterInstance = any;

export function FastifyFilesInterceptor(
  fieldName: string,
  localOptions: Array<Options>,
): Type<NestInterceptor> {
  class MixinInterceptor implements NestInterceptor {
    protected multer: MulterInstance;
    private readonly logger : Logger;
    constructor(
      @Optional()
      @Inject('MULTER_MODULE_OPTIONS')
      options: Multer,
    ) {
      this.multer = (FastifyMulter as any)({ ...options, ...localOptions });
      this.logger = new Logger(FastifyFilesInterceptor.name);
    }

    async intercept(
      context: ExecutionContext,
      next: CallHandler,
    ): Promise<Observable<InterceptResponseDTO>> {
      const ctx = context.switchToHttp();

      await new Promise<void>((resolve, reject) =>
        this.multer.array(fieldName)(
          ctx.getRequest(),
          ctx.getResponse(),
          (error: any) => {
            if (error) {
              this.logger.error(`Error uploading files: ${error.message}`, error.stack);
              return reject(error);
            }
            resolve();
          },
        ),
      );

      return next.handle();
    }
  }

  const Interceptor = mixin(MixinInterceptor);
  return Interceptor as Type<NestInterceptor>;
}