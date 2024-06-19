import { FastifyRequest, FastifyReply } from 'fastify';
import { Controller, Param, Body, Get, Post, Put, Delete } from '@nestjs/common';

export class GenericController<T extends { id: number }> {
  constructor(private readonly service: any) {}

  @Get()
  async getAll(request: FastifyRequest, reply: FastifyReply): Promise<any> {
    const result = await this.service.getAll();
    reply.code(200).send({
      status: 'Ok!',
      message: 'Successfully fetch data!',
      result,
    });
  }

  @Post()
  async create(request: FastifyRequest, reply: FastifyReply): Promise<any> {
    const postData: T = request.body;
    return this.service.create(postData);
  }

  @Get(':id')
  async getById(request: FastifyRequest, reply: FastifyReply): Promise<T | null> {
    const id: number = parseInt(request.params.id, 10);
    return this.service.getById(id);
  }

  @Delete(':id')
  async delete(request: FastifyRequest, reply: FastifyReply): Promise<T> {
    const id: number = parseInt(request.params.id, 10);
    return this.service.delete(id);
  }

  @Put(':id')
  async update(request: FastifyRequest, reply: FastifyReply): Promise<T> {
    const id: number = parseInt(request.params.id, 10);
    const data: T = request.body;
    return this.service.update(id, data);
  }
}
