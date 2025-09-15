import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { ProductService } from 'src/product/product.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Project } from './entities/project.entity';
import { Repository } from 'typeorm';
import { hasNonEmptyString, isValidDate } from 'src/utils/validation.utils';

@Injectable()
export class ProjectService {
  constructor(
      @InjectRepository(Project)
      private readonly projectRepo: Repository<Project>,
      private readonly productSv: ProductService,
    ){}

  async create(createProjectDto: CreateProjectDto) {
    const newProject = await this.projectRepo.create(createProjectDto)
  
    return await this.projectRepo.save(newProject)
  }

  async findAll() {
    return await this.projectRepo.find({where:{IsActive:true}});
  }

  async findOne(Id: number) {
    const foundProject = await this.projectRepo.findOne({
      where: { Id, IsActive: true },
    });
    
    if(!foundProject) throw new NotFoundException(`Project with Id ${Id} not found`);
    return foundProject;
  }

  async update(Id: number, updateProjectDto: UpdateProjectDto) {
    const updateProject = await this.projectRepo.findOne({where:{Id}});
    
    if(!updateProject) throw new ConflictException(`Project with Id ${Id} not found`);
  
    // const hasProducts = await this.productSv.isOnMaterial(Id);
  
    // if (hasProducts && updateProjectDto.IsActive === false) {
    //   throw new BadRequestException(
    //     `No se puede desactivar el material ${Id} porque está asociado a al menos un producto.`
    //   );
    // }
    
    if (hasNonEmptyString(updateProjectDto.Name) && updateProjectDto.Name !== undefined) 
      updateProject.Name = updateProjectDto.Name;
    
    if (hasNonEmptyString(updateProjectDto.Description) && updateProjectDto.Description !== undefined) 
      updateProject.Description = updateProjectDto.Description;
    
    if (isValidDate(updateProjectDto.EndDate) && updateProjectDto.EndDate !== undefined) 
      updateProject.EndDate = updateProjectDto.EndDate as any;
    
    if (hasNonEmptyString(updateProjectDto.Description) && updateProjectDto.Description !== undefined) 
      updateProject.Description = updateProjectDto.Description;

    if (updateProjectDto.IsActive !== undefined && updateProjectDto.IsActive != null) 
      updateProject.IsActive = updateProjectDto.IsActive;
    
    return await this.projectRepo.save(updateProject);
  }

  async remove(Id: number) {
    const project = await this.findOne(Id);
    
    // ¿Hay algún producto que referencie este material?
    //const hasProducts = await this.productSv.isOnMaterial(Id);
  
    // if (hasProducts) {
    //   throw new BadRequestException(
    //     `No se puede desactivar el material ${Id} porque está asociado a al menos un producto.`
    //   );
    // }
  
    project.IsActive = false;
    return await this.projectRepo.save(project);
  }
}
