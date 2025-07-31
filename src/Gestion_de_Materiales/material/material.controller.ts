import {
  Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, UseGuards,
} from '@nestjs/common';
import { CreateMaterialDto } from './dto/create-material.dto';
import { UpdateMaterialDto } from './dto/update-material.dto';
import { ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { MaterialsService } from './material.service';


@ApiBearerAuth()
@Controller('material')
export class MaterialsController {
  constructor(private readonly materialsService: MaterialsService) {}


  @Post()
  create(@Body() createDto: CreateMaterialDto) {
    return this.materialsService.create(createDto);
  }


  @Get()
  findAll() {
    return this.materialsService.findAll();
  }


  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.materialsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateMaterialDto,
  ) {
    return this.materialsService.update(id, updateDto);
  }


  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.materialsService.remove(id);
  }
}
