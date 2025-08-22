import { HttpException, Injectable } from '@nestjs/common';
import { hash, compare } from 'bcrypt'
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { RegisterAuth } from './dto/register-auth.dto';
import { LoginAuthDto } from './dto/login-auth.dto';
import { JwtService } from '@nestjs/jwt';
import { ForgotPassword } from './dto/forgotPassword-auth.dto';
import { Role } from 'src/roles/entities/role.entity';
import { v4 as uuidv4 } from 'uuid';
import { RolesService } from 'src/roles/roles.service';
import { UsersService } from 'src/users/users.service';
@Injectable()
export class AuthService {
  constructor (
    private readonly userRepo: UsersService,
    private readonly roleRepo: RolesService,
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
    const findUser = await this.userRepo.findByIDcardEmail(userObjectForgot);
    if (!findUser) throw new HttpException('Usuario no encontrado', 404);
    
    
  }

}
