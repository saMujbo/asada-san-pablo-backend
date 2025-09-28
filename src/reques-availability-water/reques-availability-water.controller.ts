import { Controller, Get, Post, Body, Patch, Param, Delete, Put } from '@nestjs/common';
import { RequesAvailabilityWaterService } from './reques-availability-water.service';
import { CreateRequestAvailabilityWaterDto } from './dto/create-reques-availability-water.dto';
import { UpdateRequestAvailabilityWaterDto } from './dto/update-reques-availability-water.dto';

@Controller('reques-availability-water')
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
