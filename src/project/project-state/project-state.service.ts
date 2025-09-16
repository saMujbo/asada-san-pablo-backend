import { BadRequestException, ConflictException, forwardRef, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreateProjectStateDto } from './dto/create-project-state.dto';
import { UpdateProjectStateDto } from './dto/update-project-state.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProjectState } from './entities/project-state.entity';
import { ProjectService } from '../project.service';
import { hasNonEmptyString } from 'src/utils/validation.utils';

@Injectable()
export class ProjectStateService {
  constructor(
    @InjectRepository(ProjectState)
    private readonly projectStateRepo: Repository<ProjectState>,
    @Inject(forwardRef(() => ProjectService))
    private readonly projectSv: ProjectService,
  ){}

  async create(createProjectStateDto: CreateProjectStateDto) {
    const newprojectStateRepo = await this.projectStateRepo.create(createProjectStateDto)
  
    return await this.projectStateRepo.save(newprojectStateRepo)
  }

  async findAll() {
    return await this.projectStateRepo.find({where:{IsActive:true}});
  }

  async findOne(Id: number) {
    const foundProjectState = await this.projectStateRepo.findOne({
      where:{Id, IsActive: true}
    });

    if(!foundProjectState) throw new NotFoundException(`ProjectState with Id ${Id} not found`);
    return foundProjectState;
  }

  async update(Id: number, updateProjectStateDto: UpdateProjectStateDto) {
    const foundProjectState = await this.projectStateRepo.findOne({ where: { Id } });
    
    if (!foundProjectState) {
      throw new ConflictException(`ProjectState with Id ${Id} not found`);
    }

    const hasProjects = await this.projectSv.isOnProjectState(Id);

    if (hasProjects && updateProjectStateDto.IsActive === false) {
      throw new BadRequestException(
        `No se puede desactivar la categoría ${Id} porque está asociado a al menos un producto.`
      );
    }

    if (hasNonEmptyString(updateProjectStateDto.Name) && updateProjectStateDto.Name !== undefined) 
      foundProjectState.Name = updateProjectStateDto.Name;

    if (hasNonEmptyString(updateProjectStateDto.Description) && updateProjectStateDto.Description !== undefined) 
      foundProjectState.Description = updateProjectStateDto.Description;

    if (updateProjectStateDto.IsActive !== undefined && updateProjectStateDto.IsActive != null) 
      foundProjectState.IsActive = updateProjectStateDto.IsActive;

    return await this.projectStateRepo.save(foundProjectState);
  }

  async remove(Id: number) {
    const projectState = await this.findOne(Id);
    
    // ¿Hay algún producto que referencie este material?
    const hasProjects = await this.projectSv.isOnProjectState(Id);
  
    if (hasProjects) {
      throw new BadRequestException(
        `No se puede desactivar el Estado de Proyecto ${Id} porque está asociado a al menos un Proyecto.`
      );
    }
  
    projectState.IsActive = false;
    return await this.projectStateRepo.save(projectState);
  }
}
