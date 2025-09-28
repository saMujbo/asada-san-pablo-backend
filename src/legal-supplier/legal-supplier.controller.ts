import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { LegalSupplierService } from './legal-supplier.service';
import { CreateLegalSupplierDto } from './dto/create-legal-supplier.dto';
import { UpdateLegalSupplierDto } from './dto/update-legal-supplier.dto';

@Controller('legal-supplier')
export class LegalSupplierController {
  constructor(private readonly legalSupplierService: LegalSupplierService) {}

  @Post()
  create(@Body() createLegalSupplierDto: CreateLegalSupplierDto) {
    return this.legalSupplierService.create(createLegalSupplierDto);
  }

  @Get()
  findAll() {
    return this.legalSupplierService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.legalSupplierService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateLegalSupplierDto: UpdateLegalSupplierDto) {
    return this.legalSupplierService.update(+id, updateLegalSupplierDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.legalSupplierService.remove(+id);
  }
}
