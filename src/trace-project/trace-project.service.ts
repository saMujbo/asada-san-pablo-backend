import { BadRequestException, ConflictException, forwardRef, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreateTraceProjectDto } from './dto/create-trace-project.dto';
import { UpdateTraceProjectDto } from './dto/update-trace-project.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { changeState } from 'src/utils/changeState';
import { Repository } from 'typeorm';
import { TraceProject } from './entities/trace-project.entity';
import { ProjectService } from 'src/project/project.service';
import { hasNonEmptyString } from 'src/utils/validation.utils';

@Injectable()
export class TraceProjectService {
  constructor(
    @InjectRepository(TraceProject)
    private readonly traceProjectRepo: Repository<TraceProject>,
    @Inject(forwardRef(() => ProjectService))
    private readonly projecService:ProjectService
  ){}
  
  async create(createTraceProjectDto: CreateTraceProjectDto) {
    if (!hasNonEmptyString(createTraceProjectDto.Name)) {
      throw new BadRequestException('El nombre del seguimiento es requerido');
    }

    if (!hasNonEmptyString(createTraceProjectDto.Observation)) {
      throw new BadRequestException('La observacion del seguimiento es requerida');
    }

    const projectExists = await this.projecService.findOne(createTraceProjectDto.ProjectId);
    const normalizedName = createTraceProjectDto.Name.trim().toLowerCase();

    const existingTraceProject = await this.traceProjectRepo
      .createQueryBuilder('traceProject')
      .where('LOWER(traceProject.Name) = :name', { name: normalizedName })
      .getOne();

    if (existingTraceProject) {
      throw new ConflictException('Ya existe un seguimiento con ese nombre.');
    }

    const newTraceProject = this.traceProjectRepo.create({
      Name: createTraceProjectDto.Name.trim(),
      Observation: createTraceProjectDto.Observation.trim(),
      Project: projectExists,
    })  
    return await this.traceProjectRepo.save(newTraceProject)
  }

  async findAll(projectId?: number) {
    const where =
      projectId != null && Number.isFinite(projectId)
        ? { IsActive: true, Project: { Id: projectId } }
        : { IsActive: true };

    return await this.traceProjectRepo.find({
      where,
      relations:[
        'Project',
        "ActualExpense",
        'ActualExpense.ProductDetails', 
        'ActualExpense.ProductDetails.Product',
        'ActualExpense.ProductDetails.Product.Category',
        'ActualExpense.ProductDetails.Product.UnitMeasure'
      ]
    });
  }

  async findOne(Id: number) {
    const foundTraceProject = await this.traceProjectRepo.findOne({
    where:{Id,IsActive:true},
    relations:[
      'Project',
      "ActualExpense",
      'ActualExpense.ProductDetails', 
      'ActualExpense.ProductDetails.Product',
      'ActualExpense.ProductDetails.Product.Category',
      'ActualExpense.ProductDetails.Product.UnitMeasure'
    ]
    })

    if(!foundTraceProject) throw new NotFoundException(`TraceProject with Id ${Id} not found`)
    return foundTraceProject;
  }

  async update(Id: number, updateTraceProjectDto: UpdateTraceProjectDto) {
    const updateTraceProject = await this.traceProjectRepo.findOne({where:{Id}});

    if(!updateTraceProject) throw new NotFoundException(`TraceProject with Id ${Id} not found`)

    if (updateTraceProjectDto.Name !== undefined) {
      if (!hasNonEmptyString(updateTraceProjectDto.Name)) {
        throw new BadRequestException('El nombre del seguimiento no puede estar vacio');
      }

      const normalizedName = updateTraceProjectDto.Name.trim().toLowerCase();
      const duplicatedTraceProject = await this.traceProjectRepo
        .createQueryBuilder('traceProject')
        .where('LOWER(traceProject.Name) = :name', { name: normalizedName })
        .andWhere('traceProject.Id != :id', { id: Id })
        .getOne();

      if (duplicatedTraceProject) {
        throw new ConflictException('Ya existe un seguimiento con ese nombre.');
      }

      updateTraceProject.Name = updateTraceProjectDto.Name.trim();
    }

    if (updateTraceProjectDto.date !== undefined) updateTraceProject.date = updateTraceProjectDto.date as any;

    if (updateTraceProjectDto.Observation !== undefined) {
      if (!hasNonEmptyString(updateTraceProjectDto.Observation)) {
        throw new BadRequestException('La observacion del seguimiento no puede estar vacia');
      }

      updateTraceProject.Observation = updateTraceProjectDto.Observation.trim();
    }

    return await this.traceProjectRepo.save(updateTraceProject);
  }

  async remove(Id: number) {
    const traceProject = await this.findOne(Id);

    const hasActiveProject = await this.projecService.isTraceProjectOnProject(Id);
    if (hasActiveProject) {
      throw new NotFoundException(`Cannot delete TraceProject with ID ${Id} because it is associated with an active Project`);
    }
    traceProject.IsActive = false;
    return await this.traceProjectRepo.save(traceProject);
  }

    async reactive(Id: number){
    const updateActive = await this.findOne(Id);
    updateActive.IsActive = changeState(updateActive.IsActive);

    return await this.traceProjectRepo.save(updateActive);
  }

  async isOnActualExpesne(Id: number){
    const hasActiveActualExpense = await this.traceProjectRepo.exists({
      where: {ActualExpense:{Id}, IsActive:true},
    });
    return hasActiveActualExpense;
  }
}
