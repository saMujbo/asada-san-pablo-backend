import { ConflictException, Injectable } from '@nestjs/common';
import { CreateMaterialDto } from './dto/create-material.dto';
import { UpdateMaterialDto } from './dto/update-material.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Material } from './entities/material.entity';
import { Repository } from 'typeorm';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class MaterialService {
  @InjectRepository(Material)
  private readonly materialRepo: Repository<Material>

  async create(createMaterialDto: CreateMaterialDto) {
    const newMaterial = await this.materialRepo.create(createMaterialDto);
    return await this.materialRepo.save(newMaterial);
  }

  async findAll() {
    return await this.materialRepo.find();
  }

  findOne(id: number) {
    return `This action returns a #${id} material`;
  }

  update(id: number, updateMaterialDto: UpdateMaterialDto) {
    return `This action updates a #${id} material`;
  }

  async remove(id: number) {
    const material = await this.materialRepo.findOneBy({ Id: id })
    if(!material){
      throw new ConflictException(`User with Id ${id} not found`);
    }
    return await this.materialRepo.remove(material);
  }
}
