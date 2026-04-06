import { BadRequestException, ConflictException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { ForgotPassword } from 'src/auth/dto/forgotPassword-auth.dto';
import { RolesService } from 'src/roles/roles.service';
import * as bcrypt from 'bcrypt';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateRolesUserDto } from './dto/updateRoles-user.dto';
import { UpdateEmailDto } from './dto/updateEmail-user';
import { changeState } from 'src/utils/changeState';
import { UpdateMeDto } from './dto/updateMeDto';
import { PaginationDto } from './dto/pagination.dto';
import { DropboxService } from 'src/dropbox/dropbox.service';
import { AuditRequestContext } from 'src/audit/audit.types';

const PROFILE_PHOTO_FOLDER = 'profile-photos';
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_PROFILE_PHOTO_SIZE = 5 * 1024 * 1024; // 5 MB

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly rolesService: RolesService,
    private readonly dropboxService: DropboxService,
  ) {}

  private getUserRepository(auditContext?: AuditRequestContext) {
    return auditContext?.queryRunner.manager.getRepository(User) ?? this.userRepo;
  }

  async createRegister( 
    createUserDto: CreateUserDto,
    auditContext?: AuditRequestContext,
  ) {
    const userRepository = this.getUserRepository(auditContext);
  
    const newUser = userRepository.create(createUserDto);
    return await userRepository.save(newUser);
  }

  async create(createUserDto: CreateUserDto, auditContext?: AuditRequestContext) {
    const userRepository = this.getUserRepository(auditContext);
    const {Password, ...rest}= createUserDto;
    const hashed= await bcrypt.hash(Password,10);

    const newUser = userRepository.create({...rest,Password:hashed});
    return await userRepository.save(newUser);
  }

  async findAllWithoutRelations() {
    return await this.userRepo.find();
  }

  async findAll() {
    return await this.userRepo.find({
      relations: ['Roles'], // Carga los roles asociados
    });
  }

  async findByRole(roleName: string) {
    return await this.userRepo.find({
      relations: ['Roles'], // Carga los roles asociados
      where: {
        Roles: {
          Rolname: roleName
        }
      }
    });
  }

  async search({ page, limit, name, roleId, state }: PaginationDto) {
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

    if (state) {
      qb.andWhere('user.IsActive = :state', { state });
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
    const found = await this.userRepo.findOne({ where: { Id }, relations: ['Roles'] });

    if (!found) throw new ConflictException(`User with Id ${Id} not found`);

    return found;
  }

  async findByEmail(Email: string) {
    return await this.userRepo.findOne({ where: { Email, IsActive: true }, relations: ['Roles'] });
  }

  async findByIDcardEmail(userObjectForgot: ForgotPassword) {
      const { IDcard, Email } = userObjectForgot;
      const user = await this.userRepo.findOne({ where: { IDcard ,Email } });
      if (!user) {
        throw new NotFoundException('Usuario no encontrado');
      }
      return user;
  }


async update(
  Id: number,
  dto: UpdateUserDto,
  auditContext?: AuditRequestContext,
) {
  const userRepository = this.getUserRepository(auditContext);

  const user = await userRepository.findOne({
    where: { Id },
    relations: ['Roles'],
  });

  if (!user) {
    throw new NotFoundException(`User with Id ${Id} not found`);
  }

  const {
    Email,
    PhoneNumber,
    Address,
    Birthdate,
    IsActive,
    Nis,
    roleIds,
  } = dto;

  // Campos simples
  if (Email !== undefined) user.Email = Email;
  if (PhoneNumber !== undefined) user.PhoneNumber = PhoneNumber;
  if (Address !== undefined) user.Address = Address;
  if (Birthdate !== undefined) user.Birthdate = Birthdate as any;
  if (IsActive !== undefined) user.IsActive = IsActive;
  if (Nis !== undefined) user.Nis = Nis as any;

  // Roles (solo si vienen)
  if (roleIds !== undefined) {
    const roles = await Promise.all(
      roleIds.map(async (id) => {
        const role = await this.rolesService.findOne(id);
        if (!role) {
          throw new NotFoundException(`Role with Id ${id} not found`);
        }
        return role;
      }),
    );
    user.Roles = roles;
  }

  const saved = await userRepository.save(user);

  // devolver con relaciones
  return await userRepository.findOne({
    where: { Id: saved.Id },
    relations: ['Roles'],
  });
}

  async remove(Id: number, auditContext?: AuditRequestContext) {
    const userRepository = this.getUserRepository(auditContext);
    const user = await userRepository.findOneBy({ Id });

    if (!user) {
      throw new ConflictException(`User with Id ${Id} not found`);
    }
    user.IsActive = false;
    return await userRepository.save(user);
  }
  
  async reactive(Id: number, auditContext?: AuditRequestContext){
    const userRepository = this.getUserRepository(auditContext);
    const updateActive = await userRepository.findOneBy({ Id });
    if (!updateActive) {
      throw new ConflictException(`User with Id ${Id} not found`);
    }
    changeState(updateActive.IsActive);

    return await userRepository.save(updateActive);
  }

  async removeRolesFromUser(
    updateRoles:UpdateRolesUserDto,
    auditContext?: AuditRequestContext,
  ){
      const userRepository = this.getUserRepository(auditContext);
      const { Id, RoleId } = updateRoles;

      const user = await userRepository.findOne({
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

      await userRepository.save(user);
      return {
        message: `Role ${role.Rolname} removed from user ${user.Id}`,
        user,
      };
  }

  async AddRolesFromUser(
    updateRoles:UpdateRolesUserDto,
    auditContext?: AuditRequestContext,
  ){
    const userRepository = this.getUserRepository(auditContext);
    const { Id, RoleId } = updateRoles;

    const user = await userRepository.findOne({
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
    await userRepository.save(user);

    return {
      message: `Role ${role.Rolname} uptade from user ${user.Id}`,
      user,
    };
  }

  async hashPassword(password: string, salt: number) {
    return await bcrypt.hash(password, salt);
  }

  async updatePassword(
    UserId:number,
    NewPassword: string,
    auditContext?: AuditRequestContext,
  ){
    const userRepository = this.getUserRepository(auditContext);
    try{  
      const user = await userRepository.findOne({
        where: { Id: UserId },
        relations: ['Roles'],
      });
      if (!user) {
        throw new NotFoundException('Usuario no encontrado!');
      }
      user.Password = await this.hashPassword(NewPassword,10);
      return await userRepository.save(user);
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

  async updateMe(
    Id: number,
    dto: UpdateMeDto,
    file?: Express.Multer.File,
    auditContext?: AuditRequestContext,
  ) {
    const userRepository = this.getUserRepository(auditContext);
    const user = await userRepository.findOne({ where: { Id } });

    if (!user) {
      throw new ConflictException(`User with Id ${Id} not found`);
    }

    if (file) {
      if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
        throw new BadRequestException(
          `Tipo de archivo no permitido. Use: ${ALLOWED_MIME_TYPES.join(', ')}`,
        );
      }
      if (file.size > MAX_PROFILE_PHOTO_SIZE) {
        throw new BadRequestException('La foto no puede superar 5 MB');
      }
      const buffer = (file as any).buffer as Buffer;
      if (!buffer?.length) {
        throw new BadRequestException('El archivo no pudo leerse correctamente');
      }
      const ext = file.originalname?.split('.').pop()?.toLowerCase() || 'jpg';
      const safeExt = ['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(ext) ? ext : 'jpg';
      const dropboxPath = `/${PROFILE_PHOTO_FOLDER}/${Id}/${Date.now()}.${safeExt}`;
      await this.dropboxService.ensureFolder(`/${PROFILE_PHOTO_FOLDER}/${Id}`);
      await this.dropboxService.uploadBuffer(buffer, dropboxPath);
      const photoUrl = await this.dropboxService.getFileSharedLink(dropboxPath);
      user.ProfilePhoto = photoUrl;
    }

    if (dto.Address !== undefined && dto.Address != null && dto.Address !== '') user.Address = dto.Address;
    if (dto.PhoneNumber !== undefined && dto.PhoneNumber != null && dto.PhoneNumber !== '') user.PhoneNumber = dto.PhoneNumber;
    if (dto.Birthdate !== undefined) user.Birthdate = dto.Birthdate as any;

    const saved = await userRepository.save(user);

    const withRelations = await userRepository.findOne({
      where: { Id: saved.Id },
      relations: ['Roles'],
    });

    if (withRelations && (withRelations as any).Password !== undefined) {
      delete (withRelations as any).Password;
    }

    return withRelations ?? saved;
  }

  async updateMyEmail(
    Id: number,
    { OldEmail, NewEmail }: UpdateEmailDto,
    auditContext?: AuditRequestContext,
  ) {
    const userRepository = this.getUserRepository(auditContext);
    const user = await userRepository.findOne({ where: { Id } });
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
    await userRepository.save(user);
    return { message: 'Email updated', email: user.Email };
  }

  async findUsersByRole() {
    const users = await this.userRepo.find({
      relations: ['Roles'],
      where: {
        Roles: {
          Rolname: 'ABONADO',
        },
      },
    });

    return users.length;
  }

  async findByIdCardRaw(idCardRaw: string) {
    const normalized = (idCardRaw ?? '').replace(/[^0-9]/g, ''); // quita guiones/espacios
    // Compara contra IDcard normalizado en la consulta
    return this.userRepo.createQueryBuilder('u')
      .leftJoinAndSelect('u.Roles', 'r')
      .where("REPLACE(REPLACE(REPLACE(u.IDcard, '-', ''), ' ', ''), '.', '') = :ced", { ced: normalized })
      .getOne();
  }
  
async findUsersByRoleAdmin() {
  return await this.userRepo.find({
    relations: ['Roles'],
    where: {
      Roles: { Rolname: 'ADMIN' },
    },
  });
}

async findUsersByRoleFontanero() {
  return await this.userRepo.find({
    relations: ['Roles'],
    where: {
      Roles: { Rolname: 'FONTANERO' },
    },
  });
}

async searchAbonados(searchTerm?: string) {
  const qb = this.userRepo
    .createQueryBuilder('user')
    .leftJoinAndSelect('user.Roles', 'role')
    .where('role.Rolname = :rolename', { rolename: 'ABONADO' })
    .andWhere('user.IsActive = :isActive', { isActive: true });

  // Si hay término de búsqueda, buscar por nombre completo o cédula
  if (searchTerm && searchTerm.trim() !== '') {
    const term = searchTerm.trim().toLowerCase();
    const normalizedTerm = term.replace(/[^0-9]/g, '');

    // Si el término es numérico, intentar buscar por NIS
    const nisSearch = /^\d+$/.test(term) 
      ? `OR JSON_SEARCH(user.Nis, 'one', :nisTerm) IS NOT NULL` 
      : '';

    qb.andWhere(
      `(
        LOWER(user.Name) LIKE :term 
        OR LOWER(user.Surname1) LIKE :term 
        OR LOWER(user.Surname2) LIKE :term
        OR LOWER(CONCAT(user.Name, ' ', user.Surname1, ' ', user.Surname2)) LIKE :term
        OR REPLACE(REPLACE(REPLACE(user.IDcard, '-', ''), ' ', ''), '.', '') LIKE :normalizedTerm
        ${nisSearch}
      )`,
      { 
        term: `%${term}%`,
        normalizedTerm: `%${normalizedTerm}%`,
        nisTerm: term
      }
    );
  }

  // Ordenar por nombre
  qb.orderBy('user.Name', 'ASC')
    .addOrderBy('user.Surname1', 'ASC');

  if (!searchTerm || searchTerm.trim() === '') {
    qb.take(5);
  }
  const users = await qb.getMany();

  return users.map(user => ({
    Id: user.Id,
    IDcard: user.IDcard,
    Nis: user.Nis,
    FullName: `${user.Name} ${user.Surname1} ${user.Surname2}`.trim(),
    Name: user.Name,
    Surname1: user.Surname1,
    Surname2: user.Surname2,
    Email: user.Email,
    PhoneNumber: user.PhoneNumber,
    Address: user.Address,
    Birthdate: user.Birthdate,
  }));
}

}


