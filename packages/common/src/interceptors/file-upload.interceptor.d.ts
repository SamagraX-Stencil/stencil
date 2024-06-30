import { ExecutionContext, CallHandler} from '@nestjs/common'; 
import { Multer, MulterError } from 'multer';
import { Observable } from 'rxjs';

declare type MulterInstance = Multer;

interface FastifyFileInterceptor {
    intercept(context: ExecutionContext, next: CallHandler) :
     Promise<Observable<{ [fieldName: string]: Express.Multer.File }>>; 
}

export { FastifyFileInterceptor, MulterInstance}; 
