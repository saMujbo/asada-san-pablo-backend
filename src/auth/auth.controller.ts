import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { ApiTags } from '@nestjs/swagger';
import { RegisterAuth } from './dto/register-auth.dto';
import { LoginAuthDto } from './dto/login-auth.dto';
import { ForgotPassword } from './dto/forgotPassword-auth.dto';
import { ChangepasswordDto } from './dto/changePassword.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(@Body() registerAuthDto: RegisterAuth) {
    return this.authService.register(registerAuthDto);
  }

  @Post('forgot-password')
  @HttpCode(200)
  fogotPassword(@Body() forgotObjectUser: ForgotPassword) {
    return this.authService.forgotPassword(forgotObjectUser);
  }

  @Post('change-password')
    async Register(@Req() req, @Body() changePasswordDto: ChangepasswordDto) {
    return await this.authService.changePassword(
      req.user.id,
      changePasswordDto.OldPassword,
      changePasswordDto.NewPassword,
    );
  }
  
  @Post('login')
  login(@Body() loginAuth: LoginAuthDto) {
    return this.authService.login(loginAuth);
  }
}
