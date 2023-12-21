import { HttpException, HttpStatus } from '@nestjs/common';

export class CustomHttpException extends HttpException {
  private customFields: any;

  constructor(
    response: string | Record<string, any>,
    status: HttpStatus,
    customFields?: any,
  ) {
    super(response, status);
    this.customFields = customFields;
  }

  getCustomFields(): any {
    return this.customFields;
  }
}
