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
      map((data) => ({
        success: true,
        statusCode: context.switchToHttp().getResponse().statusCode,
        message: context.switchToHttp().getRequest().method === 'POST' ? 'Created' : 'Success',
        data,
        error: {},
      })),
      catchError((error) => {
        const status = error instanceof HttpException ? error.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
        const message = this.formatErrorMessage(error);

        return of({
          success: false,
          statusCode: status,
          message,
          data: null,
          error: this.formatError(status, message),
        });
      }),
    );
  }

  private formatErrorMessage(error: any): string {
    const message = error?.response?.message || error.message || 'Internal Server Error';
    return Array.isArray(message) ? message.join(', ') : message;
  }

  private formatError(status: number, message: string): any {
    return {
      code: status,
      message,
    };
  }
}
