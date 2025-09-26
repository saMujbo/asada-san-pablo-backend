import { Injectable } from '@nestjs/common';
import { CreateProductDetailDto } from './dto/create-product-detail.dto';
import { UpdateProductDetailDto } from './dto/update-product-detail.dto';
import { Repository } from 'typeorm';
import { ProductDetail } from './entities/product-detail.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from '../entities/product.entity';
import { ProductService } from '../product.service';
import { ProjectService } from 'src/project/project.service';
import { ProjectProjectionService } from 'src/project-projection/project-projection.service';
import { ActualExpenseService } from 'src/actual-expense/actual-expense.service';
import { hasNonEmptyString } from 'src/utils/validation.utils';

@Injectable()
export class ProductDetailService {
  constructor(
    @InjectRepository(ProductDetail)
    private readonly productDetailRepo: Repository<ProductDetail>,
    private readonly productSv: ProductService,
    private readonly actualExpenseSv: ActualExpenseService,
    private readonly projectProjectionSv: ProjectProjectionService,
  ) {}

  async create(createProductDetailDto: CreateProductDetailDto) {
    if(createProductDetailDto.ProjectProjectionId == null
        && createProductDetailDto.ActualExpenseId == null){
      throw new Error(`Faltan argumentos para agregar un detalle de producto!`);
    }
    const productExists = await this.productSv.findOne(createProductDetailDto.ProductId);

    if(hasNonEmptyString(String(createProductDetailDto.ProjectProjectionId))){
      const actualExpense = await this.actualExpenseSv.findOne(createProductDetailDto.ActualExpenseId);

      const newProductDetail = this.productDetailRepo.create({
        Quantity: createProductDetailDto.Quantity,
        Product: productExists,
        ActualExpense: actualExpense
      })
      return await this.productDetailRepo.save(newProductDetail)
    }
    else{
      const projectProjection = await this.projectProjectionSv.findOne(createProductDetailDto.ProjectProjectionId);

      const newProductDetail = this.productDetailRepo.create({
        Quantity: createProductDetailDto.Quantity,
        Product: productExists,
        ProjectProjection: projectProjection
      })
      return await this.productDetailRepo.save(newProductDetail)
    }
  }

  async findAll() {
    return await this.productDetailRepo.find({ relations: ['Product', 'ProjectProjection'] });
  }

  async findOne(id: number) {
    const productDetail = await this.productDetailRepo.findOneBy({Id: id})
    if(!productDetail){
      throw new Error(`ProductDetail with ID ${id} not found`);
    }
    return productDetail;
  }

  async update(id: number, updateProductDetailDto: UpdateProductDetailDto) {
    const updatedProductDetail = await this.productDetailRepo.findOne({where: {Id: id}});
    if(!updatedProductDetail){
      throw new Error(`ProductDetail with ID ${id} not found`);
    }
    if(updateProductDetailDto.Quantity !== undefined && updateProductDetailDto.Quantity !== null){
      updatedProductDetail.Quantity = updateProductDetailDto.Quantity;
    } 
    return await this.productDetailRepo.save(updatedProductDetail);
  }

  async remove(Id: number) {
    const Productdelete = await this.findOne(Id);
    if(!Productdelete){
      throw new Error(`ProductDetail with ID ${Id} not found`);
    }
    return await this.productDetailRepo.remove(Productdelete);
  }

  // async isOnActualExpense(Id: number){
  //   const hasActiveActualExpense = await this.productDetailRepo.exists({
  //     where: { ActualExpense: {Id}, IsActive: true },
  //   });
  //   return hasActiveActualExpense;
  // } 
}
