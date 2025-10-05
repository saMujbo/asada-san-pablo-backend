import { Controller, Get, Post, Body, Patch, Param, Delete, Put, Query } from '@nestjs/common';
import { RequesAvailabilityWaterService } from './reques-availability-water.service';
import { CreateRequestAvailabilityWaterDto } from './dto/create-reques-availability-water.dto';
import { UpdateRequestAvailabilityWaterDto } from './dto/update-reques-availability-water.dto';
import { RequestAvailabilityWaterPagination } from './dto/pagination-request-availabaility.dto';

@Controller('request-availability-water')
export class RequesAvailabilityWaterController {
  constructor(private readonly requesAvailabilityWaterService: RequesAvailabilityWaterService) {}

  @Post()
  create(@Body() createRequesAvailabilityWaterDto: CreateRequestAvailabilityWaterDto) {
    return this.requesAvailabilityWaterService.create(createRequesAvailabilityWaterDto);
  }

  @Get()
  findAll() {
    return this.requesAvailabilityWaterService.findAll();
  }

  @Get('search')
  search(@Query() pagination: RequestAvailabilityWaterPagination){
    return this.requesAvailabilityWaterService.search(pagination);
  }

  @Get(':id')
  findOne(@Param('id') Id: number) {
    return this.requesAvailabilityWaterService.findOne(Id);
  }

  @Put(':id')
  update(@Param('id') Id: number, @Body() updateRequesAvailabilityWaterDto: UpdateRequestAvailabilityWaterDto) {
    return this.requesAvailabilityWaterService.update(Id, updateRequesAvailabilityWaterDto);
  }

  @Delete(':id')
  remove(@Param('id') Id: number) {
    return this.requesAvailabilityWaterService.remove(Id);
  }
}
