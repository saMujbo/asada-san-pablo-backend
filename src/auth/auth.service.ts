import { Injectable } from '@nestjs/common';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import{hash}from 'bcrypt'
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { RegisterAuth } from './dto/register-auth.dto';
@Injectable()
export class AuthService {
  constructor (
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ){}

  async register(createAuthDto: RegisterAuth) {
    const { password,confirmPassword,...rest } = createAuthDto;
    if(password !== confirmPassword){
      throw new Error('Las contraseñas no coinciden')
    }
    const hashed= await hash(password,10);
    const newUser = this.userRepo.create({...rest, Password:hashed});
    return this.userRepo.save(newUser);
  }

  findAll() {
    return `This action returns all auth`;
  }

  findOne(id: number) {
    return `This action returns a #${id} auth`;
  }

  update(id: number, updateAuthDto: UpdateAuthDto) {
    return `This action updates a #${id} auth`;
  }

  remove(id: number) {
    return `This action removes a #${id} auth`;
  }
}
