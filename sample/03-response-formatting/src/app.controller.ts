import { Body, Controller, Get, Post } from '@nestjs/common';
import { AppService } from './app.service';
import { RandomObjectDto } from './object.dto';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('/error')
  getError(): string {
    throw new Error('This is a sample error');
  }

  @Post()
  test(@Body() randomObjectDto: RandomObjectDto) {
    console.log('randomObject: ', randomObjectDto);
    return randomObjectDto;
  }
}
