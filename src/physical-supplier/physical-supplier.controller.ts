import { Controller, Get, Post, Body, Patch, Param, Delete, Query, Put } from '@nestjs/common';
import { PhysicalSupplierService } from './physical-supplier.service';
import { CreatePhysicalSupplierDto } from './dto/create-physical-supplier.dto';
import { UpdatePhysicalSupplierDto } from './dto/update-physical-supplier.dto';
import { PhysicalSupplierPaginationDto } from './dto/pagination-physical-supplier.dto';

@Controller('physical-supplier')
export class PhysicalSupplierController {
  constructor(private readonly physicalSupplierService: PhysicalSupplierService) {}

  @Post()
  create(@Body() createPhysicalSupplierDto: CreatePhysicalSupplierDto) {
    return this.physicalSupplierService.create(createPhysicalSupplierDto);
  }

  @Get()
  findAll() {
    return this.physicalSupplierService.findAll();
  }

  @Get('search')
  search(@Query() pagination: PhysicalSupplierPaginationDto){
    return this.physicalSupplierService.search(pagination);
  }
  
  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.physicalSupplierService.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: number, @Body() updatePhysicalSupplierDto: UpdatePhysicalSupplierDto) {
    return this.physicalSupplierService.update(id, updatePhysicalSupplierDto);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.physicalSupplierService.remove(id);
  }
}
