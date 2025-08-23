import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode, Req, Put, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiTags } from '@nestjs/swagger';
import { RegisterAuth } from './dto/register-auth.dto';
import { LoginAuthDto } from './dto/login-auth.dto';
import { ForgotPassword } from './dto/forgotPassword-auth.dto';
import { ChangepasswordDto } from './dto/changePassword.dto';
import { AuthGuard } from '@nestjs/passport';
import { TokenGuard } from './guards/token.guard';

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

  @UseGuards(AuthGuard('jwt'), TokenGuard)
  @Put('reset-password')
  async resetPassword(@Req() req, @Body() newPassword: string) {
    return this.authService.resetPassword(
      req.user.id,
      newPassword,
    );
  }
  
  @Post('login')
  login(@Body() loginAuth: LoginAuthDto) {
    return this.authService.login(loginAuth);
  }
}
