import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { Service } from './entities/service.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ServicePaginationDto } from './dto/pagination-service.dto';

@Injectable()
export class ServiceService {
  constructor (
    @InjectRepository(Service)
    private readonly serviceRepo: Repository<Service>
  ){ }

  async create(createServiceDto: CreateServiceDto) {
    const newService = this.serviceRepo.create(createServiceDto);

    return this.serviceRepo.save(newService);
  }

  async findAll() {
    return this.serviceRepo.find({where: {IsActive: true}});
  }

  async search({ page =1, limit = 10,title,state}:ServicePaginationDto){
    const pageNum = Math.max(1, Number(page)||1);
    const take = Math.min(100, Math.max(1,Number(limit)||10));
    const skip = (pageNum -1)* take; 

    const qb = this.serviceRepo.createQueryBuilder('service')
    .skip(skip)
    .take(take);

        if (title?.trim()) {
        qb.andWhere('LOWER(service.Title) LIKE :title', {
          title: `%${title.trim().toLowerCase()}%`,
        });
      }

      // se aplica solo si viene definido (true o false)
      if (state) {
        qb.andWhere('service.IsActive = :state', { state });
      }

          qb.orderBy('service.Title', 'ASC');

      const [data, total] = await qb.getManyAndCount();

      return {
        data,
        meta: {
          total,
          page: pageNum,
          limit: take,
          pageCount: Math.max(1, Math.ceil(total / take)),
          hasNextPage: pageNum * take < total,
          hasPrevPage: pageNum > 1,
        },
      };
  }

  async findOne(Id: number) {
    const serviceFound = await this.serviceRepo.findOneBy({Id});
    if(!serviceFound){
      throw new NotFoundException(`Service with ID ${Id} not found`);
    }
    return serviceFound;
  }

async update(Id: number, updateServiceDto: UpdateServiceDto) {
  const foundService = await this.serviceRepo.findOne({ where: { Id } });

  if (!foundService) {
    throw new ConflictException(`Service with Id ${Id} not found`);
  }

  if (
    updateServiceDto.Icon !== undefined &&
    updateServiceDto.Icon != null &&
    updateServiceDto.Icon !== ''
  ) {
    foundService.Icon = updateServiceDto.Icon;
  }

  if (
    updateServiceDto.Title !== undefined &&
    updateServiceDto.Title != null &&
    updateServiceDto.Title !== ''
  ) {
    foundService.Title = updateServiceDto.Title;
  }

  if (
    updateServiceDto.Description !== undefined &&
    updateServiceDto.Description != null &&
    updateServiceDto.Description !== ''
  ) {
    foundService.Description = updateServiceDto.Description;
  }

  return await this.serviceRepo.save(foundService);
}


  async remove(id: number) {
    const service = await this.findOne(id);

    service.IsActive = false;
    return await this.serviceRepo.save(service);
  }
}
