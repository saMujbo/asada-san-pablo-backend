import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { Service } from './entities/service.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

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
