import { ConflictException, Injectable } from '@nestjs/common';
import { CreateMaterialDto } from './dto/create-material.dto';
import { UpdateMaterialDto } from './dto/update-material.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Material } from './entities/material.entity';
import { Repository } from 'typeorm';

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

  async findOne(Id: number) {
    const found = await this.materialRepo.findOneBy({Id});
    if(!found) throw new ConflictException(`Material with Id ${Id} not found`);

    return found;
  }

  async update(id: number, updateMaterialDto: UpdateMaterialDto) {
    const material = await this.materialRepo.findOneBy({Id:id});
    if(!material){
      throw new ConflictException(`User with Id ${id} not found`);
    }
    const materialupdate = this.materialRepo.merge(material, updateMaterialDto);
  
    return await this.materialRepo.save(materialupdate);
  }

  async remove(id: number) {
    const material = await this.materialRepo.findOneBy({ Id: id })
    if(!material){
      throw new ConflictException(`User with Id ${id} not found`);
    }
    material.IsActive = false;
    return await this.materialRepo.save(material);
  }
}
