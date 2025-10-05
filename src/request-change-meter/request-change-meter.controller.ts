import { Controller, Get, Post, Body,Param, Delete, Query, Put } from '@nestjs/common';
import { RequestChangeMeterService } from './request-change-meter.service';
import { CreateRequestChangeMeterDto } from './dto/create-request-change-meter.dto';
import { UpdateRequestChangeMeterDto } from './dto/update-request-change-meter.dto';
import { RequestChangeMeterPagination } from './dto/pagination-request-change-meter.dto';

@Controller('request-change-meter')
export class RequestChangeMeterController {
  constructor(private readonly requestChangeMeterService: RequestChangeMeterService) {}

  @Post()
  create(@Body() createRequestChangeMeterDto: CreateRequestChangeMeterDto) {
    return this.requestChangeMeterService.create(createRequestChangeMeterDto);
  }

  @Get()
  findAll() {
    return this.requestChangeMeterService.findAll();
  }

    @Get('search')
    search(@Query() pagination: RequestChangeMeterPagination){
      return this.requestChangeMeterService.search(pagination);
    }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.requestChangeMeterService.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: number, @Body() updateRequestChangeMeterDto: UpdateRequestChangeMeterDto) {
    return this.requestChangeMeterService.update(id, updateRequestChangeMeterDto);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.requestChangeMeterService.remove(id);
  }
}
