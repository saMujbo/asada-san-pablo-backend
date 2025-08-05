import { HttpException, Injectable } from '@nestjs/common';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { hash, compare } from 'bcrypt'
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { RegisterAuth } from './dto/register-auth.dto';
import { LogInOptions } from 'passport';
import { LoginAuthDto } from './dto/login-auth.dto';
import { JwtService } from '@nestjs/jwt';
import { ForgotPassword } from './dto/forgotPassword-auth.dto';
@Injectable()
export class AuthService {
  constructor (
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private jwtService: JwtService
  ){}

  async register(createAuthDto: RegisterAuth) {
    const { Password,ConfirmPassword,...rest } = createAuthDto;
    if(Password !== ConfirmPassword){
      throw new Error('Las contraseñas no coinciden')
    }
    const hashed= await hash(Password,10);
    const newUser = this.userRepo.create({...rest, Password:hashed});
    return this.userRepo.save(newUser);
  }

  async login(userObjectLogin: LoginAuthDto) {
    const { Email, Password } = userObjectLogin;
    const findUser = await this.userRepo.findOne({ where: { Email } });

    if (!findUser) throw new HttpException('Usuario no encontrado', 404);

    const isPasswordValid = await compare(Password, findUser.Password);

    if (!isPasswordValid) throw new HttpException('Contraseña invalida', 403);

    const payload = { id: findUser.IDcard, name: findUser.Name };
    const token = this.jwtService.sign(payload);

    const data = {
      user: findUser,
      token,
    };

    return data;
  }

  async forgotPassword(userObjectForgot: ForgotPassword) {
    const { IDcard, Email } = userObjectForgot;
    const findUser = await this.userRepo.findOne({ where: { IDcard, Email } });
    if (!findUser) throw new HttpException('Usuario no encontrado', 404);
    
    
  }
}
