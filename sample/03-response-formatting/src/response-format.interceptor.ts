import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Injectable()
export class ResponseFormatInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data) => ({
        statuscode: context.switchToHttp().getResponse().statusCode,
        data: [
          {
            data: data,
            errors: [],
          },
        ],
      })),
      catchError((error) => {
        const status =
          error instanceof HttpException
            ? error.getStatus()
            : HttpStatus.INTERNAL_SERVER_ERROR;

        return throwError({
          statuscode: status,
          data: [
            {
              data: {},
              errors: [this.formatError(error)],
            },
          ],
        });
      }),
    );
  }

  private formatError(error: any): any {
    // Format your error object here. This can be customized as per requirements.
    if (error.response) {
      return error.response;
    }

    return {
      message: error.message,
      ...(error.response && { details: error.response }),
    };
  }
}
