import { forwardRef, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreateTraceProjectDto } from './dto/create-trace-project.dto';
import { UpdateTraceProjectDto } from './dto/update-trace-project.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { changeState } from 'src/utils/changeState';
import { Repository } from 'typeorm';
import { TraceProject } from './entities/trace-project.entity';
import { ProjectService } from 'src/project/project.service';

@Injectable()
export class TraceProjectService {
  constructor(
    @InjectRepository(TraceProject)
    private readonly traceProjectRepo: Repository<TraceProject>,
    @Inject(forwardRef(() => ProjectService))
    private readonly projecService:ProjectService
  ){}
  
  async create(createTraceProjectDto: CreateTraceProjectDto) {
    const projectExists = await this.projecService.findOne(createTraceProjectDto.ProjectId);
    const newTraceProject = this.traceProjectRepo.create({
      Name: createTraceProjectDto.Name,
      Observation: createTraceProjectDto.Observation,
      Project: projectExists,
    })  
    return await this.traceProjectRepo.save(newTraceProject)
  }

  async findAll() {
    return await this.traceProjectRepo.find({
      where:{IsActive:true},
      relations:[
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
      if(updateTraceProjectDto.Name !== undefined && updateTraceProjectDto.Name != null && updateTraceProjectDto.Name!='')
        updateTraceProject.Name = updateTraceProjectDto.Name;
    if (updateTraceProject.date !== undefined) updateTraceProject.date = updateTraceProject.date as any;
      if(updateTraceProjectDto.Observation !== undefined && updateTraceProjectDto.Observation != null && updateTraceProjectDto.Observation!='')
          updateTraceProject.Observation = updateTraceProjectDto.Observation;
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
    changeState(updateActive.IsActive);

    return await this.traceProjectRepo.save(updateActive);
  }

  async isOnActualExpesne(Id: number){
    const hasActiveActualExpense = await this.traceProjectRepo.exists({
      where: {ActualExpense:{Id}, IsActive:true},
    });
    return hasActiveActualExpense;
  }
}
