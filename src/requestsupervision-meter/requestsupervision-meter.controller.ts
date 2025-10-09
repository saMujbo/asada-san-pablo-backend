import { Controller, Get, Post, Body, Patch, Param, Delete, Put, Query } from '@nestjs/common';
import { RequestsupervisionMeterService } from './requestsupervision-meter.service';
import { CreateRequestSupervisionMeterDto } from './dto/create-requestsupervision-meter.dto';
import { UpdateRequestsupervisionMeterDto } from './dto/update-requestsupervision-meter.dto';
import { RequestSupervisionPagination } from './dto/pagination-requesSupervisiom-meter.tdo';

@Controller('requestsupervision-meter')
export class RequestsupervisionMeterController {
  constructor(private readonly requestsupervisionMeterService: RequestsupervisionMeterService) {}

  @Post()
  create(@Body() createRequestsupervisionMeterDto: CreateRequestSupervisionMeterDto) {
    return this.requestsupervisionMeterService.create(createRequestsupervisionMeterDto);
  }

  @Get()
  findAll() {
    return this.requestsupervisionMeterService.findAll();
  }

  @Get('search')
  search(@Query() pagination:RequestSupervisionPagination){
    return this.requestsupervisionMeterService.search(pagination);
  }
  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.requestsupervisionMeterService.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: number, @Body() updateRequestsupervisionMeterDto: UpdateRequestsupervisionMeterDto) {
    return this.requestsupervisionMeterService.update(id, updateRequestsupervisionMeterDto);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.requestsupervisionMeterService.remove(id);
  }
}
