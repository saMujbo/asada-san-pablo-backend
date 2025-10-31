import { Injectable, NotFoundException } from '@nestjs/common';
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

  async update(id: number, updateServiceDto: UpdateServiceDto) {
    const service = await this.findOne(id);

    // merge updates into the found entity then persist
    this.serviceRepo.merge(service, updateServiceDto);
    await this.serviceRepo.save(service);
    
    return service;
  }

  async remove(id: number) {
    const service = await this.findOne(id);

    service.IsActive = false;
    return await this.serviceRepo.save(service);
  }
}
