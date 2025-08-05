import {Injectable,NotFoundException,} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from './entities/role.entity';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepo: Repository<Role>,
  ) {}

  async create(createRoleDto: CreateRoleDto) {
    const newRole = this.roleRepo.create(createRoleDto);
    return await this.roleRepo.save(newRole);
  }

  async findAll() {
    return await this.roleRepo.find();
  }

  async findOne(Id: number) {
    const role = await this.roleRepo.findOneBy({ Id });

    if (!role) {
      throw new NotFoundException(`Role with Id ${Id} not found`);
    }

    return role;
  }

  async update(Id: number, updateRoleDto: UpdateRoleDto) {
    const role = await this.roleRepo.findOneBy({ Id });

    if (!role) {
      throw new NotFoundException(`Role with Id ${Id} not found`);
    }

    const updatedRole = this.roleRepo.merge(role, updateRoleDto);
    return await this.roleRepo.save(updatedRole);
  }

  async remove(Id: number) {
    const role = await this.roleRepo.findOneBy({ Id });

    if (!role) {
      throw new NotFoundException(`Role with Id ${Id} not found`);
    }

    return await this.roleRepo.remove(role);
  }
}
