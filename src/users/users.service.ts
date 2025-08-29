import { ConflictException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { ForgotPassword } from 'src/auth/dto/forgotPassword-auth.dto';
import { RolesService } from 'src/roles/roles.service';
import * as bcrypt from 'bcrypt';
import { UpdateUserDto } from './dto/update-user.dto';
import { string } from 'yargs';

@Injectable()
export class UsersService {
  constructor (
      @InjectRepository(User)
      private readonly userRepo: Repository<User>,
      private readonly rolesService: RolesService,
  ){}

  async createRegister(createUserDto: CreateUserDto) {
  
    const newUser = await this.userRepo.create(createUserDto); 
    return await this.userRepo.save(newUser);
  }
  
    async create(createUserDto: CreateUserDto) {
    const {Password, ...rest}= createUserDto;
      const hashed= await bcrypt.hash(Password,10);

    const newUser = await this.userRepo.create({...rest,Password:hashed}); 
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
  const user = await this.userRepo.findOne({ where:{ Id} });

  if (!user) {throw new ConflictException(`User with Id ${Id} not found`);}

  if (updateUserDto.Birthdate) {
    const d = new Date(updateUserDto.Birthdate);
    if (isNaN(d.getTime())) {
      throw new NotFoundException('Birthdate is not a valid date');
    }
    user.Birthdate = d;
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

async removeRolesFromUser(userId:number,roleId:number){
  const user = await this.userRepo.findOne({
    where: { Id : userId },
    relations: ['Roles'],
  });
  if(!user){
    throw new ConflictException(`User with Id ${userId} not found`);
  }
  const role = await this.rolesService.findOne(roleId);
  if (!role) {
    throw new NotFoundException(`Role with Id ${roleId} not found`);
  }
  user.Roles = user.Roles.filter(r => r.Id !== roleId);

  await this.userRepo.save(user);
  return {
    message: `Role ${role.Rolname} removed from user ${user.Id}`,
    user,
  };
};

  async hashPassword(password: string, salt: number) {
    return await bcrypt.hash(password, salt);
  }

  async updatePassword(UserId:number, NewPassword: string){
    try{  
      const user = await this.findOne(UserId);
      user.Password = await this.hashPassword(NewPassword,10);
      return await this.userRepo.save(user);
    } catch (error){
      throw new InternalServerErrorException({
        message:
          'Error al actualizar la contraseña del usuario: ' + error.message,
      });
    }
  }
}
