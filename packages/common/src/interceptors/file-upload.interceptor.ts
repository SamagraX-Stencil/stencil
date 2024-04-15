import {
  CallHandler,
  ExecutionContext,
  Inject,
  mixin,
  NestInterceptor,
  Optional,
  Type,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import FastifyMulter from 'fastify-multer';
import { Options, Multer } from 'multer';

type MulterInstance = any;
export function FastifyFileInterceptor(
  fieldName: string,
  localOptions: Options,
): Type<NestInterceptor> {
  class MixinInterceptor implements NestInterceptor {
    protected multer: MulterInstance;

    constructor(
      @Optional()
      @Inject('MULTER_MODULE_OPTIONS')
      options: Multer,
    ) {
      this.multer = (FastifyMulter as any)({ ...options, ...localOptions });
    }

    async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
      const ctx = context.switchToHttp();
    
      try {
        await new Promise<void>((resolve, reject) =>
          this.multer.single(fieldName)(
            ctx.getRequest(),
            ctx.getResponse(),
            (error: any) => {
              if (error) {
                return reject(error);
              }
    
              const file = ctx.getRequest().file;
              if (file && !this.isValidFileFormat(file.mimetype)) {
                return reject(new Error('Invalid file format'));
              }
    
              resolve();
            },
          ),
        );
    
        return next.handle();
      } catch (error) {
        throw error;
      }
    }
    
    private isValidFileFormat(mimetype: string): boolean {
      // Implement your logic to check if the mimetype is a valid file format
      // For example, you can have an array of allowed formats and check against it
      const allowedFormats = ['image/jpeg', 'image/png'];
      return allowedFormats.includes(mimetype);
    }
  }
  const Interceptor = mixin(MixinInterceptor);
  return Interceptor as Type<NestInterceptor>;
}
