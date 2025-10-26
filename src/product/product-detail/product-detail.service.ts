import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateProductDetailDto } from './dto/create-product-detail.dto';
import { UpdateProductDetailDto } from './dto/update-product-detail.dto';
import { Repository } from 'typeorm';
import { ProductDetail } from './entities/product-detail.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { ProductService } from '../product.service';
import { ProjectProjectionService } from 'src/project-projection/project-projection.service';
import { ActualExpenseService } from 'src/actual-expense/actual-expense.service';
import { CreateProductDetailTotalAEDto } from './dto/create-product-detail_TotalAE.dto';
import { TotalActualExpenseService } from 'src/total-actual-expense/total-actual-expense.service';

@Injectable()
export class ProductDetailService {
  constructor(
    @InjectRepository(ProductDetail)
    private readonly productDetailRepo: Repository<ProductDetail>,
    private readonly productSv: ProductService,
    private readonly actualExpenseSv: ActualExpenseService,
    private readonly projectProjectionSv: ProjectProjectionService,
    private readonly TotalAESv: TotalActualExpenseService,
  ) {}

  async create(createProductDetailDto: CreateProductDetailDto) {
    const { ProductId, Quantity, ProjectProjectionId, ActualExpenseId } = createProductDetailDto;

    // Si tus IDs son números, evita convertirlos a string.
    if ((ProjectProjectionId == null) && (ActualExpenseId == null)) {
      // En Nest es mejor BadRequestException
      throw new BadRequestException('Faltan argumentos para agregar un detalle de producto!');
    }

    const product = await this.productSv.findOne(ProductId);

    if (ActualExpenseId != null) {
      const actualExpense = await this.actualExpenseSv.findOne(ActualExpenseId);

      const newProductDetail = this.productDetailRepo.create({
        Quantity,
        Product: product,
        ActualExpense: actualExpense,
      });
      return await this.productDetailRepo.save(newProductDetail);
    } else {
      const projectProjection = await this.projectProjectionSv.findOne(ProjectProjectionId);

      const newProductDetail = this.productDetailRepo.create({
        Quantity,
        Product: product,
        ProjectProjection: projectProjection,
      });
      return await this.productDetailRepo.save(newProductDetail);
    }
  }

  async createTotalAE(createProductDetailDto: CreateProductDetailTotalAEDto) {
    const { ProductId, Quantity, TotalActExpenseId } = createProductDetailDto;

    const product = await this.productSv.findOne(ProductId);
    

  }

  async findAll() {
    return await this.productDetailRepo.find({ relations: ['Product', 'ProjectProjection'] });
  }

  async findOne(id: number) {
    const productDetail = await this.productDetailRepo.findOneBy({Id: id})
    if(!productDetail){
      throw new NotFoundException(`ProductDetail with ID ${id} not found`);
    }
    return productDetail;
  }

  async update(id: number, updateProductDetailDto: UpdateProductDetailDto) {
    const updatedProductDetail = await this.productDetailRepo.findOne({where: {Id: id}});
    if(!updatedProductDetail){
      throw new NotFoundException(`ProductDetail with ID ${id} not found`);
    }
    if(updateProductDetailDto.Quantity !== undefined && updateProductDetailDto.Quantity !== null){
      updatedProductDetail.Quantity = updateProductDetailDto.Quantity;
    } 
    return await this.productDetailRepo.save(updatedProductDetail);
  }

  async remove(Id: number) {
    const Productdelete = await this.findOne(Id);
    
    return await this.productDetailRepo.remove(Productdelete);
  }

  // async isOnActualExpense(Id: number){
  //   const hasActiveActualExpense = await this.productDetailRepo.exists({
  //     where: { ActualExpense: {Id}, IsActive: true },
  //   });
  //   return hasActiveActualExpense;
  // } 
}
