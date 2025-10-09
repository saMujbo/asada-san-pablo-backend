import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { RequestAssociatedService } from './request-associated.service';
import { CreateRequestAssociatedDto } from './dto/create-request-associated.dto';
import { UpdateRequestAssociatedDto } from './dto/update-request-associated.dto';

@Controller('request-associated')
export class RequestAssociatedController {
  constructor(private readonly requestAssociatedService: RequestAssociatedService) {}

  @Post()
  create(@Body() createRequestAssociatedDto: CreateRequestAssociatedDto) {
    return this.requestAssociatedService.create(createRequestAssociatedDto);
  }

  @Get()
  findAll() {
    return this.requestAssociatedService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.requestAssociatedService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: number, @Body() updateRequestAssociatedDto: UpdateRequestAssociatedDto) {
    return this.requestAssociatedService.update(id, updateRequestAssociatedDto);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.requestAssociatedService.remove(id);
  }
}
