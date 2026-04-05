import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode, Req, Put, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiTags } from '@nestjs/swagger';
import { RegisterAuth } from './dto/register-auth.dto';
import { LoginAuthDto } from './dto/login-auth.dto';
import { ForgotPassword } from './dto/forgotPassword-auth.dto';
import { ChangepasswordDto } from './dto/changePassword.dto';
import { TokenGuard } from './guards/token.guard';
import { resetPasswordDto } from './dto/resetPassword.dto';
import { AuthGuard } from './guards/auth.guard';
import { AdminCreateUserDto } from 'src/users/dto/admin-user.dto';
import { GetAuditContext } from 'src/audit/audit.decorator';
import { AuditRequestContext } from 'src/audit/audit.types';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @Post('register')
  register(@Body() registerAuthDto: RegisterAuth) {
    return this.authService.register(registerAuthDto);
  }

  @UseGuards(TokenGuard)
  @Post('admin/create-user')
  adminCreateuser(
    @Body()adminUserDto: AdminCreateUserDto,
    @GetAuditContext() auditContext?: AuditRequestContext,
  ){
    return this.authService.adminCreateUser(adminUserDto, auditContext)
  }

  @Post('forgot-password')
  @HttpCode(200)
  fogotPassword(@Body() forgotObjectUser: ForgotPassword) {
    return this.authService.forgotPassword(forgotObjectUser);
  }

  @UseGuards(AuthGuard, TokenGuard)
  @Put('change-password')
  async Register(
    @Req() req,
    @Body() changePasswordDto: ChangepasswordDto,
    @GetAuditContext() auditContext?: AuditRequestContext,
  ) {
    return await this.authService.changePassword(
      req.user.id,
      changePasswordDto.OldPassword,
      changePasswordDto.NewPassword,
      auditContext,
    );
  }

  @UseGuards(AuthGuard, TokenGuard)
  @Put('reset-password')
  async resetPassword(
    @Req() req,
    @Body() userObjectReset: resetPasswordDto,
    @GetAuditContext() auditContext?: AuditRequestContext,
  ) {
    return this.authService.resetPassword(
      req.user.id,
      userObjectReset,
      auditContext,
    );
  }
  
  @Post('login')
  login(@Body() loginAuth: LoginAuthDto) {
    return this.authService.login(loginAuth);
  }

  @Get('validate')
  @UseGuards(AuthGuard, TokenGuard)
  validateToken(@Req() req) {
    return { valid: true, user: req.user };
  }
}
