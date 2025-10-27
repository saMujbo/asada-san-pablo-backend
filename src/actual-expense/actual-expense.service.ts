import { forwardRef, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreateActualExpenseDto } from './dto/create-actual-expense.dto';
import { UpdateActualExpenseDto } from './dto/update-actual-expense.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { ActualExpense } from './entities/actual-expense.entity';
import { Repository } from 'typeorm';
import { TraceProjectService } from 'src/trace-project/trace-project.service';
import { TotalActualExpenseService } from 'src/total-actual-expense/total-actual-expense.service';

@Injectable()
export class ActualExpenseService {
  constructor(
      @InjectRepository(ActualExpense)
      private readonly actualExpenseRepo: Repository<ActualExpense>,
      @Inject(forwardRef(() => TraceProjectService))
      private readonly traceProjectService: TraceProjectService
  ) {}
  
  async create(createActualExpenseDto: CreateActualExpenseDto) {
    const traceProject = await this.traceProjectService.findOne(createActualExpenseDto.TraceProjectId);
    const newActualExpense = await this.actualExpenseRepo.create({
      Observation: createActualExpenseDto.Observation,
      TraceProject: traceProject,
    })

    const actuala_expenseSave = await this.actualExpenseRepo.save(newActualExpense);
    return actuala_expenseSave;
  }
  
  async findAll() {
    return await this.actualExpenseRepo.find({ where: { IsActive: true }});
  }

  async findOne(Id: number) {
    const actualExpense = await this.actualExpenseRepo.findOne({ where: { Id, IsActive: true },
      relations: [
        'TraceProject',
        'TraceProject.Project',
        'ProductDetails', 
        'ProductDetails.Product'
      ]
    });
    if (!actualExpense) {
      throw new NotFoundException(`ActualExpense with ID ${Id} not found`);
    }
    return actualExpense;
  }

  async update(Id: number, updateActualExpenseDto: UpdateActualExpenseDto) {
    const newActualExpense = await this.actualExpenseRepo.findOne({ where: { Id, IsActive: true } });
    
    if(!newActualExpense){
      throw new NotFoundException(`ActualExpense with ID ${Id} not found`);}
    if(updateActualExpenseDto.Observation !== undefined,updateActualExpenseDto.Observation != null && updateActualExpenseDto.Observation !='') newActualExpense.Observation= updateActualExpenseDto.Observation;
    if(updateActualExpenseDto.IsActive !== undefined) newActualExpense.IsActive= updateActualExpenseDto.IsActive;
    return await this.actualExpenseRepo.save(newActualExpense);
  }

  async remove(Id: number) {
    const actualExpense = await this.actualExpenseRepo.findOneBy({Id});

    const hasTraceProject = await this.traceProjectService.isOnActualExpesne(Id);
    if (hasTraceProject) {
      throw new NotFoundException(`Cannot delete ActualExpense with ID ${Id} because it is associated with an active TraceProject`);
    }
    if(!actualExpense){
      throw new NotFoundException(`ActualExpense with ID ${Id} not found`);
    }
    actualExpense.IsActive = false;
    return await this.actualExpenseRepo.save(actualExpense);
  }

  async reactive(Id: number){
    const actualExpense = await this.actualExpenseRepo.findOneBy({Id});
    if(!actualExpense){
      throw new NotFoundException(`ActualExpense with ID ${Id} not found`);
    }
    actualExpense.IsActive = true;
    return await this.actualExpenseRepo.save(actualExpense);
  }
}
