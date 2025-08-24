import { HttpException, Injectable, InternalServerErrorException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { RegisterAuth } from './dto/register-auth.dto';
import { LoginAuthDto } from './dto/login-auth.dto';
import { JwtService } from '@nestjs/jwt';
import { ForgotPassword } from './dto/forgotPassword-auth.dto';
import { v4 as uuidv4 } from 'uuid';
import { RolesService } from 'src/roles/roles.service';
import { UsersService } from 'src/users/users.service';
import { ConfigService } from '@nestjs/config';
import { MailServiceService } from 'src/mail-service/mail-service.service';
import { ChangepasswordDto } from './dto/changePassword.dto';
import { resetPasswordDto } from './dto/resetPassword.dto';
@Injectable()
export class AuthService {
  constructor (
    private readonly userService: UsersService,
    private readonly roleService: RolesService,
    private readonly mailClient: MailServiceService,
    private readonly configService: ConfigService,
    private jwtService: JwtService
  ){}

  async comparePasswords(passwordToCompare: string, mainPassword: string) {
    const IsCorrectPassword = await bcrypt.compare(
      passwordToCompare,
      mainPassword,
    );
    return IsCorrectPassword;
  }

  async register(createAuthDto: RegisterAuth) {
    const { Password,ConfirmPassword,...rest } = createAuthDto;
    if(Password !== ConfirmPassword){
      throw new Error('Las contraseñas no coinciden')
    }
    const hashed= await bcrypt.hash(Password,10);

    const defaultRole = await this.roleService.findByName('GUEST');

    if (!defaultRole) {
      throw new Error('❌ Rol por defecto "USER" no existe en la base de datos');
    }

    const newUser = this.userService.create({...rest, Password:hashed, Roles: [defaultRole]});
    return newUser;
  }

  async login(userObjectLogin: LoginAuthDto) {
    const { Email, Password } = userObjectLogin;
    const findUser = await this.userService.findByEmail(Email);

    if (!findUser) throw new HttpException('Usuario no encontrado', 404);

    const isPasswordValid = await bcrypt.compare(Password, findUser.Password);

    if (!isPasswordValid) throw new HttpException('Contraseña invalida', 403);

    const rolesNames = findUser.Roles?.map((role) => role.Rolname);

    const payload = { 
      id: findUser.Id,
      roles: rolesNames,
      jti: uuidv4()
    };

    const token = await this.jwtService.signAsync(payload);

    const data = {
      user: findUser,
      token
    };

    return data;
  }

  async forgotPassword(userObjectForgot: ForgotPassword) {
    const userToEdit = await this.userService.findByIDcardEmail(userObjectForgot);
    if (userToEdit) {
      const payload = await {
        Email: userToEdit.Email,
        id: userToEdit.Id,
        jti: uuidv4(),
      };

      if (!userToEdit) {
        throw new NotFoundException('Correo electronico no encontrado!');
      }

      if (!userToEdit.IsActive) {
        throw new UnauthorizedException(
          'Usuario inactivo, contacte al administrador de Recurso Humano',
        );
      }

      const token = await this.jwtService.signAsync(payload, {
        expiresIn: '10m',
      });
      const FrontendRecoverURL = `${await this.configService.get('FrontEndBaseURL')}/auth/reset-password`;
      const url = `${FrontendRecoverURL}?token=${token}`;

      this.mailClient.sendForgotpasswordEmail({
        to: userObjectForgot.Email,
        subject: 'Recuperación de constraseña',
        RecoverPasswordURL: url,
      });
    }

    return {
      message:
        'Si el usuario es válido, recibirá un email en breve para la recuperación.',
    };
  }

  async resetPassword(userId: number, userObjectReset: resetPasswordDto) {
    const { NewPassword,ConfirmPassword } = userObjectReset;
    if(NewPassword !== ConfirmPassword){
      throw new Error('Las contraseñas no coinciden')
    }

    const userToEdit = await this.userService.findOne(userId);

    if (!userToEdit) {
      throw new NotFoundException('Usurio no encontrado!');
    }

    return this.userService.updatePassword(userId, NewPassword);
  }

  async changePassword(UserId: number, OldPassword: string, NewPassword: string){
    const userToEdit = await this.userService.findOne(UserId)

    if (!userToEdit) {
      throw new NotFoundException('Usurio no encontrado!');
    }
    const IsCorrectPassword = await this.comparePasswords(
      OldPassword,
      userToEdit.Password,
    );
    if(!IsCorrectPassword){
      throw new UnauthorizedException('Contraseña actual invalida');
    }
    return this.userService.updatePassword(UserId,NewPassword);
  }
}
