import {
  Controller, Get, Post, Body, Param, Query,
  UseGuards, ParseIntPipe,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard, Roles, RolesGuard } from '../auth/jwt-auth.guard';
import {
  IsEmail, IsString, IsEnum, Length,
  Matches, MaxLength, IsOptional,
} from 'class-validator';
import { UserRole } from '../users/user.entity';

class CreateUserDto {
  @IsString()
  @Length(20, 60, { message: 'Name must be 20-60 characters' })
  name: string;

  @IsEmail({}, { message: 'Invalid email' })
  email: string;

  @IsString()
  @Length(8, 16, { message: 'Password must be 8-16 characters' })
  @Matches(/^(?=.*[A-Z])(?=.*[!@#$%^&*()\-_=+\[\]{};':"\\|,.<>/?])/, {
    message: 'Password must have at least one uppercase letter and one special character',
  })
  password: string;

  @IsString()
  @MaxLength(400)
  address: string;

  @IsEnum(UserRole)
  role: UserRole;
}

class CreateStoreDto {
  @IsString()
  @Length(20, 60, { message: 'Name must be 20-60 characters' })
  name: string;

  @IsEmail({}, { message: 'Invalid email' })
  email: string;

  @IsString()
  @MaxLength(400)
  address: string;

  @IsOptional()
  @IsEmail()
  ownerEmail?: string;
}

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
@Controller('admin')
export class AdminController {
  constructor(private adminService: AdminService) {}

  @Get('dashboard')
  getDashboard() {
    return this.adminService.getDashboard();
  }

  @Get('users')
  getUsers(@Query() q: any) {
    return this.adminService.getUsers(q);
  }

  @Get('users/:id')
  getUserById(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.getUserById(id);
  }

  @Post('users')
  createUser(@Body() dto: CreateUserDto) {
    return this.adminService.createUser(dto);
  }

  @Get('stores')
  getStores(@Query() q: any) {
    return this.adminService.getStores(q);
  }

  @Post('stores')
  createStore(@Body() dto: CreateStoreDto) {
    return this.adminService.createStore(dto);
  }
}
