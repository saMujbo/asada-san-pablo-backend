import { BadRequestException, forwardRef, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreateTotalActualExpenseDto } from './dto/create-total-actual-expense.dto';
import { UpdateTotalActualExpenseDto } from './dto/update-total-actual-expense.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { TotalActualExpense } from './entities/total-actual-expense.entity';
import { Repository } from 'typeorm';
import { ProjectService } from 'src/project/project.service';
import { ActualExpenseService } from 'src/actual-expense/actual-expense.service';
import { ProductDetail } from 'src/product/product-detail/entities/product-detail.entity';

@Injectable()
export class TotalActualExpenseService {
  constructor(
    @InjectRepository(TotalActualExpense)
    private readonly totalAERepo: Repository<TotalActualExpense>,
    @InjectRepository(ProductDetail)
        private readonly productDetailRepo: Repository<ProductDetail>,
    @Inject(forwardRef(() => ProjectService))
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

  async findByProject(IdProject: number) {
    const foundTotalAE = await this.totalAERepo.findOne({
        where: { Project: { Id: IdProject } },
        relations: ['ProductDetails', 'ProductDetails.Product', 'Project']
    });

    if(!foundTotalAE) throw new NotFoundException(`TotalActualExpense with IdProject ${IdProject} not found`);
    return foundTotalAE;
  }

  async update(IdProject: number, actualExpenseId: number) {
    const foundTotalAE = await this.findByProject(IdProject);

    const actualExpense = await this.actualExpenseSv.findOne(actualExpenseId);
    
    // Verificar si ya se procesó este ActualExpense
    if (!foundTotalAE.ActualExpenseIds) {
        foundTotalAE.ActualExpenseIds = [];
    }
    
    if (foundTotalAE.ActualExpenseIds.includes(actualExpense.Id)) {
        // Ya fue procesado, no hacer nada o lanzar excepción
        return foundTotalAE;
    }

    // Agregar el ID del ActualExpense
    foundTotalAE.ActualExpenseIds.push(actualExpense.Id);

    // Procesar cada ProductDetail del ActualExpense
    for (const aeProductDetail of actualExpense.ProductDetails) {
        // Buscar si ya existe un ProductDetail con el mismo producto en TotalActualExpense
        const existingPD = foundTotalAE.ProductDetails.find(
            pd => pd.Product.Id === aeProductDetail.Product.Id
        );

        if (existingPD) {
            // Si existe, sumar la cantidad
            existingPD.Quantity += aeProductDetail.Quantity;
            await this.productDetailRepo.save(existingPD);
        } else {
            // Si no existe, crear un nuevo ProductDetail para TotalActualExpense
            const newPD = this.productDetailRepo.create({
                Quantity: aeProductDetail.Quantity,
                Product: aeProductDetail.Product,
                TotalActualExpense: foundTotalAE
            });
            const savedPD = await this.productDetailRepo.save(newPD);
            foundTotalAE.ProductDetails.push(savedPD);
        }
    }

    return await this.totalAERepo.save(foundTotalAE);
  }

  remove(id: number) {
    return `This action removes a #${id} totalActualExpense`;
  }
}
