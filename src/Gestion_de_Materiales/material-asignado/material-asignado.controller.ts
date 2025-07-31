import {
  Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, UseGuards,
} from '@nestjs/common';
import { MaterialAsignadoService } from './material-asignado.service';
import { CreateMaterialAsignadoDto } from './dto/create-material-asignado.dto';
import { UpdateMaterialAsignadoDto } from './dto/update-material-asignado.dto';
import { ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@ApiBearerAuth()
@Controller('material-asignado')
export class MaterialAsignadoController {
  constructor(private readonly asignadoService: MaterialAsignadoService) {}


  @Post()
  create(@Body() createDto: CreateMaterialAsignadoDto) {
    return this.asignadoService.create(createDto);
  }


  @Get()
  findAll() {
    return this.asignadoService.findAll();
  }


  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.asignadoService.findOne(id);
  }


  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateMaterialAsignadoDto,
  ) {
    return this.asignadoService.update(id, updateDto);
  }


  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.asignadoService.remove(id);
  }
}
