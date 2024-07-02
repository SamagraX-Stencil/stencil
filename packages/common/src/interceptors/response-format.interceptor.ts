import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Injectable()
export class ResponseFormatInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((response) => {
        return {
          success: true,
          statusCode: context.switchToHttp().getResponse().statusCode,
          data: response.message, 
          error: null,
        };
      }),
      catchError((error) => {
        const status = error instanceof HttpException ? error.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
        const errMessage = this.formatErrorMessage(error);

        return of({
          success: false,
          statusCode: status,
          data: null,
          error: errMessage,
        });
      }),
    );
  }

  private formatErrorMessage(error: any): string {
    const errMessage = error?.response?.message || error.message || 'Internal Server Error';
    return Array.isArray(errMessage) ? errMessage.join(', ') : errMessage;
  }
}
