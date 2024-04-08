import { Body, Controller, Delete, Get, Param, Post, Put, Req, Res } from "@nestjs/common";
import { Request, Response } from "express";

export class GenericController<T extends { id: number }> {
  constructor(private readonly service: any) {}

  @Get()
  async getAll(@Req() request: Request, @Res() response: Response): Promise<any> {
    const result = await this.service.getAll();
    return response.status(200).json({
      status: "Ok!",
      message: "Successfully fetch data!",
      result: result,
    });
  }

  @Post()
  async create(@Body() postData: T): Promise<T> {
    return this.service.create(postData);
  }

  @Get(':id')
  async getById(@Param('id') id: number): Promise<T | null> {
    return this.service.getById(id);
  }

  @Delete(':id')
  async delete(@Param('id') id: number): Promise<T> {
    return this.service.delete(id);
  }

  @Put(':id')
  async update(@Param('id') id: number, @Body() data: T): Promise<T> {
    return this.service.update(id, data);
  }
}

