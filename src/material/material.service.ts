import { BadRequestException, ConflictException, forwardRef, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreateMaterialDto } from './dto/create-material.dto';
import { UpdateMaterialDto } from './dto/update-material.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Material } from './entities/material.entity';
import { Repository } from 'typeorm';
import { changeState } from 'src/utils/changeState';
import { ProductService } from 'src/product/product.service';

@Injectable()
export class MaterialService {
  constructor(
    @InjectRepository(Material)
    private readonly materialRepo: Repository<Material>,
    @Inject(forwardRef(() => ProductService))
  private readonly productSv: ProductService,
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
    
    if(!foundMaterial) throw new NotFoundException(`Material with Id ${Id} not found`);
    return foundMaterial;
  }

  async update(Id: number, updateMaterialDto: UpdateMaterialDto) {
    const updateMaterial = await this.materialRepo.findOne({where:{Id}});

    if(!updateMaterial) throw new ConflictException(`Product with Id ${Id} not found`);

    const hasProducts = await this.productSv.isOnMaterial(Id);

    if (hasProducts && updateMaterialDto.IsActive === false) {
      throw new BadRequestException(
        `No se puede desactivar el material ${Id} porque está asociado a al menos un producto.`
      );
    }
    
    if(updateMaterialDto.Name !== undefined && updateMaterialDto.Name != null && updateMaterialDto.Name != '')
      updateMaterial.Name = updateMaterialDto.Name;
    if (updateMaterialDto.IsActive !== undefined && updateMaterialDto.IsActive != null) 
      updateMaterial.IsActive = updateMaterialDto.IsActive;
    
    return await this.materialRepo.save(updateMaterial);
  }

  async remove(Id: number) {
    const material = await this.findOne(Id);

    // ¿Hay algún producto que referencie este material?
    const hasProducts = await this.productSv.isOnMaterial(Id);

    if (hasProducts) {
      throw new BadRequestException(
        `No se puede desactivar el material ${Id} porque está asociado a al menos un producto.`
      );
    }

    material.IsActive = false;
    return await this.materialRepo.save(material);
  }

  async reactive(Id: number){
    const updateActive = await this.findOne(Id);
    changeState(updateActive.IsActive);

    return await this.materialRepo.save(updateActive);
  }
}
