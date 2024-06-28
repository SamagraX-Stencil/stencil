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
        statuscode: context.switchToHttp().getResponse().statusCode,
        message: 'Success',
        data: data,
        error: {},
      })),
      catchError((error) => {
        const status =
          error instanceof HttpException
            ? error.getStatus()
            : HttpStatus.INTERNAL_SERVER_ERROR;

        return of({
          success: false,
          statuscode: status,
          message: this.formatErrorMessage(error),
          data: null,
          error: this.formatError(error),
        });
      }),
    );
  }

  private formatErrorMessage(error: any): string {
    if (error.response && error.response.message) {
      return error.response.message;
    }
    return error.message || 'Internal Server Error';
  }

  private formatError(error: any): any {
    if (error.response) {
      return {
        code: error.response.statusCode,
        message: error.response.message,
      };
    }
    return {
      code: error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      message: error.message,
    };
  }
}
