import { IsNotEmpty, IsString } from 'class-validator';

export class ChangePasswordDTO {
  @IsString()
  @IsNotEmpty()
  username: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsString()
  @IsNotEmpty()
  OTP: string;
}
