import {
  IsNotEmpty, IsPhoneNumber, IsString, MaxLength,
} from 'class-validator';

export class VerifyOtpDto {
  @IsString()
  @IsNotEmpty()
  @IsPhoneNumber('IN')
  phone: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(10)
  otp: string;
}
