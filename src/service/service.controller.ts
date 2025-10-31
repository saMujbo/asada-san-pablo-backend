import { Controller, Get, Post, Body, Patch, Param, Delete, Put, Query } from '@nestjs/common';
import { ServiceService } from './service.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { ServicePaginationDto } from './dto/pagination-service.dto';

@Controller('service')
export class ServiceController {
  constructor(private readonly serviceService: ServiceService) {}

  @Post()
  create(@Body() createServiceDto: CreateServiceDto) {
    return this.serviceService.create(createServiceDto);
  }

  @Get()
  findAll() {
    return this.serviceService.findAll();
  }

  @Get('search')
  search(@Query() pagination: ServicePaginationDto) {
    return this.serviceService.search(pagination);
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.serviceService.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: number, @Body() updateServiceDto: UpdateServiceDto) {
    return this.serviceService.update(id, updateServiceDto);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.serviceService.remove(id);
  }
}
