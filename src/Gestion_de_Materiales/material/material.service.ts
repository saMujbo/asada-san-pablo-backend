import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Material } from './entities/material.entity';
import { CreateMaterialDto } from './dto/create-material.dto';
import { UpdateMaterialDto } from './dto/update-material.dto';

@Injectable()
export class MaterialsService {
  constructor(
    @InjectRepository(Material)
    private readonly materialRepo: Repository<Material>,
  ) {}

  async create(createDto: CreateMaterialDto) {
    const newMaterial = this.materialRepo.create(createDto);
    return await this.materialRepo.save(newMaterial);
  }

  async findAll() {
    return await this.materialRepo.find();
  }

  async findOne(id: number) {
    const material = await this.materialRepo.findOneBy({ id });
    if (!material) {
      throw new ConflictException(`Material con id ${id} no encontrado`);
    }
    return material;
  }

  async update(id: number, updateDto: UpdateMaterialDto) {
    const material = await this.materialRepo.findOneBy({ id });
    if (!material) {
      throw new ConflictException(`Material con id ${id} no encontrado`);
    }
    const updated = this.materialRepo.merge(material, updateDto);
    return await this.materialRepo.save(updated);
  }

  async remove(id: number) {
    const material = await this.materialRepo.findOneBy({ id });
    if (!material) {
      throw new ConflictException(`Material con id ${id} no encontrado`);
    }
    return await this.materialRepo.remove(material);
  }
}
