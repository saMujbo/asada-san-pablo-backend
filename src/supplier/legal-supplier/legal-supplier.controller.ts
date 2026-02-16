import { Controller, Get, Post, Body, Patch, Param, Delete, Put, Query } from '@nestjs/common';
import { LegalSupplierService } from './legal-supplier.service';
import { CreateLegalSupplierDto } from './dto/create-legal-supplier.dto';
import { UpdateLegalSupplierDto } from './dto/update-legal-supplier.dto';
import { LegalSupplierPaginationDto } from './dto/pagination-legal-supplier.dto';

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

  @Get('search')
  search(@Query() pagination: LegalSupplierPaginationDto) {
    return this.legalSupplierService.search(pagination);
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.legalSupplierService.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: number, @Body() updateLegalSupplierDto: UpdateLegalSupplierDto) {
    return this.legalSupplierService.update(id, updateLegalSupplierDto);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.legalSupplierService.remove(id);
  }
}
