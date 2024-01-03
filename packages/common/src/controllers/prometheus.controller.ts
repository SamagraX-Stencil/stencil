import { Controller, Get, Res } from '@nestjs/common';
import { FastifyReply } from 'fastify';
import { register } from 'prom-client';
@Controller()
export class PrometheusController {
  @Get('metrics')
  async metrics(@Res() response: FastifyReply) {
    response.headers({ 'Content-Type': register.contentType });
    response.send(await register.metrics());
  }
}
