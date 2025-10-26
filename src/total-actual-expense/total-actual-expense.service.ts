import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateTotalActualExpenseDto } from './dto/create-total-actual-expense.dto';
import { UpdateTotalActualExpenseDto } from './dto/update-total-actual-expense.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { TotalActualExpense } from './entities/total-actual-expense.entity';
import { Repository } from 'typeorm';
import { ProjectService } from 'src/project/project.service';
import { ActualExpenseService } from 'src/actual-expense/actual-expense.service';

@Injectable()
export class TotalActualExpenseService {
  constructor(
    @InjectRepository(TotalActualExpense)
    private readonly totalAERepo: Repository<TotalActualExpense>,
    // @Inject(forwardRef(() => ProjectStateService))
    private readonly projectSv: ProjectService,
    private readonly actualExpenseSv: ActualExpenseService,
  ){}

  async create(createTotalActualExpenseDto: CreateTotalActualExpenseDto) {
    const { ProjectId } = createTotalActualExpenseDto;
    if(ProjectId){
      const project = await this.projectSv.findOne(ProjectId);
      const exist = await this.totalAERepo.findOne({where:{Project: {Id: project.Id}}});
      if(exist) throw new BadRequestException(`Total Actual Expense for Project with Id ${ProjectId} already exists`);
      const descrip = `Total Actual Expense for Project ${project.Name}`;
      const newTotalAE = this.totalAERepo.create({
        Description: descrip,
        Project: project
      });
      return await this.totalAERepo.save(newTotalAE);
    }
    throw new BadRequestException('ProjectId is required to create Total Actual Expense');
  }

  async findAll() {
    return await this.totalAERepo.find({
      relations:[
      'Project',
      'ProductDetails', 
      'ProductDetails.Product',
      'ProductDetails.Product.Category',
      'ProductDetails.Product.UnitMeasure',
      'ProductDetails.Product.Material'
    ]
    });
  }

  async findOne(Id: number) {
    const foundTotalAE = await this.totalAERepo.findOne({
      where: { Id },
      relations:[
      'Project',
      'ProductDetails', 
      'ProductDetails.Product',
      'ProductDetails.Product.Category',
      'ProductDetails.Product.UnitMeasure',
      'ProductDetails.Product.Material'
    ]
    });
    
    if(!foundTotalAE) throw new NotFoundException(`TotalActualExpense with Id ${Id} not found`);
    return foundTotalAE;
  }

  async update(Id: number, updateTotalActualExpenseDto: UpdateTotalActualExpenseDto) {
    const foundTotalAE = await this.findOne(Id);
    const actualExpense = await this.actualExpenseSv.findOne(updateTotalActualExpenseDto.ActualExpenseId);
    actualExpense.ProductDetails.forEach(pd => {
      if(!foundTotalAE.ActualExpenseIds) {
        foundTotalAE.ActualExpenseIds = [];
      }
      if(!foundTotalAE.ActualExpenseIds.includes(actualExpense.Id)){
        foundTotalAE.ActualExpenseIds.push(actualExpense.Id);
        foundTotalAE.ProductDetails = foundTotalAE.ProductDetails.concat(actualExpense.ProductDetails);
      }
    });

    return await this.totalAERepo.save(foundTotalAE);
  }

  remove(id: number) {
    return `This action removes a #${id} totalActualExpense`;
  }
}
