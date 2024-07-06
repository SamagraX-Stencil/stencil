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
      map((data) => {
        return {
          success: true,
          statusCode: context.switchToHttp().getResponse().statusCode,
          data,
          error: null,
        };
      }),
      catchError((error) => {
        const status =
          error instanceof HttpException
            ? error.getStatus()
            : HttpStatus.INTERNAL_SERVER_ERROR;
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

  private formatErrorMessage(error: any): ReadonlyArray<string> {
    let errMessage =
      error?.response?.message || error.message || 'Internal Server Error';

    // Attempt to parse the error message if it's a string
    if (typeof errMessage === 'string') {
      try {
        const parsedMessage = JSON.parse(errMessage);
        if (parsedMessage && typeof parsedMessage === 'object') {
          errMessage = parsedMessage.message || parsedMessage;
        }
      } catch (e) {
        // If parsing fails, use the original string
      }
    }

    return Array.isArray(errMessage) ? errMessage : [errMessage];
  }
}
