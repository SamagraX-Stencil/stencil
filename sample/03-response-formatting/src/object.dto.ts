import { IsEmail, IsNotEmpty, IsNumberString } from 'class-validator';

export class RandomObjectDto {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  password: string;

  @IsNumberString()
  id: string;
}
