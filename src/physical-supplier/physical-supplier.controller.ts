import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { PhysicalSupplierService } from './physical-supplier.service';
import { CreatePhysicalSupplierDto } from './dto/create-physical-supplier.dto';
import { UpdatePhysicalSupplierDto } from './dto/update-physical-supplier.dto';

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

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.physicalSupplierService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePhysicalSupplierDto: UpdatePhysicalSupplierDto) {
    return this.physicalSupplierService.update(+id, updatePhysicalSupplierDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.physicalSupplierService.remove(+id);
  }
}
