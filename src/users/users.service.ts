import { ConflictException, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { ForgotPassword } from 'src/auth/dto/forgotPassword-auth.dto';

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

  async findAllPagination({ page, limit }: PaginationDto) {
    const skip = (page - 1) * limit;

    const [data, total] = await this.userRepo.findAndCount({
      relations: ['Roles'],
      skip,
      take: limit
    });

    return {
      data,
      meta: {
        total,
        page,
        limit,
        pageCount: Math.ceil(total / limit),
        hasNextPage: page * limit < total,
        hasPrevPage: page > 1,
      },
    };
  }

  async findOne(Id: number) {
  const found = await this.userRepo.findOneBy({ Id });

  if (!found) throw new ConflictException(`User with Id ${Id} not found`);

  return found;
  }

  async findByEmail(Email: string) {
    return await this.userRepo.findOne({ where: { Email }, relations: ['Roles'] });
  }

  async findByIDcardEmail(userObjectForgot: ForgotPassword) {
    const { IDcard, Email } = userObjectForgot;
    return await this.userRepo.findOne({ where: { IDcard, Email } });
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
