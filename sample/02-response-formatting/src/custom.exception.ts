import { HttpException, HttpStatus } from '@nestjs/common';

export class CustomResponseException extends HttpException {
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
