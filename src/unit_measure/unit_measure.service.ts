import { BadRequestException, ConflictException, forwardRef, Inject, Injectable } from '@nestjs/common';
import { CreateUnitMeasureDto } from './dto/create-unit_measure.dto';
import { UpdateUnitMeasureDto } from './dto/update-unit_measure.dto';
import { UnitMeasure } from './entities/unit_measure.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { changeState } from 'src/utils/changeState';
import { ProductService } from 'src/product/product.service';
import { UnitMeasurePaginationDto } from './dto/unit_measurePaginationDto';
import { applyDefinedFields } from 'src/utils/validation.utils';
import { buildPaginationMeta } from 'src/common/pagination/pagination.util';
import { PaginatedResponse } from 'src/common/pagination/types/paginated-response';

@Injectable()
export class UnitMeasureService {
  constructor (
    @InjectRepository(UnitMeasure)
    private readonly unitRepo: Repository<UnitMeasure>,
    @Inject(forwardRef(() => ProductService))
    private readonly productSv: ProductService,
  ){}

  async create(createUnitMeasureDto: CreateUnitMeasureDto) {
    const unitRepo = await this.unitRepo.findOne({ where: { Name: createUnitMeasureDto.Name } });

    if (unitRepo) {
      throw new ConflictException(`Unit measure with Name ${createUnitMeasureDto.Name} already exists`);
    }

    const newUnit = await this.unitRepo.create(createUnitMeasureDto);
    return await this.unitRepo.save(newUnit);
  }

  async findAll() {
    return await this.unitRepo.find({ where: { IsActive: true } });
  }

  async search(dto: UnitMeasurePaginationDto): Promise<PaginatedResponse<UnitMeasure>> {
    const page = Math.max(1, Number(dto.page) ?? 1);
    const limit = Math.min(100, Math.max(1, Number(dto.limit) ?? 10));
    const skip = (page - 1) * limit;
    const { q, state, sortDir = 'ASC' } = dto;

    const qb = this.unitRepo
      .createQueryBuilder('unitMeasure')
      .skip(skip)
      .take(limit)
      .orderBy('unitMeasure.Name', sortDir ?? 'ASC');

    if (q?.trim()) {
      const term = `%${q.trim().toLowerCase().replace(/%/g, '\\%').replace(/_/g, '\\_')}%`;
      qb.andWhere('LOWER(unitMeasure.Name) LIKE :term', { term });
    }

    if (state !== undefined) {
      qb.andWhere('unitMeasure.IsActive = :state', { state });
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
    const found = await this.unitRepo.findOne({
      where: { Id, IsActive: true },
    });

    if(!found) throw new ConflictException(`Unit measure with Id ${Id} not found`);
    
    return found;
  }

  async update(Id: number, updateUnitMeasureDto: UpdateUnitMeasureDto) {
    const updateUnit =  await this.unitRepo.findOne({where:{Id}});

    if(!updateUnit){throw new ConflictException(`Unit measure with Id ${Id} not found`);}

    const hasProducts = await this.productSv.isOnUnit(Id);

    if (hasProducts && updateUnitMeasureDto.IsActive === false) {
      throw new BadRequestException(
        `No se puede desactivar la unidad de medida ${Id} porque está asociado a al menos un producto.`
      );
    }

    const { Name, IsActive } = updateUnitMeasureDto;

    applyDefinedFields(updateUnit, {
      Name, IsActive
    });

    return await this.unitRepo.save(updateUnit);
  }

  async remove(Id: number) {
    const unit_measure = await this.findOne(Id);

    const hasProducts = await this.productSv.isOnUnit(Id);
    
    if (hasProducts) {
      throw new BadRequestException(
        `No se puede desactivar la unidad de medida ${Id} porque está asociado a al menos un producto.`
      );
    }
    
    unit_measure.IsActive = false;
    return await this.unitRepo.save(unit_measure);
  }

  async reactivate(Id:number){
    const updateActive = await this.unitRepo.findOne({ where: { Id } });

    if(!updateActive){
      throw new ConflictException(`Unit measure with Id ${Id} not found`);
    }

    updateActive.IsActive = changeState(updateActive.IsActive);

    return await this.unitRepo.save(updateActive);
  }
}
