import { ConflictException, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor (
      @InjectRepository(User)
      private readonly userRepo: Repository<User>,
    ){}

  async create(createUserDto: CreateUserDto) {
    
  const newUser = await this.userRepo.create(createUserDto); 
  return await this.userRepo.save(newUser);           
}

  async findAll() {
    return  await this.userRepo.find();
  }


  async findOne(id: number) {
  const found = await this.userRepo.findOneBy({ id });

  if (!found) {
    throw new ConflictException(`User with id ${id} not found`);
    }
    return found;
}

  async update(id: number, updateUserDto: UpdateUserDto) {
  const user = await this.userRepo.findOneBy({ id });

  if (!user) {
    throw new ConflictException(`User with id ${id} not found`);
    }
    const updatedUser = this.userRepo.merge(user, updateUserDto);
  
    return await this.userRepo.save(updatedUser);
}

async remove(id: number) {
    const user = await this.userRepo.findOneBy({ id });

  if (!user) {
    throw new ConflictException(`User with id ${id} not found`);
    }

    return await this.userRepo.remove(user);
}

}
