import { BadRequestException, ConflictException, Controller, forwardRef, Inject, Injectable } from '@nestjs/common';
import { CreateUnitMeasureDto } from './dto/create-unit_measure.dto';
import { UpdateUnitMeasureDto } from './dto/update-unit_measure.dto';
import { UnitMeasure } from './entities/unit_measure.entity';
import { In, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { changeState } from 'src/utils/changeState';
import { ProductService } from 'src/product/product.service';

@Injectable()
export class UnitMeasureService {
  constructor (
    @InjectRepository(UnitMeasure)
    private readonly unitRepo: Repository<UnitMeasure>,
    @Inject(forwardRef(() => ProductService))
    private readonly productSv: ProductService,
  ){}

  async create(createUnitMeasureDto: CreateUnitMeasureDto) {
    const newUnit = await this.unitRepo.create(createUnitMeasureDto);
    return await this.unitRepo.save(newUnit);
  }

  async findAll() {
    return await this.unitRepo.find();
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

    if(updateUnitMeasureDto.Name !== undefined && updateUnitMeasureDto.Name != null && updateUnitMeasureDto.Name !='')
      updateUnit.Name = updateUnitMeasureDto.Name;
    if (updateUnitMeasureDto.IsActive !== undefined && updateUnitMeasureDto.IsActive != null) 
      updateUnit.IsActive = updateUnitMeasureDto.IsActive;

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

  async reactive(Id:number){
    const updateActive = await this.findOne(Id);
    changeState(updateActive.IsActive);

    return await this.unitRepo.save(updateActive);
  }
}


