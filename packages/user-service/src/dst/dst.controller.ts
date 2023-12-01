import { Controller, Get, HttpException, HttpStatus, Param, Query } from '@nestjs/common';
import { SkipThrottle, Throttle } from '@nestjs/throttler';
import { SignupResponse } from './dst.interface';
import { DstService } from './dst.service';
import { OtpService } from './otp/otp.service';
import { SMSResponse } from './sms/sms.interface';

@Controller('dst')
export class DstController {
    constructor(
        private readonly otpService: OtpService,
        private readonly dstService: DstService,
      ) {}

      @Get('/sendOTP')
      @SkipThrottle()
      async sendOTP(@Query('phone') phone): Promise<any> {
        const status: SMSResponse = await this.otpService.sendOTP(phone);
        const resp: SignupResponse = await this.dstService.transformOtpResponse(status);
        return { resp };
      }

      // @Throttle(3, 60)
      // @Get('/verifyOTP')
      // async verifyOTP(@Query('phone') phone, @Query('otp') otp): Promise<any> {
      //   const otpStatus: SMSResponse = await this.otpService.verifyOTP({ phone, otp });
      //   const status = otpStatus.status;
      //   const resp: SignupResponse = await this.dstService.verifyAndLoginOTP({ phone, status });
      //   return { resp };
      // }
      
      // @Throttle(3, 60)
      // @Get('/test')
      // async loginTrainee(@Query('id') id): Promise<any> {
      //   const resp = await this.dstService.checkUserInDb(id);
      //   return { resp };
      // }

      @Throttle(parseInt(process.env.DST_API_LIMIT), parseInt(process.env.DST_API_TTL))
      @Get('/:role/loginOrRegister')
      async loginOrRegister(@Param('role') role: string, @Query('id') id, @Query('phone') phone, @Query('otp') otp, @Query('dob') dob): Promise<any> {
        let resp: SignupResponse;
        if(role === "principal" || role === "trainer"){
          if(phone == null || otp == null){
            throw new HttpException(`Error loggin in: Param: ${phone==null?(otp==null?"phone and otp": "phone"): ""} missing`, HttpStatus.BAD_REQUEST);
          }else{
            const otpStatus: SMSResponse = await this.otpService.verifyOTP({ phone, otp });
            const status = otpStatus.status;
            resp = await this.dstService.verifyAndLoginOTP({ phone, status, role });
          }
        }
        else if(role === "trainee"){
          if(id == null || dob == null){
            throw new HttpException(`Error loggin in: Param: ${id==null?(dob==null?"id and dob": "id"): ""} missing`, HttpStatus.BAD_REQUEST);
          }else{
            resp = await this.dstService.loginTrainee({ id, dob, role });
          }
        }
        else{
          return new HttpException(`Error loggin in: Not a valid user: ${role}`, HttpStatus.BAD_REQUEST);
        }
        return { resp };
      }

}
