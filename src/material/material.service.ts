import { BadRequestException, ConflictException, forwardRef, Inject, Injectable } from '@nestjs/common';
import { CreateMaterialDto } from './dto/create-material.dto';
import { UpdateMaterialDto } from './dto/update-material.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Material } from './entities/material.entity';
import { Repository } from 'typeorm';
import { changeState } from 'src/utils/changeState';
import { ProductService } from 'src/product/product.service';
import { MaterialPaginationDto } from './dto/pagination-material.st';
import { applyDefinedFields } from 'src/utils/validation.utils';
import { buildPaginationMeta } from 'src/common/pagination/pagination.util';
import { PaginatedResponse } from 'src/common/pagination/types/paginated-response';

@Injectable()
export class MaterialService {
  constructor(
    @InjectRepository(Material)
    private readonly materialRepo: Repository<Material>,
    @Inject(forwardRef(() => ProductService))
    private readonly productSv: ProductService,
  ){}

  async create(createMaterialDto: CreateMaterialDto) {
    const materialRepo = await this.materialRepo.findOne({ where: { Name: createMaterialDto.Name } });

    if (materialRepo) {
      throw new ConflictException(`Material with Name ${createMaterialDto.Name} already exists`);
    }

    const newMaterial = await this.materialRepo.create(createMaterialDto);

    return await this.materialRepo.save(newMaterial);
  }

  async findAll() {
    return await this.materialRepo.find({ where: { IsActive: true } });
  }

  async search(dto: MaterialPaginationDto): Promise<PaginatedResponse<Material>> {
    const page = Math.max(1, Number(dto.page) ?? 1);
    const limit = Math.min(100, Math.max(1, Number(dto.limit) ?? 10));
    const skip = (page - 1) * limit;
    const { q, state, sortDir = 'ASC' } = dto;

    const qb = this.materialRepo
      .createQueryBuilder('material')
      .skip(skip)
      .take(limit)
      .orderBy('material.Name', sortDir ?? 'ASC');

    if (q?.trim()) {
      const term = `%${q.trim().toLowerCase().replace(/%/g, '\\%').replace(/_/g, '\\_')}%`;
      qb.andWhere('LOWER(material.Name) LIKE :term', {
        term,
      });
    }

    if (state !== undefined) {
      qb.andWhere('material.IsActive = :state', { state });
    }

    const [data, totalItems] = await qb.getManyAndCount();

    return {
      data,
      meta: buildPaginationMeta({
        totalItems,
        page,
        limit,
        itemCount: data.length,
      }),
    };
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

    if(!updateMaterial) throw new ConflictException(`Material with Id ${Id} not found`);

    const hasProducts = await this.productSv.isOnMaterial(Id);

    if (hasProducts && updateMaterialDto.IsActive === false) {
      throw new BadRequestException(
        `No se puede desactivar el material ${Id} porque está asociado a al menos un producto.`
      );
    }

    const { Name, IsActive } = updateMaterialDto;

    applyDefinedFields(updateMaterial, {
      Name, IsActive
    });
    
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

  async reactivate(Id: number){
    const updateActive = await this.materialRepo.findOne({ where: { Id } });

    if(!updateActive) {
      throw new ConflictException(`Material with Id ${Id} not found`);
    }

    updateActive.IsActive = changeState(updateActive.IsActive);

    return await this.materialRepo.save(updateActive);
  }
}
