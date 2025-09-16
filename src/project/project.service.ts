import { BadRequestException, ConflictException, forwardRef, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Project } from './entities/project.entity';
import { Repository } from 'typeorm';
import { hasNonEmptyString, isValidDate } from 'src/utils/validation.utils';
import { ProjectPaginationDto } from './dto/pagination-project.dto';
import { ProjectStateService } from './project-state/project-state.service';
import { ProjectProduct } from './project_product/entities/project_product.entity';
import { ProductService } from 'src/product/product.service';

@Injectable()
export class ProjectService {
  constructor(
    @InjectRepository(Project)
    private readonly projectRepo: Repository<Project>,
    @InjectRepository(ProjectProduct)
    private readonly projectProductRepo: Repository<ProjectProduct>,
    @Inject(forwardRef(() => ProjectStateService))
    private readonly projectStateSv: ProjectStateService,
    private readonly productSv: ProductService,
  ){}

  async create(createProjectDto: CreateProjectDto) {
    const { productQuantitys = [], ProjectStateId ,...rest } = createProjectDto;

    if (rest.InnitialDate && rest.EndDate) {
      const ini = new Date(rest.InnitialDate);
      const end = new Date(rest.EndDate);
      if (!isNaN(ini.getTime()) && !isNaN(end.getTime()) && end < ini) {
        throw new BadRequestException('La fecha de inicio debe ser anterior a la fecha de finalización.');
      }
    }
    const projectState = await this.projectStateSv.findOne(ProjectStateId);
    const project = this.projectRepo.create({ ProjectState: projectState, ...rest });
    await this.projectRepo.save(project);

    if (!productQuantitys.length) {
      project.ProjectProducts = [];
      return project;
    }

    const qtyMap = new Map<number, number>();
    for (const item of productQuantitys) {
      qtyMap.set(item.productId, (qtyMap.get(item.productId) ?? 0) + Number(item.quantity));
    }

    const ids = Array.from(qtyMap.keys());
    const products = await this.productSv.findAllByIds(ids);
    const productMap = new Map(products.map(p => [p.Id, p]));
    const faltantes = ids.filter(id => !productMap.has(id));
    if (faltantes.length) {
      throw new NotFoundException(`No existen productos con ids: ${faltantes.join(', ')}`);
    }

    const items = Array.from(qtyMap.entries()).map(([productId, quantity]) =>
      this.projectProductRepo.create({
        Project: project,
        Product: productMap.get(productId)!,
        quantity,
      })
    );

    await this.projectProductRepo.save(items);

    project.ProjectProducts = await this.projectProductRepo.find({
      where: { Project: { Id: project.Id } },
      relations: ['Product'],
      order: { idProjectProduct: 'ASC' },
    });

    return project;
  }

  async findAll() {
    return await this.projectRepo.find({where:{IsActive:true}, relations:[
      'ProjectProducts', 'ProjectProducts.Product', 'ProjectState']});
  }
  
  async search({ page =1, limit = 10,name,state}:ProjectPaginationDto){
    const pageNum = Math.max(1, Number(page)||1);
    const take = Math.min(100, Math.max(1,Number(limit)||10));
    const skip = (pageNum -1)* take;

    const qb = this.projectRepo.createQueryBuilder('project')
    .skip(skip)
    .take(take);

        if (name?.trim()) {
        qb.andWhere('LOWER(project.Name) LIKE :name', {
          name: `%${name.trim().toLowerCase()}%`,
        });
      }

      if (state) {
        qb.andWhere('project.IsActive = :state', { state });
      }

        qb.orderBy('project.Name', 'ASC');
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
    const foundProject = await this.projectRepo.findOne({
      where: { Id },
      relations:[
      'ProjectProducts', 'ProjectProducts.Product', 'ProjectState']
    });
    
    if(!foundProject) throw new NotFoundException(`Project with Id ${Id} not found`);
    return foundProject;
  }

  async update(Id: number, updateProjectDto: UpdateProjectDto) {
    const updateProject = await this.projectRepo.findOne({where:{Id}});
    
    if(!updateProject) throw new ConflictException(`Project with Id ${Id} not found`);
    
    if (hasNonEmptyString(updateProjectDto.Name) && updateProjectDto.Name !== undefined) 
      updateProject.Name = updateProjectDto.Name;
    
    if (hasNonEmptyString(updateProjectDto.Location) && updateProjectDto.Location !== undefined) 
      updateProject.Location = updateProjectDto.Location;
    
    if (isValidDate(updateProjectDto.InnitialDate) && updateProjectDto.InnitialDate !== undefined) 
      updateProject.InnitialDate = updateProjectDto.InnitialDate as any;
    
    if (isValidDate(updateProjectDto.EndDate) && updateProjectDto.EndDate !== undefined) 
      updateProject.EndDate = updateProjectDto.EndDate as any;
    
    if (hasNonEmptyString(updateProjectDto.Objective) && updateProjectDto.Objective !== undefined) 
      updateProject.Objective = updateProjectDto.Objective;
    
    if (hasNonEmptyString(updateProjectDto.Description) && updateProjectDto.Description !== undefined) 
      updateProject.Description = updateProjectDto.Description;
    
    if (hasNonEmptyString(updateProjectDto.Observation) && updateProjectDto.Observation !== undefined) 
      updateProject.Observation = updateProjectDto.Observation;
    
    if (hasNonEmptyString(updateProjectDto.SpaceOfDocument) && updateProjectDto.SpaceOfDocument !== undefined) 
      updateProject.SpaceOfDocument = updateProjectDto.SpaceOfDocument;

    if (updateProjectDto.IsActive !== undefined && updateProjectDto.IsActive != null) 
      updateProject.IsActive = updateProjectDto.IsActive;

    if (updateProjectDto.ProjectStateId !== undefined)
      updateProject.ProjectState = await this.projectStateSv.findOne(updateProjectDto.ProjectStateId);
    
    return await this.projectRepo.save(updateProject);
  }

  async updateState(Id: number, projectStateId: number) {
    const project = await this.findOne(Id);

    project.ProjectState = await this.projectStateSv.findOne(projectStateId);
    return await this.projectRepo.save(project);
  }

  async remove(Id: number) {
    const project = await this.findOne(Id);
  
    project.IsActive = false;
    return await this.projectRepo.save(project);
  }

  async isOnProjectState(Id: number) {
    const hasActiveProjectState = await this.projectRepo.exist({
      where: { ProjectState: { Id }, IsActive: true },
    });
    return hasActiveProjectState;
  }
}
