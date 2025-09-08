import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, UseGuards, Put } from '@nestjs/common';
import { UnitMeasureService } from './unit_measure.service';
import { CreateUnitMeasureDto } from './dto/create-unit_measure.dto';
import { UpdateUnitMeasureDto } from './dto/update-unit_measure.dto';
import { ApiBearerAuth } from '@nestjs/swagger';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/auth-roles/roles.decorator';
import { Role } from 'src/auth/auth-roles/roles.enum';
import { AuthGuard } from 'src/auth/guards/auth.guard';

@UseGuards(AuthGuard, RolesGuard)
@Roles(Role.ADMIN) 
@ApiBearerAuth()
@Controller('unit-measure')
export class UnitMeasureController {
  constructor(private readonly unitMeasureService: UnitMeasureService) {}

  @Post()
  create(@Body() createUnitMeasureDto: CreateUnitMeasureDto) {
    return this.unitMeasureService.create(createUnitMeasureDto);
  }

  @Get()
  findAll() {
    return this.unitMeasureService.findAll();
  }

  @Get(':id')
  findOne(@Param('id',ParseIntPipe) id: number) {
    return this.unitMeasureService.findOne(id);
  }

  @Put(':id')
  update(@Param('id',ParseIntPipe) id: number,
  @Body() updateUnitMeasureDto: UpdateUnitMeasureDto) {
    return this.unitMeasureService.update(id, updateUnitMeasureDto);
  }

  @Delete(':id')
  remove(@Param('id',ParseIntPipe) id: number) {
    return this.unitMeasureService.remove(id);
  }
}
