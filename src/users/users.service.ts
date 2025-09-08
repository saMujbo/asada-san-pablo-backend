import { BadRequestException, ConflictException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
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
import { UpdateRolesUserDto } from './dto/updateRoles-user.dto';
import { UpdateEmailDto } from './dto/updateEmail-user';
import { use } from 'passport';
import { changeState } from 'src/utils/changeState';
import { UpdateMeDto } from './dto/updateMeDto';

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

  async findAllPagination({ page, limit, name, roleId }: PaginationDto) {
    const skip = (page - 1) * limit;

    const qb = this.userRepo
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.Roles', 'role')
      .skip(skip)
      .take(limit);

    // Filtro combinado: si vienen ambos, aplica ambos.
    if (name) {
      // Búsqueda case-insensitive compatible (LOWER + LIKE)
      qb.andWhere(
        `(LOWER(user.Name) LIKE :name 
          OR LOWER(user.Surname1) LIKE :name 
          OR LOWER(user.Surname2) LIKE :name 
          OR LOWER(user.Email) LIKE :name)`,
        { name: `%${name.toLowerCase()}%` }
      );
    }

    if (roleId !== undefined) {
      qb.andWhere('role.id = :roleId', { roleId });
    }

    // Orden sugerido (ajusta a tu preferencia)
    qb.orderBy('user.Name', 'ASC').addOrderBy('user.Surname1', 'ASC');

    const [data, total] = await qb.getManyAndCount();

    return {
      data,
      meta: {
        total,
        page,
        limit,
        pageCount: Math.ceil(total / limit) || 1,
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
      const user = await this.userRepo.findOne({ where: { IDcard ,Email } });
      if (!user) {
        throw new NotFoundException('Usuario no encontrado');
      }
      return user;
  }

  async update(Id: number, updateUserDto: UpdateUserDto) {
    const user = await this.userRepo.findOne({ where:{ Id} });

    if (!user) {throw new ConflictException(`User with Id ${Id} not found`);}

    if (updateUserDto.Address !== undefined && updateUserDto.Address != null && updateUserDto.Address !== '') user.Address = updateUserDto.Address;
    if (updateUserDto.PhoneNumber !== undefined && updateUserDto.PhoneNumber != null && updateUserDto.PhoneNumber !== '') user.PhoneNumber = updateUserDto.PhoneNumber;
    if (updateUserDto.Birthdate !== undefined) user.Birthdate = updateUserDto.Birthdate as any;
    if (updateUserDto.IsActive !== undefined && updateUserDto.IsActive != null) 
      user.IsActive = updateUserDto.IsActive;
    
    return await this.userRepo.save(user);
  }

  async remove(Id: number) {
    const user = await this.userRepo.findOneBy({ Id });

    if (!user) {
      throw new ConflictException(`User with Id ${Id} not found`);
    }
    user.IsActive = false;
    return await this.userRepo.save(user);
  }
  
  async reactive(Id: number){
    const updateActive = await this.findOne(Id);
    changeState(updateActive.IsActive);

    return await this.userRepo.save(updateActive);
  }

  async removeRolesFromUser(updateRoles:UpdateRolesUserDto){ 
      const { Id, RoleId } = updateRoles;

      const user = await this.userRepo.findOne({
        where: { Id : Id },
        relations: ['Roles']
      });
      if(!user){
        throw new ConflictException(`User with Id ${Id} not found`);
      }
      const role = await this.rolesService.findOne(RoleId);
      if (!role) {
        throw new NotFoundException(`Role with Id ${RoleId} not found`);
      }
      user.Roles = user.Roles.filter(r => r.Id !== RoleId);

      await this.userRepo.save(user);
      return {
        message: `Role ${role.Rolname} removed from user ${user.Id}`,
        user,
      };
  }

  async AddRolesFromUser(updateRoles:UpdateRolesUserDto){
    const { Id, RoleId } = updateRoles;

    const user = await this.userRepo.findOne({
      where: { Id : Id },
      relations: ['Roles'],
    });
    
    if(!user){
      throw new ConflictException(`User with Id ${Id} not found`);
    }
    const role = await this.rolesService.findOne(RoleId);
    if (!role) {
      throw new NotFoundException(`Role with Id ${RoleId} not found`);
    }
    
    user.Roles = user.Roles ?? [];
    user.Roles = user.Roles.filter(r => r.Id !== RoleId);
    user.Roles.push(role);
    // if (!user.Roles.find(r => r.Id === RoleId)) {
    // user.Roles.push(role); // agrega el rol solo si no lo tiene
    await this.userRepo.save(user);

    return {
      message: `Role ${role.Rolname} uptade from user ${user.Id}`,
      user,
    };
  }

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

  async findMe(Id: number) {
    const user = await this.userRepo.findOne({ where: { Id }, relations: ['Roles'] });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  checkIfNull(data: string | undefined | null | number) {
    if (data !== undefined && data != null && data !== '') return true;
    return false;
  }

  async updateMe(Id: number, dto: UpdateMeDto) {
    const user = await this.userRepo.findOne({ where: { Id } });

    if (!user) {
      throw new ConflictException(`User with Id ${Id} not found`);
    }

    if (dto.Address !== undefined && dto.Address != null && dto.Address !== '') user.Address = dto.Address;
    if (dto.PhoneNumber !== undefined && dto.PhoneNumber != null && dto.PhoneNumber !== '') user.PhoneNumber = dto.PhoneNumber;
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

  async updateMyEmail(Id: number, { OldEmail, NewEmail }: UpdateEmailDto) {
    const user = await this.userRepo.findOne({ where: { Id } });
    if (!user) throw new NotFoundException('User not found');

    const current = (user.Email ?? '').trim().toLowerCase();
    const old = (OldEmail ?? '').trim().toLowerCase();
    const next = (NewEmail ?? '').trim().toLowerCase();

    console.log(current + ' ' + old + '   ' + next);
    if (!next) throw new BadRequestException('NewEmail is required');
    if (current !== old) throw new ConflictException('The old email does not match the current email');
    if (next === current) throw new ConflictException('The new email is the same as the current one');

    const exists = await this.userRepo.exists({ where: { Email: next } });
    if (exists) throw new ConflictException('Email already in use');

    user.Email = next;
    await this.userRepo.save(user);
    return { message: 'Email updated', email: user.Email };
  }

}
