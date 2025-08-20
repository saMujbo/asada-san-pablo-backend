import { HttpException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { hash, compare } from 'bcrypt'
import { RegisterAuth } from './dto/register-auth.dto';
import { LoginAuthDto } from './dto/login-auth.dto';
import { JwtService } from '@nestjs/jwt';
import { ForgotPassword } from './dto/forgotPassword-auth.dto';
import { v4 as uuidv4 } from 'uuid';
import { RolesService } from 'src/roles/roles.service';
import { UsersService } from 'src/users/users.service';
import { ConfigService } from '@nestjs/config';
import { MailServiceService } from 'src/mail-service/mail-service.service';
@Injectable()
export class AuthService {
  constructor (
    private readonly userRepo: UsersService,
    private readonly roleRepo: RolesService,
    private readonly mailClient: MailServiceService,
    private readonly configService: ConfigService,
    private jwtService: JwtService
  ){}

  async register(createAuthDto: RegisterAuth) {
    const { Password,ConfirmPassword,...rest } = createAuthDto;
    if(Password !== ConfirmPassword){
      throw new Error('Las contraseñas no coinciden')
    }
    const hashed= await hash(Password,10);

    const defaultRole = await this.roleRepo.findByName('GUEST');

    if (!defaultRole) {
      throw new Error('❌ Rol por defecto "USER" no existe en la base de datos');
    }

    const newUser = this.userRepo.create({...rest, Password:hashed, Roles: [defaultRole]});
    return newUser;
  }

  async login(userObjectLogin: LoginAuthDto) {
    const { Email, Password } = userObjectLogin;
    const findUser = await this.userRepo.findByEmail(Email);

    if (!findUser) throw new HttpException('Usuario no encontrado', 404);

    const isPasswordValid = await compare(Password, findUser.Password);

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
    const userToEdit = await this.userRepo.findByIDcardEmail(userObjectForgot);
    if (userToEdit) {
      const payload = await {
        Email: userToEdit.Email,
        id: userToEdit.Id,
        jti: uuidv4(),
      };

      if (!userToEdit) {
        throw new NotFoundException('Correo electronico no encontrado!');
      }

      //AGREGAR ESTADO A USER

      // if (!userToEdit.enabled) {
      //   throw new UnauthorizedException(
      //     'Usuario inactivo, contacte al administrador de Recurso Humano',
      //   );
      // }

      const token = await this.jwtService.signAsync(payload, {
        expiresIn: '10m',
      });
      const FrontendRecoverURL = `${await this.configService.get('FrontEndBaseURL')}/auth/login`;
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
}
