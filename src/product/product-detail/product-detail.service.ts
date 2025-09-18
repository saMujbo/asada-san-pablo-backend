import { Injectable } from '@nestjs/common';
import { CreateProductDetailDto } from './dto/create-product-detail.dto';
import { UpdateProductDetailDto } from './dto/update-product-detail.dto';
import { Repository } from 'typeorm';
import { ProductDetail } from './entities/product-detail.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from '../entities/product.entity';

@Injectable()
export class ProductDetailService {
  constructor(
      @InjectRepository(ProductDetail)
    private readonly productRepo: Repository<ProductDetail>,

  ) {}
  async  create(createProductDetailDto: CreateProductDetailDto) {
    const newProductDetail = this.productRepo.create(createProductDetailDto)
    return await this.productRepo.save(newProductDetail) 
  }

  async findAll() {
    return await this.productRepo.find();
  }

  async findOne(id: number) {
    const productDetail = await this.productRepo.findOneBy({Id: id})
    if(!productDetail){
      throw new Error(`ProductDetail with ID ${id} not found`);
    }
    return productDetail;
  }

  async update(id: number, updateProductDetailDto: UpdateProductDetailDto) {
    const updatedProductDetail = await this.productRepo.findOne({where: {Id: id}});
    if(!updatedProductDetail){
      throw new Error(`ProductDetail with ID ${id} not found`);
    }
    if(updateProductDetailDto.Quantity !== undefined && updateProductDetailDto.Quantity !== null){
      updatedProductDetail.Quantity = updateProductDetailDto.Quantity;
    } 
    return await this.productRepo.save(updatedProductDetail);
  }

  async remove(Id: number) {
    const Productdelete = await this.findOne(Id);
    if(!Productdelete){
      throw new Error(`ProductDetail with ID ${Id} not found`);
    }
    return await this.productRepo.remove(Productdelete);
  }
}
