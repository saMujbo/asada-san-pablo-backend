import { ConflictException, Injectable } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>
  ){}
  async create(createProductDto: CreateProductDto) {
    const newProduct = await this.productRepo.create(createProductDto);
    return await this.productRepo.save(newProduct);
  }

  async findAll() {
    return await this.productRepo.find();
  }

  async findOne(Id: number) {
    const foundProduct = await this.productRepo.findOneBy({Id});

    if(!foundProduct) throw new ConflictException(`Product with Id ${Id} not found`);
      return foundProduct;
  }
  

  async update(Id: number, updateProductDto: UpdateProductDto) {
    const updateProduct = await this.productRepo.findOne({where:{Id}});

if(!updateProduct) throw new ConflictException(`Product with Id ${Id} not found`)
  
  const productUpdate = this.productRepo.merge(updateProduct,updateProductDto);
  
  return await this.productRepo.save(productUpdate);
  }

  async remove(Id: number) {
    const removeproduct = await this.productRepo.findOneBy({Id})
    if(!removeproduct){
    throw new ConflictException(`Product with Id ${Id} not found`);
    }
    removeproduct.IsActive= false;
    return await this.productRepo.save(removeproduct);
  }
}
