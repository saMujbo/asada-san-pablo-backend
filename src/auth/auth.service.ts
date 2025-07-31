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
@Injectable()
export class AuthService {
  constructor (
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private jwtService: JwtService
  ){}

  async register(createAuthDto: RegisterAuth) {
    const { Password,confirmPassword,...rest } = createAuthDto;
    if(Password !== confirmPassword){
      throw new Error('Las contraseñas no coinciden')
    }
    const hashed= await hash(Password,10);
    const newUser = this.userRepo.create({...rest, Password:hashed});
    return this.userRepo.save(newUser);
  }

  async login(userObjectLogin: LoginAuthDto) {
    const { email, Password } = userObjectLogin;
    const findUser = await this.userRepo.findOne({ where: { email } });

    if (!findUser) throw new HttpException('Usuario no encontrado', 404);

    const isPasswordValid = await compare(Password, findUser.Password);

    if (!isPasswordValid) throw new HttpException('Contraseña invalida', 403);

    const payload = { id: findUser.id, name: findUser.nombre };
    const token = this.jwtService.sign(payload);

    const data = {
      user: findUser,
      token,
    };

    return data;
  }
}
