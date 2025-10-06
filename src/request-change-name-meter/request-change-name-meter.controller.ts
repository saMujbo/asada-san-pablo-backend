import { Controller, Get, Post, Body, Patch, Param, Delete, Query, Put } from '@nestjs/common';
import { RequestChangeNameMeterService } from './request-change-name-meter.service';
import { CreateRequestChangeNameMeterDto } from './dto/create-request-change-name-meter.dto';
import { UpdateRequestChangeNameMeterDto } from './dto/update-request-change-name-meter.dto';
import { RequestChangeNameMeterPagination } from './dto/pagination-request-change-name-meter.dt';

@Controller('request-change-name-meter')
export class RequestChangeNameMeterController {
  constructor(private readonly requestChangeNameMeterService: RequestChangeNameMeterService) {}

  @Post()
  create(@Body() createRequestChangeNameMeterDto: CreateRequestChangeNameMeterDto) {
    return this.requestChangeNameMeterService.create(createRequestChangeNameMeterDto);
  }

  @Get()
  findAll() {
    return this.requestChangeNameMeterService.findAll();
  }

  @Get('search')
  search(@Query() pagination: RequestChangeNameMeterPagination){
    return this.requestChangeNameMeterService.search(pagination);
  }
  @Get(':id')
  findOne(@Param('id') id:number) {
    return this.requestChangeNameMeterService.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: number, @Body() updateRequestChangeNameMeterDto: UpdateRequestChangeNameMeterDto) {
    return this.requestChangeNameMeterService.update(id, updateRequestChangeNameMeterDto);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.requestChangeNameMeterService.remove(id);
  }
}
