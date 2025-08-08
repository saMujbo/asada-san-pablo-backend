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
    return await this.userRepo.find({
      relations: ['Roles'], // Carga los roles asociados
    });
  }


  async findOne(Id: number) {
  const found = await this.userRepo.findOneBy({ Id });

  if (!found) {
    throw new ConflictException(`User with Id ${Id} not found`);
    }
    return found;
}

  async update(Id: number, updateUserDto: UpdateUserDto) {
  const user = await this.userRepo.findOneBy({ Id });

  if (!user) {
    throw new ConflictException(`User with Id ${Id} not found`);
    }
    const updatedUser = this.userRepo.merge(user, updateUserDto);
  
    return await this.userRepo.save(updatedUser);
}

async remove(Id: number) {
    const user = await this.userRepo.findOneBy({ Id });

  if (!user) {
    throw new ConflictException(`User with Id ${Id} not found`);
    }

    return await this.userRepo.remove(user);
}

}
