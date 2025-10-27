import { BadRequestException, ConflictException, forwardRef, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Project } from './entities/project.entity';
import { Repository } from 'typeorm';
import { hasNonEmptyString, isValidDate } from 'src/utils/validation.utils';
import { ProjectPaginationDto } from './dto/pagination-project.dto';
import { ProjectStateService } from './project-state/project-state.service';
import { UsersService } from 'src/users/users.service';
import { TotalActualExpenseService } from 'src/total-actual-expense/total-actual-expense.service';

@Injectable()
export class ProjectService {
  constructor(
    @InjectRepository(Project)
    private readonly projectRepo: Repository<Project>,
    @Inject(forwardRef(() => ProjectStateService))
    private readonly projectStateSv: ProjectStateService,
    private readonly userSv: UsersService,
    @Inject(forwardRef(() => TotalActualExpenseService))
    private readonly totalAESv: TotalActualExpenseService,
  ){}

  async create(createProjectDto: CreateProjectDto) {
    const { ProjectStateId, UserId,...rest } = createProjectDto;

    if (rest.InnitialDate && rest.EndDate) {
      const ini = new Date(rest.InnitialDate);
      const end = new Date(rest.EndDate);
      if (!isNaN(ini.getTime()) && !isNaN(end.getTime()) && end < ini) {
        throw new BadRequestException('La fecha de inicio debe ser anterior a la fecha de finalización.');
      }
    }
    const projectState = await this.projectStateSv.findOne(ProjectStateId);
    const user = await this.userSv.findOne(UserId);
    const project = this.projectRepo.create({ ProjectState: projectState, User: user, ...rest });
    await this.projectRepo.save(project);

    await this.totalAESv.create({ProjectId: project.Id});
    return project;
  }

  async findAll() {
    return await this.projectRepo.find({where:{IsActive:true}, relations:[
      'ProjectState', 
      'User',
      'ProjectFiles',
      'ProjectProjection', 
      'ProjectProjection.ProductDetails', 
      'ProjectProjection.ProductDetails.Product',
      'ProjectProjection.ProductDetails.Product.Category',
      'ProjectProjection.ProductDetails.Product.UnitMeasure',
      'TotalActualExpense'
    ] });
  }
  
  async search({ page = 1, limit = 10, name, state, projectState}:ProjectPaginationDto){
    const pageNum = Math.max(1, Number(page)||1);
    const take = Math.min(100, Math.max(1,Number(limit)||10));
    const skip = (pageNum -1)* take;

    const qb = this.projectRepo.createQueryBuilder('project')
      .leftJoinAndSelect('project.ProjectState', 'ProjectState')
      .leftJoinAndSelect('project.User', 'User')
      .leftJoinAndSelect('project.TraceProject', 'TraceProject')
      .leftJoinAndSelect('project.ProjectFiles', 'ProjectFiles')
      .leftJoinAndSelect('project.ProjectProjection', 'ProjectProjection')
      .leftJoinAndSelect('ProjectProjection.ProductDetails', 'ProductDetails')
      .leftJoinAndSelect('ProductDetails.Product', 'Product')
      .leftJoinAndSelect('project.TotalActualExpense', 'TotalActualExpense')
      .leftJoinAndSelect('TotalActualExpense.ProductDetails', 'ProductDetail')
      .leftJoinAndSelect('ProductDetail.Product', 'Products')
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

    if (projectState) {
      qb.andWhere('project.ProjectState = :projectState', { projectState });
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
      where: { Id, IsActive: true },
      relations:[
      'ProjectState', 
      'User',
      'ProjectProjection', 
      'ProjectProjection.ProductDetails', 
      'ProjectProjection.ProductDetails.Product',
      'ProjectProjection.ProductDetails.Product.Category',
      'ProjectProjection.ProductDetails.Product.UnitMeasure',
      'ProjectProjection.ProductDetails.Product.Material'
    ]
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

    if(updateProjectDto.UserId !== undefined && updateProjectDto.UserId != null) {
      updateProject.User = await this.userSv.findOne(updateProjectDto.UserId);
    }

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

  async updateProject(project: Project) {
    this.projectRepo.save(project);
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
  async isTraceProjectOnProject(Id: number) {
    const hasActiveTraceProject = await this.projectRepo.exists({
      where: {TraceProject:{Id}, IsActive:true},
    });
    return hasActiveTraceProject;
  }

  async countByState(stateId: number): Promise<number> {
    return this.projectRepo.count({
      where: {
        ProjectState: { Id: stateId }, // ajusta el nombre de la relación si difiere
        IsActive: true,
      },
    });
  }
}
