import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateProjectProjectionDto } from './dto/create-project-projection.dto';
import { UpdateProjectProjectionDto } from './dto/update-project-projection.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { ProjectProjection } from './entities/project-projection.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ProjectProjectionService {
  constructor(
    @InjectRepository(ProjectProjection)
    private readonly projectProjectionRepo: Repository<ProjectProjection>,
  ) {}
  async create(createProjectProjectionDto: CreateProjectProjectionDto) {
    const newProjectProjection = this.projectProjectionRepo.create(createProjectProjectionDto);
    return await this.projectProjectionRepo.save(newProjectProjection);
  }

  async findAll() {
  return await this.projectProjectionRepo.find();
  }

  async findOne(Id: number) {
    const foundProjection = await this.projectProjectionRepo.findOne({ where: { Id} });
    if(!foundProjection) throw new NotFoundException(`ProjectProjection with Id ${Id} not found`);
    return foundProjection;
  }

  async update(Id: number, updateProjectProjectionDto: UpdateProjectProjectionDto) {
    const updatedProjectProjection = await this.projectProjectionRepo.findOne({ where: { Id: Id } });
    if (
      updateProjectProjectionDto.Observation !== undefined &&
      updateProjectProjectionDto.Observation != null &&
      updateProjectProjectionDto.Observation !== '' &&
      updatedProjectProjection
    ) {
      updatedProjectProjection.Observation = updateProjectProjectionDto.Observation;
      return await this.projectProjectionRepo.save(updatedProjectProjection);
    }
  }
}
