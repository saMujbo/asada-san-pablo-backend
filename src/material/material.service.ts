import { ConflictException, Injectable } from '@nestjs/common';
import { CreateMaterialDto } from './dto/create-material.dto';
import { UpdateMaterialDto } from './dto/update-material.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Material } from './entities/material.entity';
import { Repository } from 'typeorm';

@Injectable()
export class MaterialService {
  constructor(
    @InjectRepository(Material)
    private readonly materialRepo: Repository<Material>
  ){}

  async create(createMaterialDto: CreateMaterialDto) {
    const newMaterial = await this.materialRepo.create(createMaterialDto)

    return await this.materialRepo.save(newMaterial)
  }

  async findAll() {
    return await this.materialRepo.find();
  }

  async findOne(Id: number) {
    const foundMaterial = await this.materialRepo.findOne({
      where: { Id, IsActive: true },
    });
    
    if(!foundMaterial) throw new ConflictException(`Material with Id ${Id} not found`);
    return foundMaterial;
  }

  async update(Id: number, updateMaterialDto: UpdateMaterialDto) {
    const updateMaterial = await this.materialRepo.findOne({where:{Id}});

    if(!updateMaterial) throw new ConflictException(`Product with Id ${Id} not found`)
    
    const productUpdate = this.materialRepo.merge(updateMaterial,updateMaterialDto);
    
    return await this.materialRepo.save(productUpdate);
  }

  async remove(Id: number) {
    const removeMaterial = await this.materialRepo.findOneBy({Id})
    if(!removeMaterial){
    throw new ConflictException(`Product with Id ${Id} not found`);
    }
    removeMaterial.IsActive= false;
    return await this.materialRepo.save(removeMaterial);
  }
}
