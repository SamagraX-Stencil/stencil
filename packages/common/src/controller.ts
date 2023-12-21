import { Controller, Get, Res } from '@nestjs/common';
import { Response } from 'express';
import { register } from 'prom-client';
@Controller()
export class PrometheusController {
  @Get('metrics')
  async metrics(@Res() response: Response) {
    response.set('Content-Type', register.contentType);
    response.send(await register.metrics());
  }
}
