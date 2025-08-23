import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
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
    const user = await this.userRepo.findOne({ where: { Email } });
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }
    return user;
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

async findMe(Id: number) {
    const user = await this.userRepo.findOne({ where: { Id }, relations: ['Roles'] });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async updateMe(Id: number, dto: UpdateUserDto) {
    const user = await this.userRepo.findOne({ where: { Id } });

    if (!user) {
      throw new ConflictException(`User with Id ${Id} not found`);
    }

    // Asigna solo campos permitidos si vienen definidos
    // if (dto.Name !== undefined) user.Name = dto.Name;
    // if (dto.Surname1 !== undefined) user.Surname1 = dto.Surname1;
    // if (dto.Surname2 !== undefined) user.Surname2 = dto.Surname2;
    if (dto.Address !== undefined) user.Address = dto.Address;
    if (dto.PhoneNumber !== undefined) user.PhoneNumber = dto.PhoneNumber;
    if (dto.Birthdate !== undefined) user.Birthdate = dto.Birthdate as any;
    

    const saved = await this.userRepo.save(user);

    // Re-carga con relaciones si quieres devolver Roles
    const withRelations = await this.userRepo.findOne({
      where: { Id: saved.Id },
      relations: ['Roles'],
    });

    // Sanea antes de retornar (por si tu entidad expone Password)
    if (withRelations && (withRelations as any).Password !== undefined) {
      delete (withRelations as any).Password;
    }

    return withRelations ?? saved;
  }
}


