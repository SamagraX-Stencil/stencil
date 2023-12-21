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
// import { CustomResponseException } from '../exceptions/custom-response.exception';

class CustomResponseException extends HttpException {
  constructor(status: HttpStatus, data: any, errors: any[] | null) {
    super(
      {
        statuscode: status,
        data: [
          {
            data: data,
            errors: errors,
          },
        ],
      },
      status,
    );
  }
}
@Injectable()
export class ResponseFormatInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data) => ({
        statuscode: context.switchToHttp().getResponse().statusCode,
        data: [
          {
            data: {
              message: data,
              statusCode: context.switchToHttp().getResponse().statusCode,
            },
            errors: [],
          },
        ],
      })),
      catchError((error) => {
        const status =
          error instanceof HttpException
            ? error.getStatus()
            : HttpStatus.INTERNAL_SERVER_ERROR;
        console.log('error: ', error);

        // return {
        //   statuscode: status,
        //   data: {},
        //   errors: [this.formatError(error)],
        // };

        return throwError(
          () =>
            new HttpException(
              HttpException.createBody({
                statuscode: status,
                data: [
                  {
                    data: {},
                    errors: [this.formatError(error)],
                  },
                ],
              }),
              status,
            ),
        );
      }),
    );
  }

  private formatError(error: any): any {
    // Format your error object here. This can be customized as per requirements.
    if (error.response) {
      return {
        message: error.response.message,
        statusCode:
          error.response.statusCode || HttpStatus.INTERNAL_SERVER_ERROR,
      };
    }
    return {
      message: error.message,
      statusCode: error.status || HttpStatus.INTERNAL_SERVER_ERROR,
    };
  }
}
