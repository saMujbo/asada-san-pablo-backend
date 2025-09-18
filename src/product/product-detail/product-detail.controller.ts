    import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, Put } from '@nestjs/common';
import { ProductDetailService } from './product-detail.service';
import { CreateProductDetailDto } from './dto/create-product-detail.dto';
import { UpdateProductDetailDto } from './dto/update-product-detail.dto';


    @Controller('productDetail')
    export class ProductDetailController {
    constructor(private readonly ProductDetailService: ProductDetailService) {}

    @Post()
    create(@Body() createProductDetailDto: CreateProductDetailDto) {
        return this.ProductDetailService.create(createProductDetailDto);
    }

    @Get()
    findAll() {
        return this.ProductDetailService.findAll();
    }

    @Get(':id')
    findOne(@Param('id',ParseIntPipe) id: number) {
        return this.ProductDetailService.findOne(id);
    }

    @Put(':id')
    update(@Param('Id',ParseIntPipe) Id: number, 
    @Body() updateProdutDetail: UpdateProductDetailDto) {
        return this.ProductDetailService.update(Id,updateProdutDetail);
    }

    }
