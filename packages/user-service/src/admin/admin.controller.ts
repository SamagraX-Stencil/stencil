import { User } from '@fusionauth/typescript-client';
import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/auth-jwt.guard';
import {
  SignupResponse,
  UserRegistration,
  UsersResponse,
} from './admin.interface';
import { AdminService } from './admin.service';
import { Roles } from './roles.decorator';

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Post('/all')
  @Roles(
    'Admin',
    'school',
    'State Admin',
    'District Admin',
    'Block Admin',
    'School Admin',
  )
  @UseGuards(JwtAuthGuard)
  async fetchUsers(@Request() req, @Body() data: any): Promise<UsersResponse> {
    return await this.adminService.fetchUsers(data);
  }

  @Post('/changePassword')
  @Roles(
    'Admin',
    'school',
    'State Admin',
    'District Admin',
    'Block Admin',
    'School Admin',
  )
  @UseGuards(JwtAuthGuard)
  async updatePassword(
    @Body() data: { loginId: string; password: string },
  ): Promise<SignupResponse> {
    return this.adminService.updatePassword(data);
  }

  @Post('/createUser')
  @Roles(
    'Admin',
    'school',
    'State Admin',
    'District Admin',
    'Block Admin',
    'School Admin',
  )
  @UseGuards(JwtAuthGuard)
  async createUser(@Body() data: UserRegistration): Promise<SignupResponse> {
    return await this.adminService.createUser(data);
  }

  @Patch('/updateUser/:userId')
  @Roles(
    'Admin',
    'school',
    'State Admin',
    'District Admin',
    'Block Admin',
    'School Admin',
  )
  @UseGuards(JwtAuthGuard)
  async updateUser(
    @Param('userId') userId: string,
    @Body() data: User,
  ): Promise<SignupResponse> {
    return await this.adminService.updateUser(userId, data);
  }

  @Get('/searchUser')
  @Roles(
    'Admin',
    'school',
    'State Admin',
    'District Admin',
    'Block Admin',
    'School Admin',
  )
  @UseGuards(JwtAuthGuard)
  async searchUser(
    @Query()
    query: {
      queryString: string;
      startRow: number;
      numberOfResults: number;
    },
  ): Promise<UsersResponse> {
    console.log(query.numberOfResults);
    return await this.adminService.fetchUsersByString(
      query.queryString,
      query.startRow,
      query.numberOfResults,
    );
  }

  @Get('/user/:userId')
  @Roles(
    'Admin',
    'school',
    'State Admin',
    'District Admin',
    'Block Admin',
    'School Admin',
  )
  @UseGuards(JwtAuthGuard)
  async searchUserbyId(
    @Param('userId') userId: string,
  ): Promise<UsersResponse> {
    return await this.adminService.fetchUsersByString(
      userId,
      undefined,
      undefined,
    );
  }

  @Patch('/user/:userId/deactivate')
  @Roles(
    'Admin',
    'school',
    'State Admin',
    'District Admin',
    'Block Admin',
    'School Admin',
  )
  @UseGuards(JwtAuthGuard)
  async deactivateUserById(
    @Param('userId') userId: string,
    @Query('hardDelete') hardDelete = false,
  ): Promise<UsersResponse> {
    return await this.adminService.deactivateUserById(userId, hardDelete);
  }

  @Patch('/user/:userId/activate')
  @Roles(
    'Admin',
    'school',
    'State Admin',
    'District Admin',
    'Block Admin',
    'School Admin',
  )
  @UseGuards(JwtAuthGuard)
  async activateUserById(
    @Param('userId') userId: string,
  ): Promise<UsersResponse> {
    return await this.adminService.activateUserById(userId);
  }
}
