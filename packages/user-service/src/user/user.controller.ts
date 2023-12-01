import { SearchResponse } from '@fusionauth/typescript-client';
import ClientResponse from '@fusionauth/typescript-client/build/src/ClientResponse';
import { Body, Controller, Get, Patch, Post, Query } from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import { ChangePasswordDTO } from './dto/changePassword.dto';

import { FusionauthService } from './fusionauth/fusionauth.service';
import { OtpService } from './otp/otp.service';
import { SMSResponse } from './sms/sms.interface';
import { SignupResponse, UsersResponse } from './user.interface';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(
    private readonly fusionAuthService: FusionauthService,
    private readonly otpService: OtpService,
    private readonly userService: UserService,
  ) {}

  @Get('/verify')
  async verifyUsernamePhoneCombination(): Promise<any> {
    const status: boolean =
      await this.fusionAuthService.verifyUsernamePhoneCombination();
    return { status };
  }

  @Get('/sendOTP')
  async sendOTP(@Query('phone') phone): Promise<any> {
    const status: SMSResponse = await this.otpService.sendOTP(phone);
    return { status };
  }

  @Get('/verifyOTP')
  async verifyOTP(@Query('phone') phone, @Query('otp') otp): Promise<any> {
    const status: SMSResponse = await this.otpService.verifyOTP({ phone, otp });
    return { status };
  }

  @Post('/signup')
  async signup(@Body() user: any): Promise<SignupResponse> {
    const status: SignupResponse = await this.userService.signup(user);
    return status;
  }

  @Post('/login')
  async login(@Body() user: any): Promise<SignupResponse> {
    if (
      [
        // for the below listed application Ids, we'll be encrypting the creds received
        process.env.FUSIONAUTH_APPLICATION_ID,
        process.env.FUSIONAUTH_HP_ADMIN_CONSOLE_APPLICATION_ID,
      ].indexOf(user.applicationId) !== -1
    ) {
      user.loginId = this.userService.encrypt(user.loginId);
      user.password = this.userService.encrypt(user.password);
    }
    const status: SignupResponse = await this.userService.login(user);
    return status;
  }

  @Patch('/update')
  async update(@Body() user: any): Promise<SignupResponse> {
    const status: SignupResponse = await this.userService.update(user);
    return status;
  }

  @Post('/changePassword/sendOTP')
  async changePasswordOTP(@Body() data: any): Promise<SignupResponse> {
    const status: SignupResponse = await this.userService.changePasswordOTP(
      data.username,
    );
    return status;
  }

  @Patch('/changePassword/update')
  async changePassword(
    @Body() data: ChangePasswordDTO,
  ): Promise<SignupResponse> {
    const status: SignupResponse = await this.userService.changePassword(data);
    return status;
  }
}
