import { ConflictException, HttpException, Inject, Injectable, InternalServerErrorException, NotFoundException, UnauthorizedException } from '@nestjs/common';
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
import { AdminCreateUserDto } from 'src/users/dto/admin-user.dto';
import { generateRandomPassword } from 'src/utils/passwordrandom';
import { Roles } from './auth-roles/roles.decorator';


@Injectable()
export class AuthService {
  dataSource: any;
  constructor (
    private readonly userService: UsersService,
    private readonly roleService: RolesService,
    private readonly mailClient: MailServiceService,
    private readonly configService: ConfigService,
    private jwtService: JwtService,
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

    const defaultRole = await this.roleService.findOne(2);

    if (!defaultRole) {
      throw new Error('❌ Rol por defecto "GUEST" no existe en la base de datos');
    }

    const newUser = this.userService.createRegister({...rest, Password:hashed, Roles: [defaultRole]});
    const url = `${await this.configService.get('FrontEndBaseURL')}/login`;
    try {
    await this.mailClient.sendWelcomeEmail({
      to: createAuthDto.Email,
      subject: '¡Bienvenido a RedSanPablo!',
      message: 'Su cuenta ha sido creada exitosamente en la plataforma RedSanPablo.',
      LoginURL: url,
      Name: createAuthDto.Name
    });
  } catch (error) {
    console.error('Error al enviar correo de bienvenida:', error);
  }
    return newUser;
  }

  async adminCreateUser(adminCreateUserDto: AdminCreateUserDto){
    const { roleIds, ...rest } = adminCreateUserDto;

    // 2) Roles a asignar
    const roles = roleIds?.length
      ? await this.roleService.findAllByIDs(roleIds)
      : [await this.roleService.findDefaultRole()];

    // 3) Password temporal
    const plainTempPassword = generateRandomPassword(8);
    const hashed = await bcrypt.hash(plainTempPassword, 10);

    // 4) Transacción para crear y asociar roles
    const newUser = await this.userService.createRegister({
      ...rest,
      Password: hashed,
      Roles: roles, // <- lo correcto
    });

    // 5) Enviar correo (si falla, no rompas la creación)
    const url = `${this.configService.get<string>('FrontEndBaseURL')}/login`;
    try {
      await this.mailClient.sendWelcomeTempPasswordEmail({
        to: newUser.Email,
        subject: '¡Bienvenido a RedSanPablo!',
        message: 'Su cuenta ha sido creada exitosamente en la plataforma RedSanPablo.',
        LoginURL: url,
        Name: newUser.Name,
        temPasswordL: plainTempPassword, // <- nombre correcto
      });
    } catch (error) {
      // Loguea y sigue; el usuario quedó creado
      console.error('Error al enviar correo de bienvenida:', error);
    }

    return newUser;
  }

  async login(userObjectLogin: LoginAuthDto) {
    const { Email, Password } = userObjectLogin;
    const findUser = await this.userService.findByEmail(Email);

    if (!findUser) throw new NotFoundException('Usuario no encontrado');

    const isPasswordValid = await bcrypt.compare(Password, findUser.Password);

    if (!isPasswordValid) throw new ConflictException('Contraseña invalida');

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
      if (!userToEdit) {
        throw new NotFoundException('Correo electronico no encontrado!');
      }

      if (!userToEdit.IsActive) {
        throw new UnauthorizedException(
          'Usuario inactivo, contacte al administrador de Recurso Humano',
        );
      }
    const jti = uuidv4();

    const payload = {   
      id: userToEdit.Id, 
      email: userToEdit.Email, 
      jti };

      const token = await this.jwtService.signAsync(payload, {
        expiresIn: '10m',
      });
      const FrontendRecoverURL = `${await this.configService.get('FrontEndBaseURL')}/reset-password`;
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

  async resetPassword(userId: number, dto: resetPasswordDto) {
    const { NewPassword, ConfirmPassword } = dto;

    if (NewPassword !== ConfirmPassword) {
      throw new Error('Las contraseñas no coinciden');
    }

    const user = await this.userService.findOne(userId);
    if (!user) {
      throw new NotFoundException('Usuario no encontrado!');
    }

    // Aquí hashea y actualiza la contraseña
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
